
import { StoredProcedure } from '../../core/procedure';
import { DbTransaction } from '../../core/types';
import { JournalEntry, JournalEntryLine } from '../../../types';
import { DbEngine } from '../../core/db';
import { JournalService } from '../../ledger/journal';

export interface ManualEntryInput {
    header: {
        date: string;
        description: string;
        costCenter?: string;
    };
    debit: JournalEntryLine;
    credit: JournalEntryLine;
    totalAmount: number;
    actor: string;
}

export class ManualEntryProcedure extends StoredProcedure<ManualEntryInput, JournalEntry> {
    
    protected async execute(input: ManualEntryInput, trx: DbTransaction): Promise<JournalEntry> {
        const { header, debit, credit, totalAmount, actor } = input;

        const lines: JournalEntryLine[] = [debit, credit];
        
        // Step 1: Create new accounts if necessary
        for (const line of lines) {
            if (line.isNewAccount) {
                // In a real system, we'd have a full Account creation procedure.
                // For now, we add a simplified account.
                const newAccount = {
                    id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    code: 'TEMP',
                    name: line.accountName || 'Unnamed Account',
                    type: line.accountType || 'EXPENSE',
                    category: 'Uncategorized',
                    currency: 'USD',
                    balance: 0,
                    isSystem: false
                };
                
                // Use DbEngine directly within the transaction
                await DbEngine.insert('accounts', newAccount as any, trx);
                
                // Update the line to use the new ID
                line.accountId = newAccount.id;
            }
        }
        
        // Step 2: Post the Journal Entry using the main service, passing the transaction
        const journalEntry = await JournalService.postEntry({
            transactionDate: header.date,
            postedDate: new Date().toISOString(),
            reference: 'MANUAL-ENTRY',
            description: header.description,
            lines: lines,
            totalAmount: totalAmount,
            createdBy: actor,
            costCenter: header.costCenter
        }, trx);

        return journalEntry;
    }
}
