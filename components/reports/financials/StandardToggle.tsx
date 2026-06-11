
import React from 'react';
import { Globe, Flag } from 'lucide-react';
import { AccountingStandard } from '../../../services/accounting/standards';

interface StandardToggleProps {
    standard: AccountingStandard;
    onChange: (std: AccountingStandard) => void;
}

export const StandardToggle: React.FC<StandardToggleProps> = ({ standard, onChange }) => {
    return (
        <div className="flex bg-surface border border-border p-1 rounded-xl">
            <button
                onClick={() => onChange('GAAP')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    standard === 'GAAP' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-on-surface-muted hover:text-on-surface'
                }`}
            >
                <Flag className="h-4 w-4" /> US GAAP
            </button>
            <button
                onClick={() => onChange('IFRS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    standard === 'IFRS' 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-on-surface-muted hover:text-on-surface'
                }`}
            >
                <Globe className="h-4 w-4" /> IFRS
            </button>
        </div>
    );
};
