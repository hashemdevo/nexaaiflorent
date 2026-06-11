
import React, { useState } from 'react';
import { Package, Scan, Layers, BookOpen, Calculator, Scale, Globe } from 'lucide-react';
import { InventoryProps } from '../types';
import { InventoryList } from './inventory/InventoryList';
import { InventoryScanner } from './inventory/InventoryScanner';
import { RecipeManagement } from './inventory/RecipeManagement';
import { CostAllocation } from './inventory/CostAllocation';
import { SupplyChainCycle } from './inventory/SupplyChainCycle';
import { GlobalStock } from './inventory/GlobalStock';
import { useApp } from '../contexts/AppContext';

export const Inventory: React.FC<InventoryProps> = ({ readOnly }) => {
    const { currentUniversalRole } = useApp();
    const [activeTab, setActiveTab] = useState<'list' | 'scan' | 'recipes' | 'costs' | 'supply_chain' | 'global_stock'>('list');

    // Role-based visibility flags
    const isSalesRep = currentUniversalRole === 'SALES_REP';
    const isPurchasingSpecialist = currentUniversalRole === 'PURCHASING_SPECIALIST';

    return (
        <div className="p-6 animate-fade-in max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" /> Inventory Management
                    </h1>
                    <p className="text-on-surface-muted mt-1">Track stock, manage suppliers, compile recipe lists (BOM), distribute to cost centers, and capitalize landed fees.</p>
                </div>
                {!readOnly && (
                    <div className="flex gap-2 bg-surface p-1 rounded-xl border border-border flex-wrap z-10">
                        {/* Global Stock visible to Sales Rep, Purchasing, and Admins */}
                        <button 
                            onClick={() => setActiveTab('global_stock')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'global_stock' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                        >
                            <Globe className="h-4 w-4" /> Global Stock & Transfers (الفروع)
                        </button>

                        {/* Supply Chain ONLY visible to Purchasing and Admins */}
                        {!isSalesRep && (
                            <button 
                                onClick={() => setActiveTab('supply_chain')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'supply_chain' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                            >
                                <Scale className="h-4 w-4" /> دورة الإمداد والمطابقة الرقابية
                            </button>
                        )}

                        {/* Cost & valuation ONLY visible to Admins/Accountants */}
                        {!isSalesRep && !isPurchasingSpecialist && (
                            <button 
                                onClick={() => setActiveTab('costs')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'costs' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                            >
                                <Calculator className="h-4 w-4" /> Cost Centers & Valuation
                            </button>
                        )}

                        {/* Recipes ONLY visible to Admins/Accountants */}
                        {!isSalesRep && !isPurchasingSpecialist && (
                            <button 
                                onClick={() => setActiveTab('recipes')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'recipes' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                            >
                                <BookOpen className="h-4 w-4" /> Recipes (BOM)
                            </button>
                        )}

                        {/* Scanner ONLY visible to Admins/Purchasing/Storekeepers */}
                        {!isSalesRep && (
                            <button 
                                onClick={() => setActiveTab('scan')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'scan' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                            >
                                <Scan className="h-4 w-4" /> Smart Scan
                            </button>
                        )}

                        {/* Stock List always visible */}
                        <button 
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'list' ? 'bg-surface-highlight text-on-surface shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}
                        >
                            <Layers className="h-4 w-4" /> Stock List
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'list' && <InventoryList readOnly={readOnly} />}
            {activeTab === 'scan' && !readOnly && <InventoryScanner readOnly={readOnly} />}
            {activeTab === 'recipes' && <RecipeManagement />}
            {activeTab === 'costs' && !readOnly && <CostAllocation />}
            {activeTab === 'supply_chain' && !readOnly && <SupplyChainCycle />}
            {activeTab === 'global_stock' && <GlobalStock />}
        </div>
    );
};
