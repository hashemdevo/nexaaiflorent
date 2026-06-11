
import React, { useState, useEffect, useRef } from 'react';
import { Save, Building2, Upload, FileText, CheckCircle2, AlertTriangle, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { AIAnalysisResult, JournalEntryLine, CostCenter, Account } from '../../../types';
import { Nexa } from '../../../services/api';

// Mock Cost Centers (Could also be fetched from DB if module exists)
const MOCK_COST_CENTERS: CostCenter[] = [
    { id: 'cc1', code: 'MK-001', name: 'Marketing Dept' },
    { id: 'cc2', code: 'IT-002', name: 'IT Operations' },
    { id: 'cc3', code: 'HR-003', name: 'Human Resources' },
    { id: 'cc4', code: 'OPS-004', name: 'General Operations' },
];

interface ManualEntryFormProps {
    onSubmit: (data: AIAnalysisResult) => void;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSubmit }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [header, setHeader] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        costCenter: '',
        currency: 'USD'
    });

    // Files
    const fileInputRef = useRef<HTMLInputElement>(null);
    const complianceFileRef = useRef<HTMLInputElement>(null);
    const [docName, setDocName] = useState<string | null>(null);

    // Debit Side State
    const [debitSide, setDebitSide] = useState<JournalEntryLine>({
        accountId: '',
        accountName: '',
        debit: 0,
        credit: 0,
        isNewAccount: false,
        accountType: 'EXPENSE',
        suggestedParentAccount: 'None',
        subsidiaryLedger: '',
        entityVerificationRequired: false
    });

    // Credit Side State
    const [creditSide, setCreditSide] = useState<JournalEntryLine>({
        accountId: '', 
        accountName: '',
        debit: 0,
        credit: 0,
        isNewAccount: false,
        accountType: 'ASSET',
        suggestedParentAccount: 'None',
        subsidiaryLedger: ''
    });

    // Load Accounts on Mount
    useEffect(() => {
        const loadAccounts = async () => {
            const accs = await Nexa.Ledger.Accounts.getAll();
            setAccounts(accs);
            
            // Set Defaults if available
            if (accs.length > 0) {
                const cashAcc = accs.find(a => a.code === '1010') || accs[0];
                setCreditSide(prev => ({ ...prev, accountId: cashAcc.id, accountName: cashAcc.name }));
            }
        };
        loadAccounts();
    }, []);

    const handleAmountChange = (val: string) => {
        const num = parseFloat(val) || 0;
        setDebitSide({ ...debitSide, debit: num });
        setCreditSide({ ...creditSide, credit: num }); // Auto-balance for simple entry
    };

    const handleSubmit = () => {
        // Construct final lines
        const finalDebit = {
            ...debitSide,
            description: header.description,
            accountName: debitSide.isNewAccount ? debitSide.accountName : accounts.find(a => a.id === debitSide.accountId)?.name || 'Unknown'
        };
        
        const finalCredit = {
            ...creditSide,
            description: header.description,
            accountName: creditSide.isNewAccount ? creditSide.accountName : accounts.find(a => a.id === creditSide.accountId)?.name || 'Unknown'
        };

        const result: AIAnalysisResult & { costCenter?: string } = {
            summary: header.description || 'Manual Entry',
            date: header.date,
            parties: ['Manual Entry'],
            totalAmount: debitSide.debit,
            taxAmount: 0,
            lines: [finalDebit, finalCredit],
            confidence: 1.0,
            costCenter: header.costCenter
        };

        onSubmit(result);
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
                
                {/* 1. Top Header Section */}
                <div className="bg-surface border border-border rounded-2xl p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                        <input 
                            type="text" 
                            placeholder="Description (e.g. Salary Advance to Hashim)"
                            value={header.description}
                            onChange={e => setHeader({...header, description: e.target.value})}
                            className="text-2xl font-bold text-on-surface bg-transparent text-center outline-none placeholder:text-on-surface-muted/50 w-full"
                        />
                        <div className="mt-4 relative max-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted font-mono">$</span>
                            <input 
                                type="number" 
                                value={debitSide.debit || ''}
                                onChange={e => handleAmountChange(e.target.value)}
                                placeholder="0.00"
                                className="text-3xl font-mono font-bold text-primary bg-transparent text-center outline-none w-full pl-6"
                            />
                        </div>
                        <input 
                            type="date"
                            value={header.date}
                            onChange={e => setHeader({...header, date: e.target.value})}
                            className="mt-2 bg-surface-highlight/30 border border-border rounded-lg px-3 py-1 text-sm text-on-surface-muted focus:text-on-surface outline-none"
                        />
                    </div>
                </div>

                {/* 2. Split Debit / Credit Columns */}
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
                            <div className="space-y-4 bg-surface border border-border rounded-xl p-5 shadow-sm">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Account Name</label>
                                    <input 
                                        type="text" 
                                        value={debitSide.accountName} 
                                        onChange={e => setDebitSide({...debitSide, accountName: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary font-medium"
                                        placeholder="e.g. Employee Salary Advances"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Subsidiary Ledger (optional)</label>
                                    <input 
                                        type="text" 
                                        value={debitSide.subsidiaryLedger || ''}
                                        onChange={e => setDebitSide({...debitSide, subsidiaryLedger: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary placeholder:text-on-surface-muted/50"
                                        placeholder="e.g., Employee Name, Project Name"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Account Type</label>
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
                                            <option value="EQUITY">Equity</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Parent Account</label>
                                    <div className="relative">
                                        <select 
                                            value={debitSide.suggestedParentAccount || 'None'}
                                            onChange={e => setDebitSide({...debitSide, suggestedParentAccount: e.target.value})}
                                            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary appearance-none"
                                        >
                                            <option>None (Top-Level Account)</option>
                                            <option>Current Assets</option>
                                            <option>Fixed Assets</option>
                                            <option>Operating Expenses</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                    </div>
                                </div>

                                {/* Compliance Check Toggle */}
                                <div className="mt-4 pt-4 border-t border-border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <input 
                                            type="checkbox" 
                                            id="compliance"
                                            checked={debitSide.entityVerificationRequired}
                                            onChange={e => setDebitSide({...debitSide, entityVerificationRequired: e.target.checked})}
                                            className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="compliance" className="text-xs font-bold uppercase text-on-surface cursor-pointer">Require Entity Verification</label>
                                    </div>
                                    
                                    {debitSide.entityVerificationRequired && (
                                        <div className="bg-warning/5 border border-warning/20 rounded-xl p-3">
                                            <p className="text-xs text-on-surface-muted mb-3 leading-relaxed">
                                                To comply with labor laws, please upload a copy of the employment contract or ID document.
                                            </p>
                                            <div 
                                                onClick={() => complianceFileRef.current?.click()}
                                                className="border border-dashed border-border bg-background rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-surface-highlight/50 transition"
                                            >
                                                <Upload className="h-4 w-4 text-on-surface-muted" />
                                                <span className="text-xs text-on-surface-muted font-medium">Upload Verification Doc</span>
                                                <input type="file" ref={complianceFileRef} className="hidden" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                                <label className="text-xs font-bold text-on-surface-muted uppercase mb-1 block">Select Account</label>
                                <div className="relative">
                                    <select 
                                        value={debitSide.accountId}
                                        onChange={e => setDebitSide({...debitSide, accountId: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="">-- Choose Account --</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
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
                             <div className="space-y-4 bg-surface border border-border rounded-xl p-5 shadow-sm">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Account Name</label>
                                    <input 
                                        type="text" 
                                        value={creditSide.accountName} 
                                        onChange={e => setCreditSide({...creditSide, accountName: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-secondary font-medium"
                                        placeholder="e.g. Pending Clearance"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Account Type</label>
                                    <div className="relative">
                                        <select 
                                            value={creditSide.accountType || 'LIABILITY'}
                                            onChange={e => setCreditSide({...creditSide, accountType: e.target.value as any})}
                                            className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-secondary appearance-none"
                                        >
                                            <option value="ASSET">Asset</option>
                                            <option value="LIABILITY">Liability</option>
                                            <option value="EXPENSE">Expense</option>
                                            <option value="REVENUE">Revenue</option>
                                            <option value="EQUITY">Equity</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                    </div>
                                </div>
                             </div>
                        ) : (
                            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
                                <label className="text-xs font-bold text-on-surface-muted uppercase mb-1 block">Select Account</label>
                                <div className="relative">
                                    <select 
                                        value={creditSide.accountId}
                                        onChange={e => setCreditSide({...creditSide, accountId: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none focus:border-secondary appearance-none"
                                    >
                                        <option value="">-- Choose Account --</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Documents & Cost Center */}
                        <div className="mt-8 space-y-4 pt-6 border-t border-border">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Transaction Related Documents</label>
                                <div className="flex bg-background border border-border rounded-xl overflow-hidden">
                                    <button className="flex-1 py-2 text-xs font-bold bg-surface-highlight text-on-surface">Upload New</button>
                                    <div className="w-px bg-border"></div>
                                    <button className="flex-1 py-2 text-xs font-bold text-on-surface-muted hover:bg-surface-highlight/50">Archive</button>
                                </div>
                                
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-surface-highlight/30 transition"
                                >
                                    {docName ? (
                                        <>
                                            <FileText className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-medium text-on-surface truncate">{docName}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5 text-on-surface-muted" />
                                            <span className="text-sm text-on-surface-muted font-medium">Click to upload support doc</span>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={(e) => setDocName(e.target.files?.[0]?.name || null)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Cost Center (optional)</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                                    <select 
                                        value={header.costCenter}
                                        onChange={(e) => setHeader({...header, costCenter: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary appearance-none"
                                    >
                                        <option value="">None</option>
                                        {MOCK_COST_CENTERS.map(cc => (
                                            <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
                <button 
                    onClick={handleSubmit} 
                    className="px-8 py-3 bg-primary text-black font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition flex items-center gap-2"
                >
                    <Save className="h-4 w-4" /> Confirm Transaction
                </button>
            </div>
        </div>
    );
};
