import { DbEngine } from '../core/db';
import { JournalEntry } from '../../types';
import { BaseEntity, DbTransaction } from '../core/types';
import { AccountService } from './accounts';
import { SecurityService } from '../securityService';
import { AnomalyTriggerService } from '../budgeting/anomalyTrigger';
import { generateUUIDv7 } from '../../types/enterprise';

interface EnterpriseJournalEntry extends JournalEntry, Omit<BaseEntity, 'id'> {}

export const JournalService = {
    
    /**
     * Posts a Journal Entry to the ledger.
     * @param entry The entry data.
     * @param externalTrx Optional existing transaction. If provided, this operation becomes part of that transaction and will NOT commit automatically.
     */
    async postEntry(entry: Omit<JournalEntry, 'id' | 'status' | 'hash'>, externalTrx?: DbTransaction): Promise<JournalEntry> {
        // 1. Use external transaction or start a new one
        const trx = externalTrx || await DbEngine.startTransaction();
        const isSelfManaged = !externalTrx;

        try {
            // 2. Validation
            const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
            const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);
            
            // Allow for floating point epsilon
            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                throw new Error(`Unbalanced Transaction: Debit ${totalDebit} != Credit ${totalCredit}`);
            }

            const newId = generateUUIDv7();

            // 3. Prepare Record
            const newEntry: EnterpriseJournalEntry = {
                ...entry,
                id: newId,
                tenantId: 'tenant-nexa-001', 
                status: 'POSTED',
                totalAmount: totalDebit,
                hash: await SecurityService.sha256(JSON.stringify(entry) + newId),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            };

            // 4. Insert Header
            await DbEngine.insert('journal_entries', newEntry, trx);

            // 5. Update Account Balances (Trigger-like logic)
            for (const line of entry.lines) {
                if (line.debit > 0) await AccountService.updateBalance(line.accountId, line.debit, 'DEBIT', trx);
                if (line.credit > 0) await AccountService.updateBalance(line.accountId, line.credit, 'CREDIT', trx);
            }

            // 6. Commit ONLY if we own the transaction
            if (isSelfManaged) {
                await trx.commit();
            }
            
            // Trigger threshold scan asynchronously after transaction commits successfully
            AnomalyTriggerService.scanAndAlert(newEntry).catch(err => {
                console.error("⚠️ [JournalService] Background threshold scan failed: ", err);
            });
            
            return newEntry;

        } catch (error) {
            // 7. Rollback ONLY if we own the transaction
            if (isSelfManaged) {
                await trx.rollback();
            }
            throw error;
        }
    },

    async getAll(): Promise<JournalEntry[]> {
        return DbEngine.select<EnterpriseJournalEntry>('journal_entries', { orderBy: 'transactionDate', orderDir: 'desc' });
    }
};