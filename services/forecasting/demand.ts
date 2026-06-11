
import { DbEngine } from '../core/db';
import { SalesOrder, InventoryItem } from '../core/types';
import { DemandForecast } from './types';

export const DemandForecaster = {
    async predict(itemIds: string[]): Promise<DemandForecast[]> {
        const salesOrders = await DbEngine.select<SalesOrder>('sales_orders', {});
        const forecasts: DemandForecast[] = [];

        for (const itemId of itemIds) {
            // 1. Get Item Details
            const items = await DbEngine.select<InventoryItem>('inventory', { where: { id: itemId } });
            const item = items[0];
            if (!item) continue;

            // 2. Analyze Historical Usage
            // In real ML, we'd use time-series analysis (ARIMA/Prophet)
            // Here we use Moving Average of last 3 months
            let totalSold = 0;
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            salesOrders.forEach(so => {
                if (new Date(so.date) > threeMonthsAgo) {
                    const line = so.items.find(i => i.description === item.name); // Matching by name for demo as SalesOrder items simple
                    if (line) totalSold += line.quantity;
                }
            });

            const avgMonthly = totalSold / 3;
            const predicted30Days = Math.ceil(avgMonthly * 1.1); // +10% growth factor

            forecasts.push({
                itemId,
                itemName: item.name,
                predictedDemandNext30Days: predicted30Days,
                confidenceLevel: 85,
                suggestedReorderPoint: Math.ceil(predicted30Days * 0.5) // Safety stock logic
            });
        }

        return forecasts;
    }
};
