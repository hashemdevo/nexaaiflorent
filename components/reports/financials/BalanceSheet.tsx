
import React from 'react';
import { AccountingStandard } from '../../../services/accounting/standards';

interface BalanceSheetProps {
    standard: AccountingStandard;
}

export const BalanceSheet: React.FC<BalanceSheetProps> = ({ standard }) => {
    return (
        <div className="space-y-6">
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 bg-gradient-to-bl from-secondary to-transparent h-32 w-32 rounded-bl-full"></div>
                <h4 className="text-xs text-on-surface-muted font-bold uppercase tracking-widest">
                    {standard === 'IFRS' ? 'Total Equity & Liabilities' : 'Total Liabilities & Equity'}
                </h4>
                <div className="text-4xl font-bold text-secondary mt-4 drop-shadow-glow-secondary">+$145,290</div>
                
                {standard === 'IFRS' && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex justify-between text-sm">
                            <span className="text-on-surface-muted">Revaluation Surplus</span>
                            <span className="font-mono text-emerald-400 font-bold">$12,500</span>
                        </div>
                        <p className="text-[10px] text-on-surface-muted mt-1 italic">
                            *Assets adjusted to Fair Value (IAS 16)
                        </p>
                    </div>
                )}
            </div>

            <div className="glass-panel p-8 rounded-2xl">
                <h4 className="text-xs text-on-surface-muted font-bold uppercase tracking-widest">Gross Margin</h4>
                <div className="text-4xl font-bold text-on-surface mt-4">68.4%</div>
                <div className="text-sm text-on-surface-muted mt-2">Stable quarter over quarter</div>
                
                <div className="w-full bg-surface-highlight h-2 rounded-full mt-6">
                    <div className="bg-primary h-2 rounded-full" style={{width: '68.4%'}}></div>
                </div>
            </div>
        </div>
    );
};
