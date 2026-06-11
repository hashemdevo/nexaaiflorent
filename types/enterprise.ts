/**
 * 🏛️ ENTERPRISE-CENTRIC ERP ARCHITECTURE
 * Core types containing strict relational boundaries, traceability trackers,
 * and standard base metadata properties applied across all database modules.
 */

/**
 * 💥 BaseEntity: Standard Unified Metadata Pattern for every schema/table.
 * No entity is allowed to exist without these fields in the Firestore/Double-Entry system.
 */
export interface BaseEntity {
    /** UUID V7 sortable primary key identifier */
    id?: string;

    /** Multi-tenant partition key */
    tenantId?: string;

    /** Legal entity or company organization identity */
    companyId?: string;

    /** Temporal auditing fields */
    createdAt: string; // ISO String representation of date
    updatedAt: string; // ISO String representation of date

    /** Actor traceability IDs */
    createdBy?: string; // employeeId or userId
    updatedBy?: string; // employeeId or userId

    /** Soft-deletion safe archives */
    deletedAt?: string;
    isDeleted?: boolean;

    /** Row/Record concurrency state version */
    version?: number;
}

/**
 * 🏢 FULL ENTERPRISE ERP UNIQUE IDENTIFIER MAP
 * Relational structures matching major databases (SAP, Oracle, Odoo, custom Cloud SQL arrays).
 */
export interface EnterpriseIdRegistry {
    // 🏛️ 1) Organization Layer
    tenantId: string;
    organizationId: string;
    companyId: string;
    subsidiaryId?: string;
    branchId?: string;
    divisionId?: string;
    departmentId?: string;
    businessUnitId?: string;
    legalEntityId?: string;
    holdingCompanyId?: string;
    consolidationGroupId?: string;

    // 👤 2) Human Resources / People Layers
    employeeId: string;
    userId: string;
    ownerId?: string;
    managerId?: string;
    supervisorId?: string;
    directorId?: string;
    ceoId?: string;
    boardMemberId?: string;
    auditorId?: string;
    consultantId?: string;
    contractorId?: string;
    driverId?: string;
    cashierId?: string;
    sellerId?: string;
    salesRepresentativeId?: string;
    purchaseRepresentativeId?: string;
    warehouseKeeperId?: string;
    accountantId?: string;
    hrEmployeeId?: string;
    supportAgentId?: string;
    technicianId?: string;
    doctorId?: string;
    nurseId?: string;
    engineerId?: string;
    workerId?: string;
    securityGuardId?: string;

    // 👥 3) CRM / Customers / Vendors
    clientId?: string;
    customerId?: string;
    vendorId?: string;
    supplierId?: string;
    leadId?: string;
    prospectId?: string;
    partnerId?: string;
    shareholderId?: string;
    investorId?: string;
    guarantorId?: string;
    contactPersonId?: string;

    // 🏦 4) Accounting Core
    accountId: string;
    accountCategoryId?: string;
    accountTypeId?: string;
    accountSubTypeId?: string;
    journalEntryId: string;
    journalLineId: string;
    ledgerEntryId: string;
    trialBalanceId?: string;
    financialStatementId?: string;
    fiscalYearId?: string;
    fiscalPeriodId?: string;
    currencyId?: string;
    exchangeRateId?: string;
    taxCodeId?: string;
    taxGroupId?: string;
    taxTransactionId?: string;
    costCenterId?: string;
    profitCenterId?: string;
    budgetId?: string;
    budgetLineId?: string;
    reconciliationId?: string;
    reconciliationLineId?: string;
    adjustmentEntryId?: string;
    closingEntryId?: string;
    openingBalanceId?: string;
    paymentTermId?: string;
    bankAccountId?: string;
    bankTransactionId?: string;
    cashFlowCategoryId?: string;
    ifrsMappingId?: string;
    gaapMappingId?: string;

    // 📦 5) Inventory / Supply Chain
    warehouseId: string;
    warehouseZoneId?: string;
    warehouseShelfId?: string;
    binLocationId?: string;
    inventoryItemId: string;
    inventoryCategoryId?: string;
    inventoryUnitId?: string;
    stockMovementId: string;
    stockAdjustmentId?: string;
    stockTransferId?: string;
    batchId?: string;
    serialNumberId?: string;
    lotId?: string;
    purchaseOrderId: string;
    purchaseOrderLineId: string;
    goodsReceiptId?: string;
    goodsIssueId?: string;
    inventoryCountId?: string;
    inventoryValuationId?: string;
    shipmentId?: string;
    deliveryId?: string;
    supplierInvoiceId?: string;
    barcodeId?: string;
    skuId?: string;

    // 🛒 6) Sales System
    quotationId?: string;
    salesOrderId?: string;
    salesOrderLineId?: string;
    invoiceId: string;
    invoiceLineId: string;
    customerPaymentId?: string;
    salesReturnId?: string;
    pricingRuleId?: string;
    discountRuleId?: string;
    promotionId?: string;
    couponId?: string;
    commissionId?: string;
    salesChannelId?: string;

    // 🏗️ 7) Projects / Construction
    projectId?: string;
    projectPhaseId?: string;
    projectTaskId?: string;
    contractId?: string;
    subcontractId?: string;
    siteId?: string;
    workOrderId?: string;
    equipmentId?: string;
    maintenanceRequestId?: string;
    timesheetId?: string;
    resourceAllocationId?: string;

    // 🔐 12) Security / Access Control
    roleId?: string;
    permissionId?: string;
    policyId?: string;
    sessionId?: string;
    apiKeyId?: string;
    accessTokenId?: string;
    refreshTokenId?: string;
    auditLogId: string;
    securityEventId?: string;

    // 📡 13) System / Infrastructure
    eventId: string;
    eventStreamId?: string;
    notificationId?: string;
    emailLogId?: string;
    smsLogId?: string;
    webhookId?: string;
    integrationId?: string;
    syncJobId?: string;
    backgroundJobId?: string;
    attachmentId?: string;
    documentId?: string;
    fileId?: string;
    reportId?: string;
    dashboardId?: string;
    workflowId?: string;
    workflowStepId?: string;
    approvalId?: string;
    approvalStepId?: string;
    commentId?: string;
    tagId?: string;
    activityLogId?: string;

    // 💳 14) Payments / Banking
    paymentId: string;
    paymentAllocationId?: string;
    bankId?: string;
    bankBranchId?: string;
    bankStatementId?: string;
    bankStatementLineId?: string;
    chequeId?: string;
    cardTransactionId?: string;
    walletId?: string;
    refundId?: string;
    settlementId?: string;

    // 🧠 16) AI & Automations
    aiPredictionId?: string;
    anomalyDetectionId?: string;
    fraudAlertId?: string;
    automationRuleId?: string;
    ruleExecutionId?: string;
    smartClassificationId?: string;
}

import { v7 as uuidv7 } from 'uuid';

/**
 * 🕒 Sortable UUID v7 Generator
 * Formulates structured high-performance sortable identifier sequences.
 */
export function generateUUIDv7(): string {
    return uuidv7();
}
