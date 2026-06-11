import { DbEngine } from '../core/db';
import { ClientEmployee } from '../../types';
import { BaseEntity } from '../core/types';
import { AuditService } from '../admin/audit';

interface EnterpriseEmployee extends ClientEmployee, Omit<BaseEntity, 'id'> {}

export const EmployeeService = {
    async getAll(): Promise<ClientEmployee[]> {
        return DbEngine.select<EnterpriseEmployee>('users', { orderBy: 'name', orderDir: 'asc' });
    },

    async add(data: Partial<ClientEmployee>, actorName: string): Promise<ClientEmployee> {
        const trx = await DbEngine.startTransaction();
        
        try {
            const newEmployee: EnterpriseEmployee = {
                id: `emp-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                name: data.name || 'New User',
                email: data.email || '',
                role: data.role || 'VIEWER',
                status: 'ACTIVE',
                // Force temporary password and setup required
                password: data.password || 'temp123',
                isSetupComplete: false, // MANDATORY: Force new user to setup
                twoFaSecret: undefined,
                permissions: data.permissions,
                phone: data.phone,
                companyName: data.companyName,
                industry: data.industry
            };

            await DbEngine.insert('users', newEmployee, trx);
            await AuditService.log('sys', actorName, 'CREATE', newEmployee.name, `Added employee ${newEmployee.email} (Pending Setup)`, trx);
            
            await trx.commit();
            return newEmployee;
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    },

    async update(employee: ClientEmployee, actorName: string): Promise<ClientEmployee> {
        const trx = await DbEngine.startTransaction();
        try {
            await DbEngine.update<EnterpriseEmployee>('users', employee.id, employee, trx);
            await AuditService.log('sys', actorName, 'UPDATE', employee.name, `Updated profile details`, trx);
            await trx.commit();
            return employee;
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    },

    async delete(id: string, actorName: string): Promise<void> {
        const trx = await DbEngine.startTransaction();
        try {
            // Simulate Delete by update status
            const emp = (await DbEngine.select<EnterpriseEmployee>('users', { where: { id } }))[0];
            if(emp) {
                await DbEngine.update<EnterpriseEmployee>('users', id, { status: 'SUSPENDED' }, trx); // Soft Delete
                await AuditService.log('sys', actorName, 'DELETE', emp.name, 'User removed (Soft Delete)', trx);
            }
            await trx.commit();
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};