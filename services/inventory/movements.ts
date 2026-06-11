
import { DbEngine } from '../core/db';
import { StockMovement, InventoryItem } from '../core/types'; 
import { AdjustStockDTO, TransferStockDTO } from './types';
import { AuditService } from '../admin/audit';
import { BaseEntity, DbTransaction } from '../core/types';

interface EnterpriseInventoryItem extends InventoryItem, BaseEntity {}

export const StockMovementService = {
    
    async adjustStock(dto: AdjustStockDTO, actor: string, externalTrx?: DbTransaction): Promise<StockMovement> {
        const trx = externalTrx || await DbEngine.startTransaction();
        const isSelfManaged = !externalTrx;

        try {
            // 1. Get Item
            const items = await DbEngine.select<EnterpriseInventoryItem>('inventory', { where: { id: dto.itemId } });
            const item = items[0];
            if (!item) throw new Error("Item not found");

            // 2. Validate Quantity
            const newQuantity = item.quantity + dto.delta;
            if (newQuantity < 0) throw new Error("Insufficient stock for adjustment");

            // 3. Create Movement Record
            const movement: StockMovement = {
                id: `mv-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                itemId: dto.itemId,
                warehouseId: dto.warehouseId,
                type: dto.delta > 0 ? 'IN' : 'OUT',
                quantity: Math.abs(dto.delta),
                reason: dto.reason,
                costPerUnit: dto.unitCost || item.unitPrice // Use current avg if not provided
            };

            await DbEngine.insert('stock_movements', movement, trx);

            // 4. Update Item Master Stock
            await DbEngine.update<EnterpriseInventoryItem>('inventory', dto.itemId, { quantity: newQuantity }, trx);

            // 5. Audit
            await AuditService.log('sys', actor, 'UPDATE', item.name, `Stock adj: ${dto.delta} (${dto.reason})`, trx);

            if (isSelfManaged) await trx.commit();
            return movement;

        } catch (error) {
            if (isSelfManaged) await trx.rollback();
            throw error;
        }
    },

    async transferStock(dto: TransferStockDTO, actor: string): Promise<void> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. OUT from Source
            const outMove: StockMovement = {
                id: `mv-out-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                itemId: dto.itemId,
                warehouseId: dto.fromWarehouseId,
                type: 'OUT',
                quantity: dto.quantity,
                reason: `Transfer to ${dto.toWarehouseId}`
            };
            await DbEngine.insert('stock_movements', outMove, trx);

            // 2. IN to Destination
            const inMove: StockMovement = {
                id: `mv-in-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                itemId: dto.itemId,
                warehouseId: dto.toWarehouseId,
                type: 'IN',
                quantity: dto.quantity,
                reason: `Transfer from ${dto.fromWarehouseId}`
            };
            await DbEngine.insert('stock_movements', inMove, trx);

            await AuditService.log('sys', actor, 'UPDATE', dto.itemId, `Transferred ${dto.quantity} units`, trx);

            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
