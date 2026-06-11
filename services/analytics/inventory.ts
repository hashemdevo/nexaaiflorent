import { DbEngine } from '../core/db';
import { InventoryItem } from '../core/types';
import { InventoryAlert } from './types';

export const InventoryAnalyticsService = {
    
    async getLowStockAlerts(): Promise<InventoryAlert[]> {
        const items = await DbEngine.select<InventoryItem>('inventory', {});
        
        return items
            .filter(item => item.quantity <= item.minStockLevel)
            .map(item => ({
                itemId: item.id,
                name: item.name,
                currentStock: item.quantity,
                minLevel: item.minStockLevel,
                status: item.quantity === 0 ? 'CRITICAL' : 'LOW'
            }));
    },

    async getTotalValuation(): Promise<number> {
        const items = await DbEngine.select<InventoryItem>('inventory', {});
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }
};