
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ClientEmployee } from '../../types';

interface ClientProfileProps {
    currentEmployee: ClientEmployee | null;
    onReset2FA: () => void;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({ currentEmployee, onReset2FA }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-on-surface">My Profile</h3>
            <div className="bg-surface border border-border rounded-xl p-8 max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        {currentEmployee?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-on-surface">{currentEmployee?.name}</h2>
                        <p className="text-on-surface-muted">{currentEmployee?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-surface-highlight rounded-lg text-xs font-bold uppercase tracking-wider text-primary border border-border">
                            {currentEmployee?.role}
                        </span>
                    </div>
                </div>
                <div className="border-t border-border pt-6 space-y-4">
                    <div className="flex justify-between items-center p-4 bg-surface-highlight/10 rounded-xl border border-border">
                        <div>
                            <p className="font-bold text-on-surface text-sm">Two-Factor Authentication</p>
                            <p className={`text-xs ${currentEmployee?.twoFaSecret ? 'text-secondary' : 'text-warning'}`}>
                                {currentEmployee?.twoFaSecret ? 'Secure & Active' : 'Not Configured'}
                            </p>
                        </div>
                        {currentEmployee?.twoFaSecret && (
                            <button onClick={onReset2FA} className="text-xs font-bold text-warning hover:underline flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" /> Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
