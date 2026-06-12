import { DbEngine } from '../core/db';
import { Account } from '../../types';
import { BaseEntity } from '../core/types';
import { generateUUIDv7 } from '../../types/enterprise';

// Extended Enterprise Account Type
interface EnterpriseAccount extends Account, Omit<BaseEntity, 'id'> {}

const DEFAULT_ACCOUNTS: EnterpriseAccount[] = [
    { id: generateUUIDv7(), tenantId: 'default', createdAt: '', updatedAt: '', version: 1, code: '1010', name: 'Cash', type: 'ASSET', category: 'Current Assets', currency: 'USD', balance: 0, isSystem: true },
    { id: generateUUIDv7(), tenantId: 'default', createdAt: '', updatedAt: '', version: 1, code: '1200', name: 'Accounts Receivable', type: 'ASSET', category: 'Current Assets', currency: 'USD', balance: 0, isSystem: true },
    { id: generateUUIDv7(), tenantId: 'default', createdAt: '', updatedAt: '', version: 1, code: '2000', name: 'Accounts Payable', type: 'LIABILITY', category: 'Current Liabilities', currency: 'USD', balance: 0, isSystem: true },
    { id: generateUUIDv7(), tenantId: 'default', createdAt: '', updatedAt: '', version: 1, code: '3000', name: 'Owner Equity', type: 'EQUITY', category: 'Equity', currency: 'USD', balance: 0, isSystem: true },
    { id: generateUUIDv7(), tenantId: 'default', createdAt: '', updatedAt: '', version: 1, code: '3100', name: 'Partner Current Drawings Account', type: 'EQUITY', category: 'Equity', currency: 'USD', balance: 0, isSystem: true },
    { id: generateUUIDv7(), tenantId: 'default', createdAt: '', updatedAt: '', version: 1, code: '4000', name: 'Sales Revenue', type: 'REVENUE', category: 'Revenue', currency: 'USD', balance: 0, isSystem: true },
    { id: generateUUIDv7(), tenantId: 'default', createdAt: '', updatedAt: '', version: 1, code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE', category: 'Expenses', currency: 'USD', balance: 0, isSystem: true },
    { id: generateUUIDv7(), tenantId: 'default', createdAt: '', updatedAt: '', version: 1, code: '5100', name: 'Rent Expense', type: 'EXPENSE', category: 'Expenses', currency: 'USD', balance: 0, isSystem: true },
];

export const AccountService = {
    _initialized: false,
    async init() {
        if (this._initialized) return;
        const existing = await DbEngine.select<EnterpriseAccount>('accounts');
        if (existing.length === 0) {
            for (const acc of DEFAULT_ACCOUNTS) {
                await DbEngine.insert('accounts', acc);
            }
        }
        this._initialized = true;
    },

    async getByCode(code: string): Promise<Account | undefined> {
        const results = await DbEngine.select<EnterpriseAccount>('accounts', { where: { code } });
        return results[0];
    },

    async getAll(): Promise<Account[]> {
        await this.init();
        return DbEngine.select<EnterpriseAccount>('accounts', { orderBy: 'code', orderDir: 'asc' });
    },

    async getById(id: string): Promise<Account | undefined> {
        const results = await DbEngine.select<EnterpriseAccount>('accounts', { where: { id } });
        return results[0];
    },

    async updateBalance(accountId: string, amount: number, type: 'DEBIT' | 'CREDIT', transaction?: any) {
        const account = await this.getById(accountId);
        if (!account) return;

        let change = 0;
        // GAAP Logic
        if (['ASSET', 'EXPENSE'].includes(account.type)) {
            change = type === 'DEBIT' ? amount : -amount;
        } else {
            change = type === 'CREDIT' ? amount : -amount;
        }

        await DbEngine.update<EnterpriseAccount>('accounts', accountId, { balance: account.balance + change }, transaction);
    }
};