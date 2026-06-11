
import React, { useState } from 'react';
import { X, ArrowLeft, CheckCircle2, Loader2, Bot, PenTool } from 'lucide-react';
import { AIInputForm } from './AIInputForm';
import { AIReviewForm } from './AIReviewForm';
import { ManualJournalForm } from './ManualJournalForm';
import { analyzeFinancialTransaction } from '../../services/geminiService';
import { AIAnalysisResult } from '../../types';
import { Nexa } from '../../services/api';
import { useApp } from '../../contexts/AppContext';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'SELECT_MODE' | 'AI_INPUT' | 'MANUAL_INPUT' | 'REVIEW' | 'SUCCESS';

export const TransactionDirectorModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
    const { currentUserIdentity } = useApp();
    const [step, setStep] = useState<Step>('SELECT_MODE');
    const [analysisData, setAnalysisData] = useState<AIAnalysisResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleReset = () => {
        setStep('SELECT_MODE');
        setAnalysisData(null);
        setIsProcessing(false);
    };

    const handleClose = () => {
        onClose();
        // Delay reset to avoid UI flicker while closing
        setTimeout(handleReset, 300);
    };

    const handleAIAnalysis = async (inputType: 'TEXT' | 'IMAGE' | 'AUDIO', content: string, mime?: string) => {
        setIsProcessing(true);
        try {
            const result = await analyzeFinancialTransaction(inputType, content, mime);
            if (result) {
                setAnalysisData(result);
                setStep('REVIEW');
            } else {
                alert("AI analysis returned no data. Please check your input.");
            }
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Analysis failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalSave = async (finalData: any) => {
        setIsProcessing(true);
        try {
            await Nexa.Transactions.Director.initiate('MANUAL_JOURNAL_ENTRY', {
                header: {
                    date: finalData.date,
                    description: finalData.summary,
                    costCenter: finalData.costCenter,
                },
                debit: finalData.lines.find((l:any) => l.debit > 0),
                credit: finalData.lines.find((l:any) => l.credit > 0),
                totalAmount: finalData.totalAmount,
                actor: currentUserIdentity || 'User'
            });

            setStep('SUCCESS');
            setTimeout(handleClose, 2000);

        } catch (error) {
            console.error("Posting failed", error);
            alert("Failed to post transaction.");
            setIsProcessing(false);
        }
    };

    const getTitle = () => {
        switch(step) {
            case 'SELECT_MODE': return 'Add Transaction';
            case 'AI_INPUT': return 'AI Automation';
            case 'MANUAL_INPUT': return 'Manual Journal Entry';
            case 'REVIEW': return 'Review & Confirm Entry';
            case 'SUCCESS': return 'Success';
            default: return 'Add Transaction';
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative">
                
                <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-surface-highlight/10 shrink-0">
                    <div className="flex items-center gap-4">
                        {(step === 'MANUAL_INPUT' || step === 'REVIEW' || step === 'AI_INPUT') && (
                            <button onClick={() => setStep('SELECT_MODE')} className="p-2 rounded-full hover:bg-surface-highlight text-on-surface-muted hover:text-on-surface transition">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                        <h2 className="text-2xl font-bold text-on-surface">{getTitle()}</h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-surface-highlight text-on-surface-muted hover:text-on-surface transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {step === 'SELECT_MODE' && (
                         <div className="flex flex-col items-center justify-center h-full p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                                <div onClick={() => setStep('AI_INPUT')} className="bg-surface border-2 border-border rounded-2xl p-6 flex items-center gap-6 cursor-pointer hover:border-secondary hover:bg-secondary/5 transition group">
                                    <div className="p-4 bg-surface-highlight rounded-xl text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                                        <Bot className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-on-surface text-lg">AI Automation</h3>
                                        <p className="text-sm text-on-surface-muted mt-1">Scan, Voice, or Text</p>
                                    </div>
                                </div>
                                <div onClick={() => setStep('MANUAL_INPUT')} className="bg-surface border-2 border-border rounded-2xl p-6 flex items-center gap-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition group">
                                     <div className="p-4 bg-surface-highlight rounded-xl text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                                        <PenTool className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-on-surface text-lg">Manual Journal</h3>
                                        <p className="text-sm text-on-surface-muted mt-1">Traditional Debit/Credit</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'AI_INPUT' && <AIInputForm onAnalyze={handleAIAnalysis} isProcessing={isProcessing} />}

                    {step === 'MANUAL_INPUT' && <ManualJournalForm onSubmit={(data) => { setAnalysisData(data); setStep('REVIEW'); }} />}

                    {step === 'REVIEW' && analysisData && (
                        isProcessing ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                <h3 className="text-xl font-bold text-on-surface">Posting to Ledger...</h3>
                            </div>
                        ) : (
                            <AIReviewForm 
                                initialData={analysisData} 
                                onSave={handleFinalSave} 
                                onCancel={() => setStep(analysisData.confidence < 1.0 ? 'AI_INPUT' : 'MANUAL_INPUT')} 
                            />
                        )
                    )}

                    {step === 'SUCCESS' && (
                        <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                            <div className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mb-6 shadow-glow-secondary">
                                <CheckCircle2 className="h-12 w-12 text-secondary" />
                            </div>
                            <h2 className="text-3xl font-bold text-on-surface">Transaction Posted</h2>
                            <p className="text-on-surface-muted mt-2">The ledger has been updated successfully.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
