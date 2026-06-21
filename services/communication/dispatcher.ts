
import { DbEngine } from '../core/db';
import { EmailMessage, SMSMessage, CommunicationLog } from './types';

export const CommunicationDispatcher = {
    
    async sendEmail(message: EmailMessage): Promise<boolean> {
        console.log(`[📧 EMAIL SENT] To: ${message.to} | Subject: ${message.subject}`);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        await this._log('EMAIL', message.to, message.subject);
        return true;
    },

    async sendSMS(message: SMSMessage): Promise<boolean> {
        console.log(`[📱 SMS SENT] To: ${message.to} | Body: ${message.body}`);
        
        await new Promise(resolve => setTimeout(resolve, 300));

        await this._log('SMS', message.to, 'SMS Message');
        return true;
    },

    async _log(type: 'EMAIL' | 'SMS', recipient: string, subject?: string) {
        // In a real app, this would go to a dedicated 'communication_logs' table
        // For now, we can leverage the Audit Log or just console log
        // Let's assume we store it in audit logs for simplicity in this mock
        
        // Mocking the log entry persistence
        const logEntry = {
            id: `comm-${Date.now()}`,
            type,
            recipient,
            subject,
            status: 'SENT',
            timestamp: new Date().toISOString()
        };
        
        // console.debug("Communication Logged:", logEntry);
    }
};
