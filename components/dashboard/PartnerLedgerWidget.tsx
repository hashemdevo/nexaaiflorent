import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PartnerLedgerService, PartnerLedgerEntry } from '../../services/pos/partnerLedgerService';
import { DbEngine } from '../../services/core/db';
import { ViewState } from '../../types';
import { 
    Coins, ArrowDownRight, ArrowUpLeft, PlusCircle, 
    RefreshCcw, CheckCircle2, History, AlertCircle, 
    Sparkles, ShoppingCart, TrendingUp, Building2, ExternalLink
} from 'lucide-react';

export const PartnerLedgerWidget: React.FC = () => {
    const { currentUserIdentity, currentUniversalRole, setCurrentView } = useApp();
    const [entries, setEntries] = useState<PartnerLedgerEntry[]>([]);
    const [balance, setBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [depositAmount, setDepositAmount] = useState<string>('');
    const [depositDescription, setDepositDescription] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [successMsg, setSuccessMsg] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    // Strategic KPIs for Company Dashboard
    const [branchesCount, setBranchesCount] = useState<number>(3);
    const [totalSalesVolume, setTotalSalesVolume] = useState<number>(24150);

    const ownerEmail = currentUserIdentity || 'owner@nexa.ai';
    const ownerName = ownerEmail.split('@')[0].toUpperCase();

    // Calculate running balance chronologically (oldest first)
    const sortedChronological = [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    let balAccumulator = 0;
    const entriesWithRunningBalance = sortedChronological.map(entry => {
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
    // Reverse for showing newest first in the ledger table
    const displayEntries = [...entriesWithRunningBalance].reverse();

    // Fetch ledger information & Strategic Indicators
    const fetchLedger = async () => {
        setIsLoading(true);
        try {
            const data = await PartnerLedgerService.getEntries(ownerEmail);
            const bal = await PartnerLedgerService.getBalance(ownerEmail);
            setEntries(data);
            setBalance(bal);

            // Fetch strategic indicators for Company
            try {
                const bList = await DbEngine.select<any>('branches');
                if (bList && bList.length > 0) {
                    setBranchesCount(bList.length);
                }
                const sales = await DbEngine.select<any>('sales_orders');
                if (sales && sales.length > 0) {
                    const total = sales.reduce((sum: number, item: any) => sum + (item.totalAmount || item.amount || 0), 0);
                    if (total > 0) {
                        setTotalSalesVolume(total);
                    }
                }
            } catch (kpiErr) {
                console.error("Failed to load strategic metrics", kpiErr);
            }
        } catch (err) {
            console.error("Error fetching partner ledger details", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, [ownerEmail]);

    // Handle Manual Deposit for settlement
    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) {
            setErrorMsg('يرجى إدخال مبلغ صحيح أكبر من صفر');
            return;
        }

        setIsSaving(true);
        try {
            await PartnerLedgerService.recordDeposit(
                ownerEmail,
                ownerName,
                amount,
                depositDescription || 'سداد نقدي لتسوية جاري الشريك بالخزينة'
            );
            
            setDepositAmount('');
            setDepositDescription('');
            setSuccessMsg('تم قيد الإيداع وتخفيض مديونية حساب الشريك بنجاح!');
            await fetchLedger();
            
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            console.error("Deposit submission failed", err);
            setErrorMsg('فشل تسجيل الإيداع. يرجى مراجعة الاتصال بقاعدة البيانات.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div id="partner-ledger-widget-card" className="bg-surface border border-border/80 rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all hover:border-amber-500/30">
            {/* Top Amber Bar Flag */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-400" />
            
            {/* Personalized Space Greeting (الحيز الشخصي للشريك) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border/40 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
                        <Coins className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-extrabold text-md flex items-center gap-1.5 leading-tight">
                            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                            حيز الشريك الشخصي: أهلاً بك {ownerName}
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                            مساحتك التشغيلية المعزولة - رصيدك وحسابك المالي مؤمن بالكامل لخصوصيتك
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-stretch md:self-auto justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 uppercase font-mono">
                        Active OWNER Segment
                    </span>
                    <button 
                        onClick={fetchLedger}
                        disabled={isLoading}
                        className="p-2 hover:bg-surface-highlight text-on-surface-muted hover:text-on-surface rounded-xl transition"
                        title="تحديث البيانات"
                    >
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Dashboard Zones Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Zone 1: Private Ledger Info & Strategic Corporate Analytics (Left - Dynamic 8 columns) */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Sub-Zone A: Private Financial Status Cards */}
                    <div>
                        <span className="text-xs font-bold text-on-surface-muted uppercase mb-3 block">وضعك المالي الخاص بالشراكة</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Running Balance */}
                            <div className={`p-4 rounded-2xl border transition ${
                                balance >= 0 
                                ? 'bg-emerald-500/5 border-emerald-500/10' 
                                : 'bg-rose-500/5 border-rose-500/10'
                            }`}>
                                <div className="text-xs font-semibold text-on-surface-muted mb-1">رصيد حسابك الجاري المتراكم</div>
                                <div className={`text-2xl font-black font-mono tracking-tight ${
                                    balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                    ${balance.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-on-surface-muted mt-1.5 leading-tight">
                                    {balance >= 0 ? 'رصيد دائن لصالحك كشريك (لديك إيداعات فائضة)' : 'رصيد مدين ومسحوبات مستحقة عليك للشركة'}
                                </div>
                            </div>

                            {/* Cumulative Withdrawals */}
                            <div className="p-4 rounded-2xl border border-border bg-surface-highlight/10">
                                <div className="text-xs font-semibold text-on-surface-muted mb-1">إجمالي المسحوبات الخاصة بك</div>
                                <div className="text-2xl font-black font-mono tracking-tight text-amber-400">
                                    ${entries.filter(e => e.type === 'WITHDRAWAL').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                                </div>
                                <div className="text-[10px] text-on-surface-muted mt-1.5 leading-tight">
                                    مرات السحب والمسحوبات العينية: {entries.filter(e => e.type === 'WITHDRAWAL').length}
                                </div>
                            </div>

                            {/* Cumulative Settlement Deposits */}
                            <div className="p-4 rounded-2xl border border-border bg-surface-highlight/10">
                                <div className="text-xs font-semibold text-on-surface-muted mb-1">إجمالي إيداعاتك وتمرير السيولة</div>
                                <div className="text-2xl font-black font-mono tracking-tight text-white">
                                    ${entries.filter(e => e.type === 'DEPOSIT').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                                </div>
                                <div className="text-[10px] text-on-surface-muted mt-1.5 leading-tight">
                                    مرات التسويات والتمويلات: {entries.filter(e => e.type === 'DEPOSIT').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Zone B: Strategic Company Status Panel (بدون كشف حسابات باقي الشركاء لخصوصية تامة) */}
                    <div className="bg-background/40 border border-border p-5 rounded-2xl space-y-3.5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-on-surface-muted uppercase">التحليلات الاستراتيجية لأداء الشركة</span>
                            <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">Owner Strategy View</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Strategic Sales metric */}
                            <div className="p-3.5 bg-background border border-border/80 rounded-xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[11px] text-on-surface-muted">إجمالي إيرادات المبيعات المحققة للشركة</p>
                                    <p className="text-xl font-black font-mono text-emerald-400">${totalSalesVolume.toLocaleString()}</p>
                                </div>
                                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                            </div>

                            {/* Active outlets */}
                            <div className="p-3.5 bg-background border border-border/80 rounded-xl flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[11px] text-on-surface-muted">شبكة المنافذ والفروع المربوطة والمراقبة</p>
                                    <p className="text-xl font-black font-mono text-cyan-400">{branchesCount} فروع ومعارض</p>
                                </div>
                                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                                    <Building2 className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Zone C: Private Personal Ledger Transactions Table */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-on-surface-muted" />
                            <h4 className="text-xs font-bold text-on-surface uppercase">سجل الحركات المالية الخاص بحساب الجاري لك (Newest First)</h4>
                        </div>
                        <div className="border border-border rounded-2xl overflow-hidden max-h-[220px] overflow-y-auto custom-scrollbar bg-zinc-950/20">
                            <table className="w-full text-right border-collapse text-xs" dir="rtl">
                                <thead>
                                    <tr className="bg-surface-highlight/30 border-b border-border text-on-surface-muted font-bold">
                                        <th className="p-3">التاريخ والوقت</th>
                                        <th className="p-3 text-right">المعاملة / تفصيل الحركة</th>
                                        <th className="p-3 text-left">مدين (سحب/خصم)</th>
                                        <th className="p-3 text-left">دائن (إيداع/إضافة)</th>
                                        <th className="p-3 text-left">الرصيد الجاري</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {displayEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-on-surface-muted italic">
                                                لا توجد حركات مالية مسجلة خاصة بك حتى الآن.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayEntries.map((ent) => (
                                            <tr key={ent.id} className="border-b border-border/20 hover:bg-surface-highlight/10 text-right">
                                                <td className="p-3 text-on-surface-muted font-mono text-[11px]">
                                                    {new Date(ent.createdAt).toLocaleDateString('ar-EG', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="p-3 font-medium text-white text-right">
                                                    <div className="flex flex-col">
                                                        <span>{ent.description}</span>
                                                        {ent.orderNumber && (
                                                            <span className="text-[10px] text-amber-500 font-mono">رقم الطلب: #{ent.orderNumber}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-mono font-bold text-left text-rose-400">
                                                    {ent.type === 'WITHDRAWAL' ? `$${ent.amount.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-3 font-mono font-bold text-left text-emerald-400">
                                                    {ent.type === 'DEPOSIT' ? `$${ent.amount.toFixed(2)}` : '-'}
                                                </td>
                                                <td className={`p-3 font-mono font-bold text-left ${
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
                </div>

                {/* Zone 2: Quick Action Center (الحيز التشغيلي) & Settle Action Sheets (Right - 4 columns) */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                    
                    {/* Sub-Zone X: Quick Operational Action Shortcut Buttons */}
                    <div className="bg-surface-highlight/10 p-5 rounded-2xl border border-border space-y-3">
                        <span className="text-[11px] font-extrabold text-amber-500 uppercase block tracking-wider">الحيز التشغيلي والوصول السريع</span>
                        <p className="text-[11px] text-on-surface-muted leading-relaxed">
                            اختصارات مخصصة للأونر لإجراء الحركات التشغيلية الفورية لتقليص الدورة الزمنية:
                        </p>
                        
                        <div className="grid grid-cols-1 gap-2 pt-1">
                            {/* POS Order Shortcut */}
                            <button
                                onClick={() => setCurrentView(ViewState.TOOLS_POS)}
                                className="w-full p-3 bg-primary hover:bg-primary-hover text-black font-extrabold rounded-xl text-xs flex items-center justify-between transition shadow-md"
                            >
                                <span className="flex items-center gap-1.5">
                                    <ShoppingCart className="h-4 w-4" />
                                    عمل طلب مبيعات جديد (POS)
                                </span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </button>

                            {/* Quick Inventory Stock view */}
                            <button
                                onClick={() => setCurrentView(ViewState.MANAGEMENT_INVENTORY)}
                                className="w-full p-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs flex items-center justify-between transition border border-border"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="h-4 w-4 text-cyan-400" />
                                    مراقبة عهدة المخازن والجرد
                                </span>
                                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                            </button>
                        </div>
                    </div>

                    {/* Sub-Zone Y: Manual Settle Form */}
                    <div className="bg-surface-highlight/10 border border-border p-5 rounded-2xl space-y-3.5">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5 text-amber-500" />
                            <h4 className="text-xs font-bold text-on-surface">تسوية مديونية / إيداع مباشر بالخزينة</h4>
                        </div>
                        <p className="text-[11px] text-on-surface-muted leading-relaxed">
                            قم بقيد سداد نقدي لغذية خزينة الشركة وتصفير مديونيتك كشريك. تنشر القيد دفعة واحدة في القيد المزدوج اليومي.
                        </p>

                        <form onSubmit={handleDeposit} className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-on-surface-muted mb-1">المبلغ المراد إيداعه ($)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-background border border-border p-2 px-3 rounded-xl font-mono text-xs font-bold focus:outline-none focus:border-amber-500 text-on-surface text-left"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-on-surface-muted mb-1">البيان المالي بالعربي</label>
                                <input 
                                    type="text"
                                    value={depositDescription}
                                    onChange={(e) => setDepositDescription(e.target.value)}
                                    placeholder="مثال: تسوية وجبات ونقود شهرية"
                                    className="w-full bg-background border border-border p-2 px-3 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-on-surface text-right"
                                    required
                                />
                            </div>

                            {errorMsg && (
                                <div className="text-[10px] bg-rose-500/10 text-rose-400 p-2 rounded-xl flex items-center gap-1.5 border border-rose-500/20">
                                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {successMsg && (
                                <div className="text-[10px] bg-emerald-500/10 text-emerald-400 p-2 rounded-xl flex items-center gap-1.5 border border-emerald-500/20">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl shadow-glow-amber transition"
                            >
                                {isSaving ? 'ترحيل مباشر جاري...' : 'ترحيل مالي وتسوية الجاري'}
                            </button>
                        </form>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[10px] text-zinc-500 leading-tight">
                        <span>نظام تسوية الشركاء الفوري</span>
                        <span className="font-mono text-zinc-600">GA-PARTNER-L3</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
