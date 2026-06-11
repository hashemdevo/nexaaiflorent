
import React from 'react';
import { HardHat, Hammer, Clock, AlertTriangle, Truck } from 'lucide-react';

export const ConstructionStats: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-yellow-500">Active Projects</h4>
                        <HardHat className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">12</div>
                    <p className="text-xs text-on-surface-muted">3 Near Completion</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-on-surface">Material Usage</h4>
                        <Hammer className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">85%</div>
                    <p className="text-xs text-on-surface-muted">Allocated Budget</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-on-surface">Delays</h4>
                        <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">2</div>
                    <p className="text-xs text-on-surface-muted">Sites Impacted</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-danger/20 bg-danger/5">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-danger">Safety Incidents</h4>
                        <AlertTriangle className="h-5 w-5 text-danger" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">0</div>
                    <p className="text-xs text-on-surface-muted">This Month</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-secondary" /> Logistics & Deliveries
                    </h3>
                    <div className="space-y-4">
                        {[
                            { site: 'El-Nasr Site A', item: 'Cement (50 Tons)', status: 'In Transit', time: '2 hrs' },
                            { site: 'New Capital B2', item: 'Steel Reinforcement', status: 'Arrived', time: '10 mins ago' },
                            { site: 'Coastal Villa', item: 'Ceramic Tiles', status: 'Delayed', time: '+1 Day' },
                        ].map((delivery, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-surface/50 rounded-xl border border-border">
                                <div>
                                    <p className="font-bold text-sm text-on-surface">{delivery.site}</p>
                                    <p className="text-xs text-on-surface-muted">{delivery.item}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        delivery.status === 'Delayed' ? 'bg-danger/10 text-danger' : 
                                        delivery.status === 'Arrived' ? 'bg-secondary/10 text-secondary' : 
                                        'bg-primary/10 text-primary'
                                    }`}>
                                        {delivery.status}
                                    </span>
                                    <p className="text-[10px] text-on-surface-muted mt-1">{delivery.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg text-on-surface mb-4">Project Milestones</h3>
                    <div className="space-y-6 relative pl-4 border-l-2 border-border/50">
                        {[
                            { name: 'Foundation Pouring', date: 'Oct 25', status: 'Done', color: 'bg-secondary' },
                            { name: 'Structural Steel', date: 'Nov 02', status: 'In Progress', color: 'bg-primary' },
                            { name: 'MEP Installation', date: 'Nov 15', status: 'Pending', color: 'bg-surface-highlight' },
                        ].map((milestone, i) => (
                            <div key={i} className="relative">
                                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-background ${milestone.color}`}></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-sm text-on-surface">{milestone.name}</p>
                                        <p className="text-xs text-on-surface-muted">Target: {milestone.date}</p>
                                    </div>
                                    <span className="text-xs font-medium text-on-surface-muted">{milestone.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
