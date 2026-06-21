
import { DbEngine } from './db';
import { AccountService } from '../ledger/accounts';
import { OutboxConsumer } from '../ledger/outboxConsumer';
import { InventoryItem } from '../../types';
import { Customer, Vendor, Invoice } from './types';
import { EventBus } from './events';
import { generateUUIDv7 } from '../../types/enterprise';

// Sub-Seeders
import { SeedCRM } from './seeds/crm';
import { SeedHRM } from './seeds/hrm';
import { SeedProjects } from './seeds/projects';
import { SeedManufacturing } from './seeds/manufacturing';

export const DatabaseSeeder = {
    async seed() {
        const accounts = await AccountService.getAll();
        const invoices = await DbEngine.select<Invoice>('invoices', {});
        
        // Force seed if critical data is missing (Partial seed detection fix)
        if (accounts.length > 4 && invoices.length > 5) return; 

        console.log("🌱 Seeding Enterprise Database with Historical Data...");

        const trx = await DbEngine.startTransaction();

        try {
            // 1. Core Financials
            await AccountService.init(); 

            // 2. Inventory
            const items: Partial<InventoryItem>[] = [
                { id: 'inv-1', name: 'Espresso Beans (1kg)', sku: 'ING-COF-001', category: 'Ingredients', quantity: 50, unitPrice: 15.00, sellingPrice: 0, minStockLevel: 10 },
                { id: 'inv-2', name: 'Paper Cups (12oz)', sku: 'SUP-CUP-012', category: 'Supplies', quantity: 500, unitPrice: 0.10, sellingPrice: 0, minStockLevel: 100 },
                { id: 'inv-3', name: 'Premium Latte', sku: 'PRD-DRK-001', category: 'Finished Goods', quantity: 0, unitPrice: 0, sellingPrice: 4.50, minStockLevel: 0 },
                { id: 'inv-4', name: 'Croissant', sku: 'PRD-FOD-001', category: 'Finished Goods', quantity: 20, unitPrice: 1.20, sellingPrice: 3.50, minStockLevel: 5 },
            ];

            for (const item of items) {
                await DbEngine.insert('inventory', {
                    ...item,
                    tenantId: 'default',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                } as any, trx);
            }

            // 3. Sales & Customers
            const customers: Partial<Customer>[] = [
                { id: 'cus-1', name: 'Walk-in Customer', email: '', status: 'ACTIVE', balance: 0 },
                { id: 'cus-2', name: 'Corporate Client A', email: 'corp@a.com', status: 'ACTIVE', balance: 0 },
            ];
            for (const cus of customers) {
                await DbEngine.insert('customers', { ...cus, tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 } as any, trx);
            }

            // 4. Historical Data (Invoices & Revenue) - Generate 6 months back
            const today = new Date();
            for (let i = 0; i < 6; i++) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 15);
                const dateStr = date.toISOString().split('T')[0];
                
                // Create 3 invoices per month
                for (let j = 0; j < 3; j++) {
                    const amount = 2000 + Math.floor(Math.random() * 3000);
                    const newInvoiceId = generateUUIDv7();
                    const inv: Invoice = {
                        id: newInvoiceId,
                        tenantId: 'default',
                        createdAt: date.toISOString(),
                        updatedAt: date.toISOString(),
                        version: 1,
                        invoiceNumber: `INV-${date.getFullYear()}-${i}-${j}`,
                        customerId: 'cus-2',
                        date: dateStr,
                        dueDate: dateStr,
                        status: 'POSTED',
                        subtotal: amount,
                        taxTotal: amount * 0.1,
                        totalAmount: amount * 1.1,
                        balanceDue: 0,
                        items: []
                    };
                    await DbEngine.insert('invoices', inv as any, trx);

                    // Publish Outbox Event
                    await EventBus.publish(
                        'INVOICE_POSTED',
                        'Invoice',
                        newInvoiceId,
                        {
                            invoiceId: newInvoiceId,
                            customerId: 'cus-2',
                            subtotal: amount,
                            taxTotal: amount * 0.1,
                            totalAmount: amount * 1.1,
                            date: dateStr
                        },
                        'default',
                        trx
                    );
                }
            }

            // 5. Purchasing
            const vendors: Partial<Vendor>[] = [
                { id: 'vnd-1', name: 'Global Coffee Suppliers', email: 'orders@gcs.com', balance: 0 },
                { id: 'vnd-2', name: 'City Packaging Co.', email: 'sales@citypack.com', balance: 0 },
            ];
            for (const vnd of vendors) {
                await DbEngine.insert('vendors', { ...vnd, tenantId: 'default', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 } as any, trx);
            }

            // 6. Initial Capital via Outbox
            const openingBalEventId = generateUUIDv7();
            await EventBus.publish(
                'OPENING_BALANCE',
                'Journal',
                openingBalEventId,
                {
                    amount: 50000,
                    date: new Date().toISOString()
                },
                'default',
                trx
            );

            // 7. Run Sub-Seeders for Enterprise Modules
            await SeedCRM.run(trx);
            await SeedHRM.run(trx);
            await SeedProjects.run(trx);
            await SeedManufacturing.run(trx);

            await trx.commit();
            console.log("✅ Database Seeding Complete with History.");
            
            // 8. Process Outbox events generated during seeding
            await OutboxConsumer.processPendingEvents();

        } catch (e) {
            await trx.rollback();
            console.error("❌ Database Seeding Failed", e);
        }
    }
};
