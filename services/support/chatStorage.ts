
import { cleanAndParseJSON } from '../gemini/core';

export interface Message {
    id: string;
    sender: 'visitor' | 'admin';
    text: string;
    timestamp: number;
    read: boolean;
}

export interface VisitorDetails {
    name: string;
    email: string;
    phone: string;
}

export interface ChatSession {
    id: string;
    visitorName: string;
    visitorDetails?: VisitorDetails;
    lastMessage: string;
    lastTimestamp: number;
    unreadCount: number;
    messages: Message[];
}

const STORAGE_KEY = 'nexa_support_chats';
export const VISITOR_ID_KEY = 'nexa_visitor_id';

export const ChatStorageService = {
    getSessions(): Record<string, ChatSession> {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return cleanAndParseJSON(stored || '', {});
        } catch {
            return {};
        }
    },

    saveSession(session: ChatSession) {
        const sessions = this.getSessions();
        sessions[session.id] = session;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('storage'));
        }
    },

    getVisitorId(): string {
        let id = localStorage.getItem(VISITOR_ID_KEY);
        if (!id) {
            id = `VIS-${Math.floor(Math.random() * 1000000)}`;
            localStorage.setItem(VISITOR_ID_KEY, id);
        }
        return id;
    }
};
