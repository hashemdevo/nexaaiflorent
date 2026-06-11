
import React from 'react';
import { ShoppingBag, TrendingUp, Users, Tag } from 'lucide-react';

export const RetailStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-indigo-500">Avg Basket</h4>
                    <ShoppingBag className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">$42.50</div>
                <p className="text-xs text-on-surface-muted">+5% vs Last Week</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Sales / SqFt</h4>
                    <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">$18.2</div>
                <p className="text-xs text-on-surface-muted">High Efficiency</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Footfall</h4>
                    <Users className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">845</div>
                <p className="text-xs text-on-surface-muted">Visitors Today</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Conversion</h4>
                    <Tag className="h-5 w-5 text-pink-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">24%</div>
                <p className="text-xs text-on-surface-muted">Purchases / Visits</p>
            </div>
        </div>
    );
};
