
import { AccountType } from './enums';

export interface Account {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    category: string; 
    currency: string;
    balance: number;
    isSystem: boolean; 
}

export interface JournalEntryLine {
    accountId: string; 
    accountName?: string; 
    description?: string;
    debit: number;
    credit: number;
    isNewAccount?: boolean;
    suggestedParentAccount?: string; 
    entityVerificationRequired?: boolean; 
    subsidiaryLedger?: string[]; 
    accountType?: AccountType;
}

export interface JournalEntry {
    id: string;
    transactionDate: string;
    postedDate: string;
    reference: string;
    description: string;
    lines: JournalEntryLine[];
    totalAmount: number;
    status: 'DRAFT' | 'POSTED' | 'VOID';
    createdBy: string;
    costCenter?: string;
    hash?: string; 
    attachedFile?: string; 
    voiceMemo?: string; 
}

export interface AIAnalysisResult {
    summary: string;
    date: string;
    parties: string[];
    taxAmount: number;
    totalAmount: number;
    lines: JournalEntryLine[];
    confidence: number;
    warnings?: string[];
}

export interface CostCenter {
    id: string;
    code: string;
    name: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  merchant?: string;
  amount: number;
  category: string;
  type: 'credit' | 'debit';
  status: 'cleared' | 'pending' | 'flagged';
  riskScore?: number;
  aiAnalysis?: string;
  ledgerEntryId?: string; 
}

export interface Asset {
  id: string;
  name: string;
  purchaseDate: string;
  cost: number;
  usefulLife: number; 
  salvageValue: number; 
  currentValue: number; 
  depreciationMethod: 'Straight Line' | 'Double Declining';
  serialNumber?: string;
  ledgerAccountId?: string;
}

export interface ExtractedPaymentDetails {
    amount: number;
    date: string;
    method: string;
    reference: string;
}

export interface AnomalyResult {
  id: string;
  confidence?: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ComplianceRisk {
    id: string;
    category: 'Regulatory' | 'Tax' | 'Operational' | 'Fraud';
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    finding: string;
    implication: string;
    recommendation: string;
    regulationReference?: string; 
}
