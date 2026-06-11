import { DbEngine } from '../core/db';
import { ProfitCenter } from './types';

export const ProfitCenterService = {
    async create(tenantId: string, data: Omit<ProfitCenter, keyof import('../../types/enterprise').BaseEntity>) {
        return DbEngine.insert<ProfitCenter>('profit_centers', {
            ...data,
            tenantId,
        } as any);
    },

    async update(id: string, data: Partial<ProfitCenter>) {
        return DbEngine.update<ProfitCenter>('profit_centers', id, data);
    },

    async getById(id: string) {
        return DbEngine.getOne<ProfitCenter>('profit_centers', id);
    },

    async list(tenantId: string, options?: any) {
        return DbEngine.select<ProfitCenter>('profit_centers', {
            ...options,
            where: {
                ...options?.where,
                tenantId
            }
        });
    }
};
