
import { PayRun, Payslip } from '../core/types';

export type { PayRun, Payslip };

export interface SalaryComponent {
    name: string;
    amount: number;
    type: 'EARNING' | 'DEDUCTION';
    taxable: boolean;
}

export interface CreatePayRunDTO {
    periodStart: string;
    periodEnd: string;
    paymentDate: string;
    employeeIds: string[]; // List of employees to include
}
