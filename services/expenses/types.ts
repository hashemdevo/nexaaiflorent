
import { ExpenseClaim } from '../core/types';

export type { ExpenseClaim };

export interface SubmitExpenseDTO {
    employeeId: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    receiptBase64?: string;
}
