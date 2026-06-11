import { StoredProcedure } from '../core/procedure';
import { ManualEntryProcedure, ManualEntryInput } from './procedures/ManualEntryProcedure';

/**
 * TRANSACTION DIRECTOR
 * The single, unified gateway for all financial transactions in the system.
 * It selects the appropriate Stored Procedure based on the transaction type,
 * ensuring every operation is atomic, consistent, isolated, and durable (ACID).
 */
export const TransactionDirector = {

    async initiate(
        type: 'MANUAL_JOURNAL_ENTRY' | 'POS_SALE' | 'INVOICE_PAYMENT',
        payload: any
    ): Promise<any> {
        let procedure: StoredProcedure<any, any>;

        switch (type) {
            case 'MANUAL_JOURNAL_ENTRY':
                procedure = new ManualEntryProcedure();
                return procedure.run(payload as ManualEntryInput);
            
            // Future procedures would be instantiated here
            // case 'POS_SALE':
            //     procedure = new PosSaleProcedure();
            //     return procedure.run(payload);

            default:
                throw new Error(`Transaction type "${type}" is not supported.`);
        }
    }
};
