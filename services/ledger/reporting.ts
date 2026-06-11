
import { JournalService } from './journal';
import { AccountService } from './accounts';

export const ReportingService = {
    
    async getTrialBalance() {
        const accounts = await AccountService.getAll();
        const ledger = await JournalService.getAll();
        
        // In a real SQL DB, this would be: SELECT accountId, SUM(debit), SUM(credit) FROM ... GROUP BY accountId
        // Here we simulate the aggregation engine.
        
        const balances: Record<string, { debit: number, credit: number, name: string }> = {};

        // Initialize
        accounts.forEach(acc => {
            balances[acc.id] = { debit: 0, credit: 0, name: acc.name };
        });

        // Aggregate
        ledger.forEach(entry => {
            entry.lines.forEach(line => {
                const accId = line.accountId;
                if (balances[accId]) {
                    balances[accId].debit += line.debit;
                    balances[accId].credit += line.credit;
                }
            });
        });

        return Object.keys(balances).map(id => ({
            account: balances[id].name,
            debit: balances[id].debit,
            credit: balances[id].credit
        }));
    }
};
