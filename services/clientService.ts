
import { ClientEmployee, ClientActivityLog } from '../types';
import { EmployeeService } from './client/employees';
import { AuditService } from './admin/audit';

/**
 * ADAPTER: Bridges legacy calls to the new Async Enterprise Architecture.
 * Now fully powered by Firestore via EmployeeService.
 */
export const ClientService = {
    
    // --- Employee Management ---
    
    async getEmployees(): Promise<ClientEmployee[]> {
        return EmployeeService.getAll();
    },

    /**
     * @deprecated Use EmployeeService.add directly for transactions.
     */
    async addEmployee(employeeData: Partial<ClientEmployee>, actorName: string): Promise<ClientEmployee> {
        return EmployeeService.add(employeeData, actorName);
    },

    /**
     * @deprecated Use EmployeeService.update directly.
     */
    async updateEmployee(employee: ClientEmployee, actorName: string): Promise<ClientEmployee> {
        return EmployeeService.update(employee, actorName);
    },

    /**
     * @deprecated Use EmployeeService.delete directly.
     */
    async deleteEmployee(id: string, actorName: string): Promise<void> {
        return EmployeeService.delete(id, actorName);
    },

    // --- Client Activity Log ---

    async getLogs(): Promise<ClientActivityLog[]> {
        // Mapping Audit Logs (System) to Client Activity Log format
        const audits = await AuditService.getLogs(50);
        return audits.map(a => ({
            id: a.id,
            timestamp: a.timestamp,
            actor: a.actorName,
            action: a.action,
            details: `${a.target}: ${a.details || ''}`
        }));
    },

    async logActivity(actor: string, action: string, details: string) {
        await AuditService.log('sys', actor, action, 'System', details);
    }
};
