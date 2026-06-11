
import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface TwoFactorFormProps {
    onVerify: (otp: string) => void;
    error?: string;
}

export const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ onVerify, error }) => {
    const [otp, setOtp] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onVerify(otp);
    };

    return (
        <div className="space-y-6 text-center animate-fade-in">
            <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary border border-primary/20"><ShieldCheck className="h-6 w-6" /></div>
                <h3 className="text-lg font-bold text-white">Authenticator</h3>
                <p className="text-xs text-zinc-400 mt-1">Enter code from your app</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    type="text" 
                    maxLength={6} 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-mono text-xl tracking-[0.5em] outline-none focus:border-primary transition" 
                    placeholder="000000" 
                    autoFocus 
                />
                {error && <div className="text-danger text-xs font-bold">{error}</div>}
                <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition shadow-sm">Verify</button>
            </form>
        </div>
    );
};
