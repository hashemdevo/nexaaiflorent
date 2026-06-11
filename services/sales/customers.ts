
import { DbEngine } from '../core/db';
import { Customer } from '../core/types';

export const CustomerService = {
    async getAll(): Promise<Customer[]> {
        return DbEngine.select<Customer>('customers', { orderBy: 'name', orderDir: 'asc' });
    },

    async getById(id: string): Promise<Customer | undefined> {
        const results = await DbEngine.select<Customer>('customers', { where: { id } });
        return results[0];
    },

    async create(data: Partial<Customer>): Promise<Customer> {
        const newCustomer: Customer = {
            id: `cus-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            name: data.name || 'New Customer',
            email: data.email,
            phone: data.phone,
            taxId: data.taxId,
            address: data.address,
            status: 'ACTIVE',
            balance: 0
        };
        return DbEngine.insert('customers', newCustomer);
    },

    async update(id: string, data: Partial<Customer>): Promise<Customer> {
        return DbEngine.update('customers', id, data);
    }
};
