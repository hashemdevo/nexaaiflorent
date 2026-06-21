
import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ImportPreviewProps {
    step: 'preview' | 'success';
    importProgress: number;
    detectedSystemName?: string;
    onReset: () => void;
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({ step, importProgress, detectedSystemName, onReset }) => {
    if (step === 'success') {
        return (
            <div className="glass-panel p-8 rounded-3xl border border-border h-[400px] flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center text-secondary mb-6 shadow-glow-secondary">
                    <ShieldCheck className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-bold text-on-surface mb-2">Migration Complete</h2>
                <p className="text-on-surface-muted max-w-md mb-8">
                    Successfully imported database from {detectedSystemName}. Your ledger is now synchronized.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={onReset} 
                        className="px-6 py-3 bg-surface hover:bg-surface-highlight border border-border rounded-xl font-bold text-on-surface transition"
                    >
                        Import Another
                    </button>
                    <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-glow-primary hover:bg-primary-hover transition">
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel p-8 rounded-3xl border border-border h-[400px] flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--surface-highlight))" strokeWidth="8" />
                    <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--primary))" strokeWidth="8" 
                        strokeDasharray="283" strokeDashoffset={283 - (283 * importProgress / 100)} 
                        className="transition-all duration-300 ease-linear rotate-[-90deg] origin-center"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-on-surface font-mono">
                    {importProgress.toFixed(0)}%
                </div>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Importing Data...</h2>
            <p className="text-on-surface-muted max-w-sm">Writing records to ledger. Performing final validation and integrity checks.</p>
            
            <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-md">
                <div className="bg-surface-highlight/20 p-3 rounded-xl border border-border">
                    <div className="text-xs text-on-surface-muted uppercase">Customers</div>
                    <div className="font-bold text-on-surface">1,240</div>
                </div>
                <div className="bg-surface-highlight/20 p-3 rounded-xl border border-border">
                    <div className="text-xs text-on-surface-muted uppercase">Transactions</div>
                    <div className="font-bold text-on-surface">45,892</div>
                </div>
                <div className="bg-surface-highlight/20 p-3 rounded-xl border border-border">
                    <div className="text-xs text-on-surface-muted uppercase">Suppliers</div>
                    <div className="font-bold text-on-surface">350</div>
                </div>
            </div>
        </div>
    );
};
