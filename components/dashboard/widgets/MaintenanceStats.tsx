
import React from 'react';
import { Wrench, Clock, CheckCircle2, UserCheck } from 'lucide-react';

export const MaintenanceStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-orange-500">Open Tickets</h4>
                    <Wrench className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">18</div>
                <p className="text-xs text-on-surface-muted">5 High Priority</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">SLA Compliance</h4>
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-secondary">94%</div>
                <p className="text-xs text-on-surface-muted">Target Met</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Tech Utilization</h4>
                    <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">85%</div>
                <p className="text-xs text-on-surface-muted">Active in Field</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Avg Resolution</h4>
                    <Clock className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">4.2h</div>
                <p className="text-xs text-on-surface-muted">Last 7 Days</p>
            </div>
        </div>
    );
};
