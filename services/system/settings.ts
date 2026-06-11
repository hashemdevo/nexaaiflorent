
import { DbEngine } from '../core/db';
import { SystemSetting } from '../core/types';
import { UpdateSettingDTO } from './types';

export const SystemSettingsService = {
    async getAll(): Promise<SystemSetting[]> {
        return DbEngine.select<SystemSetting>('system_settings', { orderBy: 'key', orderDir: 'asc' });
    },

    async getByKey(key: string): Promise<string | null> {
        const results = await DbEngine.select<SystemSetting>('system_settings', { where: { key } });
        return results[0]?.value || null;
    },

    async set(dto: UpdateSettingDTO): Promise<SystemSetting> {
        const existing = await DbEngine.select<SystemSetting>('system_settings', { where: { key: dto.key } });
        
        if (existing.length > 0) {
            return DbEngine.update<SystemSetting>('system_settings', existing[0].id, { value: dto.value });
        } else {
            const setting: SystemSetting = {
                id: `set-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                key: dto.key,
                value: dto.value,
                group: dto.group || 'GENERAL'
            };
            return DbEngine.insert('system_settings', setting);
        }
    },

    // --- Quick Helpers ---
    async getCompanyInfo() {
        const name = await this.getByKey('company_name') || 'My Company';
        const taxId = await this.getByKey('tax_id') || '';
        const currency = await this.getByKey('base_currency') || 'USD';
        return { name, taxId, currency };
    }
};
