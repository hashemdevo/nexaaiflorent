
import { DbEngine } from '../core/db';
import { Invoice, InvoiceItem, Customer } from '../core/types';
import { generateUUIDv7 } from '../../types/enterprise';
import { EventBus } from '../core/events';

export const InvoiceService = {
    async getAll(): Promise<Invoice[]> {
        return DbEngine.select<Invoice>('invoices', { orderBy: 'date', orderDir: 'desc' });
    },

    async createInvoice(
        customerId: string, 
        items: InvoiceItem[], 
        date: string, 
        dueDate: string,
        tenantId: string = 'tenant-nexa-001'
    ): Promise<Invoice> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Calculate Totals
            let subtotal = 0;
            let taxTotal = 0;
            
            items.forEach(item => {
                subtotal += item.total;
                taxTotal += item.taxAmount;
            });
            
            const totalAmount = subtotal + taxTotal;
            const newInvoiceId = generateUUIDv7();

            // 2. Create Invoice Record
            const invoice: Invoice = {
                id: newInvoiceId,
                tenantId: tenantId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                customerId,
                date,
                dueDate,
                status: 'POSTED', 
                subtotal,
                taxTotal,
                totalAmount,
                balanceDue: totalAmount,
                items
            };

            // 3. Save Invoice
            await DbEngine.insert('invoices', invoice as any, trx);

            // 4. Update Customer Balance 
            const customerRows = await DbEngine.select<any>('customers', { where: { id: customerId } });
            if (customerRows.length > 0) {
                const customer = customerRows[0];
                await DbEngine.update<Customer>('customers', customerId, { balance: (customer.balance || 0) + totalAmount } as any, trx);
            }

            // 5. Publish Outbox Event for Accounting Domain
            await EventBus.publish(
                'INVOICE_POSTED',
                'Invoice',
                invoice.id!,
                {
                    invoiceId: invoice.id,
                    customerId,
                    subtotal,
                    taxTotal,
                    totalAmount,
                    date
                },
                tenantId,
                trx
            );

            await trx.commit();

            return invoice;

        } catch (error) {
            await trx.rollback();
            console.error("Invoice Creation Failed", error);
            throw error;
        }
    }
};
