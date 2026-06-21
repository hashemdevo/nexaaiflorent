
import React, { useState } from 'react';
import { analyzeBankTransactions } from '../../services/geminiService';
import { Transaction } from '../../types';
import { Loader2, Sparkles, RefreshCcw, Landmark, Download, Server, CheckCircle2 } from 'lucide-react';
import { DbEngine } from '../../services/core/db';
import { JournalService } from '../../services/ledger/journal';
import { JournalEntry } from '../../types';

// Shared Mock Data for Insights
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX001', date: '2023-10-01', description: 'AWS Services', amount: 450.00, category: 'Software', type: 'debit', status: 'cleared' },
  { id: 'TX002', date: '2023-10-02', description: 'WeWork Rent', amount: 2500.00, category: 'Rent', type: 'debit', status: 'cleared' },
  { id: 'TX003', date: '2023-10-05', description: 'Client Payment - Alpha', amount: 12000.00, category: 'Sales', type: 'credit', status: 'cleared' },
  { id: 'TX004', date: '2023-10-12', description: 'Uber Trip', amount: 1450.00, category: 'Travel', type: 'debit', status: 'flagged' },
  { id: 'TX005', date: '2023-10-15', description: 'Staples Supplies', amount: 240.00, category: 'Office', type: 'debit', status: 'cleared' },
  { id: 'TX006', date: '2023-10-15', description: 'Staples Supplies', amount: 240.00, category: 'Office', type: 'debit', status: 'flagged' },
  { id: 'TX007', date: '2023-10-20', description: 'Unknown Vendor 882', amount: 99.99, category: 'Misc', type: 'debit', status: 'pending' },
  { id: 'TX008', date: '2023-10-21', description: 'Consulting Fee', amount: 4999.00, category: 'Professional Services', type: 'debit', status: 'cleared' },
  { id: 'TX009', date: '2023-10-22', description: 'Consulting Fee', amount: 4999.00, category: 'Professional Services', type: 'debit', status: 'cleared' },
];

export const BankInsights: React.FC = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [proxySyncing, setProxySyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeBankTransactions(MOCK_TRANSACTIONS);
    setAnalysis(result);
    setLoading(false);
  };

  const handleProxySync = async () => {
    setProxySyncing(true);
    setSyncLogs(['Connecting to Plaid/Bank Mockup Proxy...']);
    
    // Simulate API Delay
    await new Promise(r => setTimeout(r, 1000));
    setSyncLogs(prev => [...prev, 'Fetched 3 new external transactions.']);
    
    await new Promise(r => setTimeout(r, 800));
    setSyncLogs(prev => [...prev, 'AI Auto-categorizing...']);
    
    const today = new Date().toISOString().split('T')[0];
    
    const incomingTxs = [
      { desc: 'Deposit: POS Retail', amount: 1500, type: 'credit', acct: '4000', label: 'Sales Revenue' },
      { desc: 'Withdrawal: Cloud Hosting', amount: 300, type: 'debit', acct: '6000', label: 'IT Expenses' },
      { desc: 'Deposit: Online Gateway', amount: 2200, type: 'credit', acct: '4000', label: 'Sales Revenue' }
    ];

    try {
        for (const tx of incomingTxs) {
            await JournalService.postEntry({
                transactionDate: today,
                postedDate: new Date().toISOString(),
                reference: 'MOCK-BANK-SYNC',
                description: tx.desc,
                lines: [
                    { accountId: '1000', accountName: 'Main Bank Account', debit: tx.type === 'credit' ? tx.amount : 0, credit: tx.type === 'debit' ? tx.amount : 0 },
                    { accountId: tx.acct, accountName: tx.label, debit: tx.type === 'debit' ? tx.amount : 0, credit: tx.type === 'credit' ? tx.amount : 0 }
                ],
                totalAmount: tx.amount,
                createdBy: 'BANK_PROXY'
            }, null as any); // Bypass strict trx requirements for mockup demo wrapper
        }
        setSyncLogs(prev => [...prev, 'Reconciliation Engine matched 3 entries. Ledger updated.']);
    } catch(e) {
        console.error("Bank proxy error", e);
        setSyncLogs(prev => [...prev, 'Error writing to Ledger.']);
    }

    await new Promise(r => setTimeout(r, 500));
    setSyncLogs(prev => [...prev, 'Sync Complete!']);
    setTimeout(() => {
        setProxySyncing(false);
        setSyncLogs([]);
    }, 4000);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl mx-auto font-sans" dir="ltr">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            Banking Automation Hub
          </h2>
          <p className="text-on-surface-muted mt-1">Bank Mockup Proxy, feed synchronization & AI Insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bank Feed Proxy Panel */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
           <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
             <Server className="h-5 w-5 text-indigo-500" /> API Mockup Proxy
           </h3>
           <p className="text-sm text-on-surface-muted mb-6">
             Simulate incoming bank feeds. This will fetch mock external transactions, auto-categorize them with Gemini, and register corresponding double-entry journals into the ledger.
           </p>

           <div className="bg-surface-highlight/30 rounded-lg p-4 mb-6 min-h-[120px] font-mono text-xs text-on-surface-muted border border-border">
             {syncLogs.length === 0 ? (
                 <div className="flex items-center justify-center h-full opacity-50">System Idle. Waiting for sync...</div>
             ) : (
                 <div className="space-y-2">
                     {syncLogs.map((log, i) => (
                         <div key={i} className="flex gap-2 items-center">
                             <span className="text-indigo-500">{'>'}</span> {log}
                         </div>
                     ))}
                 </div>
             )}
           </div>

           <button 
              onClick={handleProxySync}
              disabled={proxySyncing}
              className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5 py-3 rounded-xl transition duration-300 disabled:opacity-50"
            >
              {proxySyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {proxySyncing ? 'Syncing Feeds...' : 'Trigger Proxy Bank Sync'}
            </button>
        </div>

        {/* AI Bank Insights Panel */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
             <Sparkles className="h-5 w-5 text-primary" /> AI Insights Engine
           </h3>
           <p className="text-sm text-on-surface-muted mb-6">
             Run deep analysis on cash flow trends, categorized expenses, and anomalous recurring charges across connected accounts.
           </p>

           <div className="flex-1 flex flex-col justify-center">
               {!analysis && !loading && (
                <div className="text-center py-8 bg-surface-highlight/20 rounded-lg border border-dashed border-border mb-6">
                    <CheckCircle2 className="h-8 w-8 text-primary/50 mx-auto mb-2" />
                    <p className="text-sm text-on-surface-muted">Ready to scan 9 recent transactions.</p>
                </div>
               )}

               {loading && (
                 <div className="space-y-4 animate-pulse p-4 mb-6">
                   <div className="h-3 bg-surface-highlight rounded w-3/4"></div>
                   <div className="h-3 bg-surface-highlight rounded w-full"></div>
                   <div className="h-3 bg-surface-highlight rounded w-5/6"></div>
                 </div>
               )}

               {analysis && (
                 <div className="bg-primary/5 rounded-lg border border-primary/20 p-4 mb-6 max-h-[200px] overflow-y-auto custom-scrollbar">
                    <div className="whitespace-pre-wrap text-on-surface text-sm">
                      {analysis}
                    </div>
                 </div>
               )}
           </div>

           <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-surface-highlight hover:bg-border text-on-surface font-bold px-5 py-3 rounded-xl transition duration-300 disabled:opacity-50 mt-auto shadow-[0_0_10px_rgba(20,241,149,0.1)] border border-primary/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              {loading ? 'Analyzing Data...' : 'Analyze Cash Flow'}
            </button>
        </div>
      </div>
    </div>
  );
};
