
import { DbEngine } from '../core/db';
import { BankAccount } from '../core/types';
import { CreateBankAccountDTO } from './types';

export const BankAccountService = {
    async getAll(): Promise<BankAccount[]> {
        return DbEngine.select<BankAccount>('bank_accounts', { orderBy: 'name', orderDir: 'asc' });
    },

    async create(dto: CreateBankAccountDTO): Promise<BankAccount> {
        const account: BankAccount = {
            id: `bnk-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            name: dto.name,
            accountNumber: dto.accountNumber,
            bankName: dto.bankName,
            currency: dto.currency,
            glAccountId: dto.glAccountId,
            currentBalance: dto.initialBalance || 0
        };
        return DbEngine.insert('bank_accounts', account);
    },

    async updateBalance(id: string, delta: number, transaction?: any): Promise<void> {
        const accounts = await DbEngine.select<BankAccount>('bank_accounts', { where: { id } });
        if (accounts[0]) {
            await DbEngine.update<BankAccount>('bank_accounts', id, {
                currentBalance: accounts[0].currentBalance + delta
            }, transaction);
        }
    }
};
