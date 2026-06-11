
import { DbEngine } from '../core/db';
import { Payment, Invoice, Customer } from '../core/types';
import { generateUUIDv7 } from '../../types/enterprise';
import { EventBus } from '../core/events';

export const PaymentService = {
    async recordPayment(
        invoiceId: string,
        amount: number,
        method: string,
        tenantId: string = 'tenant-nexa-001'
    ): Promise<Payment> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Fetch Invoice
            const invoices = await DbEngine.select<Invoice>('invoices', { where: { id: invoiceId } });
            const invoice = invoices[0];
            if (!invoice) throw new Error("Invoice not found");

            if (invoice.balanceDue < amount) {
                throw new Error("Payment amount exceeds balance due");
            }

            const paymentId = generateUUIDv7();

            // 2. Create Payment Record
            const payment: Payment = {
                id: paymentId,
                tenantId: tenantId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                invoiceId,
                customerId: invoice.customerId,
                amount,
                date: new Date().toISOString().split('T')[0],
                method
            };

            // 3. Update Invoice Balance & Status
            const newBalance = invoice.balanceDue - amount;
            const newStatus = newBalance <= 0 ? 'PAID' : 'POSTED';
            
            await DbEngine.update<Invoice>('invoices', invoiceId, { 
                balanceDue: newBalance,
                status: newStatus
            } as any, trx);

            // 4. Update Customer Balance
            const customerRows = await DbEngine.select<any>('customers', { where: { id: invoice.customerId } });
            if (customerRows.length > 0) {
                const customer = customerRows[0];
                await DbEngine.update<Customer>('customers', invoice.customerId, { balance: (customer.balance || 0) - amount } as any, trx);
            }

            // 5. Save Payment
            await DbEngine.insert('payments', payment as any, trx);

            // 6. Publish Outbox Event for Accounting Domain
            await EventBus.publish(
                'PAYMENT_RECEIVED',
                'Payment',
                paymentId,
                {
                    paymentId,
                    invoiceId,
                    customerId: invoice.customerId,
                    amount,
                    method,
                    date: payment.date
                },
                tenantId,
                trx
            );

            await trx.commit();
            return payment;

        } catch (error) {
            await trx.rollback();
            console.error("Payment Recording Failed", error);
            throw error;
        }
    }
};