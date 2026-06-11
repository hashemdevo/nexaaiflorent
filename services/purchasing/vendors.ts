
import { DbEngine } from '../core/db';
import { Vendor } from '../core/types';

export const VendorService = {
    async getAll(): Promise<Vendor[]> {
        return DbEngine.select<Vendor>('vendors', { orderBy: 'name', orderDir: 'asc' });
    },

    async getById(id: string): Promise<Vendor | undefined> {
        const results = await DbEngine.select<Vendor>('vendors', { where: { id } });
        return results[0];
    },

    async create(data: Partial<Vendor>): Promise<Vendor> {
        const newVendor: Vendor = {
            id: `vnd-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            name: data.name || 'New Vendor',
            email: data.email,
            taxId: data.taxId,
            contactPerson: data.contactPerson,
            balance: 0
        };
        return DbEngine.insert('vendors', newVendor);
    },

    async update(id: string, data: Partial<Vendor>): Promise<Vendor> {
        return DbEngine.update('vendors', id, data);
    }
};
