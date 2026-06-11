import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Nexa } from '../../services/api';
import { JournalEntry } from '../../types';

export const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entries = await Nexa.Ledger.Journal.getAll();
        setTransactions(entries.slice(0, 15)); // Show recent 15
      } catch (e) {
        console.error("Failed to fetch ledger", e);
      }
    };

    fetchData();
    
    // Refresh on storage updates
    const handleUpdate = () => fetchData();
    window.addEventListener('nexa-storage-update', handleUpdate);
    return () => window.removeEventListener('nexa-storage-update', handleUpdate);
  }, []);

  return (
    <div className="glass-panel p-0 rounded-2xl border border-border overflow-hidden flex flex-col h-auto animate-fade-in">
      <div className="p-6 border-b border-border bg-surface/50">
        <h3 className="font-bold text-on-surface text-lg">Recent Ledger Entries</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-border">
                {transactions.length === 0 ? (
                    <tr>
                        <td colSpan={2} className="p-8 text-center text-on-surface-muted">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No transactions recorded yet.
                        </td>
                    </tr>
                ) : transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-highlight/30 transition duration-150 group">
                        <td className="px-6 py-4">
                            <div className="font-bold text-on-surface truncate max-w-[400px]" title={tx.description}>{tx.description}</div>
                            <div className="text-xs text-on-surface-muted mt-1">{new Date(tx.transactionDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="font-mono font-bold text-on-surface">
                                ${tx.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-secondary font-bold uppercase tracking-wide">
                                <CheckCircle2 className="h-3 w-3" /> Posted
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
