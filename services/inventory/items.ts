import { DbEngine } from '../core/db';
import { InventoryItem } from '../../types';
import { BaseEntity } from '../core/types';
import { generateUUIDv7 } from '../../types/enterprise';

interface EnterpriseInventoryItem extends InventoryItem, Omit<BaseEntity, 'id'> {}

export const InventoryService = {
    async getAll(): Promise<InventoryItem[]> {
        return DbEngine.select<EnterpriseInventoryItem>('inventory', { orderBy: 'name', orderDir: 'asc' });
    },

    async adjustStock(itemId: string, delta: number, reason: string, actor: string, tenantId: string = 'tenant-nexa-001') {
        const trx = await DbEngine.startTransaction();
        try {
            const items = await DbEngine.select<EnterpriseInventoryItem>('inventory', { where: { id: itemId } });
            const item = items[0];
            
            if (!item) throw new Error("Item not found");

            const newQuantity = item.quantity + delta;
            if (newQuantity < 0) throw new Error("Insufficient stock");

            await DbEngine.update<EnterpriseInventoryItem>('inventory', itemId, { quantity: newQuantity } as any, trx);
            
            // Log the stock movement (audit)
            // We access the Audit table directly via DbEngine insert for speed
            await DbEngine.insert('audit_logs', {
                id: generateUUIDv7(),
                tenantId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                timestamp: new Date().toISOString(),
                actorId: 'sys',
                actorName: actor,
                action: 'UPDATE',
                target: item.name,
                details: `Stock adjusted by ${delta}. Reason: ${reason}`
            } as any, trx);

            await trx.commit();
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};