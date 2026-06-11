
import React, { useState, useRef } from 'react';
import { AIAnalysisResult, JournalEntryLine, CostCenter } from '../../../types';
import { Save, Building2, Upload, FileText, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';

interface ReviewFormProps {
    initialData: AIAnalysisResult;
    onSave: (finalData: any) => void;
    onCancel: () => void;
}

const MOCK_COST_CENTERS: CostCenter[] = [
    { id: 'cc1', code: 'MK-001', name: 'Marketing Dept' },
    { id: 'cc2', code: 'IT-002', name: 'IT Operations' },
    { id: 'cc3', code: 'HR-003', name: 'Human Resources' },
    { id: 'cc4', code: 'OPS-004', name: 'General Operations' },
];

const EXISTING_ACCOUNTS = [
    { id: '1010', name: '1010 - Main Bank Account', type: 'Asset' },
    { id: '1020', name: '1020 - Petty Cash', type: 'Asset' },
    { id: '5001', name: '5001 - Salaries & Wages', type: 'Expense' },
];

export const ReviewForm: React.FC<ReviewFormProps> = ({ initialData, onSave, onCancel }) => {
    const [costCenter, setCostCenter] = useState((initialData as any).costCenter || '');
    const [docMode, setDocMode] = useState<'NEW' | 'ARCHIVE'>('NEW');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const complianceFileRef = useRef<HTMLInputElement>(null);
    
    // Split lines into Debit and Credit for the UI
    const [debitSide, setDebitSide] = useState<JournalEntryLine>(
        initialData.lines.find(l => l.debit > 0) || { 
            accountId: '', accountName: 'Employee Salary Advances', debit: initialData.totalAmount, credit: 0, 
            isNewAccount: true, suggestedParentAccount: 'None (Top-Level Account)', 
            accountType: 'ASSET', subsidiaryLedger: 'Employee Name, Project Name',
            entityVerificationRequired: true
        }
    );

    const [creditSide, setCreditSide] = useState<JournalEntryLine>(
        initialData.lines.find(l => l.credit > 0) || { 
            accountId: '1010', accountName: 'Main Bank Account', debit: 0, credit: initialData.totalAmount, 
            isNewAccount: false 
        }
    );

    const handleSave = () => {
        onSave({
            ...initialData,
            lines: [debitSide, creditSide],
            costCenter
        });
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
                
                {/* 1. Top Header Summary */}
                <div className="flex flex-col items-center text-center mb-6">
                    <h3 className="text-2xl font-bold text-on-surface">{initialData.summary}</h3>
                    <div className="text-3xl font-mono font-bold text-primary mt-2">
                        EGP {initialData.totalAmount.toFixed(2)}
                        <span className="text-sm font-sans font-normal text-on-surface-muted ml-2">(approx. $1.05)</span>
                    </div>
                </div>

                {/* 2. AI Suggestion Alert */}
                {(debitSide.isNewAccount || creditSide.isNewAccount) && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                        <div className="p-1 bg-blue-500/20 rounded-full text-blue-400 mt-0.5">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm text-on-surface font-medium">The AI suggests creating one or more new accounts for this transaction. Please review and confirm.</p>
                        </div>
                    </div>
                )}

                {/* 3. Split Debit / Credit Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* --- DEBIT SECTION --- */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-border pb-2 mb-4">
                            <span className="text-sm font-bold text-on-surface-muted uppercase tracking-widest">Debit</span>
                        </div>

                        {/* Toggle: New vs Existing */}
                        <div className="flex bg-surface-highlight/20 rounded-lg p-1 border border-border">
                            <button 
                                onClick={() => setDebitSide({...debitSide, isNewAccount: true})}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition ${debitSide.isNewAccount ? 'bg-primary text-black shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}
                            >
                                New account for Debit
                            </button>
                            <button 
                                onClick={() => setDebitSide({...debitSide, isNewAccount: false})}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition ${!debitSide.isNewAccount ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}
                            >
                                Use Existing
                            </button>
                        </div>

                        {debitSide.isNewAccount ? (
                            <div className="space-y-4 bg-surface border border-border rounded-xl p-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Account Name</label>
                                    <input 
                                        type="text" 
                                        value={debitSide.accountName} 
                                        onChange={e => setDebitSide({...debitSide, accountName: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Subsidiary Ledger Account (optional)</label>
                                    <input 
                                        type="text" 
                                        value={debitSide.subsidiaryLedger || ''}
                                        onChange={e => setDebitSide({...debitSide, subsidiaryLedger: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary placeholder:text-on-surface-muted/50"
                                        placeholder="e.g., Employee Name, Project Name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Suggested Type</label>
                                    <div className="relative">
                                        <select 
                                            value={debitSide.accountType || 'ASSET'}
                                            onChange={e => setDebitSide({...debitSide, accountType: e.target.value as any})}
                                            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary appearance-none"
                                        >
                                            <option value="ASSET">Asset</option>
                                            <option value="LIABILITY">Liability</option>
                                            <option value="EXPENSE">Expense</option>
                                            <option value="REVENUE">Revenue</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Parent Account (optional)</label>
                                    <div className="relative">
                                        <select 
                                            value={debitSide.suggestedParentAccount || 'None'}
                                            onChange={e => setDebitSide({...debitSide, suggestedParentAccount: e.target.value})}
                                            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary appearance-none"
                                        >
                                            <option>None (Top-Level Account)</option>
                                            <option>Current Assets</option>
                                            <option>Fixed Assets</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                    </div>
                                </div>

                                {/* Compliance Check */}
                                {debitSide.entityVerificationRequired && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="flex items-center gap-2 mb-2 text-warning">
                                            <AlertTriangle className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase">Entity Verification Required</span>
                                        </div>
                                        <p className="text-xs text-on-surface-muted mb-3 leading-relaxed">
                                            To comply with labor laws, please upload a copy of the employment contract or a similar identifying document for this new employee.
                                        </p>
                                        <div 
                                            onClick={() => complianceFileRef.current?.click()}
                                            className="border border-dashed border-border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-surface-highlight/50 transition"
                                        >
                                            <Upload className="h-4 w-4 text-on-surface-muted" />
                                            <span className="text-xs text-on-surface-muted font-medium">No file chosen</span>
                                            <input type="file" ref={complianceFileRef} className="hidden" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-surface border border-border rounded-xl p-5">
                                <label className="text-xs font-bold text-on-surface-muted uppercase mb-1 block">Select Account</label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary appearance-none"
                                    >
                                        {EXISTING_ACCOUNTS.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- CREDIT SECTION --- */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-border pb-2 mb-4">
                            <span className="text-sm font-bold text-on-surface-muted uppercase tracking-widest">Credit</span>
                        </div>

                        {/* Toggle: New vs Existing */}
                        <div className="flex bg-surface-highlight/20 rounded-lg p-1 border border-border">
                            <button 
                                onClick={() => setCreditSide({...creditSide, isNewAccount: true})}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition ${creditSide.isNewAccount ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}
                            >
                                New account for Credit
                            </button>
                            <button 
                                onClick={() => setCreditSide({...creditSide, isNewAccount: false})}
                                className={`flex-1 py-2 text-xs font-bold rounded-md transition ${!creditSide.isNewAccount ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}
                            >
                                Use Existing
                            </button>
                        </div>

                        {creditSide.isNewAccount ? (
                             <div className="space-y-4 bg-surface border border-border rounded-xl p-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Account Name</label>
                                    <input 
                                        type="text" 
                                        value={creditSide.accountName} 
                                        onChange={e => setCreditSide({...creditSide, accountName: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-secondary font-medium"
                                    />
                                </div>
                                {/* Simpler inputs for credit side example */}
                             </div>
                        ) : (
                            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Select Account</label>
                                    <div className="relative">
                                        <select 
                                            value={creditSide.accountId}
                                            onChange={e => setCreditSide({...creditSide, accountId: e.target.value})}
                                            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-secondary appearance-none"
                                        >
                                            {EXISTING_ACCOUNTS.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Supporting Info (Documents & Cost Center) - Placed in Credit Col visually or Bottom */}
                        <div className="mt-8 space-y-4 pt-4 border-t border-border">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Transaction Related Documents</label>
                                <div className="flex bg-background border border-border rounded-xl overflow-hidden">
                                    <button 
                                        onClick={() => setDocMode('NEW')}
                                        className={`flex-1 py-2 text-xs font-bold transition ${docMode === 'NEW' ? 'bg-surface-highlight text-on-surface' : 'text-on-surface-muted hover:bg-surface-highlight/50'}`}
                                    >
                                        Upload New
                                    </button>
                                    <div className="w-px bg-border"></div>
                                    <button 
                                        onClick={() => setDocMode('ARCHIVE')}
                                        className={`flex-1 py-2 text-xs font-bold transition ${docMode === 'ARCHIVE' ? 'bg-surface-highlight text-on-surface' : 'text-on-surface-muted hover:bg-surface-highlight/50'}`}
                                    >
                                        Select from Archive
                                    </button>
                                </div>
                                
                                {docMode === 'NEW' && (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-surface-highlight/30 transition"
                                    >
                                        <Upload className="h-5 w-5 text-on-surface-muted" />
                                        <span className="text-sm text-on-surface-muted font-medium">Click to upload support doc</span>
                                        <input type="file" ref={fileInputRef} className="hidden" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Cost Center (optional)</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                                    <select 
                                        value={costCenter}
                                        onChange={(e) => setCostCenter(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="">None</option>
                                        {MOCK_COST_CENTERS.map(cc => (
                                            <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
                <button 
                    onClick={onCancel}
                    className="px-6 py-3 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-8 py-3 bg-primary text-black font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition flex items-center gap-2"
                >
                    <Save className="h-4 w-4" /> Confirm Transaction
                </button>
            </div>
        </div>
    );
};
