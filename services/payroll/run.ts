import { DbEngine } from '../core/db';
import { PayRun, Payslip, BaseEntity } from '../core/types';
import { CreatePayRunDTO } from './types';
import { PayrollEngine } from './engine';
import { JournalService } from '../ledger/journal';
import { JournalEntryLine } from '../../types';
import { ClientEmployee } from '../../types';

interface EnterpriseEmployee extends ClientEmployee, Omit<BaseEntity, 'id'> {
    baseSalary?: number; // Extended field for DB user
}

export const PayRunService = {
    
    async createDraftRun(dto: CreatePayRunDTO): Promise<PayRun> {
        const trx = await DbEngine.startTransaction();
        
        try {
            const payRunId = `prun-${Date.now()}`;
            let totalGross = 0;
            let totalTax = 0;
            let totalNet = 0;

            // 1. Iterate Employees
            for (const empId of dto.employeeIds) {
                // In real app: fetch employee salary details from a dedicated 'employee_salaries' table
                // Here we mock it based on 'users' table if we had salary info there
                const employees = await DbEngine.select<EnterpriseEmployee>('users', { where: { id: empId } });
                const emp = employees[0];
                
                if (!emp) continue;

                const baseSalary = emp.baseSalary || 5000; // Default mock salary if missing

                // Check for approved unpaid leaves for this employee within the database
                let extraDeductions = 0;
                let unpaidLeaveDays = 0;
                try {
                    const leaves = await DbEngine.select<any>('leave_requests', { 
                        where: { employeeId: empId, status: 'APPROVED' } 
                    });
                    
                    if (leaves && leaves.length > 0) {
                        leaves.forEach(l => {
                            if (l.type === 'UNPAID') {
                                unpaidLeaveDays += l.days || 0;
                            }
                        });
                    }
                } catch (e) {
                    console.warn(`Could not calculate leave requests deduction for user: ${empId}`, e);
                }

                if (unpaidLeaveDays > 0) {
                    extraDeductions = Math.round((baseSalary / 30) * unpaidLeaveDays);
                }

                const components = extraDeductions > 0 ? [
                    { name: `خصم إجازة غير مدفوعة (أيام: ${unpaidLeaveDays})`, amount: extraDeductions, type: 'DEDUCTION' as const, taxable: false }
                ] : [];

                const calc = PayrollEngine.calculateNetPay(baseSalary, components);

                const payslip: Payslip = {
                    id: `pslip-${Date.now()}-${empId}`,
                    tenantId: 'default',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                    payRunId,
                    employeeId: empId,
                    basicSalary: baseSalary,
                    allowances: 0,
                    deductions: calc.totalDeductions,
                    tax: calc.tax,
                    netPay: calc.net,
                    status: 'DRAFT'
                };

                await DbEngine.insert('payslips', payslip, trx);

                totalGross += calc.gross;
                totalTax += calc.tax;
                totalNet += calc.net;
            }

            // 2. Create Pay Run Header
            const payRun: PayRun = {
                id: payRunId,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                periodStart: dto.periodStart,
                periodEnd: dto.periodEnd,
                paymentDate: dto.paymentDate,
                totalGross,
                totalNet,
                totalTax,
                status: 'DRAFT'
            };

            await DbEngine.insert('pay_runs', payRun, trx);
            await trx.commit();
            
            return payRun;

        } catch (e) {
            await trx.rollback();
            throw e;
        }
    },

    async approveAndPost(payRunId: string): Promise<void> {
        const trx = await DbEngine.startTransaction();
        try {
            // 1. Get Pay Run
            const runs = await DbEngine.select<PayRun>('pay_runs', { where: { id: payRunId } });
            const run = runs[0];
            if (!run) throw new Error("Pay Run not found");

            // 2. Create Journal Entry
            // Debit: Salaries Expense
            // Credit: Tax Payable
            // Credit: Bank (Net Pay)
            
            const glLines: JournalEntryLine[] = [
                {
                    accountId: '5001', // Salaries Expense
                    accountName: 'Salaries Expense',
                    debit: run.totalGross,
                    credit: 0
                },
                {
                    accountId: '2020', // Tax Payable (Liability) - Mock ID
                    accountName: 'Payroll Tax Payable',
                    debit: 0,
                    credit: run.totalTax
                },
                {
                    accountId: '1010', // Cash/Bank
                    accountName: 'Cash',
                    debit: 0,
                    credit: run.totalNet
                }
            ];

            const journalEntry = await JournalService.postEntry({
                transactionDate: run.paymentDate,
                postedDate: new Date().toISOString(),
                reference: `PAYROLL-${run.id}`,
                description: `Payroll Run ${run.periodStart} to ${run.periodEnd}`,
                lines: glLines,
                totalAmount: run.totalGross,
                createdBy: 'SYSTEM'
            }, trx);

            // 3. Update Pay Run Status
            await DbEngine.update<PayRun>('pay_runs', payRunId, {
                status: 'PAID',
                journalEntryId: journalEntry.id
            }, trx);

            // 4. Update Payslips status
            const payslips = await DbEngine.select<Payslip>('payslips', { where: { payRunId } });
            for(const slip of payslips) {
                if(slip.id) {
                    await DbEngine.update<Payslip>('payslips', slip.id, { status: 'ISSUED' }, trx);
                }
            }

            await trx.commit();
        } catch(e) {
            await trx.rollback();
            throw e;
        }
    }
};