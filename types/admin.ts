import { IndustryType, UniversalRole } from './enums';

export interface PortalPermissions {
    manageClients: boolean;      
    suspendAccounts: boolean;    
    viewClientData: boolean;     
    manageAdmins: boolean;       
    resetPasswords: boolean;     
    viewAuditLogs: boolean;      
    manageSupport: boolean;      
    broadcastMessages: boolean;  
    viewAnalytics: boolean;      
    manageSettings: boolean;     
}

export interface PortalAdmin {
    id: string;
    name: string;
    email: string;
    password?: string; 
    role: 'ROOT' | 'MANAGER';
    permissions: PortalPermissions;
    lastLogin?: string;
    avatar?: string;
    twoFaSecret?: string; 
    backupCodes?: string[];
    isSetupComplete?: boolean; 
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actorId: string;
    actorName: string;
    action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'SECURITY' | 'POST';
    target: string;
    details?: string;
    ip?: string; 
}

export interface ClientPermissions {
    viewFinancialReports: boolean;
    manageLedger: boolean;
    approveExpenses: boolean;
    createInvoices: boolean;
    accessPos: boolean;
    manageCustomers: boolean;
    viewInventory: boolean;
    adjustStock: boolean;
    manageSuppliers: boolean;
    manageTeam: boolean;
    viewAuditLogs: boolean;
    manageSettings: boolean;
    exportData: boolean;
}

export interface ClientEmployee {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: UniversalRole; 
    companyName?: string;
    industry?: IndustryType;
    password?: string; 
    status: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED';
    lastLogin?: string;
    createdAt: string;
    twoFaSecret?: string;
    permissions?: ClientPermissions; 
    isSetupComplete?: boolean;
    assignedBranch?: string;
}

export interface ClientActivityLog {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
}

export interface CompanyRequest {
    id: string;
    requestDate: string;
    clientName: string;
    clientEmail: string;
    companyName: string;
    industry: string; 
    region: string;
    contactPhone: string;
    contactAddress: string;
    plan: 'Standard' | 'Enterprise';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
}

export interface Subscription {
    id: string;
    clientCode: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    company: string;
    industry: IndustryType;
    plan: string;
    license: string;
    expiry: string;
    users: number;
    username: string;
    password: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED';
    twoFaSecret?: string;
    isSetupComplete?: boolean;
}