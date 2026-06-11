import { DbEngine } from '../core/db';
import { Timesheet, Project, BaseEntity } from '../core/types';
import { ClientEmployee } from '../../types';
import { LogTimeDTO } from './types';

interface EnterpriseEmployee extends ClientEmployee, Omit<BaseEntity, 'id'> {
    hourlyRate?: number;
}

export const TimesheetService = {
    async logTime(dto: LogTimeDTO): Promise<Timesheet> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Get Employee Rate
            const emps = await DbEngine.select<EnterpriseEmployee>('users', { where: { id: dto.employeeId } });
            const emp = emps[0];
            const rate = emp?.hourlyRate || 0; 
            const cost = rate * dto.hours;

            // 2. Create Timesheet
            const timesheet: Timesheet = {
                id: `ts-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                employeeId: dto.employeeId,
                projectId: dto.projectId,
                date: dto.date,
                hours: dto.hours,
                hourlyRate: rate,
                description: dto.description,
                status: 'SUBMITTED'
            };
            await DbEngine.insert('timesheets', timesheet, trx);

            // 3. Update Project Cost
            const projects = await DbEngine.select<Project>('projects', { where: { id: dto.projectId } });
            if (projects.length > 0) {
                const proj = projects[0];
                await DbEngine.update<Project>('projects', dto.projectId, { 
                    totalCost: proj.totalCost + cost 
                }, trx);
            }

            await trx.commit();
            return timesheet;

        } catch (e) {
            await trx.rollback();
            throw e;
        }
    },

    async getProjectTimesheets(projectId: string): Promise<Timesheet[]> {
        return DbEngine.select<Timesheet>('timesheets', { where: { projectId }, orderBy: 'date', orderDir: 'desc' });
    }
};