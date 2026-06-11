
import React from 'react';
import { Pill, AlertTriangle, CheckCircle2, ClipboardList, Search, Activity, User } from 'lucide-react';

const MOCK_RX_QUEUE = [
    { id: 'RX-9921', patient: 'Sarah Connor', medication: 'Amoxicillin 500mg', doctor: 'Dr. Samy', status: 'READY', alert: null },
    { id: 'RX-9922', patient: 'John Doe', medication: 'Warfarin 5mg', doctor: 'Dr. House', status: 'REVIEW', alert: 'Interaction Warning' },
    { id: 'RX-9923', patient: 'Jane Smith', medication: 'Ibuprofen 400mg', doctor: 'Dr. Strange', status: 'PENDING', alert: null },
];

export const PharmacyDispensa: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Pill className="h-8 w-8 text-emerald-500" /> Dispensary & Rx
                    </h1>
                    <p className="text-on-surface-muted mt-1">Prescription processing and drug interaction checks.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Scan Rx or Search Patient..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-emerald-500 w-64"
                        />
                    </div>
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" /> New Script
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Prescription Queue */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg text-on-surface mb-2">Prescription Queue</h3>
                    {MOCK_RX_QUEUE.map(rx => (
                        <div key={rx.id} className="glass-panel p-4 rounded-xl border border-border flex items-center justify-between hover:border-emerald-500/30 transition duration-300">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                    rx.status === 'READY' ? 'bg-emerald-500/20 text-emerald-500' : 
                                    rx.status === 'REVIEW' ? 'bg-warning/20 text-warning' : 
                                    'bg-surface-highlight text-on-surface-muted'
                                }`}>
                                    {rx.status === 'READY' ? <CheckCircle2 className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-on-surface">{rx.medication}</h4>
                                    <div className="flex items-center gap-2 text-xs text-on-surface-muted mt-1">
                                        <span className="font-mono">{rx.id}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {rx.patient}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                {rx.alert ? (
                                    <div className="flex items-center gap-2 text-warning text-sm font-bold bg-warning/10 px-3 py-1.5 rounded-lg border border-warning/20">
                                        <AlertTriangle className="h-4 w-4" /> {rx.alert}
                                    </div>
                                ) : (
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${
                                        rx.status === 'READY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-highlight text-on-surface-muted'
                                    }`}>
                                        {rx.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stock Alerts */}
                <div className="glass-panel p-6 rounded-2xl border border-border h-fit">
                    <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning" /> Low Stock Alerts
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-surface/50 rounded-xl border border-border flex justify-between items-center">
                            <div>
                                <p className="font-bold text-sm text-on-surface">Lisinopril 10mg</p>
                                <p className="text-xs text-danger">Only 15 tablets left</p>
                            </div>
                            <button className="text-xs font-bold text-emerald-500 hover:underline">Reorder</button>
                        </div>
                        <div className="p-3 bg-surface/50 rounded-xl border border-border flex justify-between items-center">
                            <div>
                                <p className="font-bold text-sm text-on-surface">Metformin 500mg</p>
                                <p className="text-xs text-warning">Below min level</p>
                            </div>
                            <button className="text-xs font-bold text-emerald-500 hover:underline">Reorder</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
