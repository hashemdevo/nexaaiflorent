
import React from 'react';
import { Building, DollarSign, Key, Wrench } from 'lucide-react';

export const RealEstateStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-indigo-500">Occupancy</h4>
                    <Building className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">94%</div>
                <div className="w-full bg-surface-highlight h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[94%]"></div>
                </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Rent Roll</h4>
                    <DollarSign className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">$145k</div>
                <p className="text-xs text-on-surface-muted">Projected Monthly</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Vacant Units</h4>
                    <Key className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">12</div>
                <p className="text-xs text-on-surface-muted">Ready for Leasing</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-warning/20 bg-warning/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-warning">Maintenance</h4>
                    <Wrench className="h-5 w-5 text-warning" />
                </div>
                <div className="text-2xl font-bold text-on-surface">8</div>
                <p className="text-xs text-on-surface-muted">Active Requests</p>
            </div>
        </div>
    );
};
