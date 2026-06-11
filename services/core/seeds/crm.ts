
import { DbEngine } from '../db';
import { Lead, Opportunity } from '../../core/types';

export const SeedCRM = {
    async run(trx: any) {
        // Leads
        const leads: Lead[] = [
            {
                id: 'lead-1', tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1,
                firstName: 'Sarah', lastName: 'Connor', email: 'sarah@skynet.com', companyName: 'Cyberdyne Systems',
                status: 'NEW', source: 'Website'
            },
            {
                id: 'lead-2', tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1,
                firstName: 'Tony', lastName: 'Stark', email: 'tony@stark.com', companyName: 'Stark Industries',
                status: 'QUALIFIED', source: 'Referral'
            }
        ];

        for (const l of leads) await DbEngine.insert('leads', l, trx);

        // Opportunities
        const opportunities: Opportunity[] = [
            {
                id: 'opp-1', tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1,
                name: 'Stark Ind - Annual Contract',
                stage: 'NEGOTIATION',
                expectedRevenue: 500000,
                probability: 80,
                closeDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
            }
        ];

        for (const o of opportunities) await DbEngine.insert('opportunities', o, trx);
    }
};
