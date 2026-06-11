
import React from 'react';
import { Factory, AlertTriangle, Package, BarChart3 } from 'lucide-react';

export const ManufacturingStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-orange-500">Production Rate</h4>
                    <Factory className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">92%</div>
                <p className="text-xs text-on-surface-muted">Running Capacity</p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Daily Output</h4>
                    <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">1,240</div>
                <p className="text-xs text-on-surface-muted">Units Completed</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">OEE Score</h4>
                    <BarChart3 className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-secondary">85%</div>
                <p className="text-xs text-on-surface-muted">Overall Efficiency</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-danger/20 bg-danger/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-danger">Defect Rate</h4>
                    <AlertTriangle className="h-5 w-5 text-danger" />
                </div>
                <div className="text-2xl font-bold text-on-surface">0.5%</div>
                <p className="text-xs text-on-surface-muted">Within Tolerance</p>
            </div>
        </div>
    );
};
