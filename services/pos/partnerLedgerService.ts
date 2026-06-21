
export interface PartnerLedgerEntry {
    id: string;
    partnerEmail: string;
    partnerName: string;
    date: string;
    type: 'deposit' | 'withdrawal' | 'adjustment';
    amount: number;
    balanceAfter: number;
    journalEntryId?: string;
    orderId?: string;
    orderNo?: string;
    remarks?: string;
}
export const PartnerLedgerService = {
  recordWithdrawal: async () => true,
  recordDeposit: async () => true,
  getEntries: async () => [],
  getBalance: async () => 0,
  getPartnersBreakdown: async () => []
};
