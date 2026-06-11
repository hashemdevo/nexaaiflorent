
import { BaseEntity } from './base';

export interface InventoryItem extends BaseEntity {
    name: string;
    sku: string;
    category: string;
    quantity: number;
    unitPrice: number;
    sellingPrice: number;
    minStockLevel: number;
    lastUpdated?: string;
    supplier?: string;
    itemType?: 'RAW' | 'FINISHED';
}

export interface Warehouse extends BaseEntity {
    name: string;
    location: string;
    code: string;
}

export interface StockMovement extends BaseEntity {
    itemId: string;
    warehouseId: string;
    type: 'IN' | 'OUT' | 'TRANSFER';
    quantity: number;
    referenceId?: string;
    reason?: string;
    costPerUnit?: number;
}

export interface Project extends BaseEntity {
    name: string;
    code: string;
    customerId?: string;
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
    startDate: string;
    endDate?: string;
    budget: number;
    totalCost: number;
    totalRevenue: number;
}

export interface Timesheet extends BaseEntity {
    employeeId: string;
    projectId: string;
    date: string;
    hours: number;
    hourlyRate: number;
    description: string;
    status: 'SUBMITTED' | 'APPROVED';
}

export interface BOMItem {
    itemId: string;
    quantity: number;
    wastagePercent?: number;
}

export interface BillOfMaterials extends BaseEntity {
    finishedGoodId: string;
    name: string;
    bomVersion: string;
    items: BOMItem[];
    laborCostPerUnit: number;
    overheadCostPerUnit: number;
    isActive: boolean;
}

export interface ProductionOrder extends BaseEntity {
    orderNumber: string;
    bomId: string;
    finishedGoodId: string;
    warehouseId: string;
    quantityToProduce: number;
    startDate: string;
    completionDate?: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    totalMaterialCost: number;
    totalLaborCost: number;
    journalEntryId?: string;
}

export interface Lead extends BaseEntity {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';
    source: string;
    notes?: string;
    convertedCustomerId?: string;
}

export interface Opportunity extends BaseEntity {
    leadId?: string;
    customerId?: string;
    name: string;
    stage: 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
    expectedRevenue: number;
    probability: number;
    closeDate: string;
}

export interface Interaction extends BaseEntity {
    entityId: string;
    entityType: 'LEAD' | 'OPPORTUNITY' | 'CUSTOMER';
    type: 'CALL' | 'EMAIL' | 'MEETING' | 'NOTE';
    summary: string;
    date: string;
    performedBy: string;
}

export interface SystemSetting extends BaseEntity {
    key: string;
    value: string;
    group: 'GENERAL' | 'FINANCE' | 'LOCALIZATION';
}

export interface Notification extends BaseEntity {
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    isRead: boolean;
    link?: string;
}

export interface ExchangeRate extends BaseEntity {
    currencyCode: string;
    rateToHomeCurrency: number;
    date: string;
    source: string;
}

export interface JobLog extends BaseEntity {
    jobName: string;
    status: 'SUCCESS' | 'FAILED';
    startTime: string;
    endTime: string;
    details?: string;
}

export interface ApprovalPolicy extends BaseEntity {
    name: string;
    module: 'PURCHASING' | 'SALES' | 'EXPENSES';
    triggerCondition: string;
    approverRoleId?: string;
    approverUserId?: string;
}

export interface ApprovalRequest extends BaseEntity {
    entityId: string;
    entityType: 'PURCHASE_ORDER' | 'EXPENSE_CLAIM' | 'SALES_ORDER';
    requesterId: string;
    policyId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    assignedToRoleId?: string;
    assignedToUserId?: string;
    approvedBy?: string;
    approvalDate?: string;
    comments?: string;
    stage?: number;
    maxStages?: number;
}

export interface QCInspection extends BaseEntity {
    referenceType: 'PRODUCTION_ORDER' | 'PURCHASE_RECEIPT';
    referenceId: string;
    itemId: string;
    quantityInspected: number;
    quantityPassed: number;
    quantityFailed: number;
    inspectorId: string;
    notes?: string;
    status: 'COMPLETED';
}

export interface SupportTicket extends BaseEntity {
    ticketNumber: string;
    subject: string;
    requesterEmail: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    assignedToUserId?: string;
    messages: { sender: string, text: string, timestamp: string }[];
}
