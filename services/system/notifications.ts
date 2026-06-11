
import { DbEngine } from '../core/db';
import { Notification } from '../core/types';
import { CreateNotificationDTO } from './types';

export const NotificationService = {
    async getUserNotifications(userId: string, unreadOnly: boolean = true): Promise<Notification[]> {
        const options: any = {
            where: { userId },
            orderBy: 'createdAt',
            orderDir: 'desc'
        };
        
        let notes = await DbEngine.select<Notification>('notifications', options);
        
        if (unreadOnly) {
            notes = notes.filter(n => !n.isRead);
        }
        return notes;
    },

    async send(dto: CreateNotificationDTO, trx?: any): Promise<Notification> {
        const note: Notification = {
            id: `ntf-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            isRead: false,
            ...dto
        };
        return DbEngine.insert('notifications', note, trx);
    },

    async markAsRead(id: string): Promise<void> {
        await DbEngine.update<Notification>('notifications', id, { isRead: true });
    },

    async markAllAsRead(userId: string): Promise<void> {
        const unread = await this.getUserNotifications(userId, true);
        const trx = await DbEngine.startTransaction();
        
        try {
            for (const note of unread) {
                await DbEngine.update<Notification>('notifications', note.id, { isRead: true }, trx);
            }
            await trx.commit();
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};
