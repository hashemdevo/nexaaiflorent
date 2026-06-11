
import { SystemSetting, Notification } from '../core/types';

export type { SystemSetting, Notification };

export interface UpdateSettingDTO {
    key: string;
    value: string;
    group?: SystemSetting['group'];
}

export interface CreateNotificationDTO {
    userId: string;
    title: string;
    message: string;
    type: Notification['type'];
    link?: string;
}
