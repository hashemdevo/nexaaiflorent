
import React from 'react';
import { Scissors, LayoutGrid, List, User } from 'lucide-react';

const MOCK_SURGERIES = [
    { id: 'OR-1', time: '08:00 AM', procedure: 'Appendectomy', surgeon: 'Dr. Shephard', patient: 'Jack L.', status: 'COMPLETED' },
    { id: 'OR-2', time: '10:30 AM', procedure: 'Knee Replacement', surgeon: 'Dr. Yang', patient: 'Meredith G.', status: 'IN_PROGRESS' },
    { id: 'OR-1', time: '02:00 PM', procedure: 'Heart Bypass', surgeon: 'Dr. Burke', patient: 'Denny D.', status: 'SCHEDULED' },
];

export const SurgerySchedule: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="glass-panel p-6 rounded-2xl border border-border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-indigo-400" /> Surgery Schedule
                </h3>
                <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
                    <button className="p-1.5 hover:bg-surface-highlight rounded text-on-surface-muted hover:text-on-surface"><LayoutGrid className="h-4 w-4" /></button>
                    <button className="p-1.5 bg-surface-highlight rounded text-on-surface"><List className="h-4 w-4" /></button>
                </div>
            </div>

            <div className="space-y-4">
                {MOCK_SURGERIES.map((op, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-surface/50 border border-border rounded-xl hover:bg-surface-highlight/10 transition">
                        <div className="flex flex-col items-center justify-center min-w-[80px] p-2 bg-surface-highlight rounded-lg border border-border">
                            <span className="text-xs font-bold text-on-surface-muted uppercase">{op.id}</span>
                            <span className="text-lg font-bold text-on-surface">{op.time}</span>
                        </div>
                        
                        <div className="flex-1 w-full md:w-auto">
                            <h4 className="font-bold text-lg text-on-surface">{op.procedure}</h4>
                            <div className="flex items-center gap-4 text-sm text-on-surface-muted mt-1">
                                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {op.patient}</span>
                                <span className="flex items-center gap-1"><Scissors className="h-3 w-3" /> {op.surgeon}</span>
                            </div>
                        </div>

                        <div className="w-full md:w-auto text-right">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                                op.status === 'IN_PROGRESS' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse' :
                                op.status === 'COMPLETED' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                'bg-surface-highlight text-on-surface-muted border-border'
                            }`}>
                                {op.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
