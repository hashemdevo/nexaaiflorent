
import { DbEngine } from '../core/db';
import { BankTransaction } from '../core/types';

export const BankFeedService = {
    async getTransactions(bankAccountId: string): Promise<BankTransaction[]> {
        return DbEngine.select<BankTransaction>('bank_transactions', { 
            where: { bankAccountId },
            orderBy: 'date',
            orderDir: 'desc'
        });
    },

    async importTransactions(bankAccountId: string, transactions: Partial<BankTransaction>[]): Promise<BankTransaction[]> {
        const trx = await DbEngine.startTransaction();
        const results: BankTransaction[] = [];

        try {
            for (const tx of transactions) {
                const newTx: BankTransaction = {
                    id: `btx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    tenantId: 'default',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                    bankAccountId,
                    externalId: tx.externalId || `ext-${Date.now()}`,
                    date: tx.date || new Date().toISOString(),
                    amount: tx.amount || 0,
                    description: tx.description || 'Unknown',
                    payee: tx.payee,
                    status: 'PENDING'
                };
                
                await DbEngine.insert('bank_transactions', newTx, trx);
                results.push(newTx);
            }
            
            await trx.commit();
            return results;
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};
