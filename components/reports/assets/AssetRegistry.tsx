
import React, { useState } from 'react';
import { Asset } from '../../../types';
import { AssetCard } from './AssetCard';
import { DepreciationTable } from './DepreciationTable';
import { StandardToggle } from '../financials/StandardToggle';
import { AccountingStandard } from '../../../services/accounting/standards';

interface AssetRegistryProps {
    assets: Asset[];
    onCalculateSchedule: (asset: Asset) => any[];
}

export const AssetRegistry: React.FC<AssetRegistryProps> = ({ assets, onCalculateSchedule }) => {
    const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
    const [standard, setStandard] = useState<AccountingStandard>('GAAP');

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-surface-highlight/10 p-3 rounded-xl border border-border/50">
                <span className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">Accounting Framework</span>
                <StandardToggle standard={standard} onChange={setStandard} />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {assets.map((asset) => (
                    <div key={asset.id}>
                        <AssetCard 
                            asset={asset} 
                            isExpanded={expandedAssetId === asset.id} 
                            onToggle={() => setExpandedAssetId(expandedAssetId === asset.id ? null : asset.id)}
                            standard={standard}
                        />
                        {expandedAssetId === asset.id && (
                            <DepreciationTable 
                                schedule={onCalculateSchedule(asset)} 
                                asset={asset}
                                standard={standard}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
