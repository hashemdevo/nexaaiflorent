
import { DbEngine } from '../core/db';
import { Payment, Invoice, Customer } from '../core/types';
import { JournalService } from '../ledger/journal';
import { JournalEntryLine } from '../../types';

export const PaymentService = {
    async recordPayment(
        invoiceId: string,
        amount: number,
        method: string,
        depositAccountId: string = '1010' // Default to Cash
    ): Promise<Payment> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Fetch Invoice
            const invoices = await DbEngine.select<Invoice>('invoices', { where: { id: invoiceId } });
            const invoice = invoices[0];
            if (!invoice) throw new Error("Invoice not found");

            if (invoice.balanceDue < amount) {
                throw new Error("Payment amount exceeds balance due");
            }

            // 2. Create Payment Record
            const payment: Payment = {
                id: `pay-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                invoiceId,
                customerId: invoice.customerId,
                amount,
                date: new Date().toISOString().split('T')[0],
                method,
                depositAccountId
            };

            // 3. Prepare GL Lines
            // Debit: Cash/Bank (Asset)
            // Credit: Accounts Receivable (Asset)
            const glLines: JournalEntryLine[] = [
                {
                    accountId: depositAccountId,
                    accountName: 'Cash/Bank',
                    debit: amount,
                    credit: 0
                },
                {
                    accountId: '1200', // AR Account
                    accountName: 'Accounts Receivable',
                    debit: 0,
                    credit: amount
                }
            ];

            // 4. Post Journal Entry
            const journalEntry = await JournalService.postEntry({
                transactionDate: payment.date,
                postedDate: new Date().toISOString(),
                reference: `PAY-${invoice.invoiceNumber}`,
                description: `Payment received for Invoice ${invoice.invoiceNumber}`,
                lines: glLines,
                totalAmount: amount,
                createdBy: 'SYSTEM'
            }, trx);

            payment.journalEntryId = journalEntry.id;

            // 5. Update Invoice Balance & Status
            const newBalance = invoice.balanceDue - amount;
            const newStatus = newBalance <= 0 ? 'PAID' : 'POSTED';
            
            await DbEngine.update<Invoice>('invoices', invoiceId, { 
                balanceDue: newBalance,
                status: newStatus
            }, trx);

            // 6. Update Customer Balance
            const customerRows = await DbEngine.select<any>('customers', { where: { id: invoice.customerId } });
            if (customerRows.length > 0) {
                const customer = customerRows[0];
                await DbEngine.update<Customer>('customers', invoice.customerId, { balance: (customer.balance || 0) - amount }, trx);
            }

            // 7. Save Payment
            await DbEngine.insert('payments', payment, trx);

            await trx.commit();
            return payment;

        } catch (error) {
            await trx.rollback();
            console.error("Payment Recording Failed", error);
            throw error;
        }
    }
};