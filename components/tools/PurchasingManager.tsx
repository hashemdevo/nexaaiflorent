
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { PurchaseOrderList } from './purchasing/PurchaseOrderList';
import { BillList } from './purchasing/BillList';
import { VendorList } from './purchasing/VendorList';
import { SupplyChainCycle } from '../inventory/SupplyChainCycle';

export const PurchasingManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'VENDORS' | 'PO' | 'BILLS' | 'SUPPLY_CHAIN'>('PO');

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <ShoppingCart className="h-8 w-8 text-indigo-500" /> Procurement & Spending
                    </h1>
                    <p className="text-on-surface-muted mt-1">Manage suppliers, orders, and accounts payable.</p>
                </div>
                <div className="flex gap-2 bg-surface border border-border rounded-xl p-1 flex-wrap">
                    <button 
                        onClick={() => setActiveTab('SUPPLY_CHAIN')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'SUPPLY_CHAIN' ? 'bg-indigo-500 text-white shadow-lg' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        دورة الإمداد والمطابقة الرقابية
                    </button>
                    <button 
                        onClick={() => setActiveTab('PO')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'PO' ? 'bg-indigo-500 text-white shadow-lg' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        Purchase Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('BILLS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'BILLS' ? 'bg-indigo-500 text-white shadow-lg' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        Bills & Expenses
                    </button>
                    <button 
                        onClick={() => setActiveTab('VENDORS')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'VENDORS' ? 'bg-indigo-500 text-white shadow-lg' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        Vendors
                    </button>
                </div>
            </div>

            {activeTab === 'PO' && <PurchaseOrderList />}
            {activeTab === 'BILLS' && <BillList />}
            {activeTab === 'VENDORS' && <VendorList />}
            {activeTab === 'SUPPLY_CHAIN' && <SupplyChainCycle />}
        </div>
    );
};
