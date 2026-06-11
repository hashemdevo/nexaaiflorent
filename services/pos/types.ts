import { Product } from '../../types';

export interface POSCartItem extends Product {
    quantity: number;
    discount?: number;
}

export interface ProcessOrderDTO {
    items: POSCartItem[];
    totalAmount: number;
    taxAmount: number;
    paymentMethod: 'CASH' | 'CARD' | 'ON_ACCOUNT';
    customerId?: string; // Optional for walk-ins
    cashierId: string;
}

export interface POSOrderResult {
    orderId: string;
    invoiceNumber: string;
    success: boolean;
    message?: string;
}