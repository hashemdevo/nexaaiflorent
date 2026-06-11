
import { SalaryComponent } from './types';

/**
 * Core Calculation Engine for Payroll.
 * In a real enterprise system, this would handle complex tax brackets, social security, etc.
 */
export const PayrollEngine = {
    
    calculateNetPay(basicSalary: number, components: SalaryComponent[]) {
        let gross = basicSalary;
        let taxableIncome = basicSalary;
        let totalDeductions = 0;

        // 1. Process Earnings
        components.filter(c => c.type === 'EARNING').forEach(c => {
            gross += c.amount;
            if (c.taxable) taxableIncome += c.amount;
        });

        // 2. Calculate Tax (Mock Flat Rate 15% for demo)
        const tax = taxableIncome * 0.15;

        // 3. Process Deductions
        components.filter(c => c.type === 'DEDUCTION').forEach(c => {
            totalDeductions += c.amount;
        });

        // 4. Net
        const net = gross - tax - totalDeductions;

        return {
            gross,
            tax,
            totalDeductions,
            net
        };
    }
};
