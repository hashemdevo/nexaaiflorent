
export interface EmailMessage {
    to: string;
    subject: string;
    body: string; // HTML content
    attachments?: { filename: string; content: string; encoding: string }[];
}

export interface SMSMessage {
    to: string;
    body: string;
}

export interface CommunicationLog {
    id: string;
    type: 'EMAIL' | 'SMS';
    recipient: string;
    subject?: string;
    status: 'SENT' | 'FAILED';
    timestamp: string;
}
