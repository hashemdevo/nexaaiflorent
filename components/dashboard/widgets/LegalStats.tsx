
import React from 'react';
import { Scale, Clock, Briefcase, FileText } from 'lucide-react';

export const LegalStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-amber-500">Billable Hours</h4>
                    <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">142.5</div>
                <p className="text-xs text-on-surface-muted">This Week</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Active Cases</h4>
                    <Scale className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">28</div>
                <p className="text-xs text-on-surface-muted">12 Court Appearances</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Open Matters</h4>
                    <Briefcase className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">15</div>
                <p className="text-xs text-on-surface-muted">New Intake</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Documents</h4>
                    <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">8</div>
                <p className="text-xs text-on-surface-muted">Pending Review</p>
            </div>
        </div>
    );
};
