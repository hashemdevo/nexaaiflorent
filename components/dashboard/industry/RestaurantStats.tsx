
import React from 'react';
import { Utensils, TrendingUp, Users, CalendarCheck, ChefHat } from 'lucide-react';

export const RestaurantStats: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-orange-500/20 bg-orange-500/5">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-orange-500">Live Orders</h4>
                        <Utensils className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">18</div>
                    <p className="text-xs text-on-surface-muted">5 Pending in Kitchen</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-on-surface">Sales Today</h4>
                        <TrendingUp className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">$2,450</div>
                    <p className="text-xs text-on-surface-muted">+15% vs Last Tuesday</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-on-surface">Table Occupancy</h4>
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">65%</div>
                    <p className="text-xs text-on-surface-muted">14/22 Tables Full</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-on-surface">Reservations</h4>
                        <CalendarCheck className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">8</div>
                    <p className="text-xs text-on-surface-muted">For Tonight (7PM Peak)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-border lg:col-span-2">
                    <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-warning" /> Kitchen Performance
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-surface-highlight/30 p-3 rounded-xl border border-border text-center">
                            <div className="text-xl font-bold text-on-surface">12m</div>
                            <div className="text-[10px] uppercase text-on-surface-muted">Avg Prep Time</div>
                        </div>
                        <div className="bg-surface-highlight/30 p-3 rounded-xl border border-border text-center">
                            <div className="text-xl font-bold text-danger">2</div>
                            <div className="text-[10px] uppercase text-on-surface-muted">Late Orders</div>
                        </div>
                        <div className="bg-surface-highlight/30 p-3 rounded-xl border border-border text-center">
                            <div className="text-xl font-bold text-secondary">98%</div>
                            <div className="text-[10px] uppercase text-on-surface-muted">Accuracy</div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-on-surface-muted uppercase">Top Selling Items</h4>
                        {[
                            { name: 'Signature Burger', qty: 45, rev: '$675' },
                            { name: 'Truffle Fries', qty: 32, rev: '$256' },
                            { name: 'Espresso Martini', qty: 28, rev: '$336' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-surface/50 rounded-lg hover:bg-surface-highlight transition">
                                <span className="text-sm font-medium text-on-surface">{item.name}</span>
                                <div className="text-right text-xs">
                                    <span className="font-bold text-on-surface mr-3">{item.qty} Sold</span>
                                    <span className="text-primary">{item.rev}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg text-on-surface mb-4">Shift Manager</h3>
                    <div className="space-y-4">
                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                            <p className="text-xs font-bold text-primary mb-1">CURRENT SHIFT</p>
                            <p className="text-sm text-on-surface">Lunch (11:00 AM - 4:00 PM)</p>
                            <div className="mt-3 flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-surface-highlight border-2 border-surface flex items-center justify-center text-[10px] font-bold">
                                        S{i}
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-surface-highlight border-2 border-surface flex items-center justify-center text-[10px] font-bold text-on-surface-muted">
                                    +2
                                </div>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-surface hover:bg-surface-highlight border border-border rounded-xl text-sm font-bold text-on-surface transition">
                            Manage Schedule
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
