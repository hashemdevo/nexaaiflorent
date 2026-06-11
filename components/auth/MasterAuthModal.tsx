
import React, { useState, useEffect } from 'react';

interface MasterAuthModalProps {
    isOpen: boolean;
    mode: 'setup' | 'login' | 'change';
    currentConfig: { password: string | null, hint: string };
    onAuthSuccess: (newPassword?: string, newHint?: string) => void;
    onClose: () => void;
    isSuperAdmin?: boolean;
}

export const MasterAuthModal: React.FC<MasterAuthModalProps> = ({ isOpen, mode, currentConfig, onAuthSuccess, onClose, isSuperAdmin }) => {
    const [state, setState] = useState({
        input: '',
        inputConfirm: '',
        inputOld: '',
        inputHint: '',
        error: ''
    });

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setState({ input: '', inputConfirm: '', inputOld: '', inputHint: '', error: '' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (mode === 'setup' || mode === 'change') {
            if (mode === 'change' && state.inputOld !== currentConfig.password) {
                setState(s => ({ ...s, error: 'Current password incorrect' }));
                return;
            }
            if (state.input !== state.inputConfirm) {
                setState(s => ({ ...s, error: 'Passwords do not match' }));
                return;
            }
            if (!state.input) {
                setState(s => ({ ...s, error: 'Password cannot be empty' }));
                return;
            }
            onAuthSuccess(state.input, state.inputHint);
        } else if (mode === 'login') {
            if (state.input === currentConfig.password || isSuperAdmin) {
                onAuthSuccess();
            } else {
                setState(s => ({ ...s, error: 'Incorrect Master Password' }));
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-background/90 backdrop-blur-md flex items-center justify-center animate-fade-in p-4">
            <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl max-w-sm w-full relative overflow-hidden">
                <h2 className="text-2xl font-bold text-on-surface mb-4 text-center">
                    {mode === 'setup' ? 'Setup Master Password' : 'Admin Access'}
                </h2>
                <div className="space-y-4">
                    {mode === 'change' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-muted">Current Pass</label>
                            <input 
                                type="password" 
                                value={state.inputOld} 
                                onChange={(e) => setState(s => ({...s, inputOld: e.target.value, error: ''}))} 
                                className="w-full bg-background border border-border rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary" 
                                autoFocus 
                            />
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-muted">{mode === 'change' ? 'New Pass' : 'Password'}</label>
                        <input 
                            type="password" 
                            value={state.input} 
                            onChange={(e) => setState(s => ({...s, input: e.target.value, error: ''}))} 
                            className="w-full bg-background border border-border rounded-xl px-4 py-2 text-on-surface focus:ring-2 focus:ring-primary" 
                            autoFocus={mode !== 'change'} 
                        />
                    </div>

                    {(mode === 'setup' || mode === 'change') && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted">Confirm</label>
                                <input 
                                    type="password" 
                                    value={state.inputConfirm} 
                                    onChange={(e) => setState(s => ({...s, inputConfirm: e.target.value, error: ''}))} 
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-on-surface" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted">Hint</label>
                                <input 
                                    type="text" 
                                    value={state.inputHint} 
                                    onChange={(e) => setState(s => ({...s, inputHint: e.target.value}))} 
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-on-surface" 
                                />
                            </div>
                        </>
                    )}

                    {state.error && <div className="text-danger text-sm font-bold">{state.error}</div>}
                    
                    <button onClick={handleSubmit} className="w-full py-3 bg-primary text-white rounded-xl font-bold">
                        {mode === 'setup' ? 'Enable POS' : 'Unlock'}
                    </button>
                    <button onClick={onClose} className="w-full py-2 text-sm text-on-surface-muted">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
