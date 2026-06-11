
import { DbEngine } from '../core/db';
import { FixedAsset } from '../core/types';
import { RegisterAssetDTO } from './types';
import { JournalService } from '../ledger/journal';
import { JournalEntryLine } from '../../types';

export const AssetRegistryService = {
    async getAll(): Promise<FixedAsset[]> {
        return DbEngine.select<FixedAsset>('fixed_assets', { orderBy: 'name', orderDir: 'asc' });
    },

    async register(dto: RegisterAssetDTO, createJournalEntry: boolean = true): Promise<FixedAsset> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Create Asset Record
            const asset: FixedAsset = {
                id: `ast-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                ...dto,
                depreciationMethod: 'STRAIGHT_LINE',
                status: 'ACTIVE',
                currentBookValue: dto.purchaseCost
            };

            await DbEngine.insert('fixed_assets', asset, trx);

            // 2. Post Acquisition Journal Entry (Optional, if not coming from a Bill)
            if (createJournalEntry) {
                const glLines: JournalEntryLine[] = [
                    {
                        accountId: dto.assetAccountId,
                        accountName: 'Fixed Asset Cost',
                        debit: dto.purchaseCost,
                        credit: 0
                    },
                    {
                        accountId: '1010', // Assuming Cash/Bank for simplicity, or AP
                        accountName: 'Bank/Clearing',
                        debit: 0,
                        credit: dto.purchaseCost
                    }
                ];

                await JournalService.postEntry({
                    transactionDate: dto.purchaseDate,
                    postedDate: new Date().toISOString(),
                    reference: `AST-REG-${asset.serialNumber || 'NEW'}`,
                    description: `Acquisition of ${asset.name}`,
                    lines: glLines,
                    totalAmount: dto.purchaseCost,
                    createdBy: 'SYSTEM'
                }, trx);
            }

            await trx.commit();
            return asset;

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
