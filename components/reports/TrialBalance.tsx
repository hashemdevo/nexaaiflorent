import React, { useState, useEffect, useMemo } from 'react';
import { Nexa } from '../../services/api';
import { PDFEngine } from '../../services/pdfEngine';
import { Download, RefreshCw, AlertCircle, Scale, Building } from 'lucide-react';

interface BalanceLine {
  account: string;
  debit: number;
  credit: number;
}

export const TrialBalance: React.FC = () => {
  const [data, setData] = useState<BalanceLine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await Nexa.Ledger.Reporting.getTrialBalance();
      // Ensure there are values or map to state
      setData(records.map(r => ({
        account: r.account,
        debit: Number(r.debit) || 0,
        credit: Number(r.credit) || 0
      })));
    } catch (err: any) {
      console.error("Error retrieving ledger trial balance: ", err);
      setError(err.message || 'Failed to fetch ledger balance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance();
  }, []);

  const totals = useMemo(() => {
    return data.reduce((acc, curr) => ({
      debit: acc.debit + curr.debit,
      credit: acc.credit + curr.credit
    }), { debit: 0, credit: 0 });
  }, [data]);

  const hasMismatch = Math.abs(totals.debit - totals.credit) > 0.01;

  const handleExportPDF = () => {
    if (data.length === 0) return;
    PDFEngine.exportTrialBalance(data.map(item => ({
      accountName: item.account,
      debit: item.debit,
      credit: item.credit
    })));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1200px] mx-auto p-4 md:p-6 text-on-surface">
      
      {/* Dynamic Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Scale className="h-8 w-8 text-indigo-500" /> General Trial Balance
          </h2>
          <p className="text-on-surface-muted mt-1 text-sm">
            Automatic double-entry aggregation complying with IFRS reporting standards in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchTrialBalance}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-surface-highlight hover:bg-border transition text-on-surface disabled:opacity-50 flex items-center gap-2 font-bold text-xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Reload Ledger'}
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={loading || data.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg"
          >
            <Download className="h-4 w-4" /> Export IFRS PDF
          </button>
        </div>
      </div>

      {/* Out of Balance Warning Alert */}
      {hasMismatch && !loading && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Ledger Trial-Balance Mismatch Detected</h4>
            <p className="text-xs text-red-400 mt-1">
              General ledger debits ({totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR) 
              do not match credits ({totals.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR). 
              A corrective adjustment or pending forensic auditing entry from the accountant role is required.
            </p>
          </div>
        </div>
      )}

      {/* Balanced Confirmation */}
      {!hasMismatch && !loading && data.length > 0 && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-start gap-3">
          <Building className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Ledger Verification Succeeded</h4>
            <p className="text-xs text-emerald-400 mt-1">
              Perfect double-entry balance maintained. All debits correspond fully with credits under general controls.
            </p>
          </div>
        </div>
      )}

      {/* Table Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-background/50 border border-border rounded-2xl gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-mono text-on-surface-muted">Aggregating system-wide Double Entry Ledger lines...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/15 border border-red-500/20 rounded-2xl text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm font-bold">{error}</p>
          <button onClick={fetchTrialBalance} className="mt-4 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl">Retry Load</button>
        </div>
      ) : data.length === 0 ? (
        <div className="py-16 text-center bg-background/50 border border-dashed border-border rounded-2xl text-on-surface-muted text-sm">
          No active financial records found. Run transactions to generate trial balance lines dynamically.
        </div>
      ) : (
        <div className="glass-panel border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-highlight/40 text-on-surface-muted font-bold uppercase text-xs tracking-wider border-b border-border">
              <tr>
                <th className="px-8 py-5">Account Name / GL Code</th>
                <th className="px-8 py-5 text-right">Debit (SAR)</th>
                <th className="px-8 py-5 text-right">Credit (SAR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-indigo-500/5 transition duration-150">
                  <td className="px-8 py-5 font-medium text-on-surface">{row.account}</td>
                  <td className="px-8 py-5 text-right text-on-surface font-mono">
                    {row.debit > 0 ? row.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                  </td>
                  <td className="px-8 py-5 text-right text-on-surface font-mono">
                    {row.credit > 0 ? row.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-highlight/30 font-bold text-on-surface border-t-2 border-border">
              <tr>
                <td className="px-8 py-5 text-sm uppercase">Total Controls</td>
                <td className="px-8 py-5 text-right font-mono text-indigo-400 text-base">
                  {totals.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-5 text-right font-mono text-indigo-400 text-base">
                  {totals.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
