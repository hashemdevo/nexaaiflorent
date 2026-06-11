
import React, { useState } from 'react';
import { Lock, ArrowLeft, Eye, EyeOff, User, Briefcase, Utensils, Monitor, Bell, HardHat, Stethoscope } from 'lucide-react';
import { ClientEmployee, UniversalRole } from '../../../types';
import { getRoleLabel } from '../../../config/roles';

interface PasswordFormProps {
    user: ClientEmployee;
    onSubmit: (password: string) => void;
    onBack: () => void;
    error?: string;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({ user, onSubmit, onBack, error }) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(password);
    };

    const getRoleIcon = (role: UniversalRole) => {
        switch (role) {
            case 'OWNER': case 'CEO': return <Briefcase className="h-5 w-5" />;
            case 'KITCHEN_STAFF': return <Utensils className="h-5 w-5" />;
            case 'CASHIER': return <Monitor className="h-5 w-5" />;
            case 'RECEPTION': return <Bell className="h-5 w-5" />;
            case 'SITE_ENGINEER': case 'FOREMAN': case 'PROJECT_MANAGER': return <HardHat className="h-5 w-5" />;
            case 'DOCTOR': case 'NURSE': return <Stethoscope className="h-5 w-5" />;
            default: return <User className="h-5 w-5" />;
        }
    };

    return (
        <div className="animate-fade-in">
            <div className={`mb-6 p-4 rounded-xl flex flex-col items-center text-center gap-2 bg-zinc-800/50 border border-zinc-700`}>
                <div className="p-2 bg-zinc-900 rounded-full shadow-sm border border-zinc-700 text-zinc-300">
                    {getRoleIcon(user.role)}
                </div>
                <div>
                    <h3 className="font-bold text-lg text-white leading-tight">
                        {getRoleLabel(user.role)}
                    </h3>
                    <p className="text-xs text-zinc-400 opacity-80 mt-1">
                        {user.companyName}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2"><Lock className="h-3 w-3" /> Password</label>
                        <button type="button" onClick={onBack} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <ArrowLeft className="h-3 w-3" /> Back
                        </button>
                    </div>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-4 pr-10 py-3 text-white outline-none focus:border-primary transition text-base" 
                            placeholder="••••••••" 
                            autoFocus 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                {error && <div className="text-danger text-xs font-bold bg-danger/10 p-3 rounded-lg border border-danger/20 text-center">{error}</div>}
                <button type="submit" className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition shadow-sm flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" /> Login
                </button>
            </form>
        </div>
    );
};
