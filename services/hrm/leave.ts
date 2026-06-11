
import { DbEngine } from '../core/db';
import { LeaveRequest } from '../core/types';
import { RequestLeaveDTO } from './types';
import { AuditService } from '../admin/audit';

export const LeaveService = {
    async getPending(): Promise<LeaveRequest[]> {
        return DbEngine.select<LeaveRequest>('leave_requests', { where: { status: 'PENDING' } });
    },

    async getByEmployee(employeeId: string): Promise<LeaveRequest[]> {
        return DbEngine.select<LeaveRequest>('leave_requests', { where: { employeeId } });
    },

    async request(dto: RequestLeaveDTO): Promise<LeaveRequest> {
        // Calculate days
        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const request: LeaveRequest = {
            id: `leave-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            status: 'PENDING',
            days,
            ...dto
        };
        return DbEngine.insert('leave_requests', request);
    },

    async approve(requestId: string, approverId: string): Promise<void> {
        const trx = await DbEngine.startTransaction();
        try {
            await DbEngine.update<LeaveRequest>('leave_requests', requestId, {
                status: 'APPROVED',
                approvedBy: approverId
            }, trx);

            // Future: Deduct from Leave Balance in Employee record here

            await AuditService.log('hrm', approverId, 'APPROVE', `Leave #${requestId}`, 'Leave Approved', trx);
            await trx.commit();
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    },

    async reject(requestId: string, approverId: string): Promise<void> {
        await DbEngine.update<LeaveRequest>('leave_requests', requestId, {
            status: 'REJECTED',
            approvedBy: approverId
        });
    }
};
