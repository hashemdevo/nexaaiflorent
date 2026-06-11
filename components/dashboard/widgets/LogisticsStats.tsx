
import React from 'react';
import { Truck, MapPin, Package, AlertCircle } from 'lucide-react';

export const LogisticsStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-blue-500">Active Fleet</h4>
                    <Truck className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">18/24</div>
                <p className="text-xs text-on-surface-muted">Vehicles on Road</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Deliveries</h4>
                    <Package className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">145</div>
                <p className="text-xs text-on-surface-muted">Completed Today</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">On Time</h4>
                    <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-secondary">98.5%</div>
                <p className="text-xs text-on-surface-muted">SLA Compliance</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-warning/20 bg-warning/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-warning">Delays</h4>
                    <AlertCircle className="h-5 w-5 text-warning" />
                </div>
                <div className="text-2xl font-bold text-on-surface">3</div>
                <p className="text-xs text-on-surface-muted">Traffic/Mechanical</p>
            </div>
        </div>
    );
};
