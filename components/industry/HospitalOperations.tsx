
import React, { useState } from 'react';
import { Activity, Bed, HeartPulse, Scissors } from 'lucide-react';
import { EmergencyRoom } from './hospital/EmergencyRoom';
import { InpatientWards } from './hospital/InpatientWards';
import { SurgerySchedule } from './hospital/SurgerySchedule';

export const HospitalOperations: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ER' | 'WARDS' | 'OR'>('ER');

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Activity className="h-8 w-8 text-danger" /> Hospital Operations
                    </h1>
                    <p className="text-on-surface-muted mt-1">Emergency, Inpatient Wards, and Operating Theaters.</p>
                </div>
                <div className="flex bg-surface border border-border rounded-xl p-1">
                    <button 
                        onClick={() => setActiveTab('ER')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'ER' ? 'bg-danger text-white shadow-lg' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        <HeartPulse className="h-4 w-4" /> ER & Triage
                    </button>
                    <button 
                        onClick={() => setActiveTab('WARDS')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'WARDS' ? 'bg-primary text-black shadow-lg' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        <Bed className="h-4 w-4" /> Wards
                    </button>
                    <button 
                        onClick={() => setActiveTab('OR')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'OR' ? 'bg-indigo-500 text-white shadow-lg' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        <Scissors className="h-4 w-4" /> Surgery
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
                {activeTab === 'ER' && <EmergencyRoom />}
                {activeTab === 'WARDS' && <InpatientWards />}
                {activeTab === 'OR' && <SurgerySchedule />}
            </div>
        </div>
    );
};
