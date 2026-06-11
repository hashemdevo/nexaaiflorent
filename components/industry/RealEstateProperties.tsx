
import React from 'react';
import { Building, User, Key, DollarSign, Calendar, Search, Plus, MapPin } from 'lucide-react';

const MOCK_PROPERTIES = [
    { 
        id: 'PROP-101', 
        name: 'Sunset Towers', 
        unit: 'Apt 12B', 
        tenant: 'Michael Scott', 
        status: 'OCCUPIED', 
        rent: 2500, 
        leaseEnd: '2024-05-01',
        nextPayment: 'Nov 01'
    },
    { 
        id: 'PROP-102', 
        name: 'Downtown Lofts', 
        unit: 'Unit 404', 
        tenant: 'Dwight Schrute', 
        status: 'OCCUPIED', 
        rent: 1800, 
        leaseEnd: '2024-08-15',
        nextPayment: 'Nov 01'
    },
    { 
        id: 'PROP-103', 
        name: 'The Office Park', 
        unit: 'Suite 200', 
        tenant: '-', 
        status: 'VACANT', 
        rent: 4000, 
        leaseEnd: '-',
        nextPayment: '-'
    },
];

export const RealEstateProperties: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Building className="h-8 w-8 text-indigo-500" /> Property Management
                    </h1>
                    <p className="text-on-surface-muted mt-1">Manage units, leases, and tenant payments.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search properties..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-indigo-500 w-64"
                        />
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Unit
                    </button>
                </div>
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold text-on-surface-muted uppercase mb-2">Occupancy Rate</h3>
                    <div className="text-3xl font-bold text-on-surface">94%</div>
                    <div className="w-full bg-surface-highlight h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[94%]"></div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold text-on-surface-muted uppercase mb-2">Total Rent Roll</h3>
                    <div className="text-3xl font-bold text-on-surface">$145,200</div>
                    <p className="text-xs text-on-surface-muted mt-1">Monthly projected</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="text-sm font-bold text-on-surface-muted uppercase mb-2">Maintenance Requests</h3>
                    <div className="text-3xl font-bold text-warning">8</div>
                    <p className="text-xs text-on-surface-muted mt-1">2 Urgent</p>
                </div>
            </div>

            {/* Property List */}
            <div className="grid grid-cols-1 gap-4">
                {MOCK_PROPERTIES.map(prop => (
                    <div key={prop.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-indigo-500/30 transition duration-300 group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-surface-highlight rounded-xl text-indigo-500">
                                    <Key className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-on-surface">{prop.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                            prop.status === 'OCCUPIED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-surface-highlight text-on-surface-muted border-border'
                                        }`}>
                                            {prop.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-on-surface-muted flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" /> {prop.unit}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-8 text-sm">
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Tenant</span>
                                    <span className="font-medium text-on-surface flex items-center gap-2">
                                        <User className="h-3 w-3" /> {prop.tenant}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Rent</span>
                                    <span className="font-mono font-bold text-on-surface flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" /> {prop.rent.toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs text-on-surface-muted uppercase block mb-1">Lease Ends</span>
                                    <span className="font-medium text-on-surface flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> {prop.leaseEnd}
                                    </span>
                                </div>
                            </div>

                            <button className="text-sm font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
                                Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
