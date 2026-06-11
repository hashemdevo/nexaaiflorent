import React, { useState, useMemo, useEffect } from 'react';
import { Users, Shield, Activity, History, User, MessageCircle, Layout, ArrowRight, Server, CheckCircle2, Loader2, Wrench, Landmark } from 'lucide-react';
import { ClientManager } from './admin/ClientManager';
import { PortalAdminManager } from './admin/PortalAdminManager';
import { AuditLogViewer } from './admin/AuditLogViewer';
import { AdminProfile } from './admin/AdminProfile';
import { AdminNavigation } from './admin/AdminNavigation';
import { SystemDiagnostics } from './admin/SystemDiagnostics';
import { LogoutButton } from './common/LogoutButton';
import { AdminSupportInbox } from './SupportChat';
import { AdminMaintenanceManager } from './admin/AdminMaintenanceManager';
import { ProjectFinancialsUI } from './admin/ProjectFinancialsUI';
import { SecurityService } from '../services/securityService';
import { useApp } from '../contexts/AppContext';
import { AuthService } from '../services/authService';
import { ViewState, PortalAdmin } from '../types';

export const AdminPortal: React.FC = () => {
    const { currentUserIdentity, setCurrentView } = useApp();
    const [currentAdmin, setCurrentAdmin] = useState<PortalAdmin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAdmin = async () => {
            if (currentUserIdentity) {
                setIsLoading(true);
                const adminProfile = await AuthService.findAdminByEmail(currentUserIdentity);
                setCurrentAdmin(adminProfile || null);
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };
        fetchAdmin();
    }, [currentUserIdentity]);
    
    const managementTabs = useMemo(() => {
        if (!currentAdmin) return [];
        const permissions = currentAdmin.permissions;
        return [
            { 
                id: 'financials', 
                label: 'Project Financials', 
                icon: Landmark,
                allowed: permissions?.manageClients || currentAdmin?.role === 'ROOT'
            },
            { 
                id: 'clients', 
                label: 'Companies & Subscriptions', 
                icon: Users,
                allowed: permissions?.viewClientData || permissions?.manageClients 
            },
            { 
                id: 'maintenance', 
                label: 'Hardware Maintenance', 
                icon: Wrench,
                allowed: permissions?.manageClients || currentAdmin?.role === 'ROOT'
            },
            { 
                id: 'inbox', 
                label: 'Support Inbox', 
                icon: MessageCircle,
                allowed: permissions?.manageSupport 
            },
            { 
                id: 'diagnostics', 
                label: 'System Health', 
                icon: Activity,
                allowed: permissions?.manageSettings
            },
            { 
                id: 'logs', 
                label: 'System Audit Logs', 
                icon: History,
                allowed: permissions?.viewAuditLogs 
            },
            { 
                id: 'admins', 
                label: 'Admin Team', 
                icon: Shield,
                allowed: permissions?.manageAdmins 
            },
        ].filter(t => t.allowed);
    }, [currentAdmin]);

    const hasAccess = currentAdmin && managementTabs.length > 0;
    
    const [activeTab, setActiveTab] = useState<string>('clients');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-center p-4">
                <div>
                    <Shield className="h-16 w-16 mx-auto mb-4 opacity-50 text-danger" />
                    <h2 className="text-2xl font-bold text-on-surface">Access Restricted</h2>
                    <p className="text-on-surface-muted mt-2">You do not have permission to view any administrative modules.</p>
                    <div className="mt-8">
                        <LogoutButton variant="header" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-surface font-sans p-6 animate-fade-in">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
                    
                    {/* Left: Title & Identity */}
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl shadow-lg ${currentAdmin?.role === 'ROOT' ? 'bg-amber-500 text-black' : 'bg-blue-500 text-white'}`}>
                            <Shield className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight">
                                {currentAdmin?.role === 'ROOT' ? 'Designer Control Panel' : 'Admin Console'}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm font-bold text-on-surface">{currentAdmin?.name}</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider border border-border px-1.5 rounded text-on-surface-muted">
                                    {currentAdmin?.role}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    System Online
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: System Utilities + Logout */}
                    <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                        <div className="hidden md:flex items-center gap-4 mr-4 text-xs font-mono text-on-surface-muted bg-surface-highlight/30 px-3 py-1.5 rounded-lg border border-border/50">
                            <span className="flex items-center gap-1"><Server className="h-3 w-3" /> v4.2.0</span>
                            <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> 99.9% Uptime</span>
                        </div>

                        <div className="h-8 w-px bg-border mx-1 hidden md:block"></div>
                        
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`p-2 rounded-xl transition ${activeTab === 'profile' ? 'bg-surface-highlight text-on-surface' : 'text-on-surface-muted hover:text-on-surface'}`}
                            title="My Profile"
                        >
                            <User className="h-5 w-5" />
                        </button>

                        <LogoutButton variant="header" />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    <AdminNavigation 
                        tabs={managementTabs as any} 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab} 
                        className="bg-surface border-border shadow-md" 
                    />
                </div>

                {/* Tab Content Area */}
                <div className="min-h-[600px] pt-2">
                    {activeTab === 'profile' && <AdminProfile />}
                    {activeTab === 'financials' && <ProjectFinancialsUI />}
                    {activeTab === 'inbox' && <AdminSupportInbox embedded={true} />}
                    {activeTab === 'clients' && <ClientManager />}
                    {activeTab === 'maintenance' && <AdminMaintenanceManager />}
                    {activeTab === 'diagnostics' && <SystemDiagnostics />}
                    {activeTab === 'admins' && <PortalAdminManager />}
                    {activeTab === 'logs' && <AuditLogViewer logs={SecurityService.getAuditLogs()} />}
                </div>
            </div>
        </div>
    );
};