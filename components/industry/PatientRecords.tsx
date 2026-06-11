
import React from 'react';
import { Stethoscope, User, Activity, FileText, Calendar, Search, Plus } from 'lucide-react';

const MOCK_PATIENTS = [
    {
        id: 'PAT-1023',
        name: 'Sarah Connor',
        age: 34,
        condition: 'Hypertension',
        status: 'Admitted',
        room: '302',
        doctor: 'Dr. Samy',
        lastVitals: '140/90 mmHg'
    },
    {
        id: 'PAT-1024',
        name: 'John Doe',
        age: 58,
        condition: 'Post-Op Recovery',
        status: 'Stable',
        room: '205',
        doctor: 'Dr. House',
        lastVitals: '98 bpm / 98% SpO2'
    },
    {
        id: 'PAT-1025',
        name: 'Jane Smith',
        age: 24,
        condition: 'Migraine',
        status: 'Waiting',
        room: 'ER-4',
        doctor: 'TBD',
        lastVitals: 'Pending'
    }
];

export const PatientRecords: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Stethoscope className="h-8 w-8 text-cyan-500" /> Patient Records
                    </h1>
                    <p className="text-on-surface-muted mt-1">EMR, Triage, and Departmental Status.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search patients..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-cyan-500 w-64"
                        />
                    </div>
                    <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Admit Patient
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Status Cards */}
                <div className="lg:col-span-3 space-y-4">
                    {MOCK_PATIENTS.map(patient => (
                        <div key={patient.id} className="glass-panel p-4 rounded-2xl border border-border hover:border-cyan-500/30 transition duration-300 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold text-lg">
                                    {patient.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-on-surface">{patient.name}</h3>
                                    <div className="flex items-center gap-3 text-xs text-on-surface-muted">
                                        <span className="font-mono">{patient.id}</span>
                                        <span>•</span>
                                        <span>{patient.age} yrs</span>
                                        <span>•</span>
                                        <span className="text-on-surface font-medium">{patient.condition}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 w-full md:w-auto text-sm">
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Status</span>
                                    <span className={`font-bold px-2 py-1 rounded text-xs uppercase ${
                                        patient.status === 'Admitted' ? 'bg-danger/10 text-danger' : 
                                        patient.status === 'Waiting' ? 'bg-warning/10 text-warning' : 
                                        'bg-secondary/10 text-secondary'
                                    }`}>
                                        {patient.status}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Room</span>
                                    <span className="font-mono font-bold text-on-surface">{patient.room}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Vitals</span>
                                    <span className="font-mono font-bold text-primary">{patient.lastVitals}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button className="p-2 hover:bg-surface-highlight rounded-lg text-on-surface-muted hover:text-on-surface transition border border-transparent hover:border-border">
                                    <Activity className="h-5 w-5" />
                                </button>
                                <button className="p-2 hover:bg-surface-highlight rounded-lg text-on-surface-muted hover:text-cyan-500 transition border border-transparent hover:border-border">
                                    <FileText className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Sidebar: On Call */}
                <div className="glass-panel p-6 rounded-2xl border border-border h-fit">
                    <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" /> On Call Today
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-border">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div>
                                <p className="font-bold text-sm text-on-surface">Dr. Samy</p>
                                <p className="text-xs text-on-surface-muted">Cardiology • Ext 101</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-border">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <div>
                                <p className="font-bold text-sm text-on-surface">Dr. House</p>
                                <p className="text-xs text-on-surface-muted">Diagnostic • Ext 404</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-border">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div>
                                <p className="font-bold text-sm text-on-surface">Nurse Rania</p>
                                <p className="text-xs text-on-surface-muted">Head Nurse • ICU</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="text-xs font-bold text-on-surface-muted uppercase mb-3">Shift Schedule</h4>
                        <div className="text-sm text-on-surface flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-on-surface-muted" /> 
                            <span>Morning Shift (07:00 - 15:00)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
