
import { BaseEntity } from './base';

export interface PayRun extends BaseEntity {
    periodStart: string;
    periodEnd: string;
    paymentDate: string;
    totalGross: number;
    totalNet: number;
    totalTax: number;
    status: 'DRAFT' | 'APPROVED' | 'PAID';
    journalEntryId?: string;
}

export interface Payslip extends BaseEntity {
    payRunId: string;
    employeeId: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    tax: number;
    netPay: number;
    status: 'DRAFT' | 'ISSUED';
}

export interface ExpenseClaim extends BaseEntity {
    employeeId: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
    approvedBy?: string;
    receiptUrl?: string;
    journalEntryId?: string;
}

export interface Department extends BaseEntity {
    name: string;
    managerId?: string;
    costCenterId?: string;
}

export interface LeaveRequest extends BaseEntity {
    employeeId: string;
    type: 'VACATION' | 'SICK' | 'UNPAID';
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvedBy?: string;
}

export interface KpiObjective extends BaseEntity {
    employeeId: string;
    title: string;          // e.g., "Increase Sales by 10%"
    category: 'FINANCIAL' | 'CUSTOMER' | 'INTERNAL_PROCESS' | 'LEARNING_GROWTH';
    targetValue: number;
    currentValue: number;
    unit: string;           // e.g., "%", "$", "Count"
    period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    startDate: string;
    endDate: string;
    status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'ACHIEVED';
    weight: number;         // percentage of total performance (0-100)
    notes?: string;
    lastUpdated: string;
}

export interface PerformanceReview extends BaseEntity {
    employeeId: string;
    reviewerId: string;
    date: string;
    rating: number;
    comments: string;
    goals: string;
    evaluationCriteria?: {
        qualityOfWork: number; // 1-5
        communication: number; // 1-5
        teamwork: number; // 1-5
        initiative: number; // 1-5
        technicalSkills: number; // 1-5
    };
    strengths?: string;
    areasForImprovement?: string;
}
