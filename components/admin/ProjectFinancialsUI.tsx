import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Landmark, CheckCircle2, AlertCircle, Plus, Upload, Loader2, Download, Table, X } from 'lucide-react';
import { ProjectFinancialsService, SaaSRevenue, SaaSExpense } from '../../services/admin/projectFinancialsService';

export const ProjectFinancialsUI: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'REVENUES' | 'EXPENSES'>('REVENUES');
    const [revenues, setRevenues] = useState<SaaSRevenue[]>([]);
    const [expenses, setExpenses] = useState<SaaSExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'REVENUES' | 'EXPENSES'>('REVENUES');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [revs, exps] = await Promise.all([
                ProjectFinancialsService.fetchRevenues(),
                ProjectFinancialsService.fetchExpenses()
            ]);
            setRevenues(revs);
            setExpenses(exps);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Summary calculations
    const totalRevenue = revenues.filter(r => r.status === 'PAID').reduce((sum, r) => sum + r.amount, 0);
    const pendingRevenue = revenues.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.filter(e => e.status === 'PAID').reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const handlePostToGL = async (type: 'REVENUE' | 'EXPENSE', id: string) => {
        setIsLoading(true);
        try {
            if (type === 'REVENUE') {
                await ProjectFinancialsService.postRevenueToGL(id);
            } else {
                await ProjectFinancialsService.postExpenseToGL(id);
            }
            await loadData();
            alert("تم ترحيل قيد اليومية بنجاح إلى النظام المالي لشركة نكسا.");
        } catch (e) {
            console.error(e);
            alert("فشل في الترحيل: " + (e as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNewRecord = () => {
        setIsModalOpen(false);
        loadData();
    };

    return (
        <div className="space-y-6 animate-fade-in text-right" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-emerald-500" /> الدفاتر المالية لنكسا
                    </h2>
                    <p className="text-sm text-on-surface-muted mt-1">حسابات الشركة: تتبع إيرادات الاشتراكات، مدفوعات العملاء، والتكاليف التشغيلية للمشروع</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadData} className="px-4 py-2 border border-border rounded-xl text-on-surface hover:bg-surface-highlight flex items-center gap-2 font-bold text-sm">
                        تحديث البيانات
                    </button>
                    <button onClick={() => { setModalType(activeTab); setIsModalOpen(true); }} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-glow-primary transition flex items-center gap-2 font-bold text-sm">
                        <Plus className="h-4 w-4" /> إضافة حركة مالية
                    </button>
                </div>
            </div>

            {/* Dashboards Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-on-surface-muted font-bold mb-1">الإيرادات المحصلة (PAID)</p>
                    <p className="text-2xl font-mono font-bold text-emerald-500 flex items-center gap-2">
                        {totalRevenue.toLocaleString()} ﷼
                    </p>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-on-surface-muted font-bold mb-1">فواتير بانتظار السداد (PENDING)</p>
                    <p className="text-2xl font-mono font-bold text-amber-500 flex items-center gap-2">
                        {pendingRevenue.toLocaleString()} ﷼
                    </p>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-on-surface-muted font-bold mb-1">إجمالي المصروفات (تشغيل)</p>
                    <p className="text-2xl font-mono font-bold text-red-400 flex items-center gap-2">
                        {totalExpenses.toLocaleString()} ﷼
                    </p>
                </div>
                <div className="bg-surface border border-emerald-500/30 rounded-2xl p-5 shadow-sm bg-emerald-500/5">
                    <p className="text-xs font-bold mb-1 text-emerald-600">صافي التدفقات (السيولة المتاحة)</p>
                    <p className="text-2xl font-mono font-bold text-emerald-600 flex items-center gap-2">
                        {netProfit.toLocaleString()} ﷼
                    </p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden mt-6">
                <div className="flex items-center gap-1 border-b border-border p-2 bg-surface-highlight/30">
                    <button 
                        onClick={() => setActiveTab('REVENUES')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${activeTab === 'REVENUES' ? 'bg-background shadow border border-border text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        إيرادات اشتراكات الشركات (Revenues)
                    </button>
                    <button 
                        onClick={() => setActiveTab('EXPENSES')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${activeTab === 'EXPENSES' ? 'bg-background shadow border border-border text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                    >
                        مصروفات نكسا ليدجر (Expenses)
                    </button>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="p-12 flex justify-center text-primary"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-surface-highlight/30 border-b border-border text-xs uppercase text-on-surface-muted">
                                    {activeTab === 'REVENUES' ? (
                                        <tr>
                                            <th className="p-4 font-bold">الشركة المطالبة</th>
                                            <th className="p-4 font-bold">تاريخ الفوترة</th>
                                            <th className="p-4 font-bold">المبلغ</th>
                                            <th className="p-4 font-bold">الحالة</th>
                                            <th className="p-4 font-bold">وسيلة الدفع والحساب</th>
                                            <th className="p-4 font-bold">إجـراء</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="p-4 font-bold">بيان التكلفة / المورد</th>
                                            <th className="p-4 font-bold">التصنيف</th>
                                            <th className="p-4 font-bold">تاريخ السداد</th>
                                            <th className="p-4 font-bold">المبلغ</th>
                                            <th className="p-4 font-bold">الحالة</th>
                                            <th className="p-4 font-bold">وسيلة الدفع</th>
                                            <th className="p-4 font-bold">الوثيقة</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {activeTab === 'REVENUES' ? (
                                        revenues.map(rev => (
                                            <tr key={rev.id} className="border-b border-border hover:bg-surface-highlight/20 transition">
                                                <td className="p-4">
                                                    <p className="font-bold text-on-surface">{rev.companyName}</p>
                                                    <p className="text-[10px] text-on-surface-muted">{rev.plan} Plan</p>
                                                </td>
                                                <td className="p-4 text-xs font-mono">{rev.billingDate}</td>
                                                <td className="p-4 font-bold font-mono text-primary">{rev.amount.toLocaleString()} ﷼</td>
                                                <td className="p-4">
                                                    {rev.status === 'PAID' ? (
                                                        <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs w-max font-bold">
                                                            <CheckCircle2 className="h-3 w-3" /> مسدد
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs w-max font-bold">
                                                            <AlertCircle className="h-3 w-3" /> بانتظار الدفع
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {rev.status === 'PAID' ? (
                                                        <div className="text-[10px]">
                                                            <div className="font-bold flex items-center gap-1">
                                                                {rev.paymentMethod === 'BANK_TRANSFER' ? <Landmark className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                                                                {rev.paymentMethod === 'BANK_TRANSFER' ? 'تحويل بنكي' : rev.paymentMethod}
                                                            </div>
                                                            {rev.bankAccountNumber && <div className="font-mono text-on-surface-muted truncate max-w-[150px]">{rev.bankAccountNumber}</div>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-on-surface-muted">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-left flex flex-col items-end gap-2">
                                                    <button className="text-xs text-primary font-bold hover:underline">المستندات</button>
                                                    {rev.isPostedToGL ? (
                                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20">مرحل للقيود</span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handlePostToGL('REVENUE', rev.id)}
                                                            className="text-[10px] bg-surface-highlight hover:bg-primary hover:text-white transition px-2 py-1 rounded font-bold"
                                                        >
                                                            ترحيل قيد
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        expenses.map(exp => (
                                            <tr key={exp.id} className="border-b border-border hover:bg-surface-highlight/20 transition">
                                                <td className="p-4">
                                                    <p className="font-bold text-on-surface">{exp.title}</p>
                                                    <p className="text-[10px] text-on-surface-muted truncate max-w-[200px]">{exp.notes}</p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-surface-highlight text-on-surface px-2 py-1 rounded text-xs">{exp.category}</span>
                                                </td>
                                                <td className="p-4 text-xs font-mono">{exp.issuedAt}</td>
                                                <td className="p-4 font-bold font-mono text-red-400">-{exp.amount.toLocaleString()} ﷼</td>
                                                <td className="p-4">
                                                    {exp.status === 'PAID' ? (
                                                        <span className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded text-xs w-max font-bold">
                                                            <CheckCircle2 className="h-3 w-3" /> مدفوع
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded text-xs w-max font-bold">
                                                            <AlertCircle className="h-3 w-3" /> بانتظار السداد
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-[10px] font-bold">
                                                   {exp.paymentMethod || '-'}
                                                </td>
                                                <td className="p-4 text-left flex flex-col items-end gap-2">
                                                    {exp.attachmentUrl ? (
                                                        <button className="text-xs text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                                                            <Download className="h-3 w-3" /> تحميل المرفق
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-on-surface-muted">لا يوجد ملف</span>
                                                    )}
                                                    {exp.isPostedToGL ? (
                                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20">مرحل للقيود</span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handlePostToGL('EXPENSE', exp.id)}
                                                            className="text-[10px] bg-surface-highlight hover:bg-primary hover:text-white transition px-2 py-1 rounded font-bold mt-1"
                                                        >
                                                            ترحيل قيد
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {((activeTab === 'REVENUES' && revenues.length === 0) || (activeTab === 'EXPENSES' && expenses.length === 0)) && (
                                <div className="p-12 text-center text-on-surface-muted">لا توجد سجلات مالية بعد.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface border border-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-4 border-b border-border">
                            <h3 className="font-bold text-lg">
                                {modalType === 'REVENUES' ? 'تسجيل إيراد اشتراك جديد' : 'تسجيل مصروف / تكلفة تشغيل'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface-highlight rounded-full transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {modalType === 'REVENUES' ? (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-on-surface-muted mb-1 block">الشركة المطالبة</label>
                                        <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary" placeholder="اسم الشركة..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-on-surface-muted mb-1 block">باقة الاشتراك</label>
                                            <select className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary">
                                                <option>Basic Plan</option>
                                                <option>Pro Plan</option>
                                                <option>Enterprise</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-on-surface-muted mb-1 block">قيمة المطالبة (الاشتراك)</label>
                                            <input type="number" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary" placeholder="المبلغ المطلق..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-on-surface-muted mb-1 block">طريقة التحصيل</label>
                                        <select className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary">
                                            <option>حوالة بنكية</option>
                                            <option>بطاقة ائتمانية (Visa/Mastercard)</option>
                                            <option>بوابة دفع (ميسر / تاب)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-on-surface-muted mb-1 block">رقم الحساب المحول إليه (اختياري)</label>
                                        <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary" placeholder="SA..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-on-surface-muted mb-1 block">إرفاق إيصال السداد / Receipt</label>
                                        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-surface-highlight transition">
                                            <Upload className="h-6 w-6 text-on-surface-muted mx-auto mb-2" />
                                            <span className="text-xs text-primary font-bold">تصفح لرفع الايصال الدال على الدفع</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-on-surface-muted mb-1 block">بيان التكلفة أو المصروف</label>
                                        <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary" placeholder="مثل: استضافة سحابية، تسويق، رواتب..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-on-surface-muted mb-1 block">تصنيف المصروف</label>
                                            <select className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary">
                                                <option>بنية تحتية (Infrastructure)</option>
                                                <option>رواتب وتشغيل (Operations)</option>
                                                <option>تسويق (Marketing)</option>
                                                <option>رسوم حكومية وقانونية</option>
                                                <option>أخرى</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-on-surface-muted mb-1 block">المبلغ المنصرف</label>
                                            <input type="number" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary" placeholder="المبلغ بالريال..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-on-surface-muted mb-1 block">تاريخ السداد</label>
                                        <input type="date" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-on-surface-muted mb-1 block">إرفاق الفاتورة أو وثيقة التكلفة</label>
                                        <div className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-surface-highlight transition">
                                            <Upload className="h-6 w-6 text-on-surface-muted mx-auto mb-2" />
                                            <span className="text-xs text-primary font-bold">انقر لرفع ملف الفاتورة</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-4 border-t border-border bg-surface-highlight/20 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-highlight transition">الغاء</button>
                            <button onClick={handleSaveNewRecord} className="px-5 py-2 rounded-xl text-sm font-bold bg-primary hover:bg-primary-hover text-white shadow-lg transition">تسجيل وحفظ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
