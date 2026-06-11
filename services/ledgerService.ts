
import { JournalService } from './ledger/journal';
import { AccountService } from './ledger/accounts';
import { ReportingService } from './ledger/reporting';
import { JournalEntry, Account } from '../types';

/**
 * LEGACY ADAPTER
 * This file now acts as a bridge to the new 'services/ledger/' modular architecture.
 * This ensures we don't break existing imports in components.
 */
export const LedgerService = {
    
    async init() {
        await AccountService.init();
    },

    async postJournalEntry(entry: Omit<JournalEntry, 'id' | 'status' | 'hash'>): Promise<JournalEntry> {
        return JournalService.postEntry(entry);
    },

    async getLedger(): Promise<JournalEntry[]> {
        return JournalService.getAll();
    },

    async getChartOfAccounts(): Promise<Account[]> {
        return AccountService.getAll();
    },

    async getTrialBalance(): Promise<{account: string, debit: number, credit: number}[]> {
        return ReportingService.getTrialBalance();
    }
};
