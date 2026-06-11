
import React, { useState, useEffect } from 'react';
import { KitchenOrderService } from '../services/pos/kitchenOrderService';
import { Order } from '../types';
import { Bell, CheckCircle2, ShoppingBag, Clock, User, ArrowRightCircle } from 'lucide-react';
import { ClientService } from '../services/clientService';

const RECEPTION_STAFF_LIST = [
    { name: 'Runner Tariq', role: 'Main Runner' },
    { name: 'Runner Sara', role: 'Delivery Runner' },
    { name: 'Hostess Amira', role: 'Reception Host' },
    { name: 'Hostess Laila', role: 'Lobby Host' }
];

export const ReceptionDisplay: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedStaff, setSelectedStaff] = useState(RECEPTION_STAFF_LIST[0]);

    const fetchOrders = () => {
        const all = KitchenOrderService.getOrders();
        // Reception sees READY orders
        setOrders(all.filter(o => o.status === 'READY'));
    };

    useEffect(() => {
        fetchOrders();
        window.addEventListener('nexa-kitchen-orders-updated', fetchOrders);
        return () => window.removeEventListener('nexa-kitchen-orders-updated', fetchOrders);
    }, []);

    const handleDeliver = async (id: string) => {
        const actorName = `${selectedStaff.name} (${selectedStaff.role})`;
        const orderNum = orders.find(o => o.id === id)?.orderNumber;
        
        const tracker: Partial<Order> = {
            deliveredBy: actorName,
            deliveredAt: new Date().toISOString()
        };

        // Log delivery to backend audit
        await ClientService.logActivity(
            actorName, 
            'UPDATE', 
            `Dispatched and Delivered Order #${orderNum} over counter`
        );

        KitchenOrderService.updateStatus(id, 'DELIVERED', tracker);
    };

    return (
        <div className="p-6 h-screen bg-background text-on-surface flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-border/40">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Bell className="h-8 w-8 text-secondary animate-pulse" /> 
                        <span className="bg-gradient-to-r from-secondary to-indigo-400 bg-clip-text text-transparent">Reception / Delivery Hub</span>
                    </h1>
                    <p className="text-xs text-on-surface-muted mt-1 uppercase tracking-wider font-semibold">Ready Orders Dispatch & Delivery Management</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Active Dispatch/Reception Selector */}
                    <div className="bg-surface border border-border px-4 py-2 rounded-2xl flex items-center gap-3">
                        <User className="h-5 w-5 text-secondary animate-bounce-slow" />
                        <div className="text-left">
                            <label className="text-[9px] uppercase tracking-wider text-on-surface-muted block font-bold">Active Runner / Host</label>
                            <select 
                                value={JSON.stringify(selectedStaff)}
                                onChange={e => setSelectedStaff(JSON.parse(e.target.value))}
                                className="bg-transparent text-sm font-bold text-on-surface outline-none border-none p-0 cursor-pointer"
                            >
                                {RECEPTION_STAFF_LIST.map((staff, idx) => (
                                    <option key={idx} value={JSON.stringify(staff)} className="bg-surface text-on-surface font-sans">
                                        {staff.name} ({staff.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-xl font-bold text-secondary bg-secondary/10 px-4 py-2.5 rounded-2xl border border-secondary/20">
                        {orders.length} Ready Queue
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar flex-1 pb-10">
                {orders.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-on-surface-muted opacity-50">
                        <ShoppingBag className="h-24 w-24 mb-4 animate-bounce-slow" />
                        <h2 className="text-2xl font-bold">All caught up!</h2>
                        <span className="text-sm mt-1">Waiting for kitchen staff to complete orders...</span>
                    </div>
                )}
                {orders.map(order => (
                    <div key={order.id} className="bg-surface border-2 border-secondary rounded-2xl overflow-hidden shadow-glow-secondary flex flex-col justify-between">
                        <div>
                            <div className="p-6 bg-secondary/10 border-b border-secondary/25 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white">#{order.orderNumber}</h2>
                                    <p className="text-xs font-bold text-secondary-300 uppercase mt-1 tracking-wider">{order.serviceType}</p>
                                </div>
                                <div className="bg-secondary text-white p-2.5 rounded-full shadow-lg">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="space-y-2 border-b border-border/30 pb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-base">
                                            <span className="font-extrabold text-secondary">{item.quantity}x</span>
                                            <span className="text-on-surface font-semibold">{item.name}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Who prepped it? */}
                                {order.preppedBy && (
                                    <div className="text-xs text-on-surface-muted text-left space-y-1">
                                        <p className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-warning"></span>
                                            Prepped by: <span className="text-on-surface font-semibold">{order.preppedBy}</span>
                                        </p>
                                        {order.preppedAt && (
                                            <p className="pl-3 text-[10px] font-mono">
                                                At: {new Date(order.preppedAt).toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 pt-0">
                            <button 
                                onClick={() => handleDeliver(order.id)}
                                className="w-full py-3.5 bg-secondary text-white font-extrabold text-lg rounded-xl hover:bg-secondary/90 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                <ArrowRightCircle className="h-5 w-5" /> Dispatch Order
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
