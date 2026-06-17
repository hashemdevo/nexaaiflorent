
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

type EventCallback = (payload: any) => void | Promise<void>;
const listenersReg: Record<string, EventCallback[]> = {};

export const EventBus = {
    on(type: string, callback: EventCallback) {
        if (!listenersReg[type]) {
            listenersReg[type] = [];
        }
        listenersReg[type].push(callback);
    },

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

        // Fire in-memory callbacks as well
        if (listenersReg[type]) {
            for (const cb of listenersReg[type]) {
                try {
                    const res = cb(payload);
                    if (res instanceof Promise) {
                        await res;
                    }
                } catch (e) {
                    console.error(`[EventBus] Callback error for ${type}:`, e);
                }
            }
        }
    }
};

