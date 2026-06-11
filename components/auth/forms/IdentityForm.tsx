
import React, { useState } from 'react';
import { User, ShieldAlert, ChevronRight } from 'lucide-react';

interface IdentityFormProps {
    onSubmit: (email: string) => void;
    error?: string;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({ onSubmit, error }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(email);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-3 w-3" /> Identity
                </label>
                <input 
                    type="text" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition text-base placeholder:text-zinc-600" 
                    placeholder="name@company.com" 
                    autoFocus 
                />
            </div>
            {error && <div className="text-danger text-xs font-bold bg-danger/10 p-3 rounded-lg border border-danger/20 flex items-center gap-2"><ShieldAlert className="h-3 w-3"/> {error}</div>}
            <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition shadow-sm flex items-center justify-center gap-2 group">
                Continue <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </form>
    );
};
