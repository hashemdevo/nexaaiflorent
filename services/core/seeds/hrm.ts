
import { DbEngine } from '../db';
import { Department } from '../../core/types';

export const SeedHRM = {
    async run(trx: any) {
        const departments: Department[] = [
            { id: 'dept-1', tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1, name: 'Engineering' },
            { id: 'dept-2', tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1, name: 'Sales' },
            { id: 'dept-3', tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1, name: 'Human Resources' },
        ];

        for (const d of departments) await DbEngine.insert('departments', d, trx);
    }
};
