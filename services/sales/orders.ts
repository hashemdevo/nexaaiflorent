
import { DbEngine } from '../core/db';
import { SalesOrder, InvoiceItem } from '../core/types';

export interface CreateSalesOrderDTO {
    customerId: string;
    date: string;
    items: InvoiceItem[];
    expectedDeliveryDate?: string;
}

export const SalesOrderService = {
    
    async getAll(): Promise<SalesOrder[]> {
        return DbEngine.select<SalesOrder>('sales_orders', { orderBy: 'date', orderDir: 'desc' });
    },

    async create(dto: CreateSalesOrderDTO): Promise<SalesOrder> {
        const totalAmount = dto.items.reduce((sum, i) => sum + i.total + i.taxAmount, 0);

        const order: SalesOrder = {
            id: `so-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            orderNumber: `SO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            customerId: dto.customerId,
            date: dto.date,
            expectedDeliveryDate: dto.expectedDeliveryDate,
            status: 'DRAFT',
            totalAmount,
            items: dto.items
        };

        return DbEngine.insert('sales_orders', order);
    },

    async confirm(orderId: string): Promise<SalesOrder> {
        // Logic: Reserve Stock (Soft Allocate) could go here
        return DbEngine.update<SalesOrder>('sales_orders', orderId, { status: 'CONFIRMED' });
    }
};
