import { BaseEntity } from '../../types/enterprise';

export interface CostCenter extends BaseEntity {
    code: string;
    name: string;
    nameEn?: string;
    description?: string;
    managerId?: string; // employeeId
    parentId?: string; // costCenterId for hierarchy
    isActive: boolean;
    budgetLimit?: number;
    currency?: string;
}

export interface ProfitCenter extends BaseEntity {
    code: string;
    name: string;
    nameEn?: string;
    description?: string;
    managerId?: string; 
    parentId?: string; 
    isActive: boolean;
    targetRevenue?: number;
    currency?: string;
}

export interface FinancialProject extends BaseEntity {
    code: string;
    name: string;
    nameEn?: string;
    description?: string;
    managerId?: string;
    status: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    endDate?: string;
    budgetLimit?: number;
    currency?: string;
}
