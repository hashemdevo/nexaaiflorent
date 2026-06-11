
import React, { useState, useEffect } from 'react';
import { Search, Plus, ShieldOff, ShieldCheck, RefreshCw, Power } from 'lucide-react';
import { SubscriptionService, Subscription } from '../../services/subscriptionService';
import { SecurityService } from '../../services/securityService';
import { ClientGrid } from './clients/ClientGrid';
import { ClientForm } from './clients/ClientForm';

export const ClientManager: React.FC = () => {
    const [clients, setClients] = useState<Subscription[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Partial<Subscription> | null>(null);
    const [resetTarget, setResetTarget] = useState<Subscription | null>(null);
    const [statusToggleTarget, setStatusToggleTarget] = useState<Subscription | null>(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const allClients = await SubscriptionService.getAll();
            setClients(allClients);
        } catch (e) {
            console.error("Failed to load clients", e);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredClients = clients.filter(c => 
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirmStatusToggle = async () => {
        if (statusToggleTarget) {
            const newStatus = statusToggleTarget.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            const updated = { ...statusToggleTarget, status: newStatus };
            await SubscriptionService.updateSubscription(updated as Subscription);
            SecurityService.logAction('ADMIN', 'Super Admin', 'UPDATE', statusToggleTarget.company, `Status changed to ${newStatus}`);
            await loadClients();
            setStatusToggleTarget(null);
        }
    };

    const handleConfirmReset2FA = async () => {
        if (resetTarget) {
            await SubscriptionService.reset2FA(resetTarget.id!);
            SecurityService.logAction('ADMIN', 'Super Admin', 'SECURITY', resetTarget.company, '2FA Credentials Reset');
            await loadClients();
            setResetTarget(null);
        }
    };

    const handleResetPassword = async (client: Subscription) => {
        if(window.confirm(`Reset password for ${client.company}? They will use 'welcome123' to login next time.`)) {
             const updated = { ...client, password: 'welcome123', isSetupComplete: false };
             await SubscriptionService.updateSubscription(updated as Subscription);
             SecurityService.logAction('ADMIN', 'Super Admin', 'SECURITY', client.company, 'Password Reset');
             alert("Password reset to 'welcome123'. User must change it on login.");
        }
    };

    const handleEdit = (client: Subscription) => {
        setCurrentClient({ ...client });
        setIsEditModalOpen(true);
    };

    const handleCreateNew = () => {
        setCurrentClient({
            company: '',
            ownerName: '',
            email: '',
            phone: '',
            address: '',
            plan: 'Standard',
            industry: 'GENERIC',
            users: 5,
            username: '',
            password: 'welcome123',
            expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            status: 'ACTIVE',
            license: '',
            clientCode: ''
        });
        setIsEditModalOpen(true);
    };

    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentClient) return;

        if (currentClient.id) {
            await SubscriptionService.updateSubscription(currentClient as Subscription);
            SecurityService.logAction('ADMIN', 'Super Admin', 'UPDATE', currentClient.company || 'Client', 'Updated details');
        } else {
            await SubscriptionService.addSubscription(currentClient);
            SecurityService.logAction('ADMIN', 'Super Admin', 'CREATE', currentClient.company || 'New Client', 'Created Subscription');
        }
        
        await loadClients();
        setIsEditModalOpen(false);
        setCurrentClient(null);
    };

    if (isLoading) return <div className="p-8 text-center text-on-surface-muted">Loading Clients...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                    <input 
                        type="text" 
                        placeholder="Search clients..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
                    />
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-primary text-black font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Add Company
                </button>
            </div>

            {/* Client Grid */}
            <ClientGrid 
                clients={filteredClients} 
                onEdit={handleEdit}
                onResetPassword={handleResetPassword}
                onReset2FA={setResetTarget}
                onToggleStatus={setStatusToggleTarget}
            />

            {/* Status Toggle Modal */}
            {statusToggleTarget && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl w-full max-w-md text-center relative overflow-hidden">
                        {statusToggleTarget.status === 'ACTIVE' ? (
                            <>
                                <div className="absolute top-0 left-0 w-full h-1 bg-danger"></div>
                                <div className="mx-auto bg-danger/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-danger/30">
                                    <Power className="h-10 w-10 text-danger" />
                                </div>
                                <h2 className="text-2xl font-bold text-on-surface mb-2">Suspend Account</h2>
                                <p className="text-on-surface-muted text-sm mb-6 px-4">
                                    You are about to suspend <strong className="text-white">{statusToggleTarget.company}</strong>. 
                                    <br/><br/>
                                    Users will immediately lose access to their dashboard and data.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button onClick={handleConfirmStatusToggle} className="w-full py-3.5 bg-danger text-white font-bold rounded-xl hover:bg-danger/90 transition shadow-glow-danger flex items-center justify-center gap-2">
                                        <ShieldOff className="h-5 w-5" /> Confirm Suspension
                                    </button>
                                    <button onClick={() => setStatusToggleTarget(null)} className="w-full py-3.5 bg-transparent border border-border text-on-surface font-bold rounded-xl hover:bg-surface-highlight transition">Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
                                <div className="mx-auto bg-secondary/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-secondary/30">
                                    <RefreshCw className="h-10 w-10 text-secondary" />
                                </div>
                                <h2 className="text-2xl font-bold text-on-surface mb-2">Activate Account</h2>
                                <p className="text-on-surface-muted text-sm mb-6 px-4">
                                    Restore access for <strong className="text-white">{statusToggleTarget.company}</strong>?
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button onClick={handleConfirmStatusToggle} className="w-full py-3.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition shadow-glow-secondary flex items-center justify-center gap-2">
                                        <ShieldCheck className="h-5 w-5" /> Confirm Activation
                                    </button>
                                    <button onClick={() => setStatusToggleTarget(null)} className="w-full py-3.5 bg-transparent border border-border text-on-surface font-bold rounded-xl hover:bg-surface-highlight transition">Cancel</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Reset 2FA Modal */}
            {resetTarget && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl w-full max-w-md text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-warning"></div>
                        <div className="mx-auto bg-warning/20 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-warning/30">
                            <RefreshCw className="h-10 w-10 text-warning animate-spin-slow" />
                        </div>
                        <h2 className="text-2xl font-bold text-on-surface mb-2">Reset 2FA Security</h2>
                        <p className="text-on-surface-muted text-sm mb-6 px-4">
                            Resetting 2FA for <strong className="text-white">{resetTarget.company}</strong>. 
                            <br/><br/>
                            User will be forced to setup a new authenticator app on next login.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleConfirmReset2FA} className="w-full py-3.5 bg-warning text-black font-bold rounded-xl hover:bg-warning/90 transition shadow-glow-secondary flex items-center justify-center gap-2">
                                <ShieldCheck className="h-5 w-5" /> Confirm Reset
                            </button>
                            <button onClick={() => setResetTarget(null)} className="w-full py-3.5 bg-transparent border border-border text-on-surface font-bold rounded-xl hover:bg-surface-highlight transition">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isEditModalOpen && currentClient && (
                <ClientForm 
                    isOpen={isEditModalOpen}
                    client={currentClient}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveClient}
                    onChange={(updates) => setCurrentClient({...currentClient, ...updates})}
                />
            )}
        </div>
    );
};
