
import { RecurringInvoice, InvoiceItem } from '../core/types';

export type { RecurringInvoice };

export interface CreateRecurringProfileDTO {
    customerId: string;
    frequency: RecurringInvoice['frequency'];
    nextRunDate: string;
    items: InvoiceItem[];
}
