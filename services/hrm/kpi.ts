import { DbEngine } from '../core/db';
import { KpiObjective } from '../core/types';
import { AuditService } from '../admin/audit';

export type CreateKpiDTO = Omit<KpiObjective, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'version' | 'lastUpdated'>;

export const KpiService = {
    async getByEmployee(employeeId: string): Promise<KpiObjective[]> {
        return DbEngine.select<KpiObjective>('kpi_objectives', { 
            where: { employeeId },
            orderBy: 'endDate',
            orderDir: 'desc' 
        });
    },

    async create(dto: CreateKpiDTO): Promise<KpiObjective> {
        const trx = await DbEngine.startTransaction();

        try {
            const kpi: KpiObjective = {
                ...dto,
                id: `kpi-${Date.now()}`,
                tenantId: 'default', // In a real app we'd load this from auth context
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                lastUpdated: new Date().toISOString()
            };

            await DbEngine.insert('kpi_objectives', kpi, trx);
            await AuditService.log('hrm', 'SYSTEM', 'CREATE', `KPI for ${dto.employeeId}`, `Category: ${dto.category}`, trx);

            await trx.commit();
            return kpi;
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    },

    async updateProgress(id: string, currentValue: number, status: KpiObjective['status'], notes?: string): Promise<void> {
        const trx = await DbEngine.startTransaction();

        try {
            const updates: Partial<KpiObjective> = {
                currentValue,
                status,
                lastUpdated: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            if (notes !== undefined) {
                updates.notes = notes;
            }
            await DbEngine.update('kpi_objectives', id, updates, trx);
            await AuditService.log('hrm', 'SYSTEM', 'UPDATE', `KPI Progress ${id}`, `Value: ${currentValue}, Status: ${status}`, trx);
            await trx.commit();
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};
