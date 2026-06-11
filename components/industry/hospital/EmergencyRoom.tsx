
import React from 'react';
import { HeartPulse, Activity, Clock } from 'lucide-react';

const MOCK_ER_PATIENTS = [
    { id: 'ER-109', name: 'John Smith', triage: 'RED', condition: 'Cardiac Arrest', arrival: '10 mins ago', doctor: 'Dr. Samy', status: 'Stabilizing' },
    { id: 'ER-110', name: 'Sarah Connor', triage: 'YELLOW', condition: 'Fractured Arm', arrival: '35 mins ago', doctor: 'Dr. House', status: 'Waiting X-Ray' },
    { id: 'ER-111', name: 'Kyle Reese', triage: 'GREEN', condition: 'High Fever', arrival: '1 hr ago', doctor: 'Nurse Joy', status: 'Waiting' },
];

export const EmergencyRoom: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-danger/20 rounded-full text-danger animate-pulse"><HeartPulse className="h-6 w-6" /></div>
                <div><h4 className="text-sm font-bold text-danger uppercase">Critical (Red)</h4><p className="text-2xl font-bold text-on-surface">3 Patients</p></div>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-4">
                <div className="p-3 bg-warning/20 rounded-full text-warning"><Activity className="h-6 w-6" /></div>
                <div><h4 className="text-sm font-bold text-warning uppercase">Urgent (Yellow)</h4><p className="text-2xl font-bold text-on-surface">8 Patients</p></div>
            </div>
            <div className="p-4 bg-surface border border-border rounded-xl flex items-center gap-4">
                <div className="p-3 bg-surface-highlight rounded-full text-on-surface-muted"><Clock className="h-6 w-6" /></div>
                <div><h4 className="text-sm font-bold text-on-surface-muted uppercase">Avg Wait Time</h4><p className="text-2xl font-bold text-on-surface">24 Mins</p></div>
            </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-border">
            <h3 className="text-lg font-bold text-on-surface mb-4">Emergency Room Triage</h3>
            <div className="grid grid-cols-1 gap-4">
                {MOCK_ER_PATIENTS.map(p => (
                    <div key={p.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-surface/50 border border-border rounded-xl hover:border-primary/30 transition">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`w-2 h-16 rounded-full ${p.triage === 'RED' ? 'bg-danger' : p.triage === 'YELLOW' ? 'bg-warning' : 'bg-secondary'}`}></div>
                            <div>
                                <h4 className="font-bold text-lg text-on-surface">{p.name}</h4>
                                <p className="text-sm text-on-surface-muted flex items-center gap-2"><Activity className="h-3 w-3" /> {p.condition}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end">
                            <div className="text-right"><p className="text-xs text-on-surface-muted uppercase">Arrival</p><p className="font-mono text-sm text-on-surface">{p.arrival}</p></div>
                            <div className="text-right"><p className="text-xs text-on-surface-muted uppercase">Assigned To</p><p className="font-medium text-sm text-primary">{p.doctor}</p></div>
                            <span className="px-3 py-1 bg-surface-highlight rounded-lg text-xs font-bold text-on-surface uppercase border border-border">{p.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
