
import React, { useState } from 'react';
import { Users, Shield, Activity, Layout, Monitor } from 'lucide-react';
import { TeamManager } from './settings/TeamManager';
import { SubscriptionStatus } from './settings/SubscriptionStatus';
import { ActivityLog } from './settings/ActivityLog';
import { SystemFeatures } from './settings/SystemFeatures';

export const ClientSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'team' | 'sub' | 'logs' | 'system'>('system');

    return (
        <div className="p-6 animate-fade-in max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface">Company Settings</h1>
                    <p className="text-on-surface-muted mt-1">Manage your team, subscription, and system modules.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Settings Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button 
                        onClick={() => setActiveTab('system')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'system' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-muted hover:bg-surface-highlight'}`}
                    >
                        <Monitor className="h-4 w-4" /> System Features
                    </button>
                    <button 
                        onClick={() => setActiveTab('team')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'team' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-muted hover:bg-surface-highlight'}`}
                    >
                        <Users className="h-4 w-4" /> Team Management
                    </button>
                    <button 
                        onClick={() => setActiveTab('sub')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'sub' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-muted hover:bg-surface-highlight'}`}
                    >
                        <Shield className="h-4 w-4" /> Subscription
                    </button>
                    <button 
                        onClick={() => setActiveTab('logs')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'logs' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-muted hover:bg-surface-highlight'}`}
                    >
                        <Activity className="h-4 w-4" /> Activity Log
                    </button>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="glass-panel p-6 md:p-8 rounded-2xl border border-border min-h-[500px]">
                        {activeTab === 'system' && <SystemFeatures />}
                        {activeTab === 'team' && <TeamManager />}
                        {activeTab === 'sub' && <SubscriptionStatus />}
                        {activeTab === 'logs' && <ActivityLog />}
                    </div>
                </div>
            </div>
        </div>
    );
};
