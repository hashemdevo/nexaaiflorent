import { DbEngine } from '../core/db';
import { Invoice } from '../core/types';
import { SalesMetric, TopProduct } from './types';

export const SalesAnalyticsService = {
    
    async getRevenueTrend(months: number = 6): Promise<SalesMetric[]> {
        const invoices = await DbEngine.select<Invoice>('invoices', { where: { status: 'PAID' } });
        // Also include POSTED if accrual basis
        
        const result: Record<string, SalesMetric> = {};
        
        // Initialize buckets
        for (let i = 0; i < months; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            result[key] = { period: key, revenue: 0, orders: 0 };
        }

        invoices.forEach(inv => {
            const key = inv.date.substring(0, 7); // YYYY-MM
            if (result[key]) {
                result[key].revenue += inv.totalAmount;
                result[key].orders += 1;
            }
        });

        return Object.values(result).sort((a, b) => a.period.localeCompare(b.period));
    },

    async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
        const invoices = await DbEngine.select<Invoice>('invoices', {});
        const productMap: Record<string, TopProduct> = {};

        invoices.forEach(inv => {
            inv.items.forEach(item => {
                // Use description as key if ID not available in simple InvoiceItem
                const key = item.description; 
                if (!productMap[key]) {
                    productMap[key] = { productId: 'unknown', name: item.description, quantitySold: 0, revenue: 0 };
                }
                productMap[key].quantitySold += item.quantity;
                productMap[key].revenue += item.total;
            });
        });

        return Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }
};