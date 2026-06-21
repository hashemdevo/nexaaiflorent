
import React from 'react';
import { Asset } from '../../../types';
import { Landmark, ChevronUp, ChevronDown } from 'lucide-react';
import { AccountingStandard, StandardLogic } from '../../../services/accounting/standards';

interface AssetCardProps {
    asset: Asset;
    isExpanded: boolean;
    onToggle: () => void;
    standard: AccountingStandard;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, isExpanded, onToggle, standard }) => {
    // IFRS Logic: Simulate a Fair Value higher than book value for demo
    const fairMarketValue = asset.cost * 0.9; // Decay slightly
    const calculation = StandardLogic.calculateAssetValue(asset.cost, asset.cost - asset.currentValue, fairMarketValue, standard);

    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition duration-300 group">
            <div className="p-6 flex flex-col md:flex-row md:items-center gap-6 justify-between bg-gradient-to-b from-surface-highlight/20 to-transparent">
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary border border-primary/20 shadow-glow-primary">
                        <Landmark className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface">{asset.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs bg-surface-highlight px-2 py-0.5 rounded-md text-on-surface-muted font-mono border border-border">{asset.serialNumber || 'No S/N'}</span>
                            <span className="text-xs text-on-surface-muted">Acquired: {asset.purchaseDate}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div>
                        <span className="text-xs text-on-surface-muted block uppercase tracking-wider">Original Cost</span>
                        <span className="text-sm font-bold text-on-surface font-mono">${asset.cost.toLocaleString()}</span>
                    </div>
                    
                    {standard === 'IFRS' && calculation.revaluationSurplus > 0 ? (
                        <div>
                            <span className="text-xs text-emerald-500 block uppercase tracking-wider font-bold">Fair Value (IFRS)</span>
                            <span className="text-lg font-bold text-emerald-400 font-mono drop-shadow-sm">${Math.round(calculation.bookValue).toLocaleString()}</span>
                            <span className="text-[10px] text-emerald-600 block">Surplus: ${Math.round(calculation.revaluationSurplus).toLocaleString()}</span>
                        </div>
                    ) : (
                        <div>
                            <span className="text-xs text-on-surface-muted block uppercase tracking-wider">Book Value</span>
                            <span className="text-lg font-bold text-primary font-mono drop-shadow-sm">${Math.round(asset.currentValue).toLocaleString()}</span>
                        </div>
                    )}

                    <button 
                        onClick={onToggle}
                        className={`p-2 rounded-full hover:bg-surface-highlight transition ${isExpanded ? 'bg-surface-highlight text-on-surface' : 'text-on-surface-muted'}`}
                    >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
