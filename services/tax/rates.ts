
import { DbEngine } from '../core/db';
import { TaxRate } from '../core/types';
import { CreateTaxRateDTO } from './types';

export const TaxRateService = {
    async getAll(): Promise<TaxRate[]> {
        return DbEngine.select<TaxRate>('tax_rates', { orderBy: 'name', orderDir: 'asc' });
    },

    async create(dto: CreateTaxRateDTO): Promise<TaxRate> {
        const rate: TaxRate = {
            id: `tax-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            name: dto.name,
            code: dto.code,
            rate: dto.rate,
            glAccountId: dto.glAccountId,
            type: dto.type || 'PERCENTAGE'
        };
        return DbEngine.insert('tax_rates', rate);
    },

    async update(id: string, updates: Partial<TaxRate>): Promise<TaxRate> {
        return DbEngine.update('tax_rates', id, updates);
    }
};
