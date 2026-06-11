
import React, { useState } from 'react';
import { X, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { InputMethods } from './InputMethods';
import { ReviewForm } from './ReviewForm';
import { analyzeFinancialTransaction } from '../../../services/geminiService';
import { AIAnalysisResult } from '../../../types';
import { Nexa } from '../../../services/api';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'INPUT' | 'REVIEW' | 'SUCCESS'>('INPUT');
    const [analysisData, setAnalysisData] = useState<AIAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleAnalysis = async (inputType: 'TEXT' | 'IMAGE' | 'AUDIO', content: string, mime?: string) => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeFinancialTransaction(inputType, content, mime);
            if (result) {
                setAnalysisData(result);
                setStep('REVIEW');
            }
        } catch (error) {
            alert("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleManualSubmit = (data: AIAnalysisResult) => {
        setAnalysisData(data);
        setStep('REVIEW');
    };

    const handleFinalSave = async (finalData: any) => {
        setIsSaving(true);
        try {
            // Convert AI/UI format to Ledger format
            await Nexa.Ledger.Journal.postEntry({
                transactionDate: finalData.date,
                postedDate: new Date().toISOString(),
                reference: `TX-${Date.now().toString().substr(-6)}`, // Simple auto-ref
                description: finalData.summary,
                lines: finalData.lines.map((l: any) => ({
                    accountId: l.accountId || 'unknown', // In real app, create account if new
                    accountName: l.accountName, // Metadata
                    debit: l.debit,
                    credit: l.credit
                })),
                totalAmount: finalData.totalAmount,
                createdBy: 'CURRENT_USER', // TODO: Get from context
                costCenter: finalData.costCenter
            });

            setStep('SUCCESS');
            
            // Auto-close after delay
            setTimeout(() => {
                onClose();
                // Reset state
                setTimeout(() => {
                    setStep('INPUT');
                    setAnalysisData(null);
                    setIsSaving(false);
                }, 500);
            }, 1500);

        } catch (error) {
            console.error("Posting failed", error);
            alert("Failed to post transaction.");
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-surface-highlight/10 shrink-0">
                    <div className="flex items-center gap-4">
                        {step === 'REVIEW' && (
                            <button onClick={() => setStep('INPUT')} className="p-2 rounded-full hover:bg-surface-highlight text-on-surface-muted hover:text-on-surface transition">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-on-surface">
                                {step === 'INPUT' ? 'Add Transaction' : step === 'REVIEW' ? 'Review Entry' : 'Success'}
                            </h2>
                            <p className="text-sm text-on-surface-muted">
                                {step === 'INPUT' ? 'Choose an input method to start.' : step === 'REVIEW' ? 'Verify details and confirm posting.' : 'Transaction recorded.'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-highlight text-on-surface-muted hover:text-on-surface transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-hidden h-full flex flex-col">
                    {step === 'INPUT' && (
                        <InputMethods 
                            onAnalyze={handleAnalysis} 
                            onManualSubmit={handleManualSubmit} 
                            isProcessing={isAnalyzing} 
                        />
                    )}

                    {step === 'REVIEW' && analysisData && (
                        isSaving ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                                <h3 className="text-xl font-bold text-on-surface">Posting to Ledger...</h3>
                            </div>
                        ) : (
                            <ReviewForm 
                                initialData={analysisData} 
                                onSave={handleFinalSave} 
                                onCancel={() => setStep('INPUT')} 
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
