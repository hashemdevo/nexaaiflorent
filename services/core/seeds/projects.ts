
import { DbEngine } from '../db';
import { Project } from '../../core/types';

export const SeedProjects = {
    async run(trx: any) {
        const projects: Project[] = [
            {
                id: 'proj-1', tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1,
                name: 'Website Redesign',
                code: 'PRJ-001',
                status: 'IN_PROGRESS',
                startDate: new Date().toISOString(),
                budget: 15000,
                totalCost: 4500,
                totalRevenue: 0
            }
        ];

        for (const p of projects) await DbEngine.insert('projects', p, trx);
    }
};
