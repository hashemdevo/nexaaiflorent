
import React from 'react';
import { Plane, Map, DollarSign, Calendar } from 'lucide-react';

export const TravelStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-sky-500">Active Bookings</h4>
                    <Plane className="h-5 w-5 text-sky-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">142</div>
                <p className="text-xs text-on-surface-muted">Currently Traveling</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Commissions</h4>
                    <DollarSign className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">$12.5k</div>
                <p className="text-xs text-on-surface-muted">This Month</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Itineraries</h4>
                    <Map className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">28</div>
                <p className="text-xs text-on-surface-muted">Drafting / Quotes</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Upcoming</h4>
                    <Calendar className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">15</div>
                <p className="text-xs text-on-surface-muted">Departing Tomorrow</p>
            </div>
        </div>
    );
};
