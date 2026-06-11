
import { DbEngine } from '../core/db';
import { ProductionOrder, BillOfMaterials, InventoryItem } from '../core/types';
import { CreateWorkOrderDTO } from './types';
import { StockMovementService } from '../inventory/movements';
import { JournalService } from '../ledger/journal';
import { JournalEntryLine } from '../../types';

export const WorkOrderService = {
    
    async createOrder(dto: CreateWorkOrderDTO): Promise<ProductionOrder> {
        // 1. Fetch BOM to validate
        const boms = await DbEngine.select<BillOfMaterials>('boms', { where: { id: dto.bomId } });
        const bom = boms[0];
        if (!bom) throw new Error("BOM not found");

        const order: ProductionOrder = {
            id: `wo-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            orderNumber: `WO-${Math.floor(Math.random() * 10000)}`,
            bomId: dto.bomId,
            finishedGoodId: bom.finishedGoodId,
            warehouseId: dto.warehouseId,
            quantityToProduce: dto.quantity,
            startDate: dto.startDate,
            status: 'PLANNED',
            totalMaterialCost: 0, // Calc on completion
            totalLaborCost: 0
        };

        return DbEngine.insert('production_orders', order);
    },

    async completeOrder(orderId: string, completionDate: string, actor: string): Promise<void> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Fetch Order & BOM
            const orders = await DbEngine.select<ProductionOrder>('production_orders', { where: { id: orderId } });
            const order = orders[0];
            if (!order || order.status !== 'PLANNED' && order.status !== 'IN_PROGRESS') throw new Error("Invalid Order");

            const boms = await DbEngine.select<BillOfMaterials>('boms', { where: { id: order.bomId } });
            const bom = boms[0];
            if (!bom) throw new Error("BOM not found");

            let totalMaterialCost = 0;

            // 2. Consume Raw Materials (Stock OUT)
            for (const item of bom.items) {
                const qtyNeeded = item.quantity * order.quantityToProduce;
                
                // Fetch current cost for accurate COGS
                // In a real app, we'd check if stock exists first
                const invItems = await DbEngine.select<any>('inventory', { where: { id: item.itemId } });
                const invItem = invItems[0];
                const unitCost = invItem?.unitPrice || 0;
                totalMaterialCost += (qtyNeeded * unitCost);

                await StockMovementService.adjustStock({
                    itemId: item.itemId,
                    warehouseId: order.warehouseId,
                    delta: -qtyNeeded,
                    reason: `Used in WO ${order.orderNumber}`
                }, actor, trx);
            }

            // 3. Calculate Total Cost
            const totalLabor = bom.laborCostPerUnit * order.quantityToProduce;
            const totalOverhead = bom.overheadCostPerUnit * order.quantityToProduce;
            const totalProductionCost = totalMaterialCost + totalLabor + totalOverhead;
            const costPerUnit = totalProductionCost / order.quantityToProduce;

            // 4. Add Finished Good (Stock IN)
            await StockMovementService.adjustStock({
                itemId: order.finishedGoodId,
                warehouseId: order.warehouseId,
                delta: order.quantityToProduce,
                reason: `Produced from WO ${order.orderNumber}`,
                unitCost: costPerUnit // Update moving average cost
            }, actor, trx);

            // 5. Create Journal Entry (Manufacturing Accounting)
            // Debit: Inventory (Finished Goods)
            // Credit: Inventory (Raw Materials)
            // Credit: Wages Payable / Overhead Clearing (Simulated for Labor/Overhead)
            const glLines: JournalEntryLine[] = [
                {
                    accountId: '1300', // Finished Goods Asset (Hypothetical ID)
                    accountName: 'Finished Goods Inventory',
                    debit: totalProductionCost,
                    credit: 0
                },
                {
                    accountId: '1310', // Raw Materials Asset
                    accountName: 'Raw Materials Inventory',
                    debit: 0,
                    credit: totalMaterialCost
                },
                {
                    accountId: '5001', // Absorbed Labor/Overhead (Or clearing account)
                    accountName: 'Manufacturing Clearing',
                    debit: 0,
                    credit: totalLabor + totalOverhead
                }
            ];

            const journal = await JournalService.postEntry({
                transactionDate: completionDate,
                postedDate: new Date().toISOString(),
                reference: `MFG-${order.orderNumber}`,
                description: `Production completion for ${order.quantityToProduce} units`,
                lines: glLines,
                totalAmount: totalProductionCost,
                createdBy: actor
            }, trx);

            // 6. Update Order Status
            await DbEngine.update<ProductionOrder>('production_orders', orderId, {
                status: 'COMPLETED',
                completionDate,
                totalMaterialCost,
                totalLaborCost: totalLabor + totalOverhead,
                journalEntryId: journal.id
            }, trx);

            await trx.commit();

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
