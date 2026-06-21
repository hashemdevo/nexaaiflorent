
import React from 'react';
import { Plus } from 'lucide-react';

export const ProvisionsManager: React.FC = () => (
  <div className="animate-fade-in max-w-5xl mx-auto mt-6">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold text-on-surface">Provisions & Liabilities</h2>
      <button className="flex items-center gap-2 text-sm bg-surface hover:bg-surface-highlight px-4 py-2 rounded-xl text-on-surface font-medium transition border border-border">
        <Plus className="h-4 w-4" /> Add Provision
      </button>
    </div>
    <div className="glass-panel rounded-2xl overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-highlight/50 text-on-surface-muted border-b border-border font-bold uppercase text-xs tracking-wider">
          <tr>
            <th className="px-6 py-5">Provision Name</th>
            <th className="px-6 py-5">Due Date</th>
            <th className="px-6 py-5">Probability</th>
            <th className="px-6 py-5 text-right">Estimated Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr className="hover:bg-surface-highlight/50 transition">
            <td className="px-6 py-5 font-medium text-on-surface">Pending Litigation Case B</td>
            <td className="px-6 py-5 text-on-surface-muted">2024-12-31</td>
            <td className="px-6 py-5"><span className="text-warning bg-warning/10 border border-warning/20 px-2.5 py-1 rounded-lg text-xs font-bold">MEDIUM</span></td>
            <td className="px-6 py-5 text-right font-mono text-on-surface">$15,000.00</td>
          </tr>
          <tr className="hover:bg-surface-highlight/50 transition">
            <td className="px-6 py-5 font-medium text-on-surface">Warranty Returns Reserve</td>
            <td className="px-6 py-5 text-on-surface-muted">Rolling</td>
            <td className="px-6 py-5"><span className="text-danger bg-danger/10 border border-danger/20 px-2.5 py-1 rounded-lg text-xs font-bold">HIGH</span></td>
            <td className="px-6 py-5 text-right font-mono text-on-surface">$4,500.00</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);
