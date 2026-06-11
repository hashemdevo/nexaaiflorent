
import { DbEngine } from '../core/db';
import { Opportunity, Interaction } from '../core/types';
import { CreateOpportunityDTO, LogInteractionDTO } from './types';

export const OpportunityService = {
    async getPipeline(): Promise<Opportunity[]> {
        return DbEngine.select<Opportunity>('opportunities', { orderBy: 'stage', orderDir: 'asc' });
    },

    async create(dto: CreateOpportunityDTO): Promise<Opportunity> {
        const probabilityMap: Record<string, number> = {
            'PROSPECTING': 10,
            'QUALIFICATION': 30,
            'PROPOSAL': 60,
            'NEGOTIATION': 80,
            'CLOSED_WON': 100,
            'CLOSED_LOST': 0
        };

        const opp: Opportunity = {
            id: `opp-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            probability: probabilityMap[dto.stage] || 10,
            ...dto
        };
        return DbEngine.insert('opportunities', opp);
    },

    async updateStage(id: string, stage: Opportunity['stage']): Promise<Opportunity> {
        const probabilityMap: Record<string, number> = {
            'PROSPECTING': 10,
            'QUALIFICATION': 30,
            'PROPOSAL': 60,
            'NEGOTIATION': 80,
            'CLOSED_WON': 100,
            'CLOSED_LOST': 0
        };
        
        return DbEngine.update<Opportunity>('opportunities', id, { 
            stage, 
            probability: probabilityMap[stage] 
        });
    },

    async logInteraction(dto: LogInteractionDTO): Promise<Interaction> {
        const interaction: Interaction = {
            id: `int-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            date: new Date().toISOString(),
            ...dto
        };
        return DbEngine.insert('interactions', interaction);
    }
};
