
import { DbEngine } from '../core/db';
import { Department } from '../core/types';

export const DepartmentService = {
    async getAll(): Promise<Department[]> {
        return DbEngine.select<Department>('departments', { orderBy: 'name', orderDir: 'asc' });
    },

    async create(name: string, managerId?: string, costCenterId?: string): Promise<Department> {
        const department: Department = {
            id: `dept-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            name,
            managerId,
            costCenterId
        };
        return DbEngine.insert('departments', department);
    },

    async update(id: string, updates: Partial<Department>): Promise<Department> {
        return DbEngine.update('departments', id, updates);
    }
};
