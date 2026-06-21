
import { Budget } from '../core/types';

export type { Budget };

export interface SetBudgetDTO {
    fiscalYear: number;
    glAccountId: string;
    amount: number;
    period: 'ANNUAL' | 'MONTHLY';
}
