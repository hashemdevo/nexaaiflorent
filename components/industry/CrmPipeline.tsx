
import React, { useState, useEffect } from 'react';
import { Target, Phone, Mail, MoreHorizontal, Plus, Calendar, DollarSign, ArrowRight, Loader2, Bot, CheckCircle } from 'lucide-react';
import { db } from '../../services/firebaseConfig';
import { collection, query, getDocs, addDoc, updateDoc, doc, orderBy, setDoc } from 'firebase/firestore';
import { useApp } from '../../contexts/AppContext';

import { InvoiceService } from '../../services/sales/invoices';

export interface Deal {
    id?: string;
    title: string;
    client: string;
    value: number;
    stage: 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON';
    owner: string;
    date: string;
    createdAt?: string;
}

const COLUMNS = [
    { id: 'NEW', title: 'New Leads', color: 'border-blue-500', bg: 'bg-blue-500' },
    { id: 'QUALIFIED', title: 'Qualified', color: 'border-purple-500', bg: 'bg-purple-500' },
    { id: 'PROPOSAL', title: 'Proposal Sent', color: 'border-yellow-500', bg: 'bg-yellow-500' },
    { id: 'NEGOTIATION', title: 'Negotiation', color: 'border-orange-500', bg: 'bg-orange-500' },
    { id: 'WON', title: 'Closed Won', color: 'border-emerald-500', bg: 'bg-emerald-500' }
];

export const CrmPipeline: React.FC = () => {
    const { currentUserIdentity, currentUniversalRole } = useApp();
    const isSupervisoryRole = ['OWNER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'ADMIN', 'SYSTEM_ADMIN'].includes(currentUniversalRole || '');
    
    const [activeSalesRep, setActiveSalesRep] = useState<string>('صالح العتيبي');
    const [filterInitials, setFilterInitials] = useState<string>('SO');

    useEffect(() => {
        if (!isSupervisoryRole) {
            // Lock to Saleh Al-Otaibi (SO) for standard sales reps
            setActiveSalesRep('صالح العتيبي');
            setFilterInitials('SO');
        }
    }, [currentUniversalRole, isSupervisoryRole]);

    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDeal, setNewDeal] = useState<Partial<Deal>>({ stage: 'NEW', value: 0 });

    const fetchDeals = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'crm_deals'));
            const snap = await getDocs(q);
            const loaded = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal));
            
            if (loaded.length === 0) {
                // Seed realistic initial deals for Saleh Al-Otaibi (SO) and Sara Shammari (SS)
                const mockDeals: Deal[] = [
                    { title: 'عقد توريد صفقة مطابخ فنادق ريزيدنس', client: 'Hilton Arriyadh Residences', value: 85000, stage: 'PROPOSAL', owner: 'SO', date: 'May 24', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
                    { title: 'مبيعات منتجات التعبئة والتغليف الكرتوني', client: 'Al-Homaizi Food Group', value: 12400, stage: 'WON', owner: 'SO', date: 'May 25', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
                    { title: 'مناقصة توريد مواد خام مصنع المخابز الآلية', client: 'Al-Watan Baking Co.', value: 340000, stage: 'NEGOTIATION', owner: 'SS', date: 'May 26', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
                    { title: 'توريد عبوات حافظة للحرارة للمطعم الرئيسي', client: 'Shaya Group Restaurants', value: 4500, stage: 'NEW', owner: 'SS', date: 'May 28', createdAt: new Date().toISOString() }
                ];
                for (const d of mockDeals) {
                    await addDoc(collection(db, 'crm_deals'), d);
                }
                const refetchSnap = await getDocs(q);
                const reloaded = refetchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal));
                setDeals(reloaded.sort((a,b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()));
            } else {
                setDeals(loaded.sort((a,b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()));
            }
        } catch (e) {
            console.error("Failed to load deals:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const handleAddDeal = async () => {
        if (!newDeal.title || !newDeal.client) return;
        try {
            await addDoc(collection(db, 'crm_deals'), {
                ...newDeal,
                owner: isSupervisoryRole ? filterInitials : 'SO',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                createdAt: new Date().toISOString()
            });
            setShowAddModal(false);
            setNewDeal({ stage: 'NEW', value: 0 });
            fetchDeals();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateStage = async (dealId: string, currentStage: string) => {
        const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'];
        const idx = stages.indexOf(currentStage);
        if (idx < stages.length - 1) {
            const nextStage = stages[idx + 1];
            try {
                const deal = deals.find(d => d.id === dealId);
                await updateDoc(doc(db, 'crm_deals', dealId), { stage: nextStage });
                
                if (nextStage === 'WON' && deal) {
                    
                    // Create Invoice automatically
                    try {
                        await InvoiceService.createInvoice(
                            'AI-AUTO-CLIENT', 
                            [{ description: `Deal: ${deal.title}`, quantity: 1, unitPrice: deal.value, taxRate: 0, taxAmount: 0, total: deal.value }],
                            new Date().toISOString().split('T')[0],
                            new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] // Net 15
                        );
                    } catch(err) {
                        console.error('Failed AI Auto Invoicing', err);
                    }

                    setAutoInvoiceNotification({
                        show: true,
                        dealName: deal.title,
                        amount: deal.value,
                        client: deal.client
                    });
                    
                    // Auto-hide notification
                    setTimeout(() => {
                        setAutoInvoiceNotification(prev => ({ ...prev, show: false }));
                    }, 6000);
                }
                
                fetchDeals();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const [autoInvoiceNotification, setAutoInvoiceNotification] = useState<{show: boolean, dealName: string, amount: number, client: string}>({ show: false, dealName: '', amount: 0, client: '' });

    const filteredDeals = deals.filter(d => {
        if (isSupervisoryRole && filterInitials === 'ALL') return true;
        return d.owner === filterInitials;
    });

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1800px] mx-auto h-[calc(100vh-100px)] flex flex-col font-sans" dir="ltr">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Target className="h-8 w-8 text-primary" /> Sales Pipeline
                    </h1>
                    <p className="text-on-surface-muted mt-1">Manage leads, track deals, and forecast revenue directly on Firebase.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Sales Representative Custom Isolation Dropdown */}
                    <div className="bg-surface border border-border/80 rounded-2xl p-2 flex items-center gap-3">
                        <span className="text-xs font-semibold text-on-surface pl-1.5 flex items-center gap-1.5">
                            {isSupervisoryRole ? (
                                <span className="text-emerald-500 font-bold">⚖️ مراقبة ومراجعة المبيعات:</span>
                            ) : (
                                <span className="text-primary font-bold">👤 مبيعات الحساب المغلق:</span>
                            )}
                        </span>
                        <select 
                            value={filterInitials}
                            disabled={!isSupervisoryRole}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFilterInitials(val);
                                if (val === 'SO') setActiveSalesRep('صالح العتيبي');
                                else if (val === 'SS') setActiveSalesRep('سارة الشمري');
                            }}
                            className="bg-background border border-border/60 text-xs font-bold text-on-surface rounded-xl px-3 py-1.5 outline-none focus:border-primary disabled:opacity-95 disabled:text-on-surface/80 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <option value="SO">صالح العتيبي (Saleh Al-Otaibi)</option>
                            <option value="SS">سارة الشمري (Sara Shammari)</option>
                            {isSupervisoryRole && <option value="ALL">كافة مناديب المبيعات (Show All Agents)</option>}
                        </select>
                    </div>

                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-primary text-black font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(20,241,149,0.3)] hover:bg-primary/90 transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Deal
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                    <div className="flex gap-6 h-full min-w-[1200px]">
                        {COLUMNS.map(col => {
                            const columnDeals = filteredDeals.filter(d => d.stage === col.id);
                            const totalValue = columnDeals.reduce((acc, d) => acc + Number(d.value || 0), 0);

                            return (
                                <div key={col.id} className="flex-1 flex flex-col bg-surface/30 rounded-2xl border border-border min-w-[280px]">
                                    {/* Column Header */}
                                    <div className={`p-4 border-t-4 ${col.color} bg-surface rounded-t-2xl shadow-sm`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider">{col.title}</h3>
                                            <span className={`text-xs font-mono px-2 py-0.5 rounded-full text-white ${col.bg}`}>{columnDeals.length}</span>
                                        </div>
                                        <div className="text-xs text-on-surface-muted font-bold">
                                            Total: ${totalValue.toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Cards Container */}
                                    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 bg-surface-highlight/5">
                                        {columnDeals.map(deal => (
                                            <div key={deal.id} className="bg-surface p-4 rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition cursor-pointer group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                                                        ${Number(deal.value).toLocaleString()}
                                                    </span>
                                                    <button onClick={() => deal.id && handleUpdateStage(deal.id, deal.stage)} className="text-on-surface-muted hover:text-primary opacity-0 group-hover:opacity-100 transition" title="Advance Stage">
                                                        <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                
                                                <h4 className="font-bold text-on-surface mb-1 text-sm leading-tight truncate">{deal.title}</h4>
                                                <p className="text-xs text-on-surface-muted mb-3 truncate">{deal.client}</p>
                                                
                                                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                                                    <div className="w-6 h-6 rounded-full bg-surface-highlight border border-border flex items-center justify-center text-[9px] font-bold text-on-surface">
                                                        {deal.owner}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-on-surface-muted">
                                                        <Calendar className="h-3 w-3" /> {deal.date}
                                                    </div>
                                                </div>

                                                <div className="hidden group-hover:flex absolute right-2 bottom-2 gap-1 bg-surface rounded-lg shadow-xl border border-border p-1">
                                                    <button className="p-1.5 hover:bg-primary/20 rounded text-on-surface-muted hover:text-primary transition">
                                                        <Phone className="h-3 w-3" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-primary/20 rounded text-on-surface-muted hover:text-primary transition">
                                                        <Mail className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add Deal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <h2 className="text-xl font-bold text-on-surface mb-6">Create New Deal</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-muted mb-1">Deal Title</label>
                                <input 
                                    type="text" 
                                    value={newDeal.title || ''} 
                                    onChange={e => setNewDeal({...newDeal, title: e.target.value})}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none" 
                                    placeholder="e.g. Enterprise License"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-muted mb-1">Client Name</label>
                                <input 
                                    type="text" 
                                    value={newDeal.client || ''} 
                                    onChange={e => setNewDeal({...newDeal, client: e.target.value})}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none" 
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-muted mb-1">Deal Value ($)</label>
                                <input 
                                    type="number" 
                                    value={newDeal.value || ''} 
                                    onChange={e => setNewDeal({...newDeal, value: Number(e.target.value)})}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none font-mono" 
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-muted mb-1">Initial Stage</label>
                                <select 
                                    value={newDeal.stage} 
                                    onChange={e => setNewDeal({...newDeal, stage: e.target.value as any})}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none">
                                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-2.5 bg-surface-highlight text-on-surface font-bold rounded-xl hover:bg-border transition">
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddDeal}
                                className="flex-1 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition shadow-[0_0_15px_rgba(20,241,149,0.3)]">
                                Create Deal
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* AI Auto Invoice Notification */}
            {autoInvoiceNotification.show && (
                <div className="fixed bottom-6 right-6 bg-surface border border-primary p-4 rounded-xl shadow-[0_0_20px_rgba(20,241,149,0.2)] animate-fade-in z-50 flex items-start gap-4 max-w-sm">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                        <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-on-surface flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-primary" /> AI Automation Triggered
                        </h4>
                        <p className="text-sm text-on-surface-muted mb-2">Deal Won: <strong>{autoInvoiceNotification.dealName}</strong></p>
                        <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded inline-block">
                            Generated Invoice for ${autoInvoiceNotification.amount.toLocaleString()} + Automated Ledger Postings
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
