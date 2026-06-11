
import React, { useState, useEffect } from 'react';
import { Store, ShieldAlert, ChevronDown, Lock, HelpCircle, AlertCircle, LogIn } from 'lucide-react';
import { Cashier } from '../../types';

interface LockScreenProps {
    isOpen: boolean;
    cashiers: Cashier[];
    onUnlock: (userId: string) => void;
    onClose: () => void;
    onOverride: (managerId: string) => void;
}

export const LockScreenOverlay: React.FC<LockScreenProps> = ({ isOpen, cashiers, onUnlock, onClose, onOverride }) => {
    const [state, setState] = useState({
        selectedUserId: '',
        input: '',
        error: '',
        showHint: false,
        overrideMode: false,
        overrideManagerId: ''
    });

    // Reset state when opening
    useEffect(() => {
        if (isOpen && cashiers.length > 0) {
            setState(s => ({ ...s, selectedUserId: cashiers[0].id, input: '', error: '', overrideMode: false }));
        }
    }, [isOpen, cashiers]);

    if (!isOpen) return null;

    const handleAction = () => {
        const userId = state.overrideMode ? state.overrideManagerId : state.selectedUserId;
        const user = cashiers.find(c => c.id === userId);
        
        if (!user) return;

        if (!user.password || user.password === state.input) {
            if (state.overrideMode) {
                onOverride(user.id);
                setState(prev => ({ ...prev, overrideMode: false, input: '', error: '' }));
            } else {
                onUnlock(user.id);
            }
        } else {
            setState(prev => ({ ...prev, error: 'Incorrect Password' }));
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center animate-fade-in">
            <div className="w-full max-w-md p-8">
                <div className="text-center mb-10">
                    <div className="h-20 w-20 bg-surface border border-border rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 shadow-glow-primary">
                        <Store className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-on-surface">POS Terminal Login</h1>
                </div>
                <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl space-y-6">
                    {state.overrideMode && (
                        <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-warning uppercase tracking-wider">Manager Override</h4>
                                <p className="text-xs text-on-surface-muted mt-1">
                                    Authorize access for: <span className="text-on-surface font-bold">{cashiers.find(c => c.id === state.selectedUserId)?.name}</span>
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">
                            {state.overrideMode ? 'Manager Account' : 'User'}
                        </label>
                        <div className="relative">
                            <select 
                                value={state.overrideMode ? state.overrideManagerId : state.selectedUserId} 
                                onChange={(e) => state.overrideMode 
                                    ? setState(s => ({...s, overrideManagerId: e.target.value, input: '', error: ''})) 
                                    : setState(s => ({...s, selectedUserId: e.target.value, input: '', error: ''}))
                                } 
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface appearance-none outline-none focus:ring-2 focus:ring-primary"
                            >
                                {cashiers.filter(c => state.overrideMode ? c.role === 'manager' : true).map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-on-surface-muted" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input 
                                type="password" 
                                value={state.input} 
                                onChange={(e) => setState(s => ({...s, input: e.target.value, error: ''}))} 
                                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-on-surface outline-none focus:border-primary" 
                                placeholder="Passcode" 
                                autoFocus 
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        </div>
                    </div>

                    {state.error && (
                        <div className="flex items-center gap-2 text-danger text-sm font-bold animate-pulse">
                            <AlertCircle className="h-4 w-4" />{state.error}
                        </div>
                    )}

                    {state.showHint && (
                        <div className="flex items-center gap-2 text-primary text-sm font-medium bg-primary/10 p-3 rounded-xl border border-primary/20">
                            <HelpCircle className="h-4 w-4" />
                            Hint: {cashiers.find(c => c.id === (state.overrideMode ? state.overrideManagerId : state.selectedUserId))?.hint || 'No hint'}
                        </div>
                    )}

                    <button 
                        onClick={handleAction} 
                        className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl font-bold shadow-glow-primary hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                        {state.overrideMode ? 'Authorize' : 'Login'} <LogIn className="h-4 w-4" />
                    </button>

                    <div className="flex justify-between mt-4 pt-4 border-t border-border">
                        <button onClick={onClose} className="text-sm font-medium text-on-surface-muted hover:text-on-surface transition">Cancel</button>
                        {!state.overrideMode ? (
                            <div className="flex gap-4">
                                <button onClick={() => setState(s => ({...s, showHint: !s.showHint}))} className="text-sm font-medium text-on-surface-muted hover:text-primary transition">Hint?</button>
                                <button 
                                    onClick={() => { 
                                        const managers = cashiers.filter(c => c.role === 'manager'); 
                                        setState(s => ({ ...s, overrideMode: true, overrideManagerId: managers[0]?.id || '', input: '', error: '', showHint: false })); 
                                    }} 
                                    className="text-sm font-bold text-secondary hover:text-secondary/80 transition"
                                >
                                    Override
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setState(s => ({...s, overrideMode: false, input: '', error: ''}))} className="text-sm font-medium text-on-surface-muted hover:text-on-surface transition">Back</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
