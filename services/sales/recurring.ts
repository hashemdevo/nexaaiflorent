
import { DbEngine } from '../core/db';
import { RecurringInvoice } from '../core/types';
import { CreateRecurringProfileDTO } from './types';
import { InvoiceService } from './invoices';
import { AuditService } from '../admin/audit';

export const RecurringSalesService = {
    
    async createProfile(dto: CreateRecurringProfileDTO): Promise<RecurringInvoice> {
        const profile: RecurringInvoice = {
            id: `rec-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            status: 'ACTIVE',
            ...dto
        };
        return DbEngine.insert('recurring_invoices', profile);
    },

    async processDueProfiles(): Promise<number> {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Find active profiles due today or before
        const allProfiles = await DbEngine.select<RecurringInvoice>('recurring_invoices', { where: { status: 'ACTIVE' } });
        const dueProfiles = allProfiles.filter(p => p.nextRunDate <= today);

        let processed = 0;
        const trx = await DbEngine.startTransaction();

        try {
            for (const profile of dueProfiles) {
                // 2. Generate Invoice
                // Note: InvoiceService.createInvoice manages its own transaction logic. 
                // In a perfect Enterprise pattern, we would pass 'trx' to it. 
                // For now, we call it separately to ensure invoice generation logic is reused.
                // Ideally: await InvoiceService.createInvoice(..., trx);
                
                // Mocking the call without trx for now as InvoiceService handles it internally
                await InvoiceService.createInvoice(
                    profile.customerId,
                    profile.items,
                    today,
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Net 30
                );

                // 3. Update Profile Next Run
                const nextDate = new Date(profile.nextRunDate);
                if (profile.frequency === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
                if (profile.frequency === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
                if (profile.frequency === 'QUARTERLY') nextDate.setMonth(nextDate.getMonth() + 3);
                if (profile.frequency === 'ANNUALLY') nextDate.setFullYear(nextDate.getFullYear() + 1);

                await DbEngine.update<RecurringInvoice>('recurring_invoices', profile.id, {
                    lastRunDate: today,
                    nextRunDate: nextDate.toISOString().split('T')[0]
                }, trx);

                processed++;
            }

            await AuditService.log('sys', 'Scheduler', 'CREATE', 'Recurring Run', `Processed ${processed} invoices`, trx);
            await trx.commit();
            
            return processed;

        } catch (error) {
            await trx.rollback();
            console.error("Recurring Run Failed", error);
            throw error;
        }
    }
};
