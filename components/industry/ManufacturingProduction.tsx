
import React from 'react';
import { Factory, Cog, Package, CheckCircle2, Clock, AlertTriangle, Play, Pause, BarChart3, Search, Plus } from 'lucide-react';

const MOCK_WO = [
    { id: 'WO-8821', product: 'Premium Latte (Bulk)', qty: 500, status: 'IN_PROGRESS', progress: 65, startDate: 'Oct 24', completion: 'Est. 2h' },
    { id: 'WO-8824', product: 'Croissant Batch A', qty: 200, status: 'PLANNED', progress: 0, startDate: 'Oct 25', completion: '-' },
    { id: 'WO-8819', product: 'Espresso Beans Roast', qty: 50, status: 'COMPLETED', progress: 100, startDate: 'Oct 23', completion: 'Done' },
];

export const ManufacturingProduction: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Factory className="h-8 w-8 text-orange-500" /> Production Floor
                    </h1>
                    <p className="text-on-surface-muted mt-1">Manage work orders, BOMs, and manufacturing efficiency.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search work order..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-orange-500 w-64"
                        />
                    </div>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Create Work Order
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-bold text-on-surface-muted uppercase">Active Jobs</h4>
                        <Cog className="h-4 w-4 text-primary animate-spin-slow" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">3</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-bold text-on-surface-muted uppercase">Efficiency</h4>
                        <BarChart3 className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="text-2xl font-bold text-secondary">92%</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-bold text-on-surface-muted uppercase">Defect Rate</h4>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                    </div>
                    <div className="text-2xl font-bold text-warning">0.5%</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-bold text-on-surface-muted uppercase">Daily Output</h4>
                        <Package className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">1,240 <span className="text-xs font-normal text-on-surface-muted">Units</span></div>
                </div>
            </div>

            {/* Work Orders List */}
            <div className="glass-panel p-6 rounded-2xl border border-border">
                <h3 className="font-bold text-lg text-on-surface mb-6">Current Work Orders</h3>
                <div className="space-y-4">
                    {MOCK_WO.map(wo => (
                        <div key={wo.id} className="bg-surface/50 border border-border p-4 rounded-xl hover:border-orange-500/30 transition group">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${
                                        wo.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary' :
                                        wo.status === 'COMPLETED' ? 'bg-secondary/10 text-secondary' :
                                        'bg-surface-highlight text-on-surface-muted'
                                    }`}>
                                        <Package className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-lg text-on-surface">{wo.product}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                                                wo.status === 'IN_PROGRESS' ? 'bg-primary/10 text-primary border-primary/20' :
                                                wo.status === 'COMPLETED' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                                'bg-surface-highlight text-on-surface-muted border-border'
                                            }`}>
                                                {wo.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-on-surface-muted mt-1">
                                            <span className="font-mono">{wo.id}</span>
                                            <span>Qty: {wo.qty}</span>
                                            <span>Start: {wo.startDate}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-on-surface-muted uppercase mb-1">Completion</div>
                                        <div className="font-bold text-on-surface">{wo.completion}</div>
                                    </div>
                                    
                                    {wo.status === 'IN_PROGRESS' && (
                                        <button className="p-2 bg-surface hover:bg-warning/10 text-on-surface-muted hover:text-warning rounded-lg border border-border transition">
                                            <Pause className="h-5 w-5" />
                                        </button>
                                    )}
                                    {wo.status === 'PLANNED' && (
                                        <button className="p-2 bg-primary text-black rounded-lg hover:bg-primary-hover transition shadow-glow-primary">
                                            <Play className="h-5 w-5 fill-current" />
                                        </button>
                                    )}
                                    {wo.status === 'COMPLETED' && (
                                        <div className="p-2 text-secondary">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-2 bg-surface-highlight rounded-full overflow-hidden">
                                <div 
                                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                                        wo.status === 'COMPLETED' ? 'bg-secondary' : 'bg-primary'
                                    }`} 
                                    style={{ width: `${wo.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
