
import React, { useState } from 'react';
import { POSPermissions } from '../../types';
import { AlertCircle } from 'lucide-react';

export const PermissionSettings: React.FC = () => {
  const [permissions, setPermissions] = useState<POSPermissions>({
      allowVoid: true,
      allowDiscount: true,
      requireManagerCodeForVoid: true,
      maxDiscountPercent: 20,
      allowManualPrice: false
  });

  return (
      <div className="max-w-3xl space-y-6 animate-fade-in">
          <div className="bg-surface-highlight/20 border border-border rounded-xl p-4 flex items-start gap-3 text-sm text-on-surface-muted mb-6">
              <AlertCircle className="h-5 w-5 text-primary shrink-0" />
              <p>These settings control what actions staff members can perform on the POS terminal without Manager approval.</p>
          </div>

          <div className="space-y-4">
              {[
                  { key: 'allowVoid', label: 'Allow Order Voiding', desc: 'Cashiers can cancel entire orders.' },
                  { key: 'allowDiscount', label: 'Allow Discretionary Discounts', desc: 'Cashiers can apply manual discounts.' },
                  { key: 'allowManualPrice', label: 'Manual Price Entry', desc: 'Cashiers can enter custom prices for items.' },
                  { key: 'requireManagerCodeForVoid', label: 'Require Manager Code for Voids', desc: 'Prompt for manager PIN when voiding items.' },
              ].map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                      <div>
                          <h3 className="font-bold text-on-surface text-sm">{perm.label}</h3>
                          <p className="text-xs text-on-surface-muted mt-0.5">{perm.desc}</p>
                      </div>
                      <button 
                        onClick={() => setPermissions({ ...permissions, [perm.key]: !permissions[perm.key as keyof POSPermissions] })}
                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${permissions[perm.key as keyof POSPermissions] ? 'bg-primary' : 'bg-surface-highlight border border-border'}`}
                      >
                          <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${permissions[perm.key as keyof POSPermissions] ? 'translate-x-7 left-0' : 'translate-x-1 left-0'}`}></div>
                      </button>
                  </div>
              ))}

              <div className="p-4 bg-background border border-border rounded-xl">
                   <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-on-surface text-sm">Max Discount Percentage</h3>
                        <span className="font-mono font-bold text-primary">{permissions.maxDiscountPercent}%</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" 
                     max="100" 
                     value={permissions.maxDiscountPercent}
                     onChange={(e) => setPermissions({...permissions, maxDiscountPercent: parseInt(e.target.value)})}
                     className="w-full accent-primary" 
                   />
                   <p className="text-xs text-on-surface-muted mt-2">Limits the maximum discount a cashier can apply to a single item.</p>
              </div>
          </div>
      </div>
  );
};
