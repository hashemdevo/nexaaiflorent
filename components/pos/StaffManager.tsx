
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Key, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { Cashier } from '../../types';
import { SecurityService } from '../../services/securityService';

interface StaffManagerProps {
    cashiers: Cashier[];
    onUpdateCashiers: (cashiers: Cashier[]) => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({ cashiers, onUpdateCashiers }) => {
  const [editingCashier, setEditingCashier] = useState<Cashier | null>(null);
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSaveCashier = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingCashier) return;

      // Password Validation
      if (editingCashier.password && editingCashier.password !== confirmPassword) {
          setPasswordError("Passwords do not match");
          return;
      }
      setPasswordError('');

      // Update via Props
      let newCashiers = [...cashiers];
      const existingIndex = newCashiers.findIndex(c => c.id === editingCashier.id);
      
      if (existingIndex >= 0) {
          newCashiers[existingIndex] = editingCashier;
      } else {
          newCashiers.push({ ...editingCashier, id: Math.random().toString(36).substr(2, 9) });
      }
      onUpdateCashiers(newCashiers);
      setIsCashierModalOpen(false);
      setEditingCashier(null);
      setConfirmPassword('');
  };

  const handleDeleteCashier = (id: string) => {
      onUpdateCashiers(cashiers.filter(c => c.id !== id));
  };

  const generate2FA = () => {
      if (!editingCashier) return;
      setEditingCashier({ ...editingCashier, twoFaSecret: SecurityService.generateRandomSecret() });
  };

  const openCashierModal = (cashier?: Cashier) => {
      if (cashier) {
          setEditingCashier(cashier);
          setConfirmPassword(cashier.password || '');
      } else {
          setEditingCashier({ id: '', name: '', role: 'cashier', password: '', hint: '', twoFaSecret: '' });
          setConfirmPassword('');
      }
      setPasswordError('');
      setIsCashierModalOpen(true);
  };

  return (
      <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-start">
              <div>
                  <h3 className="font-bold text-on-surface text-lg">Staff Management</h3>
                  <p className="text-sm text-on-surface-muted">Manage roles for POS, Kitchen, and Reception.</p>
              </div>
              <button 
                onClick={() => openCashierModal()}
                className="bg-surface hover:bg-surface-highlight border border-border text-on-surface px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition"
              >
                  <Plus className="h-4 w-4" /> Add Staff
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cashiers.map(cashier => (
                  <div key={cashier.id} className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 hover:border-primary/50 transition group">
                      <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                              <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${cashier.role === 'manager' ? 'bg-secondary' : 'bg-surface-highlight text-on-surface border border-border'}`}>
                                  {cashier.name.charAt(0)}
                              </div>
                              <div>
                                  <h4 className="font-bold text-on-surface">{cashier.name}</h4>
                                  <span className="text-xs text-on-surface-muted uppercase tracking-wide">{cashier.role}</span>
                              </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button onClick={() => openCashierModal(cashier)} className="p-2 hover:bg-surface-highlight rounded-lg text-primary">
                                  <Edit3 className="h-4 w-4" />
                              </button>
                              {cashier.role !== 'manager' && (
                                  <button onClick={() => handleDeleteCashier(cashier.id)} className="p-2 hover:bg-surface-highlight rounded-lg text-danger">
                                      <Trash2 className="h-4 w-4" />
                                  </button>
                              )}
                          </div>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-border flex items-center gap-2 text-xs text-on-surface-muted">
                          {cashier.twoFaSecret ? (
                              <span className="flex items-center gap-1 text-secondary"><ShieldCheck className="h-3 w-3" /> 2FA Active</span>
                          ) : (
                              <span className="flex items-center gap-1"><Key className="h-3 w-3" /> Standard</span>
                          )}
                          {cashier.hint && <span className="ml-auto italic">Hint: {cashier.hint}</span>}
                      </div>
                  </div>
              ))}
          </div>

          {/* CASHIER EDIT MODAL */}
          {isCashierModalOpen && editingCashier && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-surface border border-border p-6 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                      <h2 className="text-xl font-bold text-on-surface mb-6">
                          {editingCashier.id ? 'Edit Staff' : 'Add Staff'}
                      </h2>
                      <form onSubmit={handleSaveCashier} className="space-y-4">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-on-surface-muted uppercase">Name</label>
                              <input 
                                required
                                type="text" 
                                value={editingCashier.name}
                                onChange={e => setEditingCashier({...editingCashier, name: e.target.value})}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                              />
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs font-bold text-on-surface-muted uppercase">Role</label>
                              <div className="grid grid-cols-2 gap-2">
                                  {['cashier', 'manager', 'kitchen', 'reception'].map((r) => (
                                      <button 
                                        key={r}
                                        type="button"
                                        onClick={() => setEditingCashier({...editingCashier, role: r as any})}
                                        className={`py-2 rounded-lg border text-sm font-bold transition uppercase ${editingCashier.role === r ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-on-surface-muted hover:text-on-surface'}`}
                                      >
                                          {r}
                                      </button>
                                  ))}
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs font-bold text-on-surface-muted uppercase">Password</label>
                              <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-on-surface-muted" />
                                  <input 
                                    type="password" 
                                    value={editingCashier.password || ''}
                                    onChange={e => setEditingCashier({...editingCashier, password: e.target.value})}
                                    placeholder="Access Code"
                                    className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-on-surface outline-none focus:border-primary"
                                  />
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs font-bold text-on-surface-muted uppercase">Confirm Password</label>
                              <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm"
                                className={`w-full bg-background border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary transition ${passwordError ? 'border-danger ring-1 ring-danger' : 'border-border'}`}
                              />
                              {passwordError && <p className="text-xs text-danger font-bold mt-1">{passwordError}</p>}
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs font-bold text-on-surface-muted uppercase">Password Hint</label>
                              <input 
                                type="text" 
                                value={editingCashier.hint || ''}
                                onChange={e => setEditingCashier({...editingCashier, hint: e.target.value})}
                                placeholder="Optional"
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                              />
                          </div>

                          {/* 2FA Section */}
                          <div className="p-4 bg-surface-highlight/20 border border-border rounded-xl mt-4">
                              <div className="flex justify-between items-center mb-2">
                                  <label className="text-xs font-bold text-on-surface-muted uppercase flex items-center gap-2">
                                      <ShieldCheck className="h-3 w-3" /> Two-Factor Auth
                                  </label>
                                  <button 
                                    type="button"
                                    onClick={generate2FA}
                                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                                  >
                                      <RefreshCw className="h-3 w-3" /> Generate New
                                  </button>
                              </div>
                              {editingCashier.twoFaSecret ? (
                                  <div className="bg-black/20 p-2 rounded text-xs font-mono text-on-surface break-all border border-border">
                                      {editingCashier.twoFaSecret}
                                  </div>
                              ) : (
                                  <div className="text-xs text-on-surface-muted italic">No 2FA configured.</div>
                              )}
                          </div>

                          <div className="pt-4 flex gap-3">
                              <button 
                                 type="button"
                                 onClick={() => setIsCashierModalOpen(false)}
                                 className="flex-1 py-2.5 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition"
                              >
                                  Cancel
                              </button>
                              <button 
                                 type="submit"
                                 className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold shadow-glow-primary hover:bg-primary-hover transition"
                              >
                                  Save Staff
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );
};
