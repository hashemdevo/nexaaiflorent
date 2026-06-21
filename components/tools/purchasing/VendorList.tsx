
import React from 'react';
import { Users, Plus } from 'lucide-react';

const MOCK_VENDORS = [
    { id: 'VND-001', name: 'Global Coffee Supply', contact: 'John Smith', email: 'orders@globalcoffee.com', balance: 1200 },
    { id: 'VND-002', name: 'City Packaging Co.', contact: 'Sarah Jones', email: 'sales@citypack.com', balance: 0 },
    { id: 'VND-003', name: 'Fresh Farms Ltd.', contact: 'Mike Ross', email: 'mike@freshfarms.com', balance: 450 },
];

export const VendorList: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_VENDORS.map(vendor => (
                <div key={vendor.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-indigo-500/30 transition group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-surface-highlight rounded-full text-indigo-400">
                            <Users className="h-6 w-6" />
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${vendor.balance > 0 ? 'bg-warning/10 text-warning' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {vendor.balance > 0 ? 'Balance Due' : 'Clear'}
                        </span>
                    </div>
                    <h4 className="font-bold text-lg text-on-surface mb-1">{vendor.name}</h4>
                    <p className="text-sm text-on-surface-muted mb-4">{vendor.contact}</p>
                    
                    <div className="pt-4 border-t border-border flex justify-between items-center">
                        <div>
                            <p className="text-xs text-on-surface-muted uppercase">Open Balance</p>
                            <p className="font-mono font-bold text-on-surface">${vendor.balance.toLocaleString()}</p>
                        </div>
                        <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300">View History</button>
                    </div>
                </div>
            ))}
            <button className="glass-panel p-6 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-on-surface-muted hover:text-indigo-500 hover:border-indigo-500/50 transition cursor-pointer min-h-[200px]">
                <Plus className="h-8 w-8 mb-2" />
                <span className="font-bold text-sm">Add New Vendor</span>
            </button>
        </div>
    );
};
