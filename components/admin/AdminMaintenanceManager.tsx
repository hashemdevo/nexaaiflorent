import React, { useState, useEffect } from 'react';
import { 
    Wrench, Clock, CheckCircle, ShieldAlert, Truck, User, Calendar, 
    MessageSquare, RefreshCw, Layers, Sliders, Play, Plus, Search 
} from 'lucide-react';
import { db } from '../../services/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';

interface MaintenanceRequest {
    id?: string;
    companyId: string;
    companyName: string;
    deviceType: 'POS Terminal' | 'Kitchen Screen' | 'Server Box' | 'Barcode Scanner' | 'Network Router';
    description: string;
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'ASSIGNED' | 'DISPATCHED' | 'FIXED' | 'CLOSED';
    scheduledDate: string;
    technicianName: string;
    reportedAt: string;
    notes: string;
}

export const AdminMaintenanceManager: React.FC = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal States for Schedule/Update
    const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create Mode States
    const [newRequest, setNewRequest] = useState<Partial<MaintenanceRequest>>({
        companyName: '',
        deviceType: 'POS Terminal',
        description: '',
        urgency: 'MEDIUM',
        status: 'PENDING',
        scheduledDate: new Date().toISOString().split('T')[0],
        technicianName: '',
        notes: ''
    });

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'maintenance_requests'), orderBy('reportedAt', 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceRequest));
            
            // Seed defaults if empty
            if (data.length === 0) {
                const defaults: MaintenanceRequest[] = [
                    {
                        companyId: 'client_1',
                        companyName: 'Al-Baik Restaurant Group',
                        deviceType: 'Kitchen Screen',
                        description: 'Responsive screen flickering in terminal 2 kitchen display.',
                        urgency: 'HIGH',
                        status: 'DISPATCHED',
                        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        technicianName: 'Eng. Tareq Al-Amri',
                        reportedAt: new Date(Date.now() - 36000000).toISOString(),
                        notes: 'Parts loaded: Replacement capacitive LCD panel.'
                    },
                    {
                        companyId: 'client_2',
                        companyName: 'MedLife Pharmacy',
                        deviceType: 'Barcode Scanner',
                        description: 'USB disconnects repeatedly on the third POS drawer.',
                        urgency: 'MEDIUM',
                        status: 'PENDING',
                        scheduledDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                        technicianName: '',
                        reportedAt: new Date(Date.now() - 72000000).toISOString(),
                        notes: 'Awaiting phone confirmation from manager before dispatching.'
                    }
                ];
                for (const item of defaults) {
                    await addDoc(collection(db, 'maintenance_requests'), item);
                }
                setRequests(defaults);
            } else {
                setRequests(data);
            }
        } catch (e) {
            console.error("Failed to load maintenance bookings", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const requestToSave = {
                ...newRequest,
                companyId: 'adhoc_org',
                reportedAt: new Date().toISOString(),
            } as MaintenanceRequest;

            await addDoc(collection(db, 'maintenance_requests'), requestToSave);
            setShowCreateModal(false);
            setNewRequest({
                companyName: '',
                deviceType: 'POS Terminal',
                description: '',
                urgency: 'MEDIUM',
                status: 'PENDING',
                scheduledDate: new Date().toISOString().split('T')[0],
                technicianName: '',
                notes: ''
            });
            await loadRequests();
        } catch (e) {
            console.error("Failed adding request", e);
        }
    };

    const handleUpdateRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRequest || !editingRequest.id) return;

        try {
            const requestRef = doc(db, 'maintenance_requests', editingRequest.id);
            await updateDoc(requestRef, {
                status: editingRequest.status,
                scheduledDate: editingRequest.scheduledDate,
                technicianName: editingRequest.technicianName,
                notes: editingRequest.notes
            });
            setEditingRequest(null);
            await loadRequests();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              r.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUrgency = filterUrgency === 'ALL' || r.urgency === filterUrgency;
        const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
        return matchesSearch && matchesUrgency && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-fade-in text-on-surface">
            {/* Main Diagnostics Header Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                        <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Hardware Maintenance & Bookings</h2>
                        <p className="text-xs text-on-surface-muted">Manage active maintenance dispatches, equipment issues, and tickets</p>
                    </div>
                </div>

                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-primary text-black font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Book New Maintenance
                </button>
            </div>

            {/* Filters panel */}
            <div className="bg-surface border border-border p-4 rounded-xl flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                    <input 
                        type="text" 
                        placeholder="Search tickets / companies..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-primary"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-muted font-bold uppercase">Urgency:</span>
                    <select 
                        value={filterUrgency} 
                        onChange={e => setFilterUrgency(e.target.value)}
                        className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                    >
                        <option value="ALL">All Levels</option>
                        <option value="HIGH">High Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="LOW">Low Priority</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-muted font-bold uppercase">Status:</span>
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs outline-none focus:border-primary"
                    >
                        <option value="ALL">All States</option>
                        <option value="PENDING">Pending Approval</option>
                        <option value="DISPATCHED">Technician Dispatched</option>
                        <option value="FIXED">Completed / Fixed</option>
                    </select>
                </div>
            </div>

            {/* List Table Grid */}
            {isLoading ? (
                <div className="text-center py-10 text-on-surface-muted">Loading Maintenance Tickets...</div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-10 text-on-surface-muted border border-border border-dashed rounded-xl">No maintenance tickets matching filters.</div>
            ) : (
                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-background border-b border-border/80 text-xs font-bold uppercase text-on-surface-muted text-center">
                                    <th className="p-4 text-left">Company Name</th>
                                    <th className="p-4">Target Equipment</th>
                                    <th className="p-4">Priority</th>
                                    <th className="p-4">Scheduled Date</th>
                                    <th className="p-4">Technician</th>
                                    <th className="p-4">Current Status</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 text-xs text-center font-medium">
                                {filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-background/20 transition">
                                        <td className="p-4 text-left">
                                            <p className="font-bold text-white">{req.companyName}</p>
                                            <p className="text-[10px] text-on-surface-muted mt-0.5">{req.description}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-surface px-2.5 py-1 rounded border border-border/80 font-mono text-[10px] text-primary">
                                                {req.deviceType}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                                                req.urgency === 'HIGH' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                req.urgency === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                            }`}>
                                                {req.urgency}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-zinc-300">
                                            <span className="flex items-center justify-center gap-1">
                                                <Calendar className="h-3 w-3 text-on-surface-muted" /> {req.scheduledDate || 'Not Scheduled'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold text-white">
                                            {req.technicianName ? (
                                                <span className="flex items-center justify-center gap-1 text-emerald-400">
                                                    <User className="h-3.5 w-3.5" /> {req.technicianName}
                                                </span>
                                            ) : (
                                                <span className="text-on-surface-muted italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                                req.status === 'FIXED' ? 'bg-emerald-500/15 text-emerald-400' :
                                                req.status === 'DISPATCHED' ? 'bg-blue-500/15 text-blue-400' :
                                                req.status === 'ASSIGNED' ? 'bg-purple-500/15 text-purple-400' :
                                                'bg-zinc-500/15 text-zinc-400 animate-pulse'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => setEditingRequest(req)}
                                                className="px-3 py-1.5 bg-surface-highlight hover:bg-surface border border-border hover:border-primary/50 text-white hover:text-primary rounded-lg transition font-bold"
                                            >
                                                Configure Dispatch
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Ticket Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <form onSubmit={handleCreateRequest} className="bg-surface border border-border p-8 rounded-2xl w-full max-w-lg space-y-5 animate-fade-in">
                        <h3 className="text-xl font-bold">Book Dispatch / Hardware Ticket</h3>
                        
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-muted uppercase">Company Name</label>
                            <input required type="text" value={newRequest.companyName} onChange={e => setNewRequest({...newRequest, companyName: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-xs" placeholder="e.g. Riyadh Central Fastfood Co." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Equipment Category</label>
                                <select value={newRequest.deviceType} onChange={e => setNewRequest({...newRequest, deviceType: e.target.value as any})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-xs">
                                    <option>POS Terminal</option>
                                    <option>Kitchen Screen</option>
                                    <option>Server Box</option>
                                    <option>Barcode Scanner</option>
                                    <option>Network Router</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Priority Status</label>
                                <select value={newRequest.urgency} onChange={e => setNewRequest({...newRequest, urgency: e.target.value as any})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-xs">
                                    <option value="HIGH">High (Immediate)</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="LOW">Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-muted uppercase">Problem Description</label>
                            <textarea required rows={3} value={newRequest.description} onChange={e => setNewRequest({...newRequest, description: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-xs" placeholder="Describe component fault details..."></textarea>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-border">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 rounded-xl border border-border hover:bg-surface-highlight transition text-xs font-bold">Cancel</button>
                            <button type="submit" className="flex-1 py-2 bg-primary text-black font-extrabold rounded-xl hover:bg-primary-hover transition text-xs">Book Dispatch</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Configure Dispatch Modal */}
            {editingRequest && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <form onSubmit={handleUpdateRequest} className="bg-surface border border-border p-8 rounded-2xl w-full max-w-lg space-y-5 animate-fade-in">
                        <h3 className="text-xl font-bold">Configure Dispatch Action</h3>
                        <p className="text-xs text-on-surface-muted">Currently configuring ticket for <strong className="text-white">{editingRequest.companyName}</strong></p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase font-mono">Assigned Technician</label>
                                <input type="text" value={editingRequest.technicianName} onChange={e => setEditingRequest({...editingRequest, technicianName: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-xs" placeholder="e.g. Eng. Tareq Al-Amri" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase font-mono">Dispatched Status</label>
                                <select value={editingRequest.status} onChange={e => setEditingRequest({...editingRequest, status: e.target.value as any})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-xs">
                                    <option value="PENDING">PENDING</option>
                                    <option value="ASSIGNED">ASSIGNED</option>
                                    <option value="DISPATCHED">DISPATCHED</option>
                                    <option value="FIXED">FIXED</option>
                                    <option value="CLOSED">CLOSED</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-muted uppercase font-mono">Scheduled Repair Date</label>
                            <input type="date" value={editingRequest.scheduledDate} onChange={e => setEditingRequest({...editingRequest, scheduledDate: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-xs" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface-muted uppercase font-mono">Internal Technician Logs / Notes</label>
                            <textarea rows={3} value={editingRequest.notes} onChange={e => setEditingRequest({...editingRequest, notes: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-xs" />
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-border">
                            <button type="button" onClick={() => setEditingRequest(null)} className="flex-1 py-2 rounded-xl border border-border hover:bg-surface-highlight transition text-xs font-bold">Cancel</button>
                            <button type="submit" className="flex-1 py-2 bg-primary text-black font-extrabold rounded-xl hover:bg-primary-hover transition text-xs">Save Settings</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};
