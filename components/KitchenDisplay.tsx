
import React, { useState, useEffect } from 'react';
import { KitchenOrderService } from '../services/pos/kitchenOrderService';
import { Order } from '../types';
import { Utensils, Clock, Check, RefreshCw, ChefHat, User } from 'lucide-react';
import { ClientService } from '../services/clientService';

const KITCHEN_STAFF_LIST = [
    { name: 'Chef Samir', role: 'Head Chef' },
    { name: 'Chef Fatima', role: 'Sous Chef' },
    { name: 'Cook Rayan', role: 'Line Cook' },
    { name: 'Cook Khalid', role: 'Prep Cook' }
];

export const KitchenDisplay: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedStaff, setSelectedStaff] = useState(KITCHEN_STAFF_LIST[0]);

    const fetchOrders = () => {
        const all = KitchenOrderService.getOrders();
        // Kitchen sees Pending and Preparing
        setOrders(all.filter(o => o.status === 'PENDING' || o.status === 'PREPARING'));
    };

    useEffect(() => {
        fetchOrders();
        window.addEventListener('nexa-kitchen-orders-updated', fetchOrders);
        return () => window.removeEventListener('nexa-kitchen-orders-updated', fetchOrders);
    }, []);

    const handleStatusUpdate = async (id: string, status: Order['status']) => {
        const tracker: Partial<Order> = {};
        const actorName = `${selectedStaff.name} (${selectedStaff.role})`;
        
        if (status === 'PREPARING') {
            tracker.preppedBy = actorName;
            tracker.preppedAt = new Date().toISOString();
            
            // Log security/audit trail to backend
            await ClientService.logActivity(
                actorName, 
                'UPDATE', 
                `Kitchen production started on Order #${orders.find(o => o.id === id)?.orderNumber}`
            );
        } else if (status === 'READY') {
            tracker.preppedBy = orders.find(o => o.id === id)?.preppedBy || actorName;
            // Log completion trail to backend
            await ClientService.logActivity(
                actorName, 
                'UPDATE', 
                `Kitchen food prep completed. Marked Order #${orders.find(o => o.id === id)?.orderNumber} as READY to Deliver`
            );
        }

        KitchenOrderService.updateStatus(id, status, tracker);
    };

    return (
        <div className="p-6 h-screen bg-background text-on-surface flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-border/40">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Utensils className="h-8 w-8 text-warning" /> 
                        <span className="bg-gradient-to-r from-warning to-amber-400 bg-clip-text text-transparent">Kitchen Display System (KDS)</span>
                    </h1>
                    <p className="text-xs text-on-surface-muted mt-1 uppercase tracking-wider font-semibold">Real-Time Culinary Queue & Prep Management</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    {/* Active Staff Member Selector */}
                    <div className="bg-surface border border-border px-4 py-2 rounded-2xl flex items-center gap-3">
                        <ChefHat className="h-5 w-5 text-warning animate-bounce-slow" />
                        <div className="text-left">
                            <label className="text-[9px] uppercase tracking-wider text-on-surface-muted block font-bold">Culinary Member on Shift</label>
                            <select 
                                value={JSON.stringify(selectedStaff)}
                                onChange={e => setSelectedStaff(JSON.parse(e.target.value))}
                                className="bg-transparent text-sm font-bold text-on-surface outline-none border-none p-0 cursor-pointer"
                            >
                                {KITCHEN_STAFF_LIST.map((staff, idx) => (
                                    <option key={idx} value={JSON.stringify(staff)} className="bg-surface text-on-surface font-sans">
                                        {staff.name} ({staff.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-xl font-mono font-bold bg-surface border border-border px-4 py-2.5 rounded-2xl text-on-surface-muted">
                        {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-4 h-full">
                    {orders.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-on-surface-muted opacity-50 border-2 border-dashed border-border rounded-3xl">
                            <Utensils className="h-20 w-20 mb-4 animate-pulse-slow" />
                            <h2 className="text-2xl font-bold">No Active culinary Orders</h2>
                        </div>
                    )}
                    {orders.map(order => (
                        <div key={order.id} className="min-w-[325px] max-w-[325px] flex flex-col bg-surface border-2 border-border rounded-2xl overflow-hidden shadow-lg h-full transition hover:border-warning/35">
                            <div className={`p-4 border-b border-border ${order.status === 'PENDING' ? 'bg-danger/10 border-danger/20' : 'bg-warning/10 border-warning/20'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-lg text-white">Order #{order.orderNumber}</span>
                                    <span className="text-xs font-mono font-bold text-on-surface-muted flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs font-bold uppercase py-0.5 px-2 bg-black/45 rounded-lg border border-white/5 text-gray-300">
                                        {order.serviceType}
                                    </span>
                                    <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${order.status === 'PENDING' ? 'bg-danger/25 text-danger' : 'bg-warning/25 text-warning-400'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 bg-surface-highlight/5">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start border-b border-border/40 pb-2">
                                        <div className="font-extrabold text-lg text-warning pr-2">{item.quantity}x</div>
                                        <div className="flex-1 text-left">
                                            <div className="font-bold text-on-surface text-sm">{item.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Prep Tracker Line */}
                            {order.preppedBy && (
                                <div className="px-4 py-2 border-t border-border/35 bg-surface-highlight/10 text-left flex items-center gap-2 text-xs text-on-surface-muted">
                                    <User className="h-3.5 w-3.5 text-warning" />
                                    <span>Prepped by: <strong className="text-on-surface">{order.preppedBy}</strong></span>
                                </div>
                            )}

                            <div className="p-4 border-t border-border bg-surface flex flex-col gap-2">
                                {order.status === 'PENDING' ? (
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                        className="w-full py-3 bg-warning text-black font-extrabold rounded-xl hover:bg-warning/95 transition flex items-center justify-center gap-2 shadow-md hover:shadow-glow-amber-30"
                                    >
                                        <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: '4s' }} /> Start Prep
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleStatusUpdate(order.id, 'READY')}
                                        className="w-full py-3 bg-semibold bg-secondary text-white font-extrabold rounded-xl hover:bg-secondary/95 transition flex items-center justify-center gap-2 shadow-md hover:shadow-glow-secondary-30"
                                    >
                                        <Check className="h-5 w-5" /> Mark Ready
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
