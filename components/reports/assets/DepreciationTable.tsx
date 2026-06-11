
import React from 'react';
import { Calculator } from 'lucide-react';
import { Asset } from '../../../types';
import { AccountingStandard } from '../../../services/accounting/standards';

interface DepreciationTableProps {
    schedule: any[];
    asset: Asset;
    standard: AccountingStandard;
}

export const DepreciationTable: React.FC<DepreciationTableProps> = ({ schedule, asset, standard }) => {
    return (
        <div className="border-t border-border bg-surface/50 p-6 animate-fade-in -mt-4 rounded-b-2xl">
            <div className="mb-4 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-secondary" />
                <h4 className="text-sm font-bold text-on-surface">
                    Depreciation Schedule ({standard})
                </h4>
                {standard === 'IFRS' && <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">Componentization Active</span>}
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight text-on-surface-muted text-xs font-bold uppercase">
                        <tr>
                            <th className="px-4 py-3">Year</th>
                            <th className="px-4 py-3 text-right">Expense</th>
                            <th className="px-4 py-3 text-right">Accumulated</th>
                            <th className="px-4 py-3 text-right">Carrying Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {schedule.map((row) => (
                            <tr key={row.year} className="hover:bg-surface-highlight/30">
                                <td className="px-4 py-3 font-medium text-on-surface">Year {row.year}</td>
                                <td className="px-4 py-3 text-right text-on-surface-muted font-mono">${row.expense.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                <td className="px-4 py-3 text-right text-on-surface-muted font-mono">${row.accumulated.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                <td className="px-4 py-3 text-right font-bold text-on-surface font-mono">${row.bookValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 text-xs text-on-surface-muted flex gap-4">
                <span>Salvage Value: <strong className="text-on-surface">${asset.salvageValue.toLocaleString()}</strong></span>
                <span>Method: <strong className="text-on-surface">{asset.depreciationMethod}</strong></span>
            </div>
        </div>
    );
};
