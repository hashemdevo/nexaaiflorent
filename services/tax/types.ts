
import { TaxRate } from '../core/types';

export type { TaxRate };

export interface CreateTaxRateDTO {
    name: string;
    code: string;
    rate: number;
    glAccountId: string;
    type?: 'PERCENTAGE' | 'FIXED';
}
