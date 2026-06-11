
import React from 'react';
import { Ban, Phone } from 'lucide-react';

interface AccessRestrictedScreenProps {
    companyName: string;
    contactEmail: string;
}

export const AccessRestrictedScreen: React.FC<AccessRestrictedScreenProps> = ({ companyName, contactEmail }) => (
    <div className="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
        
        <div className="relative z-10 max-w-lg w-full bg-zinc-900/50 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl shadow-2xl text-center">
            <div className="mx-auto h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <Ban className="h-10 w-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Access Restricted</h1>
            
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6">
                <h2 className="text-lg font-bold text-white">{companyName}</h2>
                <div className="text-red-400 text-sm font-mono mt-1">
                    Account Status: RESTRICTED
                </div>
            </div>

            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
                Your access to the workspace has been restricted by the administration. You cannot access the dashboard or view any data until this restriction is lifted.
            </p>
            
            <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800 mb-8 text-left">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-zinc-900 rounded-lg text-white">
                        <Phone className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact Administration</h3>
                        <p className="text-xs text-zinc-500">Please resolve pending issues to restore access.</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Support Email:</span>
                        <span className="text-white font-mono">{contactEmail}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col gap-3">
                <button onClick={() => window.location.reload()} className="text-sm text-zinc-500 hover:text-white transition underline py-2">
                    Check Status
                </button>
            </div>
        </div>
    </div>
);
