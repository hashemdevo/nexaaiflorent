
import React from 'react';
import { Cpu } from 'lucide-react';

interface SimulationHeaderProps {
    viewMode: 'LAB' | 'ARENA';
    setViewMode: (mode: 'LAB' | 'ARENA') => void;
}

export const SimulationHeader: React.FC<SimulationHeaderProps> = ({ viewMode, setViewMode }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-6">
            <div>
                <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                    <Cpu className="h-8 w-8 text-secondary" /> 
                    Superhuman Simulation Stack (S3)
                </h1>
                <p className="text-on-surface-muted mt-2">
                    Enterprise Risk Intelligence (ERI) • Predictive Modeling • Strategy Lab
                </p>
            </div>
            <div className="flex bg-surface border border-border rounded-xl p-1">
                <button 
                    onClick={() => setViewMode('LAB')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'LAB' ? 'bg-primary text-black shadow-glow-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                >
                    Simulation Lab
                </button>
                <button 
                    onClick={() => setViewMode('ARENA')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition ${viewMode === 'ARENA' ? 'bg-secondary text-white shadow-glow-secondary' : 'text-on-surface-muted hover:text-on-surface'}`}
                >
                    Model Arena
                </button>
            </div>
        </div>
    );
};
