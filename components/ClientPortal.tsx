
import React, { useState, useMemo, useEffect } from 'react';
import { Users, Shield, Activity, User, Layout, ArrowRight, Building2, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ViewState, ClientEmployee } from '../types';
import { TeamManager } from './workspace/settings/TeamManager';
import { SubscriptionStatus } from './workspace/settings/SubscriptionStatus';
import { ActivityLog } from './workspace/settings/ActivityLog';
import { LogoutButton } from './common/LogoutButton';
import { ClientService } from '../services/clientService';
import { SubscriptionService, Subscription } from '../services/subscriptionService';
import { SecurityService } from '../services/securityService';
import { ClientProfile } from './client/ClientProfile';

export const ClientPortal: React.FC = () => {
    const { setCurrentView, currentUserIdentity } = useApp();
    const [currentEmployee, setCurrentEmployee] = useState<ClientEmployee | null>(null);
    const [isReset2FAOpen, setIsReset2FAOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState<'EMPLOYEE' | 'OWNER' | null>(null);
    const [ownerSubscription, setOwnerSubscription] = useState<Subscription | null>(null);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const identifyUser = async () => {
            if (!currentUserIdentity) return;
            setIsLoading(true);
            try {
                const employees = await ClientService.getEmployees();
                const employeeMatch = employees.find(e => e.email === currentUserIdentity || e.name === currentUserIdentity);
                if (employeeMatch) {
                    setCurrentEmployee(employeeMatch);
                    setUserType('EMPLOYEE');
                } else {
                    const subs = await SubscriptionService.getAll();
                    const subMatch = subs.find(s => s.email === currentUserIdentity || s.username === currentUserIdentity);
                    if (subMatch) {
                        setOwnerSubscription(subMatch);
                        setUserType('OWNER');
                        setCurrentEmployee({
                            id: subMatch.id!, name: subMatch.ownerName, email: subMatch.email,
                            role: 'ADMIN', status: subMatch.status as any, createdAt: new Date().toISOString(),
                            twoFaSecret: subMatch.twoFaSecret
                        } as ClientEmployee);
                    }
                }
            } catch (e) { console.error("Identity Check Failed", e); } finally { setIsLoading(false); }
        };
        identifyUser();
    }, [currentUserIdentity]);

    const isAdmin = currentEmployee?.role === 'ADMIN';
    const navigationTabs = useMemo(() => {
        return [
            { id: 'profile', label: 'My Profile', icon: User, allowed: true },
            { id: 'team', label: 'Team Management', icon: Users, allowed: isAdmin },
            { id: 'sub', label: 'Subscription', icon: Shield, allowed: isAdmin },
            { id: 'logs', label: 'Activity Logs', icon: Activity, allowed: isAdmin }
        ].filter(t => t.allowed);
    }, [isAdmin]);

    const handleSelfReset2FA = async () => {
        if (!currentEmployee) return;
        if (userType === 'EMPLOYEE') {
            const updatedEmployee = { ...currentEmployee };
            delete updatedEmployee.twoFaSecret;
            await ClientService.updateEmployee(updatedEmployee, currentEmployee.name);
            setCurrentEmployee(updatedEmployee);
            SecurityService.logAction(currentEmployee.id, currentEmployee.name, 'SECURITY', 'Self', 'Reset 2FA');
        } else if (userType === 'OWNER' && ownerSubscription) {
            await SubscriptionService.reset2FA(ownerSubscription.id!);
            setCurrentEmployee(prev => prev ? ({ ...prev, twoFaSecret: undefined }) : null);
            SecurityService.logAction(ownerSubscription.id!, ownerSubscription.ownerName, 'SECURITY', 'Self', 'Reset 2FA');
        }
        alert("2FA has been reset. Re-configure on next login.");
        setIsReset2FAOpen(false);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-on-surface-muted">Loading Portal...</div>;

    return (
        <div className="min-h-screen bg-background text-on-surface font-sans animate-fade-in">
            <div className="bg-surface border-b border-border sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white shadow-glow-primary"><Building2 className="h-6 w-6" /></div>
                        <div><h1 className="text-xl font-bold leading-none">Company Portal</h1><p className="text-xs text-on-surface-muted mt-1">Manage organization & settings</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition shadow-glow-primary group"><Layout className="h-4 w-4" /> Launch Workspace <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></button>
                        <div className="h-8 w-px bg-border mx-2"></div>
                        <LogoutButton variant="icon-only" className="text-on-surface-muted hover:text-danger" />
                    </div>
                </div>
            </div>
            <div className="max-w-[1600px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-3 space-y-2">
                        {navigationTabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-black shadow-glow-primary' : 'text-on-surface-muted hover:bg-surface border border-transparent hover:border-border'}`}><tab.icon className="h-5 w-5" /> {tab.label}</button>
                        ))}
                    </div>
                    <div className="lg:col-span-9">
                        <div className="glass-panel p-8 rounded-3xl border border-border min-h-[600px]">
                            {activeTab === 'profile' && <ClientProfile currentEmployee={currentEmployee} onReset2FA={() => setIsReset2FAOpen(true)} />}
                            {activeTab === 'team' && isAdmin && <TeamManager />}
                            {activeTab === 'sub' && isAdmin && <SubscriptionStatus />}
                            {activeTab === 'logs' && isAdmin && <ActivityLog />}
                        </div>
                    </div>
                </div>
            </div>
            {isReset2FAOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
                        <RefreshCw className="h-12 w-12 text-warning mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-on-surface mb-2">Reset 2FA?</h2>
                        <p className="text-on-surface-muted text-sm mb-6 px-4">You will need to scan a new QR code upon next login.</p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleSelfReset2FA} className="w-full py-3.5 bg-warning text-black font-bold rounded-xl">Confirm Reset</button>
                            <button onClick={() => setIsReset2FAOpen(false)} className="w-full py-3.5 bg-transparent border border-border text-on-surface font-bold rounded-xl">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
