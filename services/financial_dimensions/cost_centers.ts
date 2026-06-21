import { DbEngine } from '../core/db';
import { CostCenter } from './types';

export const CostCenterService = {
    async create(tenantId: string, data: Omit<CostCenter, keyof import('../../types/enterprise').BaseEntity>) {
        return DbEngine.insert<CostCenter>('cost_centers', {
            ...data,
            tenantId,
        } as any);
    },

    async update(id: string, data: Partial<CostCenter>) {
        return DbEngine.update<CostCenter>('cost_centers', id, data);
    },

    async getById(id: string) {
        return DbEngine.getOne<CostCenter>('cost_centers', id);
    },

    async list(tenantId: string, options?: any) {
        return DbEngine.select<CostCenter>('cost_centers', {
            ...options,
            where: {
                ...options?.where,
                tenantId
            }
        });
    }
};
