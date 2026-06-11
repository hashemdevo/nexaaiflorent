
import { AccountService } from '../ledger/accounts';
import { Account } from '../../types';

export interface FinancialReportLine {
    accountId: string;
    accountName: string;
    accountCode: string;
    balance: number;
}

export interface FinancialStatementSection {
    title: string;
    total: number;
    lines: FinancialReportLine[];
}

export interface BalanceSheet {
    assets: FinancialStatementSection;
    liabilities: FinancialStatementSection;
    equity: FinancialStatementSection;
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
    check: boolean; // Assets == Liabilities + Equity
}

export interface IncomeStatement {
    revenue: FinancialStatementSection;
    expenses: FinancialStatementSection;
    netIncome: number;
}

export const FinancialReportingService = {
    
    async getBalanceSheet(): Promise<BalanceSheet> {
        const accounts = await AccountService.getAll();
        
        // 1. Filter by Type
        const assets = accounts.filter(a => a.type === 'ASSET');
        const liabilities = accounts.filter(a => a.type === 'LIABILITY');
        const equity = accounts.filter(a => a.type === 'EQUITY');

        // 2. Helper to map to report line
        const mapLine = (acc: Account): FinancialReportLine => ({
            accountId: acc.id,
            accountName: acc.name,
            accountCode: acc.code,
            balance: acc.balance
        });

        // 3. Construct Sections
        const assetSection = {
            title: 'Assets',
            total: assets.reduce((sum, a) => sum + a.balance, 0),
            lines: assets.map(mapLine)
        };

        const liabilitySection = {
            title: 'Liabilities',
            total: liabilities.reduce((sum, a) => sum + a.balance, 0),
            lines: liabilities.map(mapLine)
        };

        const equitySection = {
            title: 'Equity',
            total: equity.reduce((sum, a) => sum + a.balance, 0),
            lines: equity.map(mapLine)
        };

        // 4. Validate Accounting Equation
        // Note: In a real system, current year Net Income must be calculated and added to Equity (Retained Earnings) dynamically
        // before this check passes if the fiscal year hasn't been closed.
        
        const totalAssets = assetSection.total;
        const totalLiabilitiesAndEquity = liabilitySection.total + equitySection.total;
        
        // Allow small floating point diff
        const check = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

        return {
            assets: assetSection,
            liabilities: liabilitySection,
            equity: equitySection,
            totalAssets,
            totalLiabilitiesAndEquity,
            check
        };
    },

    async getIncomeStatement(): Promise<IncomeStatement> {
        const accounts = await AccountService.getAll();

        const revenue = accounts.filter(a => a.type === 'REVENUE');
        const expenses = accounts.filter(a => a.type === 'EXPENSE');

        const mapLine = (acc: Account): FinancialReportLine => ({
            accountId: acc.id,
            accountName: acc.name,
            accountCode: acc.code,
            // For P&L, credit balance on revenue is "positive" income, debit on expense is "positive" cost
            // Assuming DB stores normal balance as positive
            balance: acc.balance 
        });

        const revenueSection = {
            title: 'Revenue',
            total: revenue.reduce((sum, a) => sum + a.balance, 0),
            lines: revenue.map(mapLine)
        };

        const expenseSection = {
            title: 'Operating Expenses',
            total: expenses.reduce((sum, a) => sum + a.balance, 0),
            lines: expenses.map(mapLine)
        };

        const netIncome = revenueSection.total - expenseSection.total;

        return {
            revenue: revenueSection,
            expenses: expenseSection,
            netIncome
        };
    }
};
