
import { SupportTicket } from '../core/types';

export type { SupportTicket };

export interface CreateTicketDTO {
    subject: string;
    email: string;
    priority: SupportTicket['priority'];
    initialMessage: string;
}

export interface AddMessageDTO {
    ticketId: string;
    sender: string;
    text: string;
}
