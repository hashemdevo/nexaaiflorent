
import React from 'react';
import { X, Save } from 'lucide-react';
import { Subscription } from '../../../services/subscriptionService';
import { IndustryType } from '../../../types';

interface ClientFormProps {
    isOpen: boolean;
    client: Partial<Subscription>;
    onClose: () => void;
    onSave: (e: React.FormEvent) => void;
    onChange: (updates: Partial<Subscription>) => void;
}

const INDUSTRIES: IndustryType[] = ['GENERIC', 'RESTAURANT', 'CONSTRUCTION', 'MEDICAL', 'PHARMACY', 'RETAIL', 'LOGISTICS', 'HOSPITAL', 'TRAVEL', 'MAINTENANCE'];

export const ClientForm: React.FC<ClientFormProps> = ({ isOpen, client, onClose, onSave, onChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-surface border border-border p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-muted hover:text-on-surface transition">
                    <X className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-on-surface mb-6">
                    {client.id ? 'Edit Client Profile' : 'Add New Company'}
                </h2>
                <form onSubmit={onSave} className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-2">Organization Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Company Name</label>
                                <input required type="text" value={client.company} onChange={(e) => onChange({company: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition" placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Industry</label>
                                <select value={client.industry} onChange={(e) => onChange({industry: e.target.value as IndustryType})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition">
                                    {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Address</label>
                                <input type="text" value={client.address} onChange={(e) => onChange({address: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition" placeholder="City, Country" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Contact Phone</label>
                                <input type="text" value={client.phone} onChange={(e) => onChange({phone: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition" placeholder="+1..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Contact Name (Owner)</label>
                                <input type="text" value={client.ownerName} onChange={(e) => onChange({ownerName: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition" placeholder="John Doe" />
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-2">Credentials</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Email (Login ID)</label>
                                <input required type="email" value={client.email} onChange={(e) => onChange({email: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition" placeholder="owner@acme.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Initial Password</label>
                                <input type="text" value={client.password || ''} onChange={(e) => onChange({password: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition" placeholder={client.id ? "Leave blank to keep" : "Default: welcome123"} />
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider border-b border-border pb-2">Subscription Plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Plan Type</label>
                                <select value={client.plan} onChange={(e) => onChange({plan: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition">
                                    <option>Standard</option>
                                    <option>Enterprise</option>
                                    <option>Premium</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Expiry Date</label>
                                <input type="date" value={client.expiry} onChange={(e) => onChange({expiry: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">User Limit</label>
                                <input type="number" value={client.users} onChange={(e) => onChange({users: parseInt(e.target.value)})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-primary transition" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4 border-t border-border">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition">Cancel</button>
                        <button type="submit" className="flex-1 py-3.5 rounded-xl bg-primary text-black font-bold shadow-glow-primary hover:bg-primary-hover transition flex items-center justify-center gap-2">
                            <Save className="h-5 w-5" /> Save Company
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
