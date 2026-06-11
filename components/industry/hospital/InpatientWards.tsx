
import React from 'react';
import { User, Thermometer, Bed } from 'lucide-react';

const MOCK_BEDS = [
    { id: '301-A', type: 'ICU', status: 'OCCUPIED', patient: 'Michael Knight', doctor: 'Dr. Strange' },
    { id: '301-B', type: 'ICU', status: 'FREE', patient: '-', doctor: '-' },
    { id: '202-A', type: 'General', status: 'OCCUPIED', patient: 'Bruce Wayne', doctor: 'Dr. Banner' },
    { id: '202-B', type: 'General', status: 'CLEANING', patient: '-', doctor: '-' },
    { id: '203-A', type: 'General', status: 'FREE', patient: '-', doctor: '-' },
    { id: '203-B', type: 'General', status: 'OCCUPIED', patient: 'Clark Kent', doctor: 'Dr. Banner' },
];

export const InpatientWards: React.FC = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2 text-sm text-on-surface-muted">
                <span className="w-3 h-3 rounded-full bg-danger"></span> Occupied
                <span className="w-3 h-3 rounded-full bg-secondary ml-2"></span> Free
                <span className="w-3 h-3 rounded-full bg-warning ml-2"></span> Cleaning
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MOCK_BEDS.map(bed => (
                <div key={bed.id} className="glass-panel p-4 rounded-xl border border-border hover:border-primary/50 transition group cursor-pointer relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${bed.status === 'OCCUPIED' ? 'bg-danger' : bed.status === 'FREE' ? 'bg-secondary' : 'bg-warning'}`}></div>
                    
                    <div className="flex justify-between items-start mb-3">
                        <span className="font-mono font-bold text-lg text-on-surface">{bed.id}</span>
                        <span className="text-[10px] uppercase font-bold text-on-surface-muted bg-surface-highlight px-2 py-0.5 rounded">{bed.type}</span>
                    </div>

                    {bed.status === 'OCCUPIED' ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-on-surface">
                                <User className="h-4 w-4 text-on-surface-muted" />
                                <span className="text-sm font-bold truncate">{bed.patient}</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-muted text-xs">
                                <Thermometer className="h-3 w-3" />
                                <span>{bed.doctor}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[44px] flex items-center justify-center text-on-surface-muted text-xs uppercase font-bold tracking-wider opacity-50">
                            {bed.status}
                        </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                        <Bed className="h-4 w-4 text-on-surface-muted group-hover:text-primary transition" />
                        <button className="text-xs text-primary hover:underline">Details</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
