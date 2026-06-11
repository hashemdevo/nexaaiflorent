
import { DbEngine } from '../core/db';
import { Customer, Invoice, InventoryItem } from '../core/types';
import { IndexItem } from './types';

export const SearchIndexer = {
    _index: [] as IndexItem[],

    async buildIndex() {
        this._index = [];

        // 1. Index Customers
        const customers = await DbEngine.select<Customer>('customers', {});
        customers.forEach(c => {
            this._index.push({
                id: c.id,
                text: `${c.name} ${c.email} ${c.phone} ${c.taxId}`.toLowerCase(),
                type: 'CUSTOMER',
                originalObject: c
            });
        });

        // 2. Index Invoices
        const invoices = await DbEngine.select<Invoice>('invoices', {});
        invoices.forEach(i => {
            this._index.push({
                id: i.id,
                text: `${i.invoiceNumber} ${i.totalAmount}`.toLowerCase(),
                type: 'INVOICE',
                originalObject: i
            });
        });

        // 3. Index Inventory
        const items = await DbEngine.select<InventoryItem>('inventory', {});
        items.forEach(i => {
            this._index.push({
                id: i.id,
                text: `${i.name} ${i.sku} ${i.category}`.toLowerCase(),
                type: 'PRODUCT',
                originalObject: i
            });
        });

        console.log(`[Search] Index rebuilt with ${this._index.length} documents.`);
    },

    getIndex() {
        return this._index;
    }
};
