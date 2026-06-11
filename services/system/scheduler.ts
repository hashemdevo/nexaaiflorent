
import { DbEngine } from '../core/db';
import { JobLog } from '../core/types';
import { RecurringSalesService } from '../sales/recurring';
import { DepreciationService } from '../assets/depreciation';

export const JobScheduler = {
    
    async runJob(jobName: string): Promise<void> {
        const startTime = new Date().toISOString();
        let status: JobLog['status'] = 'SUCCESS';
        let details = '';

        try {
            switch (jobName) {
                case 'RECURRING_INVOICES':
                    const count = await RecurringSalesService.processDueProfiles();
                    details = `Generated ${count} invoices.`;
                    break;
                
                case 'DEPRECIATION_RUN':
                    const date = new Date();
                    const assets = await DepreciationService.runDepreciation(date.getFullYear(), date.getMonth() + 1);
                    details = `Processed depreciation for ${assets} assets.`;
                    break;

                default:
                    throw new Error(`Unknown Job: ${jobName}`);
            }
        } catch (e: any) {
            status = 'FAILED';
            details = e.message;
            console.error(`Job ${jobName} Failed`, e);
        }

        // Log execution
        const log: JobLog = {
            id: `job-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            jobName,
            status,
            startTime,
            endTime: new Date().toISOString(),
            details
        };

        await DbEngine.insert('job_logs', log);
    },

    // Simulate Trigger
    startDaemon() {
        // In a real backend, this would be node-cron or similar.
        // Here we expose a method to manually trigger or interval check.
        console.log("System Scheduler Initialized");
    }
};
