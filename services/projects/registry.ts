

import { DbEngine } from '../core/db';
import { Project } from '../core/types';
import { CreateProjectDTO } from './types';

export const ProjectRegistryService = {
    async getAll(): Promise<Project[]> {
        return DbEngine.select<Project>('projects', { orderBy: 'name', orderDir: 'asc' });
    },

    async create(dto: CreateProjectDTO): Promise<Project> {
        const project: Project = {
            id: `proj-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            name: dto.name,
            code: dto.code,
            customerId: dto.customerId,
            status: 'PLANNING',
            startDate: dto.startDate,
            budget: dto.budget,
            totalCost: 0,
            totalRevenue: 0
        };
        return DbEngine.insert('projects', project);
    },

    async updateStatus(id: string, status: Project['status']): Promise<Project> {
        return DbEngine.update<Project>('projects', id, { status });
    }
};