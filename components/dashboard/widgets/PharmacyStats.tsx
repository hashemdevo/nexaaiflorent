
import React from 'react';
import { Pill, Activity, AlertTriangle, FileText } from 'lucide-react';

export const PharmacyStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-emerald-500">Scripts Filled</h4>
                    <Pill className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">142</div>
                <p className="text-xs text-on-surface-muted">Today's Rx Volume</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Pending Rx</h4>
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">8</div>
                <p className="text-xs text-on-surface-muted">In Queue</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Interactions</h4>
                    <Activity className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-secondary">3</div>
                <p className="text-xs text-on-surface-muted">Alerts Resolved</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-warning/20 bg-warning/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-warning">Expiry Alert</h4>
                    <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div className="text-2xl font-bold text-on-surface">12</div>
                <p className="text-xs text-on-surface-muted">Batches Expiring Soon</p>
            </div>
        </div>
    );
};
