
import React, { useState } from 'react';
import { Store, Package, Settings, Shield, Save, Users, Check, Loader2 } from 'lucide-react';
import { POSManagementProps } from '../types';
import { ProductManager } from './pos/ProductManager';
import { StaffManager } from './pos/StaffManager';
import { StoreSettings } from './pos/StoreSettings';
import { PermissionSettings } from './pos/PermissionSettings';

export const POSManagement: React.FC<POSManagementProps> = ({ cashiers, onUpdateCashiers }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'permissions' | 'staff'>('products');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const handleSaveChanges = () => {
      setSaveStatus('saving');
      // Simulate API save delay
      setTimeout(() => {
          setSaveStatus('success');
          setTimeout(() => {
              setSaveStatus('idle');
          }, 2000);
      }, 1000);
  };

  return (
    <div className="p-6 animate-fade-in max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                <Store className="h-8 w-8 text-secondary" /> POS Manager
            </h1>
            <p className="text-on-surface-muted mt-1">Configure terminal settings, products, and staff permissions.</p>
        </div>
        <button 
            onClick={handleSaveChanges}
            disabled={saveStatus !== 'idle'}
            className={`px-6 py-2.5 rounded-xl font-bold shadow-glow-primary transition flex items-center gap-2 min-w-[160px] justify-center
                ${saveStatus === 'success' ? 'bg-secondary text-white shadow-glow-secondary' : 'bg-primary hover:bg-primary-hover text-white'}
            `}
        >
            {saveStatus === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveStatus === 'success' ? (
                <Check className="h-4 w-4" />
            ) : (
                <Save className="h-4 w-4" />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border pb-1 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 text-sm font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'text-primary border-primary' : 'text-on-surface-muted border-transparent hover:text-on-surface'}`}
          >
              <Package className="h-4 w-4" /> Products
          </button>
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-3 text-sm font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${activeTab === 'staff' ? 'text-primary border-primary' : 'text-on-surface-muted border-transparent hover:text-on-surface'}`}
          >
              <Users className="h-4 w-4" /> Staff & Access
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 text-sm font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${activeTab === 'settings' ? 'text-primary border-primary' : 'text-on-surface-muted border-transparent hover:text-on-surface'}`}
          >
              <Settings className="h-4 w-4" /> Store Settings
          </button>
          <button 
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-3 text-sm font-bold flex items-center gap-2 transition border-b-2 whitespace-nowrap ${activeTab === 'permissions' ? 'text-primary border-primary' : 'text-on-surface-muted border-transparent hover:text-on-surface'}`}
          >
              <Shield className="h-4 w-4" /> Permissions
          </button>
      </div>

      {/* Content Area */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-border min-h-[500px]">
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'staff' && <StaffManager cashiers={cashiers} onUpdateCashiers={onUpdateCashiers} />}
          {activeTab === 'settings' && <StoreSettings />}
          {activeTab === 'permissions' && <PermissionSettings />}
      </div>
    </div>
  );
};
