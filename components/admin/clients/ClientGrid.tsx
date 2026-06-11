
import React from 'react';
import { Building2, Briefcase, User, Activity, Edit3, Key, RefreshCw, Power, MessageSquare } from 'lucide-react';
import { Subscription } from '../../../services/subscriptionService';

interface ClientGridProps {
    clients: Subscription[];
    onEdit: (client: Subscription) => void;
    onResetPassword: (client: Subscription) => void;
    onReset2FA: (client: Subscription) => void;
    onToggleStatus: (client: Subscription) => void;
}

export const ClientGrid: React.FC<ClientGridProps> = ({ clients, onEdit, onResetPassword, onReset2FA, onToggleStatus }) => {
    
    // In a real app, this would be based on last login timestamp
    const isOnline = (clientId: string) => clientId.charCodeAt(clientId.length - 1) % 2 === 0;

    return (
        <div className="grid grid-cols-1 gap-4">
            {clients.map(client => (
                <div key={client.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-primary/30 transition duration-300 group relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${client.status === 'ACTIVE' ? 'bg-secondary' : 'bg-danger'}`}></div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pl-2">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${client.status === 'ACTIVE' ? 'bg-gradient-to-br from-primary to-blue-600' : 'bg-zinc-700'}`}>
                                    {client.company.charAt(0)}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface flex items-center justify-center ${isOnline(client.id || '') ? 'bg-secondary' : 'bg-zinc-500'}`} title={isOnline(client.id || '') ? 'Online' : 'Offline'}></div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-on-surface">{client.company}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${client.status === 'ACTIVE' ? 'bg-secondary/10 text-secondary border border-secondary/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                                        {client.status}
                                    </span>
                                    {isOnline(client.id || '') && <span className="text-[10px] text-secondary font-medium">• Online Now</span>}
                                </div>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-on-surface-muted">
                                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {client.clientCode}</span>
                                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {client.industry}</span>
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {client.ownerName}</span>
                                    <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Last Active: {isOnline(client.id || '') ? 'Just now' : 'Yesterday'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                            <button onClick={() => onEdit(client)} className="px-3 py-2 bg-surface hover:bg-surface-highlight border border-border rounded-lg text-xs font-bold text-on-surface transition flex items-center gap-1">
                                <Edit3 className="h-3 w-3" /> Edit Profile
                            </button>
                            <div className="h-6 w-px bg-border mx-1"></div>
                            <button onClick={() => onResetPassword(client)} className="p-2 rounded-lg bg-surface hover:bg-surface-highlight border border-border text-on-surface-muted hover:text-on-surface transition" title="Reset Password">
                                <Key className="h-4 w-4" />
                            </button>
                            <button onClick={() => onReset2FA(client)} className="p-2 rounded-lg bg-surface hover:bg-surface-highlight border border-border text-on-surface-muted hover:text-warning transition" title="Reset 2FA">
                                <RefreshCw className="h-4 w-4" />
                            </button>
                            <button onClick={() => onToggleStatus(client)} className={`p-2 rounded-lg border transition ${client.status === 'ACTIVE' ? 'bg-surface hover:bg-danger/10 text-on-surface-muted hover:text-danger border-border' : 'bg-secondary/10 text-secondary border-secondary/20'}`} title={client.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}>
                                <Power className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-on-surface-muted bg-surface-highlight/5 rounded-b-xl px-2">
                        <div className="flex gap-6">
                            <span>Plan: <strong className="text-on-surface">{client.plan}</strong></span>
                            <span>Users: <strong className="text-on-surface">{client.users}</strong></span>
                            <span>Expires: <strong className={`${new Date(client.expiry) < new Date() ? 'text-danger' : 'text-on-surface'}`}>{client.expiry}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3 text-primary" />
                            <span className="hover:text-primary cursor-pointer">View Chat History</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
