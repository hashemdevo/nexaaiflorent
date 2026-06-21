
import { DbEngine } from './db';
import { DbTransaction } from './types';

/**
 * ENTERPRISE STORED PROCEDURE ENGINE
 * 
 * This abstract class standardizes how complex business logic is executed.
 * It ensures that every business action (like "Approve Invoice" or "Hire Employee")
 * runs within a strict ACID transaction boundary.
 */
export abstract class StoredProcedure<Input, Output> {
    
    protected abstract execute(input: Input, trx: DbTransaction): Promise<Output>;

    public async run(input: Input): Promise<Output> {
        const trx = await DbEngine.startTransaction();
        try {
            const result = await this.execute(input, trx);
            await trx.commit();
            return result;
        } catch (error) {
            await trx.rollback();
            console.error(`Procedure Execution Failed:`, error);
            throw error;
        }
    }
}
