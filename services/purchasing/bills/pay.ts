
import { DbEngine } from '../../core/db';
import { Bill, BillPayment, Vendor } from '../../core/types';
import { PayBillDTO } from '../types';
import { JournalService } from '../../ledger/journal';
import { JournalEntryLine } from '../../../types';

export const BillPayService = {
    async pay(dto: PayBillDTO): Promise<BillPayment> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Fetch Bill
            const bills = await DbEngine.select<Bill>('bills', { where: { id: dto.billId } });
            const bill = bills[0];
            if (!bill) throw new Error("Bill not found");

            if (bill.balanceDue < dto.amount) {
                throw new Error("Payment amount exceeds bill balance");
            }

            // 2. Prepare GL Lines
            const glLines: JournalEntryLine[] = [];

            // Debit: Accounts Payable (Reducing Liability)
            glLines.push({
                accountId: '2000', // AP Account
                accountName: 'Accounts Payable',
                debit: dto.amount,
                credit: 0
            });

            // Credit: Bank/Cash (Asset Decreasing)
            glLines.push({
                accountId: dto.paymentAccountId,
                accountName: 'Bank/Cash',
                debit: 0,
                credit: dto.amount
            });

            // 3. Post Journal Entry
            const journalEntry = await JournalService.postEntry({
                transactionDate: new Date().toISOString().split('T')[0],
                postedDate: new Date().toISOString(),
                reference: `PAY-BILL-${bill.billNumber}`,
                description: `Payment for Bill #${bill.billNumber}`,
                lines: glLines,
                totalAmount: dto.amount,
                createdBy: 'SYSTEM'
            }, trx);

            // 4. Create Payment Record
            const payment: BillPayment = {
                id: `bpay-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                billId: dto.billId,
                vendorId: bill.vendorId,
                amount: dto.amount,
                date: new Date().toISOString().split('T')[0],
                method: dto.method,
                paymentAccountId: dto.paymentAccountId,
                journalEntryId: journalEntry.id
            };

            await DbEngine.insert('bill_payments', payment, trx);

            // 5. Update Bill Status
            const newBalance = bill.balanceDue - dto.amount;
            await DbEngine.update<Bill>('bills', bill.id, {
                balanceDue: newBalance,
                status: newBalance <= 0 ? 'PAID' : 'OPEN'
            }, trx);

            // 6. Update Vendor Balance (We owe them less)
            const vendors = await DbEngine.select<Vendor>('vendors', { where: { id: bill.vendorId } });
            if (vendors.length > 0) {
                const vendor = vendors[0];
                await DbEngine.update<Vendor>('vendors', bill.vendorId, {
                    balance: (vendor.balance || 0) - dto.amount
                }, trx);
            }

            await trx.commit();
            return payment;

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
