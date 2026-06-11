
import { DbEngine } from '../core/db';
import { ExpenseClaim } from '../core/types';
import { SubmitExpenseDTO } from './types';

export const ExpenseClaimService = {
    
    async submit(dto: SubmitExpenseDTO): Promise<ExpenseClaim> {
        const claim: ExpenseClaim = {
            id: `exp-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            employeeId: dto.employeeId,
            date: dto.date,
            description: dto.description,
            amount: dto.amount,
            category: dto.category,
            status: 'SUBMITTED',
            // In real app, upload receipt to storage bucket and get URL
            receiptUrl: dto.receiptBase64 ? 'https://storage.nexa.ai/receipts/mock.jpg' : undefined 
        };

        return DbEngine.insert('expense_claims', claim);
    },

    async getPending(): Promise<ExpenseClaim[]> {
        return DbEngine.select<ExpenseClaim>('expense_claims', { where: { status: 'SUBMITTED' } });
    },

    async getByEmployee(employeeId: string): Promise<ExpenseClaim[]> {
        return DbEngine.select<ExpenseClaim>('expense_claims', { where: { employeeId } });
    }
};
