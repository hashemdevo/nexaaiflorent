import { DbEngine } from '../core/db';
import { AuditLogEntry } from '../../types';
import { BaseEntity } from '../core/types';

interface EnterpriseAuditLog extends AuditLogEntry, Omit<BaseEntity, 'id'> {}

export const AuditService = {
    async log(actorId: string, actorName: string, action: string, target: string, details?: string, transaction?: any) {
        const entry: EnterpriseAuditLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            tenantId: 'default', // In real multi-tenant app, this comes from context
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            timestamp: new Date().toISOString(),
            actorId,
            actorName,
            action: action as any,
            target,
            details
        };

        await DbEngine.insert('audit_logs', entry, transaction);
        return entry;
    },

    async getLogs(limit: number = 1000): Promise<AuditLogEntry[]> {
        return DbEngine.select<EnterpriseAuditLog>('audit_logs', { 
            orderBy: 'timestamp', 
            orderDir: 'desc',
            limit: limit 
        });
    }
};