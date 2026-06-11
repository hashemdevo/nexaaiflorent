
import { DbEngine } from '../core/db';
import { Warehouse } from '../core/types';
import { CreateWarehouseDTO } from './types';

export const WarehouseService = {
    async getAll(): Promise<Warehouse[]> {
        return DbEngine.select<Warehouse>('warehouses', { orderBy: 'name', orderDir: 'asc' });
    },

    async create(dto: CreateWarehouseDTO): Promise<Warehouse> {
        const warehouse: Warehouse = {
            id: `wh-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            name: dto.name,
            location: dto.location,
            code: dto.code
        };
        return DbEngine.insert('warehouses', warehouse);
    }
};
