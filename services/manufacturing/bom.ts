

import { DbEngine } from '../core/db';
import { BillOfMaterials } from '../core/types';
import { CreateBomDTO } from './types';

export const BomService = {
    async getAll(): Promise<BillOfMaterials[]> {
        return DbEngine.select<BillOfMaterials>('boms', { orderBy: 'name', orderDir: 'asc' });
    },

    async create(dto: CreateBomDTO): Promise<BillOfMaterials> {
        const bom: BillOfMaterials = {
            id: `bom-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            finishedGoodId: dto.finishedGoodId,
            name: dto.name,
            bomVersion: '1.0',
            items: dto.items,
            laborCostPerUnit: dto.laborCost,
            overheadCostPerUnit: dto.overheadCost,
            isActive: true
        };
        return DbEngine.insert('boms', bom);
    }
};