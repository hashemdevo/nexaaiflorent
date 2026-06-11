
import React, { useState } from 'react';
import { LayoutGrid, Users, Clock, Coffee, Plus, Utensils } from 'lucide-react';

interface Table {
    id: string;
    name: string;
    seats: number;
    status: 'FREE' | 'OCCUPIED' | 'RESERVED' | 'DIRTY';
    orderId?: string;
    timeSeated?: string;
    reservationTime?: string;
}

const INITIAL_TABLES: Table[] = [
    { id: 't1', name: 'Table 1', seats: 2, status: 'OCCUPIED', orderId: '#1023', timeSeated: '15m' },
    { id: 't2', name: 'Table 2', seats: 4, status: 'FREE' },
    { id: 't3', name: 'Table 3', seats: 4, status: 'RESERVED', reservationTime: '19:00' },
    { id: 't4', name: 'Table 4', seats: 6, status: 'OCCUPIED', orderId: '#1025', timeSeated: '45m' },
    { id: 't5', name: 'Booth A', seats: 4, status: 'DIRTY' },
    { id: 't6', name: 'Booth B', seats: 4, status: 'FREE' },
];

export const RestaurantTables: React.FC = () => {
    const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);

    const getStatusColor = (status: Table['status']) => {
        switch (status) {
            case 'FREE': return 'bg-secondary/20 border-secondary text-secondary';
            case 'OCCUPIED': return 'bg-danger/20 border-danger text-danger';
            case 'RESERVED': return 'bg-warning/20 border-warning text-warning';
            case 'DIRTY': return 'bg-zinc-700/50 border-zinc-500 text-zinc-400';
            default: return 'bg-surface border-border';
        }
    };

    const handleStatusChange = (id: string, newStatus: Table['status']) => {
        setTables(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <LayoutGrid className="h-8 w-8 text-orange-500" /> Floor Plan & Tables
                    </h1>
                    <p className="text-on-surface-muted mt-1">Real-time table status and reservation management.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold bg-surface px-3 py-1.5 rounded-lg border border-border">
                        <span className="w-3 h-3 rounded-full bg-secondary"></span> Free
                        <span className="w-3 h-3 rounded-full bg-danger ml-2"></span> Occupied
                        <span className="w-3 h-3 rounded-full bg-warning ml-2"></span> Reserved
                    </div>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Table
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.map(table => (
                    <div 
                        key={table.id} 
                        className={`aspect-square rounded-3xl border-2 flex flex-col items-center justify-between p-6 cursor-pointer transition hover:scale-[1.02] shadow-lg ${getStatusColor(table.status)}`}
                        onClick={() => {
                            if (table.status === 'FREE') handleStatusChange(table.id, 'OCCUPIED');
                            else if (table.status === 'OCCUPIED') handleStatusChange(table.id, 'DIRTY');
                            else if (table.status === 'DIRTY') handleStatusChange(table.id, 'FREE');
                        }}
                    >
                        <div className="flex justify-between w-full">
                            <span className="font-bold text-lg">{table.name}</span>
                            <div className="flex items-center gap-1 text-sm font-bold opacity-80">
                                <Users className="h-3 w-3" /> {table.seats}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center flex-1">
                            {table.status === 'OCCUPIED' && (
                                <div className="text-center">
                                    <Utensils className="h-8 w-8 mb-2 opacity-80 mx-auto" />
                                    <span className="font-mono text-sm block">{table.orderId}</span>
                                    <span className="text-xs opacity-70 flex items-center gap-1 justify-center mt-1"><Clock className="h-3 w-3" /> {table.timeSeated}</span>
                                </div>
                            )}
                            {table.status === 'RESERVED' && (
                                <div className="text-center">
                                    <Clock className="h-8 w-8 mb-2 opacity-80 mx-auto" />
                                    <span className="font-bold text-sm block">{table.reservationTime}</span>
                                </div>
                            )}
                            {table.status === 'FREE' && <Coffee className="h-8 w-8 opacity-40" />}
                            {table.status === 'DIRTY' && <span className="text-sm font-bold uppercase tracking-widest opacity-70">Needs Cleaning</span>}
                        </div>

                        <div className="w-full pt-4 border-t border-current/20 text-center">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-90">{table.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
