
import { DbEngine } from '../../core/db';
import { Bill, BillPayment, Vendor } from '../../core/types';
import { PayBillDTO } from '../types';
import { generateUUIDv7 } from '../../../types/enterprise';
import { EventBus } from '../../core/events';

export const BillPayService = {
    async pay(dto: PayBillDTO): Promise<BillPayment> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Fetch Bill
            const bills = await DbEngine.select<Bill>('bills', { where: { id: dto.billId } });
            const bill = bills[0];
            if (!bill) throw new Error("Bill not found");

            if (bill.balanceDue < dto.amount) {
                throw new Error("Payment amount exceeds bill balance");
            }

            const paymentId = generateUUIDv7();

            // 2. Create Payment Record
            const payment: BillPayment = {
                id: paymentId,
                tenantId: 'tenant-nexa-001',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                billId: dto.billId,
                vendorId: bill.vendorId,
                amount: dto.amount,
                date: new Date().toISOString().split('T')[0],
                method: dto.method,
                paymentAccountId: dto.paymentAccountId
            };

            await DbEngine.insert('bill_payments', payment as any, trx);

            // 3. Update Bill Status
            const newBalance = bill.balanceDue - dto.amount;
            await DbEngine.update<Bill>('bills', bill.id!, {
                balanceDue: newBalance,
                status: newBalance <= 0 ? 'PAID' : 'OPEN'
            } as any, trx);

            // 4. Update Vendor Balance (We owe them less)
            const vendors = await DbEngine.select<Vendor>('vendors', { where: { id: bill.vendorId } });
            if (vendors.length > 0) {
                const vendor = vendors[0];
                await DbEngine.update<Vendor>('vendors', bill.vendorId, {
                    balance: (vendor.balance || 0) - dto.amount
                } as any, trx);
            }

            // 5. Publish Outbox Event for Accounting Domain
            await EventBus.publish(
                'BILL_PAID',
                'BillPayment',
                paymentId,
                {
                    paymentId,
                    billId: dto.billId,
                    vendorId: bill.vendorId,
                    amount: dto.amount,
                    method: dto.method,
                    paymentAccountId: dto.paymentAccountId
                },
                'tenant-nexa-001',
                trx
            );

            await trx.commit();
            return payment;

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
