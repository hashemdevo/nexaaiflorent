
import React from 'react';
import { User, LogOut, ArrowLeft } from 'lucide-react';

interface PosHeaderProps {
    onExit: () => void;
    setShowExitConfirmation: (show: boolean) => void;
    onBackToDashboard?: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({ onExit, setShowExitConfirmation, onBackToDashboard }) => {
    return (
        <div className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shadow-lg shrink-0 z-20">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-glow-primary">
                    POS
                </div>
                <div>
                    <h1 className="text-xl font-bold text-on-surface leading-none">Terminal 01</h1>
                    <span className="text-xs text-on-surface-muted flex items-center gap-1 mt-1"><User className="h-3 w-3" /> Cashier: John Doe</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-surface-highlight px-4 py-2 rounded-lg border border-border font-mono text-on-surface font-bold hidden lg:block">
                    {new Date().toLocaleTimeString()}
                </div>
                {onBackToDashboard && (
                    <button 
                        onClick={onBackToDashboard}
                        className="flex items-center gap-2 bg-primary/10 hover:bg-primary hover:text-black text-primary px-3 md:px-4 py-2 rounded-lg transition border border-primary/20"
                        title="Return to Dashboard (No logout)"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-xs font-bold whitespace-nowrap">العودة للوحة التحكم</span>
                    </button>
                )}
                <button 
                    onClick={() => setShowExitConfirmation(true)}
                    className="flex items-center gap-2 bg-danger/10 hover:bg-danger hover:text-white text-danger px-3 md:px-4 py-2 rounded-lg transition border border-danger/20"
                >
                    <LogOut className="h-4 w-4" /> 
                    <span className="text-xs font-bold whitespace-nowrap">Exit Session</span>
                </button>
            </div>
        </div>
    );
};
