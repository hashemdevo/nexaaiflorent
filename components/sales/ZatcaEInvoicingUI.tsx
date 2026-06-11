import React, { useState } from 'react';
import { 
    FileText, CheckCircle2, AlertTriangle, ShieldCheck, XCircle, Search, 
    Download, Filter, Loader2, ArrowRight, ArrowLeft, RefreshCw, Smartphone, Monitor
} from 'lucide-react';

export const ZatcaEInvoicingUI: React.FC = () => {
    const [viewMode, setViewMode] = useState<'SUMMARY' | 'DETAILED'>('SUMMARY');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const itemsPerPage = 8;

    const [mockInvoices] = useState([
        { id: 'INV-2026-001', date: '2026-05-24', amount: 4500, customer: 'شركة الأفق للتجارة', vat: 675, status: 'CLEARED', type: 'B2B', zatcaId: 'Z-8910121' },
        { id: 'INV-2026-002', date: '2026-05-24', amount: 1200, customer: 'مؤسسة التقنية الحديثة', vat: 180, status: 'REPORTED', type: 'B2C', zatcaId: 'Z-8910122' },
        { id: 'INV-2026-003', date: '2026-05-25', amount: 3300, customer: 'علي محمد', vat: 495, status: 'PENDING_SYNC', type: 'B2C', zatcaId: '-' },
        { id: 'INV-2026-004', date: '2026-05-25', amount: 15400, customer: 'شركة الرواد للمقاولات', vat: 2310, status: 'FAILED', type: 'B2B', zatcaId: '-' },
        { id: 'INV-2026-005', date: '2026-05-25', amount: 800, customer: 'صيدلية النهدي', vat: 120, status: 'CLEARED', type: 'B2B', zatcaId: 'Z-8910125' },
    ]);

    const filteredInvoices = mockInvoices.filter(inv =>
        inv.id.includes(searchTerm) || inv.customer.includes(searchTerm)
    );

    const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto text-right" dir="rtl">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4 border-b border-border/50 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface flex items-center gap-3">
                        <ShieldCheck className="h-7 w-7 text-emerald-500" /> بوابة الفوترة الإلكترونية (ZATCA Phase 2)
                    </h1>
                    <p className="text-on-surface-muted text-sm mt-2">
                        الربط والتكامل التلقائي مع هيئة الزكاة والضريبة والجمارك وتخليص الفواتير لحظياً (B2B/B2C).
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-6 py-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-50 rounded-xl font-bold text-sm shadow-sm transition flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'جاري المزامنة النظيرة...' : 'تشغيل المزامنة المعلقة مع الهيئة'}
                    </button>
                </div>
            </div>

            {/* ZATCA Phase 2 Connection Status & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="h-6 w-6 text-emerald-500" />
                        <h3 className="font-bold text-on-surface text-sm">حالة الربط مع منظومة (فاتورة)</h3>
                    </div>
                    <p className="text-emerald-500 font-bold text-lg mb-1">متصل وموثق (Active)</p>
                    <p className="text-[10px] text-on-surface-muted">CSID Token الساري المفعول لـ 3 أشهر</p>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-xs text-on-surface-muted font-bold mb-1">فواتير مُخلّصة بنجاح (Cleared)</p>
                    <p className="text-2xl font-mono font-bold text-emerald-500">2,845</p>
                    <p className="text-[10px] text-on-surface-muted mt-1">+14 اليوم</p>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-xs text-on-surface-muted font-bold mb-1">فواتير معلقة للإرسال التلقائي</p>
                    <p className="text-2xl font-mono font-bold text-amber-500">1</p>
                    <p className="text-[10px] text-on-surface-muted mt-1">تتم المزامنة كل 10 دقائق أو يدوياً</p>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-xs text-on-surface-muted font-bold mb-1">أخطاء التشفير أو الرفض</p>
                    <p className="text-2xl font-mono font-bold text-red-500">1</p>
                    <p className="text-[10px] text-on-surface-muted mt-1">يتطلب تدقيق البنية المحاسبية للفاتورة</p>
                </div>
            </div>

            {/* Offline Background Sync Settings (Requested feature integration point) */}
            <div className="bg-background/80 border border-zinc-500/30 border-dashed rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-800/50 rounded-lg shrink-0">
                        <Monitor className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-white">تخزين الكاش للإرسال غير المتصل (Offline PWA Sync)</h4>
                        <p className="text-xs text-zinc-400 max-w-xl">
                            أثناء فقدان الاتصال بالإنترنت، نقوم بالتشفير الداخلي اللحظي وفق معيار (XML UBL 2.1) وتوقيع الفاتورة وحفظها. حالما يتوفر الاتصال يتم ترحيلها للخوادم دون فقدان الامتثال الزمني للضريبة.
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> التخزين المشفر المعزول مُفعل (Active)
                    </span>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface border border-border rounded-2xl shadow-md overflow-hidden flex flex-col mt-6">
                <div className="p-4 border-b border-border/50 flex flex-col gap-4 bg-surface-highlight/30">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-on-surface">سجل مقاصة الفواتير الضريبية</h3>
                            <p className="text-[10px] text-on-surface-muted mt-1">تتبع التشفير الفوري (Cryptographic Stamping) وحالة القبول</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 w-full border-t border-border/50 pt-3 mt-1">
                        <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
                            <div className="relative flex-1 lg:w-64 min-w-[200px]">
                                <input 
                                    type="text" 
                                    placeholder="ابحث برقم الفاتورة أو العميل..."
                                    value={searchTerm}
                                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                                    className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-2 text-xs text-on-surface focus:border-primary outline-none"
                                />
                                <Search className="absolute right-3 top-2.5 h-3 w-3 text-on-surface-muted" />
                            </div>
                            <button className="p-2 border border-border rounded-xl bg-background hover:bg-surface-highlight transition">
                                <Filter className="h-3.5 w-3.5 text-on-surface" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-3 py-2 border border-border rounded-xl bg-background hover:bg-surface-highlight text-on-surface transition flex items-center gap-2 text-xs font-bold" title="تصدير بيانات المقاصة بصيغة Excel">
                                <Download className="h-3 w-3 text-emerald-500" /> تصدير السجل (Excel)
                            </button>
                            <button className="px-3 py-2 border border-border rounded-xl bg-background hover:bg-surface-highlight text-on-surface transition flex items-center gap-2 text-xs font-bold" title="تصدير إيصالات التقرير PDF">
                                <FileText className="h-3 w-3 text-red-500" /> تصدير PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-surface-highlight/30 border-b border-border text-on-surface-muted text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-bold">رقم الفاتورة</th>
                                <th className="p-4 font-bold">العميل / المؤسسة</th>
                                <th className="p-4 font-bold text-center">نوع الفاتورة</th>
                                <th className="p-4 font-bold text-center">المبلغ قبل الضريبة</th>
                                <th className="p-4 font-bold text-center">ضريبة (15%)</th>
                                <th className="p-4 font-bold text-center">معرّف الهيئة (ZATCA ID)</th>
                                <th className="p-4 font-bold text-center">حالة المطابقة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-8 text-on-surface-muted text-xs">لا يوجد فواتير تتبع بحثك</td>
                                </tr>
                            ) : (
                                paginatedInvoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-border/30 hover:bg-surface-highlight/20 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-on-surface text-xs">{inv.id}</div>
                                            <div className="text-[10px] text-on-surface-muted font-mono">{inv.date}</div>
                                        </td>
                                        <td className="p-4 text-xs font-bold text-on-surface">{inv.customer}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.type === 'B2B' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                                                {inv.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-xs font-mono">{inv.amount.toLocaleString()} ﷼</td>
                                        <td className="p-4 text-center text-xs font-mono text-warning">+ {inv.vat.toLocaleString()} ﷼</td>
                                        <td className="p-4 text-center text-[10px] font-mono text-on-surface-muted">{inv.zatcaId}</td>
                                        <td className="p-4 text-center">
                                            {inv.status === 'CLEARED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-1 rounded inline-flex items-center gap-1 font-bold"><CheckCircle2 className="h-3 w-3" /> تم التخليص (Cleared)</span>}
                                            {inv.status === 'REPORTED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-1 rounded inline-flex items-center gap-1 font-bold"><CheckCircle2 className="h-3 w-3" /> تم الإبلاغ (Reported)</span>}
                                            {inv.status === 'PENDING_SYNC' && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] px-2 py-1 rounded inline-flex items-center gap-1 font-bold"><Loader2 className="h-3 w-3 animate-spin" /> في الانتظار</span>}
                                            {inv.status === 'FAILED' && <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] px-2 py-1 rounded inline-flex items-center gap-1 font-bold"><XCircle className="h-3 w-3" /> خطأ في البنية (XML Error)</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 border-t border-border/50 flex justify-between items-center text-xs text-on-surface-muted bg-surface-highlight/10">
                    <div>
                        عرض النطاق {((currentPage - 1) * itemsPerPage) + 1} إلی {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} من إجمالي {filteredInvoices.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 border border-border rounded-lg disabled:opacity-30 hover:bg-surface-highlight"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <span className="font-mono px-2">صفحة {currentPage} من {totalPages}</span>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1.5 border border-border rounded-lg disabled:opacity-30 hover:bg-surface-highlight"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
