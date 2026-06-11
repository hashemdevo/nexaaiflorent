
import { QCInspection } from '../core/types';

export type { QCInspection };

export interface PerformInspectionDTO {
    referenceType: QCInspection['referenceType'];
    referenceId: string;
    itemId: string;
    quantityInspected: number;
    quantityPassed: number;
    notes?: string;
}
