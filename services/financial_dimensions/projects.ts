import { DbEngine } from '../core/db';
import { FinancialProject } from './types';

export const FinancialProjectService = {
    async create(tenantId: string, data: Omit<FinancialProject, keyof import('../../types/enterprise').BaseEntity>) {
        return DbEngine.insert<FinancialProject>('financial_projects', {
            ...data,
            tenantId,
        } as any);
    },

    async update(id: string, data: Partial<FinancialProject>) {
        return DbEngine.update<FinancialProject>('financial_projects', id, data);
    },

    async getById(id: string) {
        return DbEngine.getOne<FinancialProject>('financial_projects', id);
    },

    async list(tenantId: string, options?: any) {
        return DbEngine.select<FinancialProject>('financial_projects', {
            ...options,
            where: {
                ...options?.where,
                tenantId
            }
        });
    }
};
