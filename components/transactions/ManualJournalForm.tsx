
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Plus, AlertTriangle } from 'lucide-react';
import { AIAnalysisResult, JournalEntryLine, Account } from '../../types';
import { Nexa } from '../../services/api';
import { JournalLine } from './JournalLine';

interface ManualEntryFormProps {
    onSubmit: (data: AIAnalysisResult) => void;
}

const createNewLine = (type: 'DEBIT' | 'CREDIT'): JournalEntryLine => ({
    accountId: '',
    accountName: '',
    description: '',
    debit: 0,
    credit: 0,
    isNewAccount: type === 'DEBIT', // Default debit to new, credit to existing
});

const MOCK_COST_CENTERS = [
    { id: 'cc1', code: 'MK-001', name: 'Marketing Dept' },
    { id: 'cc2', code: 'IT-002', name: 'IT Operations' },
    { id: 'cc3', code: 'HR-003', name: 'Human Resources' },
    { id: 'cc4', code: 'OPS-004', name: 'General Operations' },
];

export const ManualJournalForm: React.FC<ManualEntryFormProps> = ({ onSubmit }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [header, setHeader] = useState({ date: new Date().toISOString().split('T')[0], description: '', costCenter: '' });
    const [lines, setLines] = useState<JournalEntryLine[]>([createNewLine('DEBIT'), createNewLine('CREDIT')]);
    
    useEffect(() => {
        const loadAccounts = async () => {
            const accs = await Nexa.Ledger.Accounts.getAll();
            setAccounts(accs);
            const defaultCreditAcc = accs.find(a => a.code === '1010');
            if (defaultCreditAcc) {
                setLines(prev => {
                    const newLines = [...prev];
                    const creditIndex = newLines.findIndex(l => l.credit > 0 || (l.debit === 0 && l.credit === 0));
                    if (creditIndex !== -1) {
                        newLines[creditIndex].accountId = defaultCreditAcc.id;
                    }
                    return newLines;
                });
            }
        };
        loadAccounts();
    }, []);

    const totals = useMemo(() => {
        return lines.reduce((acc, line) => ({
            debit: acc.debit + line.debit,
            credit: acc.credit + line.credit,
        }), { debit: 0, credit: 0 });
    }, [lines]);

    const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;

    const updateLine = (index: number, updatedLine: JournalEntryLine) => {
        const newLines = [...lines];
        newLines[index] = updatedLine;
        setLines(newLines);
    };

    const addLine = (type: 'DEBIT' | 'CREDIT') => {
        setLines([...lines, createNewLine(type)]);
    };

    const removeLine = (index: number) => {
        if (lines.length > 2) {
            const newLines = lines.filter((_, i) => i !== index);
            setLines(newLines);
        }
    };

    const handleSubmit = () => {
        if (!isBalanced || totals.debit === 0) {
            alert("Transaction is unbalanced or has zero value.");
            return;
        }
        onSubmit({
            summary: header.description || 'Manual Compound Entry',
            date: header.date,
            parties: [],
            totalAmount: totals.debit,
            taxAmount: 0,
            lines: lines.filter(l => l.debit > 0 || l.credit > 0), // Filter out empty lines
            confidence: 1.0,
            costCenter: header.costCenter
        } as any);
    };
    
    const debitLines = lines.map((l, i) => ({...l, index: i})).filter(l => l.debit > 0 || (l.credit === 0 && l.debit === 0));
    const creditLines = lines.map((l, i) => ({...l, index: i})).filter(l => l.credit > 0);

    return (
        <div className="flex flex-col h-full animate-fade-in bg-background/50">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm space-y-3">
                     <textarea 
                        value={header.description} 
                        onChange={e => setHeader({...header, description: e.target.value})} 
                        placeholder="Transaction Description..." 
                        className="w-full text-lg font-medium text-on-surface bg-transparent outline-none resize-none h-12"
                    />
                    <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-border/40">
                        <div className="flex-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-muted block mb-1">Transaction Date</label>
                            <input 
                                type="date"
                                value={header.date}
                                onChange={e => setHeader({...header, date: e.target.value})}
                                className="w-full bg-surface-highlight/30 border border-border rounded-xl px-3 py-2 text-xs font-mono text-on-surface outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-muted block mb-1">Cost Center (Optional)</label>
                            <select 
                                value={header.costCenter}
                                onChange={e => setHeader({...header, costCenter: e.target.value})}
                                className="w-full bg-surface-highlight/30 border border-border rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                            >
                                <option value="">None / General Ledger</option>
                                {MOCK_COST_CENTERS.map(cc => (
                                    <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Debit Column */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">Debits</h4>
                        {lines.map((line, index) => (line.debit > 0 || (line.credit === 0 && line.debit === 0)) && (
                            <JournalLine key={index} line={line} onChange={updated => updateLine(index, updated)} onRemove={() => removeLine(index)} type="DEBIT" accounts={accounts} />
                        ))}
                        <button onClick={() => addLine('DEBIT')} className="w-full border-2 border-dashed border-border p-3 rounded-xl text-on-surface-muted hover:border-primary hover:text-primary transition flex items-center justify-center gap-2">
                            <Plus className="h-4 w-4" /> Add Debit Line
                        </button>
                    </div>

                    {/* Credit Column */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">Credits</h4>
                        {lines.map((line, index) => line.credit > 0 && (
                            <JournalLine key={index} line={line} onChange={updated => updateLine(index, updated)} onRemove={() => removeLine(index)} type="CREDIT" accounts={accounts} />
                        ))}
                         <button onClick={() => addLine('CREDIT')} className="w-full border-2 border-dashed border-border p-3 rounded-xl text-on-surface-muted hover:border-secondary hover:text-secondary transition flex items-center justify-center gap-2">
                            <Plus className="h-4 w-4" /> Add Credit Line
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-border bg-surface sticky bottom-0 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-right">
                        <span className="text-xs text-on-surface-muted uppercase">Total Debits</span>
                        <p className="font-mono font-bold text-lg text-primary">${totals.debit.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-on-surface-muted uppercase">Total Credits</span>
                        <p className="font-mono font-bold text-lg text-secondary">${totals.credit.toFixed(2)}</p>
                    </div>
                    {isBalanced ? (
                        <div className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full border border-secondary/20">Balanced</div>
                    ) : (
                        <div className="px-3 py-1 bg-danger/10 text-danger text-xs font-bold rounded-full border border-danger/20 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Unbalanced
                        </div>
                    )}
                </div>
                <button onClick={handleSubmit} disabled={!isBalanced || totals.debit === 0} className="w-full py-4 bg-primary text-black font-bold rounded-2xl shadow-glow-primary hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save className="h-5 w-5 inline-block mr-2" /> Confirm Transaction
                </button>
            </div>
        </div>
    );
};
