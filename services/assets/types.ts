
import { FixedAsset, DepreciationLog } from '../core/types';

export type { FixedAsset, DepreciationLog };

export interface RegisterAssetDTO {
    name: string;
    purchaseDate: string;
    purchaseCost: number;
    salvageValue: number;
    usefulLifeYears: number;
    serialNumber?: string;
    assetAccountId: string;
    accumDepreciationAccountId: string;
    expenseAccountId: string;
}
