
import React from 'react';
import { Scale, Briefcase, Clock, FileText, AlertCircle, CheckCircle2, Search, Plus, User } from 'lucide-react';

const MOCK_CASES = [
    { id: 'CASE-2023-089', title: 'Smith vs. State', client: 'John Smith', type: 'Criminal Defense', status: 'DISCOVERY', nextHearing: 'Nov 12', priority: 'HIGH' },
    { id: 'CASE-2023-104', title: 'TechCorp Merger', client: 'TechCorp Inc.', type: 'Corporate', status: 'DRAFTING', nextHearing: '-', priority: 'MEDIUM' },
    { id: 'CASE-2023-112', title: 'Estate of H. Potts', client: 'Potts Family', type: 'Probate', status: 'CLOSED', nextHearing: '-', priority: 'LOW' },
];

export const LegalCases: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Scale className="h-8 w-8 text-amber-500" /> Case Management
                    </h1>
                    <p className="text-on-surface-muted mt-1">Track cases, deadlines, and client documents.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search case or client..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-amber-500 w-64"
                        />
                    </div>
                    <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> New Matter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Cases List */}
                <div className="lg:col-span-2 space-y-4">
                    {MOCK_CASES.map(c => (
                        <div key={c.id} className="glass-panel p-5 rounded-2xl border border-border hover:border-amber-500/30 transition duration-300 group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-surface-highlight rounded-lg text-amber-500">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-on-surface">{c.title}</h4>
                                        <span className="text-xs text-on-surface-muted font-mono">{c.id}</span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                                    c.priority === 'HIGH' ? 'bg-danger/10 text-danger border-danger/20' : 
                                    c.priority === 'MEDIUM' ? 'bg-warning/10 text-warning border-warning/20' : 
                                    'bg-secondary/10 text-secondary border-secondary/20'
                                }`}>
                                    {c.priority}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm mt-4">
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Client</span>
                                    <span className="font-medium text-on-surface flex items-center gap-1">
                                        <User className="h-3 w-3" /> {c.client}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Status</span>
                                    <span className="font-medium text-on-surface">{c.status}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Next Event</span>
                                    <span className="font-medium text-on-surface flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {c.nextHearing}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Deadlines Sidebar */}
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-danger" /> Critical Deadlines
                    </h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-surface/50 rounded-xl border border-border flex gap-3">
                            <div className="flex flex-col items-center justify-center bg-surface-highlight rounded-lg px-3 py-1 min-w-[50px]">
                                <span className="text-xs font-bold text-danger">OCT</span>
                                <span className="text-lg font-bold text-on-surface">28</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-on-surface">Brief Submission</p>
                                <p className="text-xs text-on-surface-muted">Smith vs. State</p>
                            </div>
                        </div>
                        <div className="p-3 bg-surface/50 rounded-xl border border-border flex gap-3">
                            <div className="flex flex-col items-center justify-center bg-surface-highlight rounded-lg px-3 py-1 min-w-[50px]">
                                <span className="text-xs font-bold text-warning">NOV</span>
                                <span className="text-lg font-bold text-on-surface">02</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-on-surface">Client Meeting</p>
                                <p className="text-xs text-on-surface-muted">TechCorp Inc.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="text-xs font-bold text-on-surface-muted uppercase mb-3">Billable Hours (This Week)</h4>
                        <div className="text-2xl font-mono font-bold text-on-surface">32.5 <span className="text-sm font-normal text-on-surface-muted">hrs</span></div>
                        <div className="w-full bg-surface-highlight h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-amber-500 h-full w-[65%]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
