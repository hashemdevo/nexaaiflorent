
import { DbEngine } from '../core/db';
import { FixedAsset, DepreciationLog } from '../core/types';
import { JournalService } from '../ledger/journal';
import { JournalEntryLine } from '../../types';

export const DepreciationService = {
    
    async runDepreciation(fiscalYear: number, month: number): Promise<number> {
        // 1. Find all active assets
        const assets = await DbEngine.select<FixedAsset>('fixed_assets', { where: { status: 'ACTIVE' } });
        
        if (assets.length === 0) return 0;

        const trx = await DbEngine.startTransaction();
        let processedCount = 0;

        try {
            for (const asset of assets) {
                // Basic Straight Line Calculation (Monthly)
                // (Cost - Salvage) / (Life * 12)
                const depreciableAmount = asset.purchaseCost - asset.salvageValue;
                const totalMonths = asset.usefulLifeYears * 12;
                const monthlyAmount = depreciableAmount / totalMonths;

                // Check if already fully depreciated
                if (asset.currentBookValue <= asset.salvageValue) {
                    await DbEngine.update<FixedAsset>('fixed_assets', asset.id, { status: 'FULLY_DEPRECIATED' }, trx);
                    continue;
                }

                const actualAmount = Math.min(monthlyAmount, asset.currentBookValue - asset.salvageValue);

                if (actualAmount <= 0) continue;

                // 2. Create Journal Lines
                const glLines: JournalEntryLine[] = [
                    {
                        accountId: asset.expenseAccountId,
                        accountName: 'Depreciation Expense',
                        debit: actualAmount,
                        credit: 0
                    },
                    {
                        accountId: asset.accumDepreciationAccountId,
                        accountName: 'Accumulated Depreciation',
                        debit: 0,
                        credit: actualAmount
                    }
                ];

                // 3. Post Entry
                const entry = await JournalService.postEntry({
                    transactionDate: new Date(fiscalYear, month - 1, 28).toISOString(), // End of month approx
                    postedDate: new Date().toISOString(),
                    reference: `DEP-${asset.id}-${fiscalYear}-${month}`,
                    description: `Depreciation for ${asset.name} (${month}/${fiscalYear})`,
                    lines: glLines,
                    totalAmount: actualAmount,
                    createdBy: 'SYSTEM'
                }, trx);

                // 4. Update Asset Book Value
                await DbEngine.update<FixedAsset>('fixed_assets', asset.id, {
                    currentBookValue: asset.currentBookValue - actualAmount
                }, trx);

                // 5. Log History
                const log: DepreciationLog = {
                    id: `dlog-${Date.now()}-${asset.id}`,
                    tenantId: 'default',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                    assetId: asset.id,
                    date: new Date().toISOString(),
                    amount: actualAmount,
                    fiscalYear,
                    journalEntryId: entry.id
                };
                await DbEngine.insert('depreciation_logs', log, trx);
                
                processedCount++;
            }

            await trx.commit();
            return processedCount;

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
