
import { IndustryType, UniversalRole } from './enums';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  color?: string;
  image?: string;
  stock?: number;
  sku?: string;
  taxable?: boolean;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
  cartId: string;
}

export interface ServiceType {
    id: string;
    name: string;
    taxRate: number; 
}

export interface POSSettings {
    defaultTaxRate: number;
    currencySymbol: string;
    storeName: string;
    receiptHeader: string;
    receiptFooter: string;
    serviceTypes: ServiceType[];
}

export interface POSPermissions {
    allowVoid: boolean;
    allowDiscount: boolean;
    requireManagerCodeForVoid: boolean;
    maxDiscountPercent: number;
    allowManualPrice: boolean;
}

export interface Cashier {
    id: string;
    name: string;
    role: UniversalRole; 
    password?: string | null; 
    hint?: string;
    twoFaSecret?: string;
    companyName?: string; 
    industry?: IndustryType; 
}

export interface Order {
    id: string;
    orderNumber: string;
    status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
    items: CartItem[];
    total: number;
    serviceType: string;
    createdAt: string;
    customerName?: string;
    isOwnerOrder?: boolean;
    ownerName?: string;
    ownerEmail?: string;
    paymentMethod?: string;
    preppedBy?: string;
    preppedAt?: string;
    deliveredBy?: string;
    deliveredAt?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    unitPrice: number;
    sellingPrice: number;
    minStockLevel: number;
    lastUpdated: string;
    supplier?: string;
    itemType?: 'RAW' | 'FINISHED';
}

export interface ExtractedInvoiceItem {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface ExtractedInvoiceData {
    vendorName: string;
    invoiceDate: string;
    invoiceNumber: string;
    items: ExtractedInvoiceItem[];
    subtotal: number;
    tax: number;
    totalAmount: number;
    paymentStatus?: 'Paid' | 'Unpaid';
    liabilityAccount?: string;
    paymentReceipt?: string;
    paymentDetails?: any;
}
