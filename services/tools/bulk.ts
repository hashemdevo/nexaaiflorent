
import { DbEngine } from '../core/db';
import { TableName } from '../core/types';

export const BulkOperationService = {
    
    /**
     * Converts an array of objects to a CSV string.
     */
    async exportToCSV(table: TableName): Promise<string> {
        const data = await DbEngine.select<any>(table, {});
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => {
            return Object.values(row).map(val => {
                // Escape quotes and wrap in quotes if contains comma
                const str = String(val);
                if (str.includes(',') || str.includes('"')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(',');
        });

        return [headers, ...rows].join('\n');
    },

    /**
     * Parses a CSV string and inserts data into the specified table.
     * Assumes first row is header matching DB keys.
     */
    async importFromCSV(table: TableName, csvContent: string): Promise<number> {
        const lines = csvContent.split('\n').filter(l => l.trim());
        if (lines.length < 2) return 0;

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1);
        
        const trx = await DbEngine.startTransaction();
        let count = 0;

        try {
            for (const rowStr of rows) {
                // Basic CSV parsing (splitting by comma, ignoring complex quotes for this mock)
                const values = rowStr.split(',');
                const record: any = {
                    id: `${table.substring(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    tenantId: 'default',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                };

                headers.forEach((header, index) => {
                    if (values[index] !== undefined) {
                        let val: any = values[index].trim();
                        // Determine type (simplified)
                        if (!isNaN(Number(val)) && val !== '') val = Number(val);
                        else if (val === 'true') val = true;
                        else if (val === 'false') val = false;
                        
                        record[header] = val;
                    }
                });

                await DbEngine.insert(table, record, trx);
                count++;
            }
            await trx.commit();
            return count;
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};
