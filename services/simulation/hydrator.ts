
import { DbEngine } from '../core/db';
import { Invoice, BaseEntity } from '../core/types';
import { JournalEntry } from '../../types';
import { Nexa } from '../api';
import { MathCore } from './math/distributions';
import { SimulationParameters, DataProvenance } from './types';

interface EnterpriseJournalEntry extends JournalEntry, Omit<BaseEntity, 'id'> {}

export const SimulationHydrator = {
    async hydrateParametersFromDB(): Promise<Partial<SimulationParameters>> {
        const provenance: DataProvenance[] = [];
        
        try {
            // 1. Revenue Check
            const invoices = await DbEngine.select<Invoice>('invoices', {});
            const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
            
            // Cross-Reference Journal
            const journal = await DbEngine.select<EnterpriseJournalEntry>('journal_entries', {});
            let ledgerRevenue = 0;
            journal.forEach(entry => {
                entry.lines.forEach(line => {
                    if (line.accountId === '4000') ledgerRevenue += line.credit;
                });
            });

            const isRevenueMatched = Math.abs(totalInvoiced - ledgerRevenue) < 100;

            provenance.push({
                parameter: 'baseRevenue',
                value: totalInvoiced,
                sourceTable: 'invoices',
                recordCount: invoices.length,
                lastTransactionDate: invoices.length > 0 ? invoices[0].updatedAt : new Date().toISOString(),
                confidenceScore: invoices.length === 0 ? 0 : (isRevenueMatched ? 100 : 80),
                integrityCheck: invoices.length === 0 ? 'MISSING' : (isRevenueMatched ? 'MATCH' : 'VARIANCE')
            });

            // 2. Cash & COA
            const accounts = await Nexa.Ledger.Accounts.getAll();
            const cashAccount = accounts.find(a => a.code === '1010');
            const initialCash = cashAccount ? cashAccount.balance : 0;

            provenance.push({
                parameter: 'initialCash',
                value: initialCash,
                sourceTable: 'accounts',
                recordCount: accounts.length,
                lastTransactionDate: new Date().toISOString(),
                confidenceScore: accounts.length > 0 ? 100 : 0,
                integrityCheck: accounts.length >= 5 ? 'MATCH' : 'VARIANCE'
            });

            // 3. DSO
            const arAccount = accounts.find(a => a.code === '1200');
            const currentAR = arAccount ? arAccount.balance : 0;
            const annualizedRevenue = totalInvoiced > 0 ? totalInvoiced : 1; 
            const dso = totalInvoiced > 0 ? (currentAR / annualizedRevenue) * 365 : 0;

            provenance.push({
                parameter: 'daysSalesOutstanding',
                value: Math.ceil(dso),
                sourceTable: 'accounts (AR) + invoices',
                recordCount: invoices.length,
                lastTransactionDate: new Date().toISOString(),
                confidenceScore: totalInvoiced > 0 ? 100 : 0,
                integrityCheck: totalInvoiced > 0 ? 'MATCH' : 'MISSING'
            });

            // 4. Inventory
            const inventoryItems = await DbEngine.select<any>('inventory', {});
            const inventoryValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

            provenance.push({
                parameter: 'inventoryLevel',
                value: inventoryValue,
                sourceTable: 'inventory',
                recordCount: inventoryItems.length,
                lastTransactionDate: new Date().toISOString(),
                confidenceScore: inventoryItems.length > 0 ? 100 : 0,
                integrityCheck: inventoryItems.length > 0 ? 'MATCH' : 'MISSING'
            });

            // 5. Growth & Volatility
            const revenueTrend = await Nexa.Analytics.Sales.getRevenueTrend(6);
            const revenueValues = revenueTrend.map(r => r.revenue);
            const hasData = revenueValues.some(v => v > 0);

            let growthRate = 5;
            let volatility = 15;
            let growthConfidence = 50; 

            if (hasData && revenueValues.length >= 2) {
                const current = revenueValues[revenueValues.length - 1];
                const prev = revenueValues[revenueValues.length - 2];
                if (prev > 0) {
                    growthRate = ((current - prev) / prev) * 100;
                    growthConfidence = 90;
                }
                const stdDev = MathCore.stdDev(revenueValues);
                const meanRev = revenueValues.reduce((a, b) => a + b, 0) / (revenueValues.length || 1);
                volatility = meanRev > 0 ? (stdDev / meanRev) * 100 : 15;
            } else {
                growthConfidence = 0; 
            }

            provenance.push({
                parameter: 'growthRate',
                value: parseFloat(growthRate.toFixed(1)),
                sourceTable: 'analytics_sales_trend',
                recordCount: revenueTrend.length,
                lastTransactionDate: new Date().toISOString(),
                confidenceScore: growthConfidence,
                integrityCheck: hasData ? 'MATCH' : 'ESTIMATED'
            });

            return {
                baseRevenue: totalInvoiced > 0 ? totalInvoiced : 100000,
                initialCash,
                costRatio: 60, 
                daysSalesOutstanding: Math.ceil(dso),
                inventoryLevel: inventoryValue,
                volatility: Math.ceil(volatility),
                growthRate: parseFloat(growthRate.toFixed(1)),
                dataProvenance: provenance
            };

        } catch (error) {
            console.error("Critical Failure in Simulation Data Provenance:", error);
            return {
                dataProvenance: [{
                    parameter: 'SYSTEM_FAILURE',
                    value: 0,
                    sourceTable: 'ERROR',
                    recordCount: 0,
                    lastTransactionDate: new Date().toISOString(),
                    confidenceScore: 0,
                    integrityCheck: 'VARIANCE'
                }]
            };
        }
    }
};
