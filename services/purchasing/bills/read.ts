
import { DbEngine } from '../../core/db';
import { Bill } from '../../core/types';

export const BillReadService = {
    async getAll(): Promise<Bill[]> {
        return DbEngine.select<Bill>('bills', { orderBy: 'dueDate', orderDir: 'asc' });
    },

    async getByVendor(vendorId: string): Promise<Bill[]> {
        return DbEngine.select<Bill>('bills', { where: { vendorId } });
    },

    async getById(id: string): Promise<Bill | undefined> {
        const results = await DbEngine.select<Bill>('bills', { where: { id } });
        return results[0];
    }
};
