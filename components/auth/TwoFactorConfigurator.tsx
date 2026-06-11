
import React, { useState, useEffect } from 'react';
import { Lock, X, CheckCircle2, Copy, Download } from 'lucide-react';
import { SecurityService } from '../../services/securityService';

interface TwoFactorConfiguratorProps {
    userEmail: string;
    currentPasswordToCheck: string; 
    onComplete: (newSecret: string, backupCodes: string[]) => void;
    onCancel: () => void;
}

export const TwoFactorConfigurator: React.FC<TwoFactorConfiguratorProps> = ({ userEmail, currentPasswordToCheck, onComplete, onCancel }) => {
    const [step, setStep] = useState<'password' | 'scan' | 'verify' | 'success'>('password');
    const [inputPassword, setInputPassword] = useState('');
    const [tempSecret, setTempSecret] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    // Auto-skip password check if empty or newly created
    useEffect(() => {
        if (currentPasswordToCheck === '') {
            setTempSecret(SecurityService.generateRandomSecret());
            setBackupCodes(SecurityService.generateBackupCodes());
            setStep('scan');
        }
    }, [currentPasswordToCheck]);

    const handlePasswordCheck = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputPassword === currentPasswordToCheck) {
            setTempSecret(SecurityService.generateRandomSecret());
            setBackupCodes(SecurityService.generateBackupCodes());
            setStep('scan');
            setError('');
        } else {
            setError('Incorrect Password');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const validToken = await SecurityService.getTOTPToken(tempSecret);
        if (otp === validToken) {
            setStep('success');
            setError('');
        } else {
            setError('Invalid Code. Please try again.');
        }
    };

    const handleFinalize = () => {
        onComplete(tempSecret, backupCodes);
    };

    return (
        <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-3xl shadow-2xl w-full max-w-md relative animate-fade-in">
            <button onClick={onCancel} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
            
            {step === 'password' && (
                <form onSubmit={handlePasswordCheck} className="space-y-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700">
                            <Lock className="h-8 w-8 text-zinc-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Security Verification</h2>
                        <p className="text-zinc-400 text-sm mt-2">Please enter your password to configure Two-Factor Authentication.</p>
                    </div>
                    <div className="space-y-2">
                        <input 
                            type="password" 
                            value={inputPassword} 
                            onChange={(e) => { setInputPassword(e.target.value); setError(''); }}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition"
                            placeholder="Current Password"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                    </div>
                    <button type="submit" className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">Continue</button>
                </form>
            )}

            {step === 'scan' && (
                <div className="space-y-6 text-center animate-fade-in">
                    <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
                    <p className="text-zinc-400 text-sm">Use Google Authenticator or similar app to scan.</p>
                    
                    <div className="bg-white p-4 rounded-xl mx-auto w-fit border-4 border-white shadow-lg">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`otpauth://totp/Nexa:${userEmail}?secret=${tempSecret}&issuer=NexaLedger`)}`} 
                            alt="2FA QR"
                            className="h-32 w-32"
                        />
                    </div>
                    <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700 inline-block">
                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(tempSecret)}>
                            Secret: {tempSecret}
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-4">
                        <input 
                            type="text" 
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center font-mono text-lg tracking-[0.5em] outline-none focus:border-primary transition"
                            placeholder="000000"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                        <button type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition shadow-glow-primary">Verify & Activate</button>
                    </form>
                </div>
            )}

            {step === 'success' && (
                <div className="space-y-6 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">2FA Activated!</h2>
                    <p className="text-zinc-400 text-sm">Store these recovery codes in a safe place. You can use them if you lose your device.</p>
                    
                    <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        {backupCodes.map(code => (
                            <div key={code} className="text-xs font-mono text-zinc-300 bg-zinc-900 p-2 rounded border border-zinc-800 text-center">{code}</div>
                        ))}
                    </div>
                    
                    <div className="flex gap-2 justify-center">
                        <button onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))} className="text-xs text-primary hover:underline flex items-center gap-1"><Copy className="h-3 w-3" /> Copy All</button>
                        <button className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" /> Download</button>
                    </div>

                    <button onClick={handleFinalize} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition">Done</button>
                </div>
            )}
        </div>
    );
};
