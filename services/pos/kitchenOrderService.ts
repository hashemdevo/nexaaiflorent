
import { Order } from '../../types';
import { cleanAndParseJSON } from '../geminiService';

export const KitchenOrderService = {
    getOrders(): Order[] {
        try {
            const raw = localStorage.getItem('nexa_pos_orders');
            return cleanAndParseJSON(raw, []);
        } catch {
            return [];
        }
    },

    saveOrders(orders: Order[]) {
        localStorage.setItem('nexa_pos_orders', JSON.stringify(orders));
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('nexa-kitchen-orders-updated'));
        }
    },

    createOrder(order: Order) {
        const orders = this.getOrders();
        this.saveOrders([...orders, order]);
    },

    updateStatus(orderId: string, status: Order['status'], tracker?: Partial<Order>) {
        const orders = this.getOrders();
        const updated = orders.map(o => o.id === orderId ? { ...o, status, ...tracker } : o);
        this.saveOrders(updated);
    }
};
