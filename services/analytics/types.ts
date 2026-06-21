export interface SalesMetric {
    period: string;
    revenue: number;
    orders: number;
}

export interface TopProduct {
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
}

export interface InventoryAlert {
    itemId: string;
    name: string;
    currentStock: number;
    minLevel: number;
    status: 'LOW' | 'CRITICAL';
}