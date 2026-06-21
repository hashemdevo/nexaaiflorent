
import { DbEngine } from '../core/db';
import { ExpenseClaim } from '../core/types';
import { JournalService } from '../ledger/journal';
import { JournalEntryLine } from '../../types';
import { AuditService } from '../admin/audit';

export const ReimbursementService = {
    
    async approveAndPay(claimId: string, approverId: string, payFromAccountId: string): Promise<void> {
        const trx = await DbEngine.startTransaction();

        try {
            const claims = await DbEngine.select<ExpenseClaim>('expense_claims', { where: { id: claimId } });
            const claim = claims[0];
            if (!claim || claim.status !== 'SUBMITTED') throw new Error("Invalid Claim");

            // 1. Create GL Lines
            const glLines: JournalEntryLine[] = [
                // Debit: Expense Category (e.g. Travel Expense)
                {
                    accountId: '5100', // Generic Expense Account for now
                    accountName: `${claim.category} Expense`,
                    debit: claim.amount,
                    credit: 0
                },
                // Credit: Bank (Reimbursement)
                {
                    accountId: payFromAccountId,
                    accountName: 'Bank/Cash',
                    debit: 0,
                    credit: claim.amount
                }
            ];

            // 2. Post Entry
            const entry = await JournalService.postEntry({
                transactionDate: new Date().toISOString().split('T')[0],
                postedDate: new Date().toISOString(),
                reference: `EXP-REF-${claim.id.split('-')[1]}`,
                description: `Reimbursement for ${claim.description}`,
                lines: glLines,
                totalAmount: claim.amount,
                createdBy: approverId
            }, trx);

            // 3. Update Claim
            await DbEngine.update<ExpenseClaim>('expense_claims', claimId, {
                status: 'PAID',
                approvedBy: approverId,
                journalEntryId: entry.id
            }, trx);

            // 4. Audit
            await AuditService.log('emp', approverId, 'APPROVE', `Claim #${claimId}`, `Approved amount ${claim.amount}`, trx);

            await trx.commit();

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
