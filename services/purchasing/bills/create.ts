
import { DbEngine } from '../../core/db';
import { Bill, Vendor } from '../../core/types';
import { CreateBillDTO } from '../types';
import { generateUUIDv7 } from '../../../types/enterprise';
import { EventBus } from '../../core/events';

export const BillCreateService = {
    async create(dto: CreateBillDTO): Promise<Bill> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Calculate Total
            const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);

            const billId = generateUUIDv7();

            // 2. Create Bill Record
            const bill: Bill = {
                id: billId,
                tenantId: 'tenant-nexa-001',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                billNumber: dto.billNumber,
                vendorId: dto.vendorId,
                date: dto.date,
                dueDate: dto.dueDate,
                status: 'OPEN',
                totalAmount,
                balanceDue: totalAmount,
                items: dto.items
            };

            await DbEngine.insert('bills', bill as any, trx);

            // 3. Update Vendor Balance
            const vendors = await DbEngine.select<Vendor>('vendors', { where: { id: dto.vendorId } });
            if (vendors.length > 0) {
                const vendor = vendors[0];
                await DbEngine.update<Vendor>('vendors', dto.vendorId, { 
                    balance: (vendor.balance || 0) + totalAmount 
                } as any, trx);
            }

            // 4. Publish Outbox Event for Accounting Domain
            await EventBus.publish(
                'BILL_CREATED',
                'Bill',
                billId,
                {
                    billId,
                    vendorId: dto.vendorId,
                    totalAmount,
                    date: dto.date,
                    billNumber: dto.billNumber,
                    items: dto.items
                },
                'tenant-nexa-001',
                trx
            );

            await trx.commit();
            return bill;

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
