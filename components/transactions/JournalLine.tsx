
import React, { useState } from 'react';
import { JournalEntryLine, Account } from '../../types';
import { ChevronDown, Plus, Trash2, FolderTree } from 'lucide-react';

interface JournalLineProps {
    line: JournalEntryLine;
    onChange: (updatedLine: JournalEntryLine) => void;
    onRemove: () => void;
    type: 'DEBIT' | 'CREDIT';
    accounts: Account[];
}

export const JournalLine: React.FC<JournalLineProps> = ({ line, onChange, onRemove, type, accounts }) => {
    const isDebit = type === 'DEBIT';
    const amount = isDebit ? line.debit : line.credit;

    const handleAmountChange = (value: string) => {
        const num = parseFloat(value) || 0;
        onChange({
            ...line,
            debit: isDebit ? num : 0,
            credit: !isDebit ? num : 0,
        });
    };

    const handleSubAccountChange = (level: number, value: string) => {
        const newSubs = [...(line.subsidiaryLedger || [])];
        newSubs[level] = value;
        // Trim trailing empty values
        while (newSubs.length > 0 && !newSubs[newSubs.length - 1]) {
            newSubs.pop();
        }
        onChange({ ...line, subsidiaryLedger: newSubs });
    };

    const addSubAccount = () => {
        const currentSubs = line.subsidiaryLedger || [];
        if (currentSubs.length < 4) {
            onChange({ ...line, subsidiaryLedger: [...currentSubs, ''] });
        }
    };
    
    return (
        <div className="bg-surface border border-border rounded-2xl p-4 space-y-4 group relative">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface-muted hover:text-on-surface">
                            <input type="radio" checked={line.isNewAccount} onChange={() => onChange({ ...line, isNewAccount: true })} name={`account-type-${line.accountId}`} className="accent-primary" />
                            New
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-on-surface-muted hover:text-on-surface">
                            <input type="radio" checked={!line.isNewAccount} onChange={() => onChange({ ...line, isNewAccount: false })} name={`account-type-${line.accountId}`} className="accent-primary" />
                            Existing
                        </label>
                    </div>

                    {line.isNewAccount ? (
                        <div className="space-y-2 animate-fade-in">
                            <input
                                type="text"
                                value={line.accountName || ''}
                                onChange={e => onChange({ ...line, accountName: e.target.value })}
                                placeholder="New Account Name"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium text-on-surface outline-none focus:border-primary"
                            />
                            {(line.subsidiaryLedger || []).map((sub, i) => (
                                <div key={i} className="flex items-center gap-2 pl-4">
                                    <div className="w-4 border-l border-b border-border h-4"></div>
                                    <input
                                        type="text"
                                        value={sub}
                                        onChange={e => handleSubAccountChange(i, e.target.value)}
                                        placeholder={`Sub-Account Level ${i + 1}`}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                                    />
                                </div>
                            ))}
                            {(line.subsidiaryLedger || []).length < 4 && (
                                <button type="button" onClick={addSubAccount} className="flex items-center gap-2 text-xs text-primary font-bold hover:underline pl-4">
                                    <Plus className="h-3 w-3" /> Add Sub-Account
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="relative animate-fade-in">
                            <select
                                value={line.accountId}
                                onChange={e => onChange({ ...line, accountId: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary appearance-none font-medium"
                            >
                                <option value="">-- Select Account --</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                            </select>
                             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                        </div>
                    )}
                </div>
                <div className="w-32 ml-4">
                    <label className="text-[10px] font-bold text-on-surface-muted uppercase">{type}</label>
                    <input
                        type="number"
                        value={amount || ''}
                        onChange={e => handleAmountChange(e.target.value)}
                        className={`w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono font-bold outline-none focus:border-primary text-right ${isDebit ? 'text-primary' : 'text-secondary'}`}
                    />
                </div>
            </div>
            <button onClick={onRemove} className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-3 w-3" />
            </button>
        </div>
    );
};
