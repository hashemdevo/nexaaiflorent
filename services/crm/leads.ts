
import { DbEngine } from '../core/db';
import { Lead, Customer } from '../core/types';
import { CreateLeadDTO } from './types';
import { AuditService } from '../admin/audit';

export const LeadService = {
    async getAll(): Promise<Lead[]> {
        return DbEngine.select<Lead>('leads', { orderBy: 'createdAt', orderDir: 'desc' });
    },

    async create(dto: CreateLeadDTO): Promise<Lead> {
        const lead: Lead = {
            id: `lead-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            status: 'NEW',
            ...dto
        };
        return DbEngine.insert('leads', lead);
    },

    async convertToCustomer(leadId: string, actor: string): Promise<Customer> {
        const trx = await DbEngine.startTransaction();

        try {
            const leads = await DbEngine.select<Lead>('leads', { where: { id: leadId } });
            const lead = leads[0];
            if (!lead) throw new Error("Lead not found");
            if (lead.status === 'CONVERTED') throw new Error("Lead already converted");

            // 1. Create Customer
            const customer: Customer = {
                id: `cus-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                name: lead.companyName || `${lead.firstName} ${lead.lastName}`,
                email: lead.email,
                phone: lead.phone,
                status: 'ACTIVE',
                balance: 0
            };
            await DbEngine.insert('customers', customer, trx);

            // 2. Update Lead
            await DbEngine.update<Lead>('leads', leadId, {
                status: 'CONVERTED',
                convertedCustomerId: customer.id
            }, trx);

            // 3. Audit
            await AuditService.log('crm', actor, 'UPDATE', lead.email, `Converted lead to customer ${customer.name}`, trx);

            await trx.commit();
            return customer;

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
