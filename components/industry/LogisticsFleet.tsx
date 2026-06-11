
import React from 'react';
import { Truck, MapPin, Navigation, Package, AlertCircle, CheckCircle2, Search } from 'lucide-react';

const MOCK_FLEET = [
    { id: 'V-101', driver: 'Ali Hassan', status: 'In Transit', location: 'Cairo-Alex Hwy', eta: '2h 15m', load: 85, active: true },
    { id: 'V-104', driver: 'Omar Khaled', status: 'Idle', location: 'Warehouse A', eta: '-', load: 0, active: true },
    { id: 'V-202', driver: 'Samy Nabil', status: 'Maintenance', location: 'Service Center', eta: '1d', load: 0, active: false },
    { id: 'V-305', driver: 'Mona Youssef', status: 'Delivered', location: 'Client Site B', eta: '-', load: 0, active: true },
    { id: 'V-401', driver: 'Karim Ezz', status: 'In Transit', location: 'Ring Road', eta: '45m', load: 40, active: true },
];

export const LogisticsFleet: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Truck className="h-8 w-8 text-blue-500" /> Fleet Management
                    </h1>
                    <p className="text-on-surface-muted mt-1">Real-time tracking, dispatching, and vehicle status.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search vehicle or driver..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-blue-500 w-64"
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Navigation className="h-4 w-4" /> Dispatch Vehicle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fleet List */}
                <div className="lg:col-span-2 space-y-4">
                    {MOCK_FLEET.map(vehicle => (
                        <div key={vehicle.id} className="glass-panel p-4 rounded-xl border border-border hover:border-blue-500/30 transition flex items-center gap-4 group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${
                                vehicle.status === 'In Transit' ? 'bg-blue-500' :
                                vehicle.status === 'Maintenance' ? 'bg-warning' :
                                vehicle.status === 'Delivered' ? 'bg-secondary' : 'bg-surface-highlight text-on-surface-muted'
                            }`}>
                                <Truck className="h-6 w-6" />
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-on-surface">{vehicle.id} <span className="text-on-surface-muted font-normal text-sm mx-2">•</span> {vehicle.driver}</h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        vehicle.status === 'In Transit' ? 'bg-blue-500/10 text-blue-500' :
                                        vehicle.status === 'Maintenance' ? 'bg-warning/10 text-warning' :
                                        vehicle.status === 'Delivered' ? 'bg-secondary/10 text-secondary' : 'bg-surface-highlight text-on-surface-muted'
                                    }`}>
                                        {vehicle.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 mt-2 text-xs text-on-surface-muted">
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {vehicle.location}</span>
                                    {vehicle.status === 'In Transit' && <span className="flex items-center gap-1 text-primary"><Navigation className="h-3 w-3" /> ETA: {vehicle.eta}</span>}
                                    <span className="flex items-center gap-1"><Package className="h-3 w-3" /> Load: {vehicle.load}%</span>
                                </div>
                            </div>
                            
                            <div className="h-full w-1.5 rounded-full bg-surface-highlight overflow-hidden">
                                <div className={`w-full rounded-full ${vehicle.active ? 'bg-secondary h-full' : 'bg-danger h-1/4'}`}></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Status Overview */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-border">
                        <h3 className="font-bold text-lg text-on-surface mb-4">Fleet Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-surface/50 rounded-xl border border-border">
                                <span className="text-sm font-medium text-on-surface flex items-center gap-2"><Navigation className="h-4 w-4 text-blue-500" /> Active</span>
                                <span className="font-bold text-lg text-on-surface">3</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-surface/50 rounded-xl border border-border">
                                <span className="text-sm font-medium text-on-surface flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" /> Available</span>
                                <span className="font-bold text-lg text-on-surface">1</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-surface/50 rounded-xl border border-border">
                                <span className="text-sm font-medium text-on-surface flex items-center gap-2"><AlertCircle className="h-4 w-4 text-warning" /> Maintenance</span>
                                <span className="font-bold text-lg text-on-surface">1</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-border bg-gradient-to-br from-blue-900/20 to-transparent">
                        <h3 className="font-bold text-lg text-on-surface mb-2">Fuel Efficiency</h3>
                        <p className="text-sm text-on-surface-muted mb-4">Average consumption this week.</p>
                        <div className="text-3xl font-bold text-blue-400">12.4 <span className="text-sm text-on-surface-muted font-normal">L/100km</span></div>
                        <div className="w-full bg-surface-highlight h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-full w-3/4 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
