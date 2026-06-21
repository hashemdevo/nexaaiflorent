
import React, { useState, useMemo } from 'react';
import { AIAnalysisResult, JournalEntryLine } from '../../types';
import { Save, Plus, AlertTriangle, Volume2, Loader2 } from 'lucide-react';
import { Nexa } from '../../services/api';
import { JournalLine } from './JournalLine';
import { speakText } from '../../services/geminiService';

interface ReviewFormProps {
    initialData: AIAnalysisResult;
    onSave: (finalData: any) => void;
    onCancel: () => void;
}

const createNewLine = (type: 'DEBIT' | 'CREDIT'): JournalEntryLine => ({
    accountId: '', accountName: '', description: '', debit: 0, credit: 0, isNewAccount: true,
});

const MOCK_COST_CENTERS = [
    { id: 'cc1', code: 'MK-001', name: 'Marketing Dept' },
    { id: 'cc2', code: 'IT-002', name: 'IT Operations' },
    { id: 'cc3', code: 'HR-003', name: 'Human Resources' },
    { id: 'cc4', code: 'OPS-004', name: 'General Operations' },
];

export const AIReviewForm: React.FC<ReviewFormProps> = ({ initialData, onSave, onCancel }) => {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [lines, setLines] = useState<JournalEntryLine[]>(initialData.lines);
    const [description, setDescription] = useState(initialData.summary);
    const [costCenter, setCostCenter] = useState((initialData as any).costCenter || '');
    const [playing, setPlaying] = useState(false);

    useState(() => {
        Nexa.Ledger.Accounts.getAll().then(setAccounts);
    });

    const handleSpeak = async () => {
        if (!description || playing) return;
        setPlaying(true);
        try {
            const result = await speakText(description);
            if (result?.audioData) {
                const binary = atob(result.audioData);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: result.mimeType || 'audio/wav' });
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.onended = () => setPlaying(false);
                audio.onerror = () => setPlaying(false);
                await audio.play();
            } else {
                setPlaying(false);
            }
        } catch (e) {
            console.error("Speak failed", e);
            setPlaying(false);
        }
    };
    
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
        if (lines.length > 2) { // Must have at least one debit and one credit
            setLines(lines.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        if (!isBalanced) return;
        onSave({ ...initialData, summary: description, lines, costCenter });
    };

    return (
        <div className="flex flex-col h-full animate-fade-in bg-background/50">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="flex-1 text-lg font-medium text-on-surface bg-transparent outline-none resize-none h-12" />
                        <button 
                            onClick={handleSpeak}
                            disabled={playing || !description}
                            title="استمع للدليل الصوتي المحاسبي بالذكاء الاصطناعي"
                            className={`p-3 rounded-full border border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20 transition duration-300 disabled:opacity-50 flex items-center justify-center shrink-0 shadow-sm ${playing ? 'animate-pulse' : ''}`}
                        >
                            {playing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 max-w-xs">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-muted block mb-1">Cost Center (Optional)</label>
                            <select 
                                value={costCenter}
                                onChange={e => setCostCenter(e.target.value)}
                                className="w-full bg-surface-highlight/30 border border-border rounded-xl px-3 py-1.5 text-xs text-on-surface outline-none focus:border-primary"
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
                    <div className="space-y-3">
                        <h4 className="font-bold text-on-surface uppercase tracking-wider text-sm">Debits</h4>
                        {lines.map((line, index) => line.debit > 0 && (
                            <JournalLine key={index} line={line} onChange={updated => updateLine(index, updated)} onRemove={() => removeLine(index)} type="DEBIT" accounts={accounts} />
                        ))}
                        <button onClick={() => addLine('DEBIT')} className="w-full border-2 border-dashed border-border p-3 rounded-xl text-on-surface-muted hover:border-primary hover:text-primary transition flex items-center justify-center gap-2">
                            <Plus className="h-4 w-4" /> Add Debit Line
                        </button>
                    </div>

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

            <div className="p-6 border-t border-border bg-surface sticky bottom-0 z-20">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-right">
                        <span className="text-xs text-on-surface-muted uppercase">Debits</span>
                        <p className="font-mono font-bold text-lg text-primary">${totals.debit.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-on-surface-muted uppercase">Credits</span>
                        <p className="font-mono font-bold text-lg text-secondary">${totals.credit.toFixed(2)}</p>
                    </div>
                    {!isBalanced && (
                        <div className="px-3 py-1 bg-danger/10 text-danger text-xs font-bold rounded-full border border-danger/20 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Unbalanced by ${(totals.debit - totals.credit).toFixed(2)}
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition">Back</button>
                    <button onClick={handleSave} disabled={!isBalanced} className="flex-1 py-3 bg-primary text-black font-bold rounded-xl shadow-glow-primary hover:shadow-lg transition disabled:opacity-50">
                        Confirm & Post
                    </button>
                </div>
            </div>
        </div>
    );
};
