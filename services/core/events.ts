
import { DbEngine } from './db';
import { generateUUIDv7 } from '../../types/enterprise';
import { DbTransaction } from './types';

export interface OutboxEvent {
    id: string;
    type: string;
    aggregateId: string;
    aggregateType: string;
    payload: any;
    occurredOn: string;
    status: 'PENDING' | 'PROCESSED' | 'FAILED';
    error?: string;
    tenantId: string;
}

export const EventBus = {
    async publish(
        type: string,
        aggregateType: string,
        aggregateId: string,
        payload: any,
        tenantId: string,
        trx?: DbTransaction
    ): Promise<void> {
        const event: OutboxEvent = {
            id: generateUUIDv7(),
            type,
            aggregateId,
            aggregateType,
            payload,
            occurredOn: new Date().toISOString(),
            status: 'PENDING',
            tenantId
        };
        
        await DbEngine.insert('outbox_events', event as any, trx);
    }
};

