
import { DbEngine } from '../core/db';
import { PurchaseOrder, BillItem } from '../core/types';
import { WorkflowEngine } from '../workflow/engine';

export interface CreatePurchaseOrderDTO {
    vendorId: string;
    date: string;
    items: BillItem[];
    expectedDeliveryDate?: string;
    requesterId: string;
}

export const PurchaseOrderService = {
    
    async getAll(): Promise<PurchaseOrder[]> {
        return DbEngine.select<PurchaseOrder>('purchase_orders', { orderBy: 'date', orderDir: 'desc' });
    },

    async create(dto: CreatePurchaseOrderDTO): Promise<PurchaseOrder> {
        const trx = await DbEngine.startTransaction();

        try {
            const totalAmount = dto.items.reduce((sum, i) => sum + i.amount, 0);

            const po: PurchaseOrder = {
                id: `po-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                poNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                vendorId: dto.vendorId,
                date: dto.date,
                expectedDeliveryDate: dto.expectedDeliveryDate,
                status: 'DRAFT',
                totalAmount,
                items: dto.items
            };

            // Check Workflow Policies
            // If evaluated to false, it creates an approval request and returns false
            const isAutoApproved = await WorkflowEngine.evaluate(po.id, 'PURCHASE_ORDER', totalAmount, dto.requesterId, trx);

            if (isAutoApproved) {
                po.status = 'APPROVED';
            } else {
                po.status = 'PENDING_APPROVAL';
            }

            await DbEngine.insert('purchase_orders', po, trx);
            await trx.commit();
            return po;

        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};
