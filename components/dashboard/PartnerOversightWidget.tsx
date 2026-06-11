import React, { useState, useEffect } from 'react';
import { PartnerLedgerService, PartnerLedgerEntry } from '../../services/pos/partnerLedgerService';
import { 
    Users, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle,
    History, Search, RefreshCcw, FileSpreadsheet, ArrowLeftRight, Coins
} from 'lucide-react';

export const PartnerOversightWidget: React.FC = () => {
    const [partners, setPartners] = useState<any[]>([]);
    const [selectedPartnerEmail, setSelectedPartnerEmail] = useState<string | null>(null);
    const [selectedPartnerName, setSelectedPartnerName] = useState<string>('');
    const [selectedPartnerEntries, setSelectedPartnerEntries] = useState<PartnerLedgerEntry[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    // Fetch partners breakdown summary list
    const fetchPartnersBreakdown = async () => {
        setIsLoading(true);
        try {
            const data = await PartnerLedgerService.getPartnersBreakdown();
            setPartners(data);
            
            // Auto select the first partner for detail ledger viewing
            if (data.length > 0 && !selectedPartnerEmail) {
                setSelectedPartnerEmail(data[0].email);
                setSelectedPartnerName(data[0].name);
            }
        } catch (err) {
            console.error("Error fetching partner breakdown details for CFO", err);
            setErrorMsg('فشل سحب تفاصيل أرصدة الشركاء من خادم قاعدة البيانات.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch details when partner email changes
    const fetchPartnerDetails = async (email: string) => {
        setIsDetailLoading(true);
        try {
            const data = await PartnerLedgerService.getEntries(email);
            setSelectedPartnerEntries(data);
        } catch (err) {
            console.error("Error fetching partner ledger entries", err);
        } finally {
            setIsDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchPartnersBreakdown();
    }, []);

    useEffect(() => {
        if (selectedPartnerEmail) {
            fetchPartnerDetails(selectedPartnerEmail);
        }
    }, [selectedPartnerEmail]);

    // Calculate chronological running balance for detailed viewer
    const getChronologicalEntries = () => {
        const sortedChronological = [...selectedPartnerEntries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        let balAccumulator = 0;
        const mapped = sortedChronological.map(entry => {
            if (entry.type === 'DEPOSIT') {
                balAccumulator += entry.amount;
            } else {
                balAccumulator -= entry.amount;
            }
            return {
                ...entry,
                runningBalance: balAccumulator
            };
        });
        return [...mapped].reverse(); // Newest first
    };

    const detailedDisplayEntries = getChronologicalEntries();

    // Aggregates
    const overallNetDebts = partners.reduce((sum, p) => p.balance < 0 ? sum + Math.abs(p.balance) : sum, 0);
    const overallNetCredits = partners.reduce((sum, p) => p.balance >= 0 ? sum + p.balance : sum, 0);

    return (
        <div id="partner-oversight-widget-card" className="bg-surface border border-border/80 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all hover:border-amber-500/30">
            {/* Top Cyan Bar Flag for financial managers */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-400" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                             لوحة رقابة وضوابط جاري الشركاء (CFO Partner Compliance Gate)
                        </h3>
                        <p className="text-xs text-on-surface-muted">
                            مراقبة مديونيات السحب العيني والإيداع النقدي لكافة مساهمي وشركاء الشركة للحد من تجاوز حدود الأرصدة
                        </p>
                    </div>
                </div>
                <button 
                    onClick={fetchPartnersBreakdown}
                    disabled={isLoading}
                    className="p-2 hover:bg-surface-highlight text-on-surface-muted hover:text-on-surface rounded-xl transition"
                    title="تحديث البيانات"
                >
                    <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Quick CFO Stats Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-2xl border border-border bg-surface-highlight/10">
                    <div className="text-xs font-semibold text-on-surface-muted mb-1">الشركاء المقيدين بالنظام</div>
                    <div className="text-2xl font-black font-mono tracking-tight text-white">
                        {partners.length} شركاء
                    </div>
                    <div className="text-[10px] text-on-surface-muted mt-1">توليد تلقائي مع فتح الحساب</div>
                </div>

                <div className="p-4 rounded-2xl border border-rose-500/10 bg-rose-500/5">
                    <div className="text-xs font-semibold text-rose-400 mb-1">إجمالي ذمم المسحوبات المستحقة</div>
                    <div className="text-2xl font-black font-mono tracking-tight text-rose-400">
                        ${overallNetDebts.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-on-surface-muted mt-1">مبالغ مسحوبة تتطلب سداداً خزائنياً</div>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
                    <div className="text-xs font-semibold text-emerald-400 mb-1">صافي الأرصدة الدائنة المستحقة للشياك</div>
                    <div className="text-2xl font-black font-mono tracking-tight text-emerald-400">
                        ${overallNetCredits.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-on-surface-muted mt-1">تمويل فائض من الشركاء لدعم رأس المال</div>
                </div>

                <div className="p-4 rounded-2xl border border-amber-500/10 bg-amber-500/5">
                    <div className="text-xs font-semibold text-amber-500 mb-1">شركاء تجاوزوا حدود السحب</div>
                    <div className="text-2xl font-black font-mono tracking-tight text-amber-400">
                        {partners.filter(p => p.balance < 0 && Math.abs(p.balance) > p.limit).length} شركاء
                    </div>
                    <div className="text-[10px] text-on-surface-muted mt-1">يتطلب تنبيههم فوريا للمطابقة</div>
                </div>
            </div>

            {/* Grid Split: Left (Partner compliance lists) - Right (Audit detailed ledger view) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Partners Compliance Overview Table Grid */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowLeftRight className="h-4 w-4 text-cyan-400" />
                        <h4 className="text-sm font-bold text-on-surface">ملخّص أرصدة الحسابات الجارية وضوابط الامتثال للشركاء</h4>
                    </div>

                    <div className="border border-border rounded-2xl overflow-hidden bg-surface-highlight/5">
                        <table className="w-full text-right border-collapse text-xs" dir="rtl">
                            <thead>
                                <tr className="bg-surface-highlight/20 border-b border-border text-on-surface-muted font-bold text-right">
                                    <th className="p-3 text-right">اسم الشريك والبريد</th>
                                    <th className="p-3 text-left">الرصيد الجاري الحالي</th>
                                    <th className="p-3 text-left">إجمالي الإيداعات</th>
                                    <th className="p-3 text-left">إجمالي السحب</th>
                                    <th className="p-3 text-center">الالتزام بالحدود الرقابية</th>
                                    <th className="p-3 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-on-surface-muted">
                                            جاري تحميل تقارير الامتظام لأرصدة الشركاء...
                                        </td>
                                    </tr>
                                ) : partners.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-on-surface-muted">
                                            لا توجد سجلات شركاء معرفة في النظام حتى الآن.
                                        </td>
                                    </tr>
                                ) : (
                                    partners.map((partner) => {
                                        const isOverLimit = partner.balance < 0 && Math.abs(partner.balance) > partner.limit;
                                        const isSelected = selectedPartnerEmail === partner.email;
                                        
                                        return (
                                            <tr 
                                                key={partner.email} 
                                                className={`border-b border-border/40 hover:bg-surface-highlight/20 transition ${
                                                    isSelected ? 'bg-cyan-500/5 border-r-[3px] border-r-cyan-400' : ''
                                                }`}
                                            >
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                                                            isSelected ? 'bg-cyan-500 text-black' : 'bg-surface-highlight text-on-surface'
                                                        }`}>
                                                            {partner.name.substring(0, 2)}
                                                        </div>
                                                        <div className="flex flex-col text-right">
                                                            <span className="font-bold text-on-surface">{partner.name}</span>
                                                            <span className="text-[10px] text-on-surface-muted font-mono">{partner.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={`p-3 font-mono font-bold text-left ${
                                                    partner.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                    {partner.balance >= 0 ? '+' : ''}${partner.balance.toFixed(2)}
                                                </td>
                                                <td className="p-3 font-mono text-left text-on-surface-muted">
                                                    ${partner.deposits.toFixed(2)}
                                                </td>
                                                <td className="p-3 font-mono text-left text-on-surface-muted">
                                                    ${partner.withdrawals.toFixed(2)}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {isOverLimit ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                            <AlertTriangle className="h-3 w-3 shrink-0" /> تنبيه: تجاوز السقف
                                                        </span>
                                                    ) : partner.balance < 0 ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                            سحب تحت السقف
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <CheckCircle2 className="h-3 w-3 shrink-0" /> ملتزم ممتاز
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedPartnerEmail(partner.email);
                                                            setSelectedPartnerName(partner.name);
                                                        }}
                                                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1.5 mx-auto ${
                                                            isSelected 
                                                            ? 'bg-cyan-500 text-black shadow-cyan-500/15 font-black'
                                                            : 'bg-surface-highlight text-on-surface-muted hover:text-on-surface'
                                                        }`}
                                                    >
                                                        <History className="h-3 w-3" /> تدقيق تفصيلي
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Detailed Audit Ledger view for Selected Partner */}
                <div className="lg:col-span-5 bg-surface-highlight/10 border border-border/80 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5 text-cyan-400" />
                                <h4 className="text-sm font-bold text-on-surface">سجل دفتر الأستاذ التفصيلي: {selectedPartnerName || 'اختر شريكاً'}</h4>
                            </div>
                            {isDetailLoading && (
                                <RefreshCcw className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                            )}
                        </div>

                        <p className="text-xs text-on-surface-muted leading-relaxed mb-4 text-right" dir="rtl">
                            تعيين وتدقيق كافة حركات السحب الشفافة التي أجراها الشريك {selectedPartnerName} من منافذ البيع أو التسويات المالية المعتمدة لمطابقة الرصيد مع قيود اليومية المحاسبية للشركة.
                        </p>

                        <div className="border border-border rounded-xl bg-background/50 overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-right border-collapse text-xs" dir="rtl">
                                <thead>
                                    <tr className="bg-surface-highlight/35 border-b border-border text-on-surface-muted font-bold">
                                        <th className="p-2 text-right">التاريخ والبيان</th>
                                        <th className="p-2 text-left">مدين (-)</th>
                                        <th className="p-2 text-left">دائن (+)</th>
                                        <th className="p-2 text-left">الرصيد</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isDetailLoading ? (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-on-surface-muted">
                                                جاري تحميل القيود اليومية...
                                            </td>
                                        </tr>
                                    ) : detailedDisplayEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-on-surface-muted">
                                                لا توجد معاملات جارية مسجلة لهذا الحساب.
                                            </td>
                                        </tr>
                                    ) : (
                                        detailedDisplayEntries.map((ent) => (
                                            <tr key={ent.id} className="border-b border-border/20 hover:bg-surface-highlight/20">
                                                <td className="p-2.5">
                                                    <div className="flex flex-col text-right">
                                                        <span className="font-semibold text-on-surface leading-tight">{ent.description}</span>
                                                        <span className="text-[9px] text-on-surface-muted font-mono mt-0.5">
                                                            {new Date(ent.createdAt).toLocaleDateString('ar-EG', {
                                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {ent.orderNumber && (
                                                            <span className="text-[9px] text-amber-500 font-mono">الطلب: #{ent.orderNumber}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-2.5 font-mono text-left font-bold text-rose-400">
                                                    {ent.type === 'WITHDRAWAL' ? `$${ent.amount.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-2.5 font-mono text-left font-bold text-emerald-400">
                                                    {ent.type === 'DEPOSIT' ? `$${ent.amount.toFixed(2)}` : '-'}
                                                </td>
                                                <td className={`p-2.5 font-mono text-left font-bold ${
                                                    ent.runningBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                    ${ent.runningBalance.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/80 flex items-center justify-between text-[11px] text-on-surface-muted text-right">
                        <span>تدقيق الإدارة المالية للشركة</span>
                        <span className="font-mono text-cyan-400 font-bold uppercase">NEXA-AUDIT-L3</span>
                    </div>
                </div>

            </div>
        </div>
    );
};
