import { BankAccount, BankTransaction } from './types';
import { StorageAdapter } from '../storageAdapter';

/**
 * BankMockupProxy
 * 
 * Simulated banking gateway designed to mock Plaid and other Open Banking providers.
 * Supports sandbox transaction generation, real-time feed updates, balance checking,
 * and double-entry transaction posting triggers.
 */
export class BankMockupProxy {
    private static STORAGE_KEY = 'nexa_banking_mock_feed';

    /**
     * Set up standard demo bank accounts if they don't exist
     */
    static async initializeMockAccounts(tenantId: string): Promise<BankAccount[]> {
        const key = `nexa_bank_accounts_${tenantId}`;
        const existing = await StorageAdapter.getItem<BankAccount[]>(key, []);
        
        if (existing.length > 0) {
            return existing;
        }

        const initial: BankAccount[] = [
            {
                id: 'acc_checking_001',
                tenantId,
                name: 'SNB Checking Account',
                accountNumber: 'SA908000000109283746',
                bankName: 'Saudi National Bank (SNB)',
                currency: 'SAR',
                glAccountId: '1010',
                currentBalance: 154200.50,
                lastSynced: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            },
            {
                id: 'acc_savings_001',
                tenantId,
                name: 'Al Rajhi Savings Account',
                accountNumber: 'SA452000000309182736',
                bankName: 'Al Rajhi Bank',
                currency: 'SAR',
                glAccountId: '1020',
                currentBalance: 450000.00,
                lastSynced: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            },
            {
                id: 'acc_credit_001',
                tenantId,
                name: 'SABB Business Credit Card',
                accountNumber: 'SA124000000509384726',
                bankName: 'SABB Credit Card',
                currency: 'SAR',
                glAccountId: '2010',
                currentBalance: -12450.00,
                lastSynced: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            }
        ];

        await StorageAdapter.setItem<BankAccount[]>(key, initial);
        return initial;
    }

    /**
     * Generate simulated transactions representing various industry patterns
     */
    static generateMockTransactions(tenantId: string, count: number = 10): BankTransaction[] {
        const accounts = ['acc_checking_001', 'acc_savings_001', 'acc_credit_001'];
        const descriptions = [
            { text: 'Aramco Fuel Station', category: 'EXPENSE', amount: -150.00 },
            { text: 'SABIC Raw Materials Supplier', category: 'EXPENSE', amount: -12400.00 },
            { text: 'STC Telecom Bill', category: 'EXPENSE', amount: -650.00 },
            { text: 'Point of Sale Retail Daily Settlement', category: 'REVENUE', amount: 8430.25 },
            { text: 'Riyadh Port Customs Duty VAT Exempt Cargo', category: 'EXPENSE', amount: -1500.00 },
            { text: 'Miza Real Estate Office Rent', category: 'EXPENSE', amount: -4500.00 },
            { text: 'Saudi Electric Company SEC', category: 'EXPENSE', amount: -1120.45 },
            { text: 'Client Payout Invoice Transfer Acme Corp', category: 'REVENUE', amount: 35000.00 },
            { text: 'MoH Medical Compound Purchase', category: 'EXPENSE', amount: -3400.00 },
            { text: 'ELM SaaS API Subscription Fees', category: 'EXPENSE', amount: -850.00 }
        ];

        const transactions: BankTransaction[] = [];
        const baseDate = new Date();

        for (let i = 0; i < count; i++) {
            const rDesc = descriptions[Math.floor(Math.random() * descriptions.length)];
            const selectAcc = accounts[Math.floor(Math.random() * accounts.length)];
            const txDate = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);

            transactions.push({
                id: `bk_tx_sim_${Date.now().toString().slice(-6)}_${i}`,
                bankAccountId: selectAcc,
                tenantId,
                externalId: `PLAID-REF-${Math.floor(100000 + Math.random() * 900000)}`,
                date: txDate.toISOString().split('T')[0],
                description: rDesc.text,
                amount: parseFloat((rDesc.amount * (0.8 + Math.random() * 0.4)).toFixed(2)),
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            });
        }

        return transactions;
    }

    /**
     * Pull transaction feed from the sandbox bank proxy with caching
     */
    static async getMockTransactionsFeed(tenantId: string, refresh: boolean = false): Promise<BankTransaction[]> {
        const key = `${this.STORAGE_KEY}_${tenantId}`;
        const cached = await StorageAdapter.getItem<BankTransaction[]>(key, []);

        if (cached.length > 0 && !refresh) {
            return cached;
        }

        // Initialize bank accounts if required
        await this.initializeMockAccounts(tenantId);

        const freshTx = this.generateMockTransactions(tenantId, 15);
        await StorageAdapter.setItem<BankTransaction[]>(key, freshTx);
        return freshTx;
    }
}
