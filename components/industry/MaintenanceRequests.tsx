
import React from 'react';
import { Wrench, Clock, MapPin, User, AlertCircle, CheckCircle2, PenTool, Search } from 'lucide-react';

const MOCK_TICKETS = [
    { id: 'JOB-401', client: 'Green Plaza Mall', type: 'HVAC Repair', priority: 'HIGH', status: 'IN_PROGRESS', tech: 'Ahmed Tech', location: 'Zone B, Roof', sla: '2h remaining' },
    { id: 'JOB-402', client: 'Tech Park', type: 'Electrical Maintenance', priority: 'MEDIUM', status: 'OPEN', tech: 'Unassigned', location: 'Building 4, Floor 2', sla: '1d remaining' },
    { id: 'JOB-403', client: 'Seaside Resort', type: 'Plumbing Leak', priority: 'CRITICAL', status: 'COMPLETED', tech: 'Mina Plumber', location: 'Villa 12', sla: 'Closed' },
];

export const MaintenanceRequests: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Wrench className="h-8 w-8 text-orange-500" /> Maintenance Jobs
                    </h1>
                    <p className="text-on-surface-muted mt-1">Track field service requests, assignments, and SLAs.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search job ID..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-orange-500 w-64"
                        />
                    </div>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <PenTool className="h-4 w-4" /> Create Ticket
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_TICKETS.map(ticket => (
                    <div key={ticket.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-orange-500/50 transition duration-300 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-mono text-on-surface-muted">{ticket.id}</span>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                    ticket.priority === 'CRITICAL' ? 'bg-danger/20 text-danger border-danger/30' :
                                    ticket.priority === 'HIGH' ? 'bg-warning/20 text-warning border-warning/30' :
                                    'bg-surface-highlight text-on-surface-muted border-border'
                                }`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-lg text-on-surface mb-1">{ticket.type}</h3>
                            <p className="text-sm text-on-surface-muted">{ticket.client}</p>
                            
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-on-surface-muted">
                                    <MapPin className="h-4 w-4" /> {ticket.location}
                                </div>
                                <div className="flex items-center gap-2 text-on-surface-muted">
                                    <User className="h-4 w-4" /> {ticket.tech}
                                </div>
                                <div className={`flex items-center gap-2 font-medium ${ticket.status === 'COMPLETED' ? 'text-secondary' : 'text-primary'}`}>
                                    <Clock className="h-4 w-4" /> {ticket.sla}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                                ticket.status === 'COMPLETED' ? 'text-secondary' : 'text-on-surface'
                            }`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                            <button className="text-xs font-bold text-orange-500 hover:underline">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
