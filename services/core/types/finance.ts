
import { BaseEntity } from './base';

export interface Vendor extends BaseEntity {
    name: string;
    email?: string;
    taxId?: string;
    contactPerson?: string;
    balance: number;
}

export interface BillItem {
    description: string;
    amount: number;
    expenseAccountId: string;
}

export interface PurchaseOrder extends BaseEntity {
    poNumber: string;
    vendorId: string;
    date: string;
    expectedDeliveryDate?: string;
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'BILLED' | 'REJECTED';
    totalAmount: number;
    items: BillItem[];
    approvalRequestId?: string;
}

export interface Bill extends BaseEntity {
    billNumber: string;
    vendorId: string;
    date: string;
    dueDate: string;
    status: 'OPEN' | 'PAID' | 'OVERDUE';
    totalAmount: number;
    balanceDue: number;
    items: BillItem[];
    journalEntryId?: string;
    purchaseOrderId?: string;
}

export interface BillPayment extends BaseEntity {
    billId: string;
    vendorId: string;
    amount: number;
    date: string;
    method: string;
    paymentAccountId: string;
    journalEntryId?: string;
}

export interface TaxRate extends BaseEntity {
    name: string;
    code: string;
    rate: number;
    type: 'PERCENTAGE' | 'FIXED';
    description?: string;
    glAccountId: string;
}

export interface BankAccount extends BaseEntity {
    name: string;
    accountNumber: string;
    currency: string;
    glAccountId: string;
    bankName: string;
    currentBalance: number;
    lastSynced?: string;
}

export interface BankTransaction extends BaseEntity {
    bankAccountId: string;
    externalId: string;
    date: string;
    amount: number;
    description: string;
    payee?: string;
    status: 'PENDING' | 'CLEARED' | 'RECONCILED';
    matchedEntryId?: string;
}

export interface Budget extends BaseEntity {
    fiscalYear: number;
    costCenterId?: string;
    glAccountId: string;
    amount: number;
    period: 'ANNUAL' | 'MONTHLY' | 'QUARTERLY';
}

export interface FixedAsset extends BaseEntity {
    name: string;
    serialNumber?: string;
    purchaseDate: string;
    purchaseCost: number;
    salvageValue: number;
    usefulLifeYears: number;
    depreciationMethod: 'STRAIGHT_LINE' | 'DOUBLE_DECLINING';
    status: 'ACTIVE' | 'DISPOSED' | 'FULLY_DEPRECIATED';
    assetAccountId: string;
    accumDepreciationAccountId: string;
    expenseAccountId: string;
    currentBookValue: number;
}

export interface DepreciationLog extends BaseEntity {
    assetId: string;
    date: string;
    amount: number;
    fiscalYear: number;
    journalEntryId: string;
}
