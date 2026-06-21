
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Calendar, Users, CreditCard, Loader2 } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';
import { SubscriptionService, Subscription } from '../../../services/subscriptionService';

export const SubscriptionStatus: React.FC = () => {
    const { currentUserIdentity } = useApp();
    const [currentSub, setCurrentSub] = useState<Subscription | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (currentUserIdentity) {
                const subs = await SubscriptionService.getAll();
                const match = subs.find(s => s.email === currentUserIdentity || s.username === currentUserIdentity);
                setCurrentSub(match || null);
            }
        };
        loadData();
    }, [currentUserIdentity]);

    if (!currentSub) return <div className="p-6 flex justify-center text-on-surface-muted"><Loader2 className="animate-spin h-6 w-6" /></div>;

    const daysRemaining = SubscriptionService.getDaysRemaining(currentSub.expiry);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-on-surface">Subscription & License</h3>
            
            <div className="bg-gradient-to-br from-surface-highlight/50 to-surface border border-border rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck className="h-32 w-32 text-primary" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="bg-primary text-black font-bold px-3 py-1 rounded text-xs uppercase tracking-wider">
                            {currentSub.plan} Plan
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${currentSub.status === 'ACTIVE' ? 'text-secondary' : 'text-danger'}`}>
                            {currentSub.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs text-on-surface-muted uppercase mb-1 flex items-center gap-2"><Calendar className="h-3 w-3" /> Expiry Date</p>
                            <p className="text-xl font-bold text-on-surface font-mono">{currentSub.expiry}</p>
                            <p className="text-xs text-primary mt-1">{daysRemaining} days remaining</p>
                        </div>
                        <div>
                            <p className="text-xs text-on-surface-muted uppercase mb-1 flex items-center gap-2"><Users className="h-3 w-3" /> User Limit</p>
                            <p className="text-xl font-bold text-on-surface font-mono">{currentSub.users} Seats</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border/50">
                        <p className="text-xs text-on-surface-muted uppercase mb-1">License Key</p>
                        <p className="font-mono text-sm text-on-surface bg-black/20 p-2 rounded border border-white/10 inline-block">
                            {currentSub.license}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-surface-highlight/20 border border-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-on-surface-muted" />
                    <div>
                        <p className="text-sm font-bold text-on-surface">Billing Method</p>
                        <p className="text-xs text-on-surface-muted">Visa ending in 4242</p>
                    </div>
                </div>
                <button className="text-xs font-bold text-primary hover:underline">Update</button>
            </div>
        </div>
    );
};
