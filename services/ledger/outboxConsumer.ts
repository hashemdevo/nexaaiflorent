import { AccountService } from './accounts';
import { DbEngine } from '../core/db';
import { JournalService } from './journal';
import { OutboxEvent } from '../core/events';

export const OutboxConsumer = {
    async processPendingEvents() {
        const trx = await DbEngine.startTransaction();

        try {
            // Select up to 50 PENDING events, lock them for processing
            const events = await DbEngine.select<any>('outbox_events', {
                where: { status: 'PENDING' },
                limit: 50,
                orderBy: 'createdAt',
                orderDir: 'asc'
            });

            if (events.length === 0) {
                await trx.rollback();
                return;
            }

            for (const event of events) {
                try {
                    await this.processEvent(event, trx);
                    await DbEngine.update<any>('outbox_events', event.id, {
                        status: 'PROCESSED'
                    } as any, trx);
                } catch (e: any) {
                    await DbEngine.update<any>('outbox_events', event.id, {
                        status: 'FAILED',
                        error: e.message
                    } as any, trx);
                }
            }

            await trx.commit();
        } catch (e) {
            await trx.rollback();
            console.error('[OutboxConsumer] Failed to process batch:', e);
        }
    },

    async processEvent(event: OutboxEvent, trx: any) {
        const { type, payload } = event;

        switch (type) {
            case 'INVOICE_POSTED': {
                // Post to GL
                await JournalService.postEntry({
                    transactionDate: payload.date,
                    postedDate: new Date().toISOString(),
                    reference: `INV-${payload.invoiceId}`,
                    description: `Invoice generated for Customer #${payload.customerId}`,
                    lines: [
                        { accountId: (await AccountService.getByCode('1200'))?.id || '1200', accountName: 'Accounts Receivable', debit: payload.totalAmount, credit: 0 },
                        { accountId: (await AccountService.getByCode('4000'))?.id || '4000', accountName: 'Sales Revenue', debit: 0, credit: payload.subtotal },
                        { accountId: (await AccountService.getByCode('2000'))?.id || '2000', accountName: 'Tax Payable', debit: 0, credit: payload.taxTotal }
                    ],
                    totalAmount: payload.totalAmount,
                    createdBy: 'SYSTEM'
                }, trx);
                break;
            }
            case 'PAYMENT_RECEIVED': {
                await JournalService.postEntry({
                    transactionDate: payload.date,
                    postedDate: new Date().toISOString(),
                    reference: `PAY-${payload.invoiceId}`,
                    description: `Payment received for Invoice ${payload.invoiceId}`,
                    lines: [
                        { accountId: payload.paymentAccountId || (await AccountService.getByCode('1010'))?.id || '1010', accountName: 'Cash/Bank', debit: payload.amount, credit: 0 },
                        { accountId: (await AccountService.getByCode('1200'))?.id || '1200', accountName: 'Accounts Receivable', debit: 0, credit: payload.amount }
                    ],
                    totalAmount: payload.amount,
                    createdBy: 'SYSTEM'
                }, trx);
                break;
            }
            case 'BILL_CREATED': {
                const expenseAccount = await AccountService.getByCode('5000');
                const apAccount = await AccountService.getByCode('2000');
                const expenseAccountId = expenseAccount?.id || '5000';
                const apAccountId = apAccount?.id || '2000';

                await JournalService.postEntry({
                    transactionDate: payload.date,
                    postedDate: new Date().toISOString(),
                    reference: `BILL-${payload.billNumber}`,
                    description: `Bill from Vendor #${payload.vendorId}`,
                    lines: [
                        ...payload.items.map((item: any) => ({
                            accountId: item.expenseAccountId || expenseAccountId,
                            accountName: 'Expense/Asset',
                            debit: item.amount,
                            credit: 0
                        })),
                        { accountId: apAccountId, accountName: 'Accounts Payable', debit: 0, credit: payload.totalAmount }
                    ],
                    totalAmount: payload.totalAmount,
                    createdBy: 'SYSTEM'
                }, trx);
                break;
            }
            case 'BILL_PAID': {
                await JournalService.postEntry({
                    transactionDate: payload.date,
                    postedDate: new Date().toISOString(),
                    reference: `PAY-BILL-${payload.billId}`,
                    description: `Payment for Bill #${payload.billId}`,
                    lines: [
                        { accountId: (await AccountService.getByCode('2000'))?.id || '2000', accountName: 'Accounts Payable', debit: payload.amount, credit: 0 },
                        { accountId: payload.paymentAccountId || (await AccountService.getByCode('1010'))?.id || '1010', accountName: 'Bank/Cash', debit: 0, credit: payload.amount }
                    ],
                    totalAmount: payload.amount,
                    createdBy: 'SYSTEM'
                }, trx);
                break;
            }
            case 'OPENING_BALANCE': {
                await JournalService.postEntry({
                    transactionDate: payload.date,
                    postedDate: new Date().toISOString(),
                    reference: 'OPENING-BAL',
                    description: 'Opening Balance / Initial Capital',
                    lines: [
                        { accountId: (await AccountService.getByCode('1010'))?.id || '1010', accountName: 'Cash', debit: payload.amount, credit: 0 },
                        { accountId: (await AccountService.getByCode('3000'))?.id || '3000', accountName: 'Owner Equity', debit: 0, credit: payload.amount }
                    ],
                    totalAmount: payload.amount,
                    createdBy: 'SYSTEM'
                }, trx);
                break;
            }
            case 'ATTENDANCE_CLOCKED_IN':
            case 'ATTENDANCE_CLOCKED_OUT':
                // HR Events (No direct journal entry needed, just mark PROCESSED)
                break;
            default:
                throw new Error(`Unhandled event type: ${type}`);
        }
    }
};
