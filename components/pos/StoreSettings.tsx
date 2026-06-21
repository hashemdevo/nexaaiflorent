
import React, { useState, useEffect } from 'react';
import { POSSettings, ServiceType } from '../../types';
import { Plus, Trash2, Save, Check } from 'lucide-react';

function Percent(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}

export const StoreSettings: React.FC = () => {
  const [settings, setSettings] = useState<POSSettings>(() => {
      const stored = localStorage.getItem('nexa_pos_settings');
      if (stored) return JSON.parse(stored);
      return {
          defaultTaxRate: 8.0,
          currencySymbol: '$',
          storeName: 'Nexa Coffee & Co.',
          receiptHeader: 'Welcome to Nexa',
          receiptFooter: 'Thank you for your visit!',
          serviceTypes: [
              { id: 'st1', name: 'Dine In', taxRate: 14 },
              { id: 'st2', name: 'Take Away', taxRate: 5 },
              { id: 'st3', name: 'Delivery', taxRate: 14 }
          ]
      };
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
      localStorage.setItem('nexa_pos_settings', JSON.stringify(settings));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
  };

  const updateServiceType = (id: string, field: keyof ServiceType, value: any) => {
      setSettings(prev => ({
          ...prev,
          serviceTypes: prev.serviceTypes.map(st => st.id === id ? { ...st, [field]: value } : st)
      }));
  };

  const addServiceType = () => {
      setSettings(prev => ({
          ...prev,
          serviceTypes: [...prev.serviceTypes, { id: `st-${Date.now()}`, name: 'New Service', taxRate: 0 }]
      }));
  };

  const removeServiceType = (id: string) => {
      setSettings(prev => ({
          ...prev,
          serviceTypes: prev.serviceTypes.filter(st => st.id !== id)
      }));
  };

  return (
      <div className="max-w-2xl space-y-8 animate-fade-in">
          {/* General Info */}
          <div className="space-y-6">
              <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider border-b border-border pb-2">General Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">Store Name</label>
                      <input 
                        type="text" 
                        value={settings.storeName}
                        onChange={e => setSettings({...settings, storeName: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">Currency Symbol</label>
                      <input 
                        type="text" 
                        value={settings.currencySymbol}
                        onChange={e => setSettings({...settings, currencySymbol: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary font-mono"
                      />
                  </div>
              </div>
          </div>

          {/* Service Types & Tax */}
          <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                  <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider">Service Types & Tax</h3>
                  <button onClick={addServiceType} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Add Service
                  </button>
              </div>
              
              <div className="space-y-3">
                  {settings.serviceTypes.map(st => (
                      <div key={st.id} className="flex items-center gap-4 bg-background border border-border p-3 rounded-xl">
                          <input 
                            type="text"
                            value={st.name}
                            onChange={(e) => updateServiceType(st.id, 'name', e.target.value)}
                            className="flex-1 bg-transparent text-sm font-bold text-on-surface outline-none border-b border-transparent focus:border-primary"
                            placeholder="Service Name"
                          />
                          <div className="flex items-center gap-2">
                              <span className="text-xs text-on-surface-muted">Tax %</span>
                              <input 
                                type="number"
                                value={st.taxRate}
                                onChange={(e) => updateServiceType(st.id, 'taxRate', parseFloat(e.target.value))}
                                className="w-16 bg-surface-highlight border border-border rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-primary font-mono"
                              />
                          </div>
                          <button onClick={() => removeServiceType(st.id)} className="text-on-surface-muted hover:text-danger p-1">
                              <Trash2 className="h-4 w-4" />
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Receipt Customization */}
          <div className="space-y-6">
              <h3 className="font-bold text-on-surface text-sm uppercase tracking-wider border-b border-border pb-2">Receipt</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">Header</label>
                      <textarea 
                        value={settings.receiptHeader}
                        onChange={e => setSettings({...settings, receiptHeader: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary h-24 resize-none"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">Footer</label>
                      <textarea 
                        value={settings.receiptFooter}
                        onChange={e => setSettings({...settings, receiptFooter: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary h-24 resize-none"
                      />
                  </div>
              </div>
          </div>

          <button 
            onClick={handleSave}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-glow-secondary ${isSaved ? 'bg-secondary text-white' : 'bg-primary text-black'}`}
          >
              {isSaved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
              {isSaved ? 'Settings Saved' : 'Save Changes'}
          </button>
      </div>
  );
};
