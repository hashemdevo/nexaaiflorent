
import { DbEngine } from '../core/db';
import { SupportTicket } from '../core/types';
import { CreateTicketDTO, AddMessageDTO } from './types';

export const SupportService = {
    async getAll(): Promise<SupportTicket[]> {
        return DbEngine.select<SupportTicket>('support_tickets', { orderBy: 'updatedAt', orderDir: 'desc' });
    },

    async createTicket(dto: CreateTicketDTO): Promise<SupportTicket> {
        const ticket: SupportTicket = {
            id: `tkt-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            ticketNumber: `T-${Math.floor(Math.random() * 100000)}`,
            subject: dto.subject,
            requesterEmail: dto.email,
            priority: dto.priority,
            status: 'OPEN',
            messages: [{
                sender: dto.email,
                text: dto.initialMessage,
                timestamp: new Date().toISOString()
            }]
        };
        return DbEngine.insert('support_tickets', ticket);
    },

    async addMessage(dto: AddMessageDTO): Promise<void> {
        const tickets = await DbEngine.select<SupportTicket>('support_tickets', { where: { id: dto.ticketId } });
        const ticket = tickets[0];
        if (!ticket) throw new Error("Ticket not found");

        const newMessages = [...ticket.messages, {
            sender: dto.sender,
            text: dto.text,
            timestamp: new Date().toISOString()
        }];

        await DbEngine.update<SupportTicket>('support_tickets', dto.ticketId, { 
            messages: newMessages,
            status: 'IN_PROGRESS' // Auto update status on reply
        });
    }
};
