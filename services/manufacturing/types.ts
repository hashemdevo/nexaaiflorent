
import { BillOfMaterials, ProductionOrder, BOMItem } from '../core/types';

export type { BillOfMaterials, ProductionOrder, BOMItem };

export interface CreateBomDTO {
    name: string;
    finishedGoodId: string;
    items: BOMItem[];
    laborCost: number;
    overheadCost: number;
}

export interface CreateWorkOrderDTO {
    bomId: string;
    quantity: number;
    warehouseId: string;
    startDate: string;
}
