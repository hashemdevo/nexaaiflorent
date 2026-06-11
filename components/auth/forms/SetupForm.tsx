
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface SetupFormProps {
    onSetup: (password: string, confirm: string) => void;
    error?: string;
    introMode?: boolean;
    onStart?: () => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onSetup, error, introMode, onStart }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSetup(password, confirm);
    };

    if (introMode) {
        return (
            <div className="text-center space-y-6 animate-fade-in">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Setup Required</h2>
                    <p className="text-sm text-zinc-400 mt-2">
                        Set your permanent password and 2FA to continue.
                    </p>
                </div>
                <button 
                    onClick={onStart}
                    className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition shadow-sm flex items-center justify-center gap-2"
                >
                    Start <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            <div className="text-center mb-2">
                <h3 className="text-lg font-bold text-white">New Credentials</h3>
            </div>
            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">New Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary"
                        required
                        autoFocus
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Confirm</label>
                    <input 
                        type="password" 
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-primary"
                        required
                    />
                </div>
            </div>
            {error && <div className="text-danger text-xs font-bold text-center">{error}</div>}
            <button type="submit" className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">
                Next
            </button>
        </form>
    );
};
