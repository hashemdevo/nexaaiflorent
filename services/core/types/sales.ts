
import { BaseEntity } from './base';

export interface Customer extends BaseEntity {
    name: string;
    email?: string;
    phone?: string;
    taxId?: string;
    address?: string;
    status: 'ACTIVE' | 'INACTIVE';
    balance: number;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    taxRate: number;
    taxAmount: number;
    accountId?: string;
}

export interface SalesOrder extends BaseEntity {
    orderNumber: string;
    customerId: string;
    date: string;
    expectedDeliveryDate?: string;
    status: 'DRAFT' | 'CONFIRMED' | 'SHIPPED' | 'INVOICED' | 'CANCELLED';
    totalAmount: number;
    items: InvoiceItem[];
    convertedToInvoiceId?: string;
}

export interface Invoice extends BaseEntity {
    invoiceNumber: string;
    customerId: string;
    date: string;
    dueDate: string;
    status: 'DRAFT' | 'POSTED' | 'PAID' | 'VOID';
    subtotal: number;
    taxTotal: number;
    totalAmount: number;
    balanceDue: number;
    items: InvoiceItem[];
    journalEntryId?: string;
    salesOrderId?: string;
}

export interface RecurringInvoice extends BaseEntity {
    customerId: string;
    frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    nextRunDate: string;
    endDate?: string;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
    items: InvoiceItem[];
    lastRunDate?: string;
}

export interface Payment extends BaseEntity {
    invoiceId: string;
    customerId: string;
    amount: number;
    date: string;
    method: string;
    reference?: string;
    journalEntryId?: string;
    depositAccountId: string;
}
