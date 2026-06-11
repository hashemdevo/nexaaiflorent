
import React from 'react';
import { HardHat, MapPin, Truck, AlertTriangle, CheckCircle2, Clock, Calendar, Hammer } from 'lucide-react';

const MOCK_SITES = [
    {
        id: 'SITE-001',
        name: 'El-Nasr Residency',
        location: 'New Cairo, Sector 5',
        progress: 65,
        status: 'ACTIVE',
        workers: 45,
        materials: 'Adequate',
        nextMilestone: 'Roof Pouring (Nov 15)'
    },
    {
        id: 'SITE-002',
        name: 'Coastal Heights Mall',
        location: 'North Coast, Km 120',
        progress: 12,
        status: 'DELAYED',
        workers: 120,
        materials: 'Shortage (Steel)',
        nextMilestone: 'Foundation Completion'
    },
    {
        id: 'SITE-003',
        name: 'Tech Park Offices',
        location: 'Smart Village',
        progress: 92,
        status: 'ACTIVE',
        workers: 20,
        materials: 'Adequate',
        nextMilestone: 'Final Inspection'
    }
];

export const ConstructionSites: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <HardHat className="h-8 w-8 text-yellow-500" /> Site Management
                    </h1>
                    <p className="text-on-surface-muted mt-1">Project tracking, resource allocation, and safety logs.</p>
                </div>
                <button className="bg-primary text-black font-bold px-6 py-2.5 rounded-xl shadow-glow-primary hover:bg-primary-hover transition flex items-center gap-2">
                    <Hammer className="h-4 w-4" /> New Project
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {MOCK_SITES.map(site => (
                    <div key={site.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-yellow-500/50 transition duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-surface-highlight rounded-xl text-yellow-500">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-on-surface">{site.name}</h3>
                                    <p className="text-xs text-on-surface-muted flex items-center gap-1">
                                        {site.location}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                                site.status === 'ACTIVE' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-danger/10 text-danger border-danger/20'
                            }`}>
                                {site.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-on-surface-muted mb-1">
                                    <span>Completion</span>
                                    <span>{site.progress}%</span>
                                </div>
                                <div className="w-full bg-surface-highlight h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${site.status === 'DELAYED' ? 'bg-danger' : 'bg-secondary'}`} 
                                        style={{ width: `${site.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-surface-highlight/20 p-3 rounded-lg border border-border">
                                    <div className="text-xs text-on-surface-muted uppercase mb-1 flex items-center gap-1">
                                        <Truck className="h-3 w-3" /> Materials
                                    </div>
                                    <div className={`font-bold ${site.materials.includes('Shortage') ? 'text-danger' : 'text-on-surface'}`}>
                                        {site.materials}
                                    </div>
                                </div>
                                <div className="bg-surface-highlight/20 p-3 rounded-lg border border-border">
                                    <div className="text-xs text-on-surface-muted uppercase mb-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Next Milestone
                                    </div>
                                    <div className="font-bold text-on-surface truncate" title={site.nextMilestone}>
                                        {site.nextMilestone}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                            <span className="text-xs text-on-surface-muted">{site.workers} Workers On-Site</span>
                            <button className="text-xs font-bold text-primary hover:underline">View Daily Log</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Safety & Incidents Log */}
            <div className="glass-panel p-6 rounded-2xl border border-border mt-8">
                <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" /> Safety & Incident Log
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-surface-highlight/50 text-on-surface-muted uppercase text-xs font-bold">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Date</th>
                                <th className="px-4 py-3">Site</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr className="hover:bg-surface-highlight/20">
                                <td className="px-4 py-3 font-mono text-xs">2023-10-24</td>
                                <td className="px-4 py-3 font-medium">Coastal Heights Mall</td>
                                <td className="px-4 py-3"><span className="text-danger font-bold">Injury</span></td>
                                <td className="px-4 py-3 text-on-surface-muted">Minor cut during steel handling. First aid applied.</td>
                                <td className="px-4 py-3 text-right"><span className="text-secondary flex items-center justify-end gap-1"><CheckCircle2 className="h-3 w-3" /> Resolved</span></td>
                            </tr>
                            <tr className="hover:bg-surface-highlight/20">
                                <td className="px-4 py-3 font-mono text-xs">2023-10-22</td>
                                <td className="px-4 py-3 font-medium">Tech Park Offices</td>
                                <td className="px-4 py-3"><span className="text-warning font-bold">Near Miss</span></td>
                                <td className="px-4 py-3 text-on-surface-muted">Scaffolding loose bolt reported and fixed.</td>
                                <td className="px-4 py-3 text-right"><span className="text-secondary flex items-center justify-end gap-1"><CheckCircle2 className="h-3 w-3" /> Resolved</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
