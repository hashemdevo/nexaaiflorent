
import { DbEngine } from '../../core/db';
import { Bill, Vendor } from '../../core/types';
import { CreateBillDTO } from '../types';
import { JournalService } from '../../ledger/journal';
import { JournalEntryLine } from '../../../types';

export const BillCreateService = {
    async create(dto: CreateBillDTO): Promise<Bill> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Calculate Total
            const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

            // 2. Prepare GL Lines
            const glLines: JournalEntryLine[] = [];

            // Debits: Expense or Asset Accounts (What we bought)
            dto.items.forEach(item => {
                glLines.push({
                    accountId: item.expenseAccountId,
                    accountName: 'Expense/Asset', // Ideally fetched from AccountService
                    debit: item.amount,
                    credit: 0
                });
            });

            // Credit: Accounts Payable (Liability - We owe money)
            glLines.push({
                accountId: '2000', // Standard AP Account
                accountName: 'Accounts Payable',
                debit: 0,
                credit: totalAmount
            });

            // 3. Post Journal Entry
            const journalEntry = await JournalService.postEntry({
                transactionDate: dto.date,
                postedDate: new Date().toISOString(),
                reference: `BILL-${dto.billNumber}`,
                description: `Bill from Vendor #${dto.vendorId}`,
                lines: glLines,
                totalAmount: totalAmount,
                createdBy: 'SYSTEM'
            }, trx);

            // 4. Create Bill Record
            const bill: Bill = {
                id: `bill-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                billNumber: dto.billNumber,
                vendorId: dto.vendorId,
                date: dto.date,
                dueDate: dto.dueDate,
                status: 'OPEN',
                totalAmount,
                balanceDue: totalAmount,
                items: dto.items,
                journalEntryId: journalEntry.id
            };

            await DbEngine.insert('bills', bill, trx);

            // 5. Update Vendor Balance (We owe them more)
            const vendors = await DbEngine.select<Vendor>('vendors', { where: { id: dto.vendorId } });
            if (vendors.length > 0) {
                const vendor = vendors[0];
                await DbEngine.update<Vendor>('vendors', dto.vendorId, { 
                    balance: (vendor.balance || 0) + totalAmount 
                }, trx);
            }

            await trx.commit();
            return bill;

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
