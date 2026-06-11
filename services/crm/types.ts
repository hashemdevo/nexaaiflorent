
import { Lead, Opportunity, Interaction } from '../core/types';

export type { Lead, Opportunity, Interaction };

export interface CreateLeadDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
    source: string;
}

export interface CreateOpportunityDTO {
    name: string;
    leadId?: string;
    customerId?: string;
    stage: Opportunity['stage'];
    expectedRevenue: number;
    closeDate: string;
}

export interface LogInteractionDTO {
    entityId: string;
    entityType: 'LEAD' | 'OPPORTUNITY' | 'CUSTOMER';
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
    summary: string;
    performedBy: string;
}
