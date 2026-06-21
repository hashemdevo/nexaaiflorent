
import { DbEngine } from '../core/db';
import { RecurringInvoice, Bill } from '../core/types';
import { Account } from '../../types';
import { AccountService } from '../ledger/accounts';
import { CashFlowForecast } from './types';

export const CashFlowForecaster = {
    async predict(months: number = 3): Promise<CashFlowForecast[]> {
        const today = new Date();
        const forecasts: CashFlowForecast[] = [];
        
        // 1. Get Current Cash Balance
        const accounts = await AccountService.getAll();
        const cashAccounts = accounts.filter(a => a.type === 'ASSET' && a.name.toLowerCase().includes('cash')); // Simple heuristic
        let currentBalance = cashAccounts.reduce((sum, a) => sum + a.balance, 0);

        // 2. Get Known Future Outflows (Unpaid Bills)
        const bills = await DbEngine.select<Bill>('bills', { where: { status: 'OPEN' } });
        
        // 3. Get Known Future Inflows (Recurring Invoices)
        const recurring = await DbEngine.select<RecurringInvoice>('recurring_invoices', { where: { status: 'ACTIVE' } });

        for (let i = 0; i < months * 30; i++) { // Daily projection
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);
            const dateStr = targetDate.toISOString().split('T')[0];

            let dailyInflow = 0;
            let dailyOutflow = 0;

            // A. Bills due this day
            const billsDue = bills.filter(b => b.dueDate === dateStr);
            dailyOutflow += billsDue.reduce((sum, b) => sum + b.balanceDue, 0);

            // B. Recurring Invoices triggering this day (Simplified frequency check)
            recurring.forEach(rec => {
                if (rec.nextRunDate === dateStr) {
                    const amount = rec.items.reduce((sum, item) => sum + item.total, 0);
                    dailyInflow += amount;
                    // In real logic, we'd project the next run date too for future loops
                }
            });

            // C. Estimate random sales (noise) based on historical average
            // const dailySalesAvg = 500; 
            // dailyInflow += dailySalesAvg;

            currentBalance = currentBalance + dailyInflow - dailyOutflow;

            // Only push weekly or important data points to save size
            if (i % 7 === 0) {
                forecasts.push({
                    date: dateStr,
                    predictedInflow: dailyInflow,
                    predictedOutflow: dailyOutflow,
                    predictedBalance: currentBalance
                });
            }
        }

        return forecasts;
    }
};
