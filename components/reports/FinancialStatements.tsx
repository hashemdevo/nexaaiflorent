import React, { useState, useEffect } from 'react';
import { StandardToggle } from './financials/StandardToggle';
import { IncomeStatement } from './financials/IncomeStatement';
import { BalanceSheet } from './financials/BalanceSheet';
import { AccountingStandard } from '../../services/accounting/standards';
import { PartnerLedgerService, PartnerLedgerEntry } from '../../services/pos/partnerLedgerService';
import { 
    Coins, FileText, Users, Eye, Search, AlertTriangle, 
    CheckCircle2, RefreshCw, ChevronLeft, Calendar
} from 'lucide-react';

export const FinancialStatements: React.FC<{ readOnly?: boolean }> = ({ readOnly }) => {
    const [standard, setStandard] = useState<AccountingStandard>('GAAP');
    const [activeTab, setActiveTab] = useState<'statements' | 'partners_audit'>('statements');
    
    // Partner Audit States
    const [partners, setPartners] = useState<any[]>([]);
    const [selectedPartnerEmail, setSelectedPartnerEmail] = useState<string | null>(null);
    const [selectedPartnerName, setSelectedPartnerName] = useState<string>('');
    const [selectedPartnerEntries, setSelectedPartnerEntries] = useState<PartnerLedgerEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isLoadingPartners, setIsLoadingPartners] = useState<boolean>(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

    // Fetch reports
    const loadPartnersData = async () => {
        setIsLoadingPartners(true);
        try {
            const data = await PartnerLedgerService.getPartnersBreakdown();
            setPartners(data);
            if (data.length > 0 && !selectedPartnerEmail) {
                setSelectedPartnerEmail(data[0].email);
                setSelectedPartnerName(data[0].name);
            }
        } catch (err) {
            console.error("Failed to load partners audit data", err);
        } finally {
            setIsLoadingPartners(false);
        }
    };

    const loadPartnerEntries = async (email: string) => {
        setIsLoadingDetails(true);
        try {
            const data = await PartnerLedgerService.getEntries(email);
            setSelectedPartnerEntries(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'partners_audit') {
            loadPartnersData();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedPartnerEmail) {
            loadPartnerEntries(selectedPartnerEmail);
        }
    }, [selectedPartnerEmail]);

    const filteredPartners = partners.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate chronological running statement
    const getChronologicalEntries = () => {
        const sorted = [...selectedPartnerEntries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        let accumulator = 0;
        return sorted.map(e => {
            if (e.type === 'DEPOSIT') {
                accumulator += e.amount;
            } else {
                accumulator -= e.amount;
            }
            return { ...e, runningBalance: accumulator };
        }).reverse();
    };

    const detailedAuditEntries = getChronologicalEntries();

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto" id="financial-statements-audit-view">
            
            {/* Main Header with tab switchers */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 border-b border-border/40 pb-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
                        <FileText className="h-8 w-8 text-primary" /> Reports & Financial Inspections
                    </h2>
                    <p className="text-xs text-on-surface-muted mt-1">
                        Inspect formal financial ledgers, GAAP standard statements, and legal partner inspections (حق الاطلاع للشركاء)
                    </p>
                </div>
                
                {/* Switchers */}
                <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto">
                    <button
                        onClick={() => setActiveTab('statements')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'statements' ? 'bg-primary text-black' : 'bg-surface hover:bg-zinc-800 text-zinc-300'}`}
                    >
                        <FileText className="h-4 w-4" /> القوائم المالية الأساسية (Income & Balance)
                    </button>
                    <button
                        onClick={() => setActiveTab('partners_audit')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === 'partners_audit' ? 'bg-amber-500 text-black shadow-glow-amber' : 'bg-surface hover:bg-zinc-800 text-zinc-300'}`}
                    >
                        <Users className="h-4 w-4" /> حق الاطلاع: تدقيق حساب الشركاء الجاري
                    </button>
                </div>
            </div>

            {/* TAB: Standard Statements */}
            {activeTab === 'statements' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 bg-surface/40 p-4 rounded-2xl border border-border/50">
                        <div>
                            <h3 className="font-bold text-md text-white">GAAP/IFRS standard income accounting and net assets</h3>
                            <p className="text-[11px] text-zinc-400">Manage real-time tax classifications & standards mapping</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <StandardToggle standard={standard} onChange={setStandard} />
                            {!readOnly && (
                                <button className="bg-surface hover:bg-zinc-850 border border-border text-on-surface px-6 py-2 rounded-xl transition font-bold text-xs uppercase tracking-wider">
                                    Export PDF ({standard})
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <IncomeStatement standard={standard} readOnly={readOnly} />
                        <BalanceSheet standard={standard} />
                    </div>
                </div>
            )}

            {/* TAB: Partner Ledgers Audit Report (حق الاطلاع للشركاء) */}
            {activeTab === 'partners_audit' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in bg-surface/20 border border-border rounded-3xl p-6 shadow-xl">
                    
                    {/* Partners Lists (Left 5 columns) */}
                    <div className="lg:col-span-4 space-y-4 border-r border-border/30 pr-0 lg:pr-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-black text-amber-500 uppercase flex items-center gap-1.5">
                                <Coins className="h-4 w-4" /> شركاء الشركة المقيدين
                            </h3>
                            <button onClick={loadPartnersData} className="text-zinc-400 hover:text-white transition">
                                <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            يقيد هذا التقرير التفصيلي كافة المسحوبات والإيداعات لجميع مساهمي الشركة، تفعيلاً للمبدأ القانوني والمالي الكفيل بحق الاطلاع والشفافية التامة بين الشركاء.
                        </p>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                            <input 
                                type="text"
                                placeholder="البحث باسم الشريك..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        {isLoadingPartners ? (
                            <div className="text-center py-8 text-xs text-zinc-500">جاري سحب أرصدة الشركاء...</div>
                        ) : (
                            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                                {filteredPartners.map(p => {
                                    const hasExceeded = p.balance < 0 && Math.abs(p.balance) > p.limit;
                                    const isSelected = selectedPartnerEmail === p.email;
                                    return (
                                        <div 
                                            key={p.email}
                                            onClick={() => {
                                                setSelectedPartnerEmail(p.email);
                                                setSelectedPartnerName(p.name);
                                            }}
                                            className={`p-3.5 rounded-xl border cursor-pointer transition flex justify-between items-center text-right ${isSelected ? 'bg-amber-500/10 border-amber-500/40' : 'bg-background hover:bg-zinc-805 border-border/60'}`}
                                        >
                                            <div className="text-left font-mono">
                                                <span className={`text-xs font-bold font-mono ${p.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    ${p.balance.toFixed(2)}
                                                </span>
                                                {hasExceeded && (
                                                    <span className="block text-[8px] bg-red-500 text-white font-extrabold px-1 rounded uppercase mt-1 w-fit ml-auto">
                                                        LIMIT WARN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-xs font-bold text-white uppercase">{p.name}</p>
                                                <p className="text-[10px] text-zinc-550 font-mono">{p.email}</p>
                                                <p className="text-[10px] text-zinc-400">سقف السحب الآمن: ${p.limit.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Detailed inspection ledger (Right 8 columns) */}
                    <div className="lg:col-span-8 space-y-4 pl-0 lg:pl-2">
                        {selectedPartnerEmail ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-background border border-border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                    <div>
                                        <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                                            <Eye className="h-4 w-4 text-amber-500" />
                                            دفتر كشف الحساب والمسحوبات للشركاء: {selectedPartnerName}
                                        </h4>
                                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{selectedPartnerEmail}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                        <Calendar className="h-4 w-4" />
                                        <span>تاريخ جلب البيانات: الفعلي التراكمي</span>
                                    </div>
                                </div>

                                {isLoadingDetails ? (
                                    <div className="text-center py-24 text-xs text-zinc-500">جاري تفصيل دفتر الأستاذ والمزدوج...</div>
                                ) : (
                                    <div className="border border-border rounded-xl overflow-hidden bg-zinc-950/20 max-h-[380px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-right text-xs" dir="rtl">
                                            <thead>
                                                <tr className="bg-zinc-900 border-b border-border text-zinc-400 font-bold">
                                                    <th className="p-3">تاريخ الحركة</th>
                                                    <th className="p-3 text-right">البيان والشرح بالعربي</th>
                                                    <th className="p-3 text-left">مدين (سحب عيني/صرف)</th>
                                                    <th className="p-3 text-left">دائن (إيداع/تغذية خزينة)</th>
                                                    <th className="p-3 text-left">الرصيد الجاري</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/20">
                                                {detailedAuditEntries.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="p-12 text-center text-zinc-500 italic">
                                                            لا توجد معاملات مسجلة في جاري الشريك للشربك المحدد.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    detailedAuditEntries.map(ent => (
                                                        <tr key={ent.id} className="hover:bg-zinc-800/40">
                                                            <td className="p-3 font-mono text-[10px] text-zinc-400">
                                                                {new Date(ent.createdAt).toLocaleDateString('ar', {
                                                                    year: 'numeric', month: 'numeric', day: 'numeric',
                                                                    hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </td>
                                                            <td className="p-3 font-medium text-white">
                                                                <div className="flex flex-col">
                                                                    <span>{ent.description}</span>
                                                                    {ent.orderNumber && (
                                                                        <span className="text-[9px] text-amber-500 font-mono">المرجع: #{ent.orderNumber}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-3 font-mono text-left text-rose-400 font-bold">
                                                                {ent.type === 'WITHDRAWAL' ? `$${ent.amount.toFixed(2)}` : '-'}
                                                            </td>
                                                            <td className="p-3 font-mono text-left text-emerald-400 font-bold">
                                                                {ent.type === 'DEPOSIT' ? `$${ent.amount.toFixed(2)}` : '-'}
                                                            </td>
                                                            <td className={`p-3 font-mono text-left font-bold ${ent.runningBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                ${ent.runningBalance.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-24 text-zinc-500 border border-dashed border-border/50 rounded-2xl">
                                <Coins className="h-10 w-10 mx-auto text-zinc-650 mb-2 animate-bounce" />
                                <p className="text-xs">يرجى اختيار شريك من القائمة اليمنى لعرض تقريره وتدقيق حركاته المالية الموثقة بالمقاصة</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
