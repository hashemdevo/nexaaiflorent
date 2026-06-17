
import { DbEngine } from './db';
import { cleanAndParseJSON } from '../geminiService';

/**
 * MIGRATION RUNNER
 * Ensures schema consistency across updates.
 */
export const MigrationRunner = {
    async run() {
        let applied = null;
        if (typeof localStorage !== 'undefined') {
            applied = localStorage.getItem('nexa_migrations_applied');
        }
        const appliedVersions = cleanAndParseJSON(applied, []);

        const migrations = [
            {
                version: 1,
                name: 'Initialize Audit Log',
                up: async () => {
                    const logs = await DbEngine.getTable('audit_logs');
                    if (!logs) await DbEngine.saveTable('audit_logs', []);
                }
            },
            // Add future schema changes here
        ];

        for (const m of migrations) {
            if (!appliedVersions.includes(m.version)) {
                console.log(`Running Migration v${m.version}: ${m.name}`);
                await m.up();
                appliedVersions.push(m.version);
            }
        }

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('nexa_migrations_applied', JSON.stringify(appliedVersions));
        }
    }
};
