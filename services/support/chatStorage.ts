export interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

export interface ChatSession {
  visitorId: string;
  visitorName: string;
  messages: Message[];
  status: string;
  agentId?: string;
  lastTimestamp: number;
}

export const ChatStorageService = {
  getVisitorId: () => {
    return 'VISITOR_1';
  },
  getSessions: (): Record<string, ChatSession> => {
    return {};
  },
  saveSession: (session: ChatSession) => {
    return;
  }
};
