
import { Warehouse, StockMovement } from '../core/types';

export type { Warehouse, StockMovement };

export interface CreateWarehouseDTO {
    name: string;
    location: string;
    code: string;
}

export interface TransferStockDTO {
    itemId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    reason?: string;
}

export interface AdjustStockDTO {
    itemId: string;
    warehouseId: string;
    delta: number; // Positive for IN, Negative for OUT
    reason: string;
    unitCost?: number; // Required for IN operations to update valuation
}
