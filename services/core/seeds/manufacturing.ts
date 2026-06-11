
import { DbEngine } from '../db';
import { BillOfMaterials } from '../../core/types';

export const SeedManufacturing = {
    async run(trx: any) {
        // Assuming 'inv-3' is Premium Latte from main seeder
        const bom: BillOfMaterials = {
            id: 'bom-1', tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1,
            name: 'Premium Latte Recipe',
            finishedGoodId: 'inv-3',
            bomVersion: '1.0',
            items: [
                { itemId: 'inv-1', quantity: 0.02 }, // 20g Coffee
                { itemId: 'inv-2', quantity: 1 }     // 1 Cup
            ],
            laborCostPerUnit: 0.50,
            overheadCostPerUnit: 0.20,
            isActive: true
        };

        await DbEngine.insert('boms', bom, trx);
    }
};
