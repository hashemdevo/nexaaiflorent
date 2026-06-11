
import { DbEngine } from '../core/db';
import { QCInspection } from '../core/types';
import { PerformInspectionDTO } from './types';
import { StockMovementService } from '../inventory/movements';

export const QCService = {
    async getAll(): Promise<QCInspection[]> {
        return DbEngine.select<QCInspection>('qc_inspections', { orderBy: 'createdAt', orderDir: 'desc' });
    },

    async inspect(dto: PerformInspectionDTO, inspectorId: string): Promise<QCInspection> {
        const trx = await DbEngine.startTransaction();

        try {
            const failedQty = dto.quantityInspected - dto.quantityPassed;

            // 1. Create Inspection Record
            const inspection: QCInspection = {
                id: `qc-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                referenceType: dto.referenceType,
                referenceId: dto.referenceId,
                itemId: dto.itemId,
                quantityInspected: dto.quantityInspected,
                quantityPassed: dto.quantityPassed,
                quantityFailed: failedQty,
                inspectorId,
                notes: dto.notes,
                status: 'COMPLETED'
            };

            await DbEngine.insert('qc_inspections', inspection, trx);

            // 2. If failed items exist, move them to Quarantine Warehouse
            // We assume 'wh-quarantine' exists or is a logical location
            if (failedQty > 0) {
                // Deduct from Main/Production Warehouse (Assumed 'wh-main' for demo, real logic needs warehouse context)
                await StockMovementService.adjustStock({
                    itemId: dto.itemId,
                    warehouseId: 'wh-main', 
                    delta: -failedQty,
                    reason: `QC Failed (Ref: ${dto.referenceId})`
                }, inspectorId, trx);

                // Add to Quarantine
                await StockMovementService.adjustStock({
                    itemId: dto.itemId,
                    warehouseId: 'wh-quarantine', 
                    delta: failedQty,
                    reason: `QC Quarantine (Ref: ${dto.referenceId})`
                }, inspectorId, trx);
            }

            await trx.commit();
            return inspection;

        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }
};
