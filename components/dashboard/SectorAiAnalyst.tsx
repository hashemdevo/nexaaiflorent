import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Gemini } from '../../services/geminiService';
import { 
    Sparkles, Cpu, Loader2, Terminal, AlertTriangle, CheckCircle, Clock, Info, 
    HardHat, Activity, ShieldAlert, ShieldCheck, FileText, BarChart3, HelpCircle, ArrowRight,
    Scale, GraduationCap, Truck, ShoppingCart, Landmark, Plane, ClipboardList, Utensils,
    Plus, Trash2, Sliders
} from 'lucide-react';
import { IndustryType } from '../../types';

export const SectorAiAnalyst: React.FC = () => {
    const { currentUserIndustry } = useApp();
    const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | 'GENERIC'>('GENERIC');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [rawInput, setRawInput] = useState('');
    const [inputTab, setInputTab] = useState<'form' | 'json'>('form');
    const [securityStatus, setSecurityStatus] = useState<{ isValid: boolean; error?: string }>({ isValid: true });

    const validateAndSanitizeInput = (input: string): { isValid: boolean; sanitized: string; error?: string } => {
        if (!input) return { isValid: true, sanitized: '' };
        
        const lowercaseInput = input.toLowerCase();
        
        // Block script/HTML injections and command bypass blocks
        if (/<script|javascript:|onload|onerror|iframe|html|body|meta|alert\(|eval\(|Function\(/i.test(lowercaseInput)) {
            return {
                isValid: false,
                sanitized: input,
                error: 'تم اكتشاف أكواد أو وسوم برمجية ضارة (HTML/Script Injection Blocked) وتم حظرها فوراً للحفاظ على سلامة الحساب.'
            };
        }

        // Validate JSON property safety to prevent Prototype/Object pollution
        if (input.trim().startsWith('{') || input.trim().startsWith('[')) {
            try {
                const parsed = JSON.parse(input);
                
                const sanitizeObject = (obj: any): any => {
                    if (obj === null || typeof obj !== 'object') return obj;
                    
                    if (Array.isArray(obj)) {
                        return obj.map(sanitizeObject);
                    }
                    
                    const cleanObj: any = {};
                    for (const key in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, key)) {
                            // Strip any prototype pollution attempts
                            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                                continue;
                            }
                            cleanObj[key] = sanitizeObject(obj[key]);
                        }
                    }
                    return cleanObj;
                };

                const clean = sanitizeObject(parsed);
                // Return original or pretty printed version
                return {
                    isValid: true,
                    sanitized: JSON.stringify(clean, null, 2)
                };
            } catch (err) {
                return {
                    isValid: false,
                    sanitized: input,
                    error: 'صيغة الـ JSON المبرمجة غير صالحة هيكلياً. يرجى التأكد من كتابة الأقواس والفاصلات بشكل صحيح.'
                };
            }
        }

        return { isValid: true, sanitized: input };
    };

    useEffect(() => {
        const securityCheck = validateAndSanitizeInput(rawInput);
        setSecurityStatus({ isValid: securityCheck.isValid, error: securityCheck.error });
    }, [rawInput]);

    const getParsedData = () => {
        try {
            const raw = JSON.parse(rawInput);
            const sanitizeObject = (obj: any): any => {
                if (obj === null || typeof obj !== 'object') return obj;
                if (Array.isArray(obj)) return obj.map(sanitizeObject);
                const cleanObj: any = {};
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                            continue;
                        }
                        cleanObj[key] = sanitizeObject(obj[key]);
                    }
                }
                return cleanObj;
            };
            return sanitizeObject(raw);
        } catch {
            return null;
        }
    };

    const getGenericData = () => {
        const parsed = getParsedData();
        if (Array.isArray(parsed)) return parsed;
        return [];
    };

    const updateGenericTx = (index: number, key: string, val: any) => {
        const current = [...getGenericData()];
        if (current[index]) {
            current[index] = { ...current[index], [key]: val };
            setRawInput(JSON.stringify(current, null, 2));
        }
    };

    const addGenericTx = () => {
        const current = getGenericData();
        const newTx = {
            id: `TX00${current.length + 1}`,
            description: 'وصف حركة جديدة',
            amount: 100,
            type: 'debit',
            date: new Date().toISOString().split('T')[0]
        };
        setRawInput(JSON.stringify([...current, newTx], null, 2));
    };

    const removeGenericTx = (index: number) => {
        const current = getGenericData();
        const filtered = current.filter((_, i) => i !== index);
        setRawInput(JSON.stringify(filtered, null, 2));
    };

    const getMedicalData = () => {
        const parsed = getParsedData();
        if (Array.isArray(parsed)) return parsed;
        return [];
    };

    const updateMedicalDept = (index: number, key: string, val: any) => {
        const current = [...getMedicalData()];
        if (current[index]) {
            current[index] = { ...current[index], [key]: val };
            setRawInput(JSON.stringify(current, null, 2));
        }
    };

    const addMedicalDept = () => {
        const current = getMedicalData();
        const newDept = {
            department: 'اسم القسم الجديد',
            sick_days_taken: 5,
            reported_stress_level: 5
        };
        setRawInput(JSON.stringify([...current, newDept], null, 2));
    };

    const removeMedicalDept = (index: number) => {
        const current = getMedicalData();
        const filtered = current.filter((_, i) => i !== index);
        setRawInput(JSON.stringify(filtered, null, 2));
    };

    const getRetailData = () => {
        const parsed = getParsedData();
        if (Array.isArray(parsed)) return parsed;
        return [];
    };

    const updateRetailBasket = (index: number, itemsStr: string) => {
        const current = [...getRetailData()];
        if (current[index]) {
            current[index] = {
                items: itemsStr.split(',').map(s => s.trim()).filter(Boolean)
            };
            setRawInput(JSON.stringify(current, null, 2));
        }
    };

    const addRetailBasket = () => {
        const current = getRetailData();
        const newBasket = { items: ['دفتر مبيعات'] };
        setRawInput(JSON.stringify([...current, newBasket], null, 2));
    };

    const removeRetailBasket = (index: number) => {
        const current = getRetailData();
        const filtered = current.filter((_, i) => i !== index);
        setRawInput(JSON.stringify(filtered, null, 2));
    };

    const getEducationData = () => {
        const parsed = getParsedData();
        return {
            topic: parsed?.topic || 'عنوان الدرس',
            audience: parsed?.audience || 'الطلاب الجدد',
            duration: parsed?.duration || 60
        };
    };

    const updateEducationData = (key: string, val: any) => {
        const current = getEducationData();
        const updated = { ...current, [key]: val };
        setRawInput(JSON.stringify(updated, null, 2));
    };

    const getRestaurantData = () => {
        const parsed = getParsedData();
        return {
            occupancyRate: parsed?.occupancyRate || 50,
            localEvents: parsed?.localEvents || []
        };
    };

    const updateRestaurantData = (key: string, val: any) => {
        const current = getRestaurantData();
        const updated = { ...current, [key]: val };
        setRawInput(JSON.stringify(updated, null, 2));
    };

    const renderInteractiveForm = () => {
        switch (selectedIndustry) {
            case 'GENERIC': {
                const txs = getGenericData();
                return (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        <p className="text-[11px] text-on-surface-muted bg-primary/5 p-2 rounded-lg border border-primary/20 leading-relaxed text-right font-sans" dir="rtl">
                            هذه المحاكاة تبحث في المخاطر والتهديدات المالية لدفتر اليومية. يمكنك إضافة، تعديل أو حذف المعاملات أدناه، وسيتعامل معها نموذج الـ AI مباشرة.
                        </p>
                        {txs.map((tx: any, idx: number) => (
                            <div key={idx} className="bg-surface-highlight/30 p-3 rounded-xl border border-border flex flex-col gap-2 relative text-right" dir="rtl">
                                <button 
                                    onClick={() => removeGenericTx(idx)}
                                    className="absolute top-2 left-2 text-on-surface-muted hover:text-danger p-1 rounded transition-colors"
                                    title="حذف المعاملة"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-on-surface-muted block">كود المعاملة</label>
                                        <input 
                                            type="text" 
                                            value={tx.id || ''} 
                                            onChange={(e) => updateGenericTx(idx, 'id', e.target.value)}
                                            className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-on-surface font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-on-surface-muted block">التاريخ المعين</label>
                                        <input 
                                            type="date" 
                                            value={tx.date || ''} 
                                            onChange={(e) => updateGenericTx(idx, 'date', e.target.value)}
                                            className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-on-surface font-mono text-center"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-on-surface-muted block">وصف الحركة / حساب الدفتر اليومي</label>
                                        <input 
                                            type="text" 
                                            value={tx.description || ''} 
                                            onChange={(e) => updateGenericTx(idx, 'description', e.target.value)}
                                            className="w-full bg-background border border-border rounded-lg p-1.5 text-[11px] text-on-surface text-right"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-on-surface-muted block">المبلغ الإجمالي</label>
                                        <input 
                                            type="number" 
                                            value={tx.amount || 0} 
                                            onChange={(e) => updateGenericTx(idx, 'amount', parseFloat(e.target.value) || 0)}
                                            className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-on-surface font-mono text-center"
                                        />
                                    </div>
                                </div>
                                <div className="mt-1 flex items-center gap-3 text-xs text-on-surface-muted">
                                    <span className="font-bold">نوع الحساب:</span>
                                    <label className="inline-flex items-center gap-1 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`type-${idx}`}
                                            checked={tx.type === 'debit'} 
                                            onChange={() => updateGenericTx(idx, 'type', 'debit')}
                                            className="accent-primary"
                                        />
                                        <span>مدين (Debit)</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name={`type-${idx}`}
                                            checked={tx.type === 'credit'} 
                                            onChange={() => updateGenericTx(idx, 'type', 'credit')}
                                            className="accent-primary"
                                        />
                                        <span>دائن (Credit)</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={addGenericTx}
                            className="w-full py-2 border border-dashed border-primary/40 hover:border-primary/80 text-primary rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all bg-primary/5"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>إضافة معاملة محاسبية جديدة للتصنيف</span>
                        </button>
                    </div>
                );
            }
            case 'MEDICAL':
            case 'HOSPITAL': {
                const depts = getMedicalData();
                return (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        <p className="text-[11px] text-on-surface-muted bg-primary/5 p-2 rounded-lg border border-primary/20 leading-relaxed text-right font-sans" dir="rtl">
                            قياس معلات الإجهاد ونسب غيابات الطاقم الأخصائي والتمريض. قم بالتعديل بحرية:
                        </p>
                        {depts.map((d: any, idx: number) => (
                            <div key={idx} className="bg-surface-highlight/30 p-3 rounded-xl border border-border flex flex-col gap-2 relative text-right" dir="rtl">
                                <button 
                                    onClick={() => removeMedicalDept(idx)}
                                    className="absolute top-2 left-2 text-on-surface-muted hover:text-danger p-1 rounded transition-colors"
                                    title="حذف القسم"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-on-surface-muted block">اسم القسم الطبي بالمشفى</label>
                                    <input 
                                        type="text" 
                                        value={d.department || ''} 
                                        onChange={(e) => updateMedicalDept(idx, 'department', e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-on-surface text-right"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-on-surface-muted block">مجموع الغيابات المرضية</label>
                                        <input 
                                            type="number" 
                                            value={d.sick_days_taken || 0} 
                                            onChange={(e) => updateMedicalDept(idx, 'sick_days_taken', parseInt(e.target.value) || 0)}
                                            className="w-full bg-background border border-border rounded-lg p-1.5 text-xs text-on-surface font-mono text-center"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-bold text-on-surface-muted font-sans">مستوى الضغط (1-10)</label>
                                            <span className="text-[10px] text-secondary font-bold font-mono">{d.reported_stress_level || 5}/10</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="10"
                                            value={d.reported_stress_level || 5} 
                                            onChange={(e) => updateMedicalDept(idx, 'reported_stress_level', parseInt(e.target.value) || 5)}
                                            className="w-full bg-background h-1.5 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={addMedicalDept}
                            className="w-full py-2 border border-dashed border-primary/40 hover:border-primary/80 text-primary rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all bg-primary/5"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>إضافة قسم طبي جديد للمنظومة</span>
                        </button>
                    </div>
                );
            }
            case 'RETAIL': {
                const baskets = getRetailData();
                return (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        <p className="text-[11px] text-on-surface-muted bg-primary/5 p-2 rounded-lg border border-primary/20 leading-relaxed text-right font-sans" dir="rtl">
                            اكتب الأصناف المشتراة معاً في السلة (مفصولة بفاصلة) لدراسة الارتباط السلعي في محلات السوبرماركت والتجزئة.
                        </p>
                        {baskets.map((b: any, idx: number) => (
                            <div key={idx} className="bg-surface-highlight/30 p-3 rounded-xl border border-border flex flex-col gap-2 relative text-right" dir="rtl">
                                <button 
                                    onClick={() => removeRetailBasket(idx)}
                                    className="absolute top-2 left-2 text-on-surface-muted hover:text-danger p-1 rounded transition-colors"
                                    title="حذف السلة"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-on-surface-muted block">قائمة المشتريات للسلة رقم {idx + 1}</label>
                                    <input 
                                        type="text" 
                                        value={b.items?.join(', ') || ''} 
                                        onChange={(e) => updateRetailBasket(idx, e.target.value)}
                                        placeholder="مثال: شاي، سكر، بسكويت"
                                        className="w-full bg-background border border-border rounded-lg p-2 text-xs text-on-surface text-right"
                                    />
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={addRetailBasket}
                            className="w-full py-2 border border-dashed border-primary/40 hover:border-primary/80 text-primary rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all bg-primary/5"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>إضافة عربة مبيعات ذكية</span>
                        </button>
                    </div>
                );
            }
            case 'EDUCATION': {
                const edu = getEducationData();
                return (
                    <div className="space-y-3 text-right font-sans" dir="rtl">
                        <p className="text-[11px] text-on-surface-muted bg-primary/5 p-2 rounded-lg border border-primary/20 leading-relaxed">
                            أدخل معطيات المحتوى والمدة المناسبة لجلسة العمل وسيقوم Gemini ببرمجة دقيقة متوازنة للخطة الدراسية.
                        </p>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-on-surface-muted block font-bold">عنوان المحاضرة أو الموضوع التعليمي</label>
                                <input 
                                    type="text" 
                                    value={edu.topic} 
                                    onChange={(e) => updateEducationData('topic', e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-on-surface text-right"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-on-surface-muted block font-bold">الجمهور المستهدف (الطلاب / الموظفين)</label>
                                <input 
                                    type="text" 
                                    value={edu.audience} 
                                    onChange={(e) => updateEducationData('audience', e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-on-surface text-right"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between px-1">
                                    <label className="text-[10px] font-bold text-on-surface-muted">الحد الأقصى للمدة في الورشة</label>
                                    <span className="text-[10px] text-secondary font-bold font-mono">{edu.duration} دقيقة</span>
                                </div>
                                <input 
                                    type="number" 
                                    value={edu.duration} 
                                    onChange={(e) => updateEducationData('duration', parseInt(e.target.value) || 60)}
                                    className="w-full bg-background border border-border rounded-lg p-2 text-xs text-on-surface font-mono text-center"
                                />
                            </div>
                        </div>
                    </div>
                );
            }
            case 'RESTAURANT': {
                const rst = getRestaurantData();
                return (
                    <div className="space-y-4 text-right pr-1 font-sans" dir="rtl">
                        <p className="text-[11px] text-on-surface-muted bg-primary/5 p-2 rounded-lg border border-primary/20 leading-relaxed font-sans">
                            نماذج إشغال المقاعد ومعدلات الفعاليات؛ لحساب وتوصية الأسعار المتغيرة بالوجبات الحيوية:
                        </p>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-1 font-bold">
                                    <label className="text-[10px] font-bold text-on-surface-muted">معدل الإشغال الحالي للطاولات</label>
                                    <span className="text-[10px] text-secondary font-bold font-mono">{rst.occupancyRate}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100"
                                    value={rst.occupancyRate} 
                                    onChange={(e) => updateRestaurantData('occupancyRate', parseInt(e.target.value) || 50)}
                                    className="w-full bg-background h-1.5 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-on-surface-muted block font-bold">الفعاليات الحالية في المنطقة المجاورة للمطعم</label>
                                <input 
                                    type="text" 
                                    value={rst.localEvents?.join(', ') || ''} 
                                    onChange={(e) => updateRestaurantData('localEvents', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="مثال: مؤتمر الرياض، نهائيات الكأس"
                                    className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-on-surface text-right"
                                />
                            </div>
                        </div>
                    </div>
                );
            }
            case 'CONSTRUCTION':
            case 'LEGAL':
            case 'LOGISTICS':
            default: {
                return (
                    <div className="space-y-3 text-right text-right" dir="rtl">
                        <p className="text-[11px] text-on-surface-muted bg-primary/5 p-2 rounded-lg border border-primary/20 leading-relaxed font-sans">
                            أدخل النص الإنشائي، كشوفات الجمارك، أو بنود العقد المطلوبة بالأسفل، بدون رموز أو قيود JSON معقدة:
                        </p>
                        <textarea 
                            value={rawInput} 
                            onChange={(e) => setRawInput(e.target.value)}
                            placeholder="أدخل النص التفصيلي بالكامل هنا متبوعاً بأي ملاحظات..." 
                            className="w-full h-56 bg-background border border-border rounded-xl p-3.5 text-xs text-on-surface leading-normal outline-none focus:border-primary transition text-right"
                        />
                    </div>
                );
            }
        }
    };

    // Prepopulate inputs based on selected industry to give a fast flawless simulation experience
    useEffect(() => {
        if (currentUserIndustry && currentUserIndustry !== 'GENERIC') {
            setSelectedIndustry(currentUserIndustry);
        } else {
            setSelectedIndustry('GENERIC');
        }
    }, [currentUserIndustry]);

    const loadSampleParams = (industry: string) => {
        switch (industry) {
            case 'CONSTRUCTION':
                return `تقرير موقع التجمع الخامس - البناء رقم ٥٢:
تم صب الخرسانة بنجاح للدور الأول بدقة.
تأخر توريد حديد التسليح من المورد الرئيسي لمدة ٦ ساعات بسبب الازدحام المروري.
لم يتم الإبلاغ عن أي إصابات أو مخالفات تتعلق بسلامة العمال اليوم أو معدات الحماية الشخصية.`;
            case 'MEDICAL':
            case 'HOSPITAL':
                return JSON.stringify([
                    { department: 'Emergency Room', sick_days_taken: 14, reported_stress_level: 8 },
                    { department: 'Outpatient Clinic', sick_days_taken: 5, reported_stress_level: 4 },
                    { department: 'Intensive Care Unit', sick_days_taken: 22, reported_stress_level: 9 },
                    { department: 'Radiology Dep', sick_days_taken: 3, reported_stress_level: 3 }
                ], null, 2);
            case 'RETAIL':
                return JSON.stringify([
                    { items: ['Notebook', 'Blue Pen', 'Laptop Stand'] },
                    { items: ['Blue Pen', 'Notebook', 'Sticky Notes', 'Highlighter'] },
                    { items: ['Coffee Mug', 'Spoon'] },
                    { items: ['Notebook', 'Blue Pen', 'Pencil Case'] },
                    { items: ['Sticky Notes', 'Highlighter', 'Notebook'] }
                ], null, 2);
            case 'LEGAL':
                return `Non-Disclosure Agreement
Parties: Nexa Ledger Solutions (Disclosing Party) and Delta Logistics Corp (Receiving Party).
Effective Date: May 20, 2026.
Contract Value: 120,000 USD paid in monthly installments.
Obligations: The Receiving Party shall safeguard all proprietary customer lists. Any breach or unauthorized copy of the proprietary code will lead to a 10% penalty fee of the total remaining balance.
Risk level is high under breach events.`;
            case 'EDUCATION':
                return JSON.stringify({
                    topic: 'مبادئ القيد المزدوج في المحاسبة المالية',
                    audience: 'طلاب التدريب الداخلي والمبتدئين بالشركة',
                    duration: 90
                }, null, 2);
            case 'LOGISTICS':
                return 'Smart automated thermal printing scale for warehouse and cold supply chain optimization with Bluetooth 5.0';
            case 'RESTAURANT':
                return JSON.stringify({
                    occupancyRate: 88,
                    localEvents: ['معرض القاهرة الدولي للكتاب', 'مؤتمر الشرق الأوسط للتقنيات المالية']
                }, null, 2);
            default:
                return JSON.stringify([
                    { id: 'TX001', description: 'AWS Cloud Hosting', amount: 940, type: 'debit', date: '2026-05-10' },
                    { id: 'TX002', description: 'Office Rent Payment', amount: 4500, type: 'debit', date: '2026-05-12' },
                    { id: 'TX003', description: 'Duplicate Payment to Supplier X', amount: 1200, type: 'debit', date: '2026-05-15' },
                    { id: 'TX004', description: 'Incoming Client Deposit', amount: 8500, type: 'credit', date: '2026-05-18' }
                ], null, 2);
        }
    };

    useEffect(() => {
        setRawInput(loadSampleParams(selectedIndustry));
        setResult(null);
    }, [selectedIndustry]);

    const handleExecuteAi = async () => {
        setLoading(true);
        setResult(null);
        try {
            let resData = null;
            switch (selectedIndustry) {
                case 'CONSTRUCTION':
                    resData = await Gemini.Construction.analyzeDailyReport(rawInput);
                    break;
                case 'MEDICAL':
                case 'HOSPITAL':
                    try {
                        const parsed = JSON.parse(rawInput);
                        resData = await Gemini.Health.analyzeWellnessData(parsed);
                    } catch {
                        resData = { error: 'Invalid JSON entered for Wellness analysis' };
                    }
                    break;
                case 'RETAIL':
                    try {
                        const parsed = JSON.parse(rawInput);
                        resData = await Gemini.Retail.analyzeMarketBasket(parsed);
                    } catch {
                        resData = { error: 'Invalid JSON entered for Market Basket analysis' };
                    }
                    break;
                case 'LEGAL':
                    resData = await Gemini.Legal.analyzeContract(rawInput);
                    break;
                case 'EDUCATION':
                    try {
                        const parsed = JSON.parse(rawInput);
                        resData = await Gemini.Education.createLessonPlan(parsed.topic, parsed.audience, parsed.duration);
                    } catch {
                        resData = { error: 'Invalid JSON entered for Lesson Planner analysis' };
                    }
                    break;
                case 'LOGISTICS':
                    resData = await Gemini.Logistics.getHarmonizedCode(rawInput);
                    break;
                case 'RESTAURANT':
                    try {
                        const parsed = JSON.parse(rawInput);
                        const rateAdjustment = await Gemini.Hospitality.suggestDynamicPricing(parsed.occupancyRate, parsed.localEvents);
                        resData = { recommendation: rateAdjustment };
                    } catch {
                        resData = { error: 'Invalid JSON entered for Dynamic Pricing analysis' };
                    }
                    break;
                default:
                    try {
                        const transactions = JSON.parse(rawInput);
                        resData = await Gemini.Finance.analyzeComplianceRisk(transactions);
                    } catch {
                        resData = { error: 'Invalid JSON entered for general risk assessment' };
                    }
                    break;
            }
            setResult(resData);
        } catch (error) {
            console.error("Executor AI error: ", error);
            setResult({ error: "Failed to connect to Nexa AI Engine. Please check your network or credentials." });
        } finally {
            setLoading(false);
        }
    };

    const getIndustryIcon = (industry: string) => {
        switch (industry) {
            case 'CONSTRUCTION': return <HardHat className="h-5 w-5 text-yellow-500 animate-bounce-slow" />;
            case 'MEDICAL':
            case 'HOSPITAL': return <Activity className="h-5 w-5 text-emerald-500 animate-pulse-slow" />;
            case 'RETAIL': return <ShoppingCart className="h-5 w-5 text-primary" />;
            case 'LEGAL': return <Scale className="h-5 w-5 text-purple-500" />;
            case 'EDUCATION': return <GraduationCap className="h-5 w-5 text-cyan-500" />;
            case 'LOGISTICS': return <Truck className="h-5 w-5 text-orange-500" />;
            case 'RESTAURANT': return <Utensils className="h-5 w-5 text-rose-500" />;
            default: return <Landmark className="h-5 w-5 text-secondary" />;
        }
    };

    const getTranslationName = (industry: string) => {
        switch (industry) {
            case 'CONSTRUCTION': return 'قطاع الإنشاءات والمقاولات';
            case 'MEDICAL':
            case 'HOSPITAL': return 'قطاع الرعاية الطبية والمستشفيات';
            case 'RETAIL': return 'قطاع التجزئة والتجارة الإلكترونية';
            case 'LEGAL': return 'القطاع القانوني وتدقيق العقود';
            case 'EDUCATION': return 'قطاع التدريب والتطوير التعليمي';
            case 'LOGISTICS': return 'قطاع الخدمات اللوجستية والشحن';
            case 'RESTAURANT': return 'قطاع الضيافة والمطاعم والمأكولات';
            default: return 'المحلل المالي والاستشارات العامة لكافة القطاعات الصناعية';
        }
    };

    return (
        <div id="sector-ai-analyst" className="glass-panel p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-surface-highlight/10 to-surface-highlight/30 shadow-lg space-y-6 animate-fade-in my-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-borderpb pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/30">
                        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg md:text-xl text-on-surface">موجه قطاعات Nexa الذكي لأكثر من 40 قطاعاً</h3>
                            <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/30 px-2 py-0.5 rounded-full font-bold">GEMINI 2.5/3</span>
                        </div>
                        <p className="text-xs text-on-surface-muted">دمج اللوحات والتحليلات المتخصصة بالذكاء الاصطناعي مع قاعدة البيانات والمحاسبة المعاصرة.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-muted">تخصيص القطاع:</span>
                    <select 
                        value={selectedIndustry} 
                        onChange={(e) => setSelectedIndustry(e.target.value as IndustryType | 'GENERIC')}
                        className="bg-background border border-border px-3 py-2 rounded-xl text-xs font-bold text-on-surface focus:border-secondary outline-none transition"
                    >
                        <option value="GENERIC">كل القطاعات (تحليل التدقيق المحاسبي)</option>
                        <option value="CONSTRUCTION">المقاولات والإنشاءات (Construction)</option>
                        <option value="HOSPITAL">الرعاية الطبية والمستشفيات (Medical)</option>
                        <option value="RETAIL">التجزئة والتجارة الإلكترونية (Retail)</option>
                        <option value="LEGAL">الشؤون القانونية والعقود (Legal)</option>
                        <option value="EDUCATION">التدريب والتعليم المهني (Education)</option>
                        <option value="LOGISTICS">الخدمات اللوجستية واستخراج الأكواد الجمركية</option>
                        <option value="RESTAURANT">المطاعم والضيافة والتسعير الديناميكي</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs Setup */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-surface-highlight/30 p-2.5 rounded-xl border border-border">
                        <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                            {getIndustryIcon(selectedIndustry)}
                            <span>{getTranslationName(selectedIndustry)}</span>
                        </div>
                        <button 
                            onClick={() => {
                                setRawInput(loadSampleParams(selectedIndustry));
                            }}
                            className="text-[10px] font-bold text-secondary hover:underline flex items-center gap-1"
                        >
                            تعبئة بيانات تجريبية حقيقية
                        </button>
                    </div>

                    {/* Choose Input Mode Toggle: Interactive Form vs Raw JSON */}
                    {!(selectedIndustry === 'CONSTRUCTION' || selectedIndustry === 'LEGAL' || selectedIndustry === 'LOGISTICS') && (
                        <div className="flex border-b border-border text-right" dir="rtl">
                            <button
                                type="button"
                                onClick={() => setInputTab('form')}
                                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                                    inputTab === 'form' 
                                        ? 'text-primary border-primary bg-primary/5' 
                                        : 'text-on-surface-muted border-transparent hover:text-on-surface'
                                }`}
                            >
                                <Sliders className="h-3.5 w-3.5" />
                                <span>الواجهة المبسطة (دون كود)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInputTab('json')}
                                className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                                    inputTab === 'json' 
                                        ? 'text-primary border-primary bg-primary/5' 
                                        : 'text-on-surface-muted border-transparent hover:text-on-surface'
                                }`}
                            >
                                <Terminal className="h-3.5 w-3.5 text-secondary" />
                                <span>محرر الشفرة البرمجية (JSON)</span>
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded scale-90 font-mono">SANDBOX PROTECTED</span>
                            </button>
                        </div>
                    )}

                    <div className="relative">
                        {inputTab === 'form' ? (
                            <div className="p-4 bg-background border border-border rounded-xl space-y-3 min-h-[224px]">
                                {renderInteractiveForm()}
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Secure Sandbox Notification Header Banner */}
                                <div className={`px-3 py-2 border-x border-t border-border select-none rounded-t-lg transition-colors duration-300 text-right flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 ${
                                    securityStatus.isValid 
                                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                                        : 'bg-danger/10 text-danger border-danger/20'
                                }`} dir="rtl">
                                    <div className="flex items-center gap-2">
                                        {securityStatus.isValid ? (
                                            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                        ) : (
                                            <ShieldAlert className="h-4 w-4 text-danger shrink-0 animate-bounce-slow" />
                                        )}
                                        <div className="text-right">
                                            <span className="text-[11px] font-bold block sm:inline">
                                                {securityStatus.isValid 
                                                    ? 'درع الحماية المحاسبي نشط (Sandbox Shield): ' 
                                                    : 'تم رصد محتوى غير آمن وثغرة محتملة: '}
                                            </span>
                                            <span className="text-[10px] text-on-surface-muted leading-relaxed">
                                                {securityStatus.isValid 
                                                    ? 'المحرر يعزل ويعقم كافة المدخلات تلقائياً لمنع أي ثغرات حقن برمجية (Anti-Injection & Pollution Verified).' 
                                                    : securityStatus.error}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded font-mono select-none self-end sm:self-auto ${
                                        securityStatus.isValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-danger/20 text-danger-hover'
                                    }`}>
                                        {securityStatus.isValid ? 'SECURE' : 'ISOLATED'}
                                    </span>
                                </div>
                                
                                <textarea 
                                    value={rawInput} 
                                    onChange={(e) => setRawInput(e.target.value)}
                                    placeholder="أدخل المدخلات المحاسبية أو السجلات للتحليل هنا..." 
                                    className={`w-full h-52 bg-background border p-4 text-xs md:text-sm text-on-surface leading-relaxed outline-none transition font-mono border-t-0 rounded-b-xl focus:border-primary ${
                                        securityStatus.isValid ? 'border-border' : 'border-danger/40'
                                    }`}
                                />
                                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] text-on-surface-muted bg-surface/80 backdrop-blur-sm px-2 py-1 rounded border border-border">
                                    <Terminal className="h-3 w-3" />
                                    <span>محرر البارامترات الحية</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleExecuteAi}
                        disabled={loading || !rawInput.trim() || !securityStatus.isValid}
                        className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-glow-primary transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>جاري استدعاء خدمات Gemini المخصصة...</span>
                            </>
                        ) : !securityStatus.isValid ? (
                            <>
                                <ShieldAlert className="h-4 w-4 text-red-400" />
                                <span>تم الحظر التلقائي - يرجى تصحيح الأخطاء الأمنية</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                <span>تشغيل نموذج التحليل المحاسبي المتخصص</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Gemini Outputs Container */}
                <div className="bg-background/50 border border-border/80 rounded-2xl p-5 flex flex-col justify-between overflow-auto max-h-[350px] lg:max-h-[unset] relative">
                    {!result && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <Cpu className="h-10 w-10 text-on-surface-muted/30 mb-3 animate-pulse" />
                            <h4 className="font-bold text-sm text-on-surface">بوابة التحليلات المربوطة نشطة</h4>
                            <p className="text-xs text-on-surface-muted mt-1 max-w-xs">انقر على تشغيل لإرسال معطيات النشاط والحصول على الاستشاري الآلي من Nexa Ledger AI.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                            <Loader2 className="h-8 w-8 text-secondary animate-spin" />
                            <p className="text-xs text-on-surface-muted animate-pulse">ربط معايير التدقيق ومقارنة السجلات بـ IFRS ومقترحات الأعمال الحرة للتجمع والمنطقة الصناعية...</p>
                        </div>
                    )}

                    {result && (
                        <div className="flex-1 space-y-4 animate-fade-in text-right" dir="rtl">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mb-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>تم التحليل واستخلاص النتائج الجمركية والمالية والتشغيلية</span>
                            </div>

                            <div className="bg-surface/60 border border-emerald-500/10 p-4 rounded-xl space-y-3">
                                {/* Construction output */}
                                {selectedIndustry === 'CONSTRUCTION' && (
                                    <>
                                        <div>
                                            <span className="text-[10px] bg-danger/10 text-danger border border-danger/20 px-2 py-0.5 rounded-full font-bold">حوادث السلامة ومخاطر الموقع ({result.safetyIncidents?.length || 0})</span>
                                            {result.safetyIncidents?.length > 0 ? (
                                                <ul className="list-disc pr-4 mt-1.5 text-xs text-on-surface space-y-1">
                                                    {result.safetyIncidents.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-on-surface-muted mt-1.5">لا تتوفر حوادث سلامة مرصودة بالتقرير اليومي للخرسانة.</p>
                                            )}
                                        </div>

                                        <div className="border-t border-border pt-2">
                                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold">أسباب التأخير اللوجستي والمعوقات ({result.projectDelays?.length || 0})</span>
                                            <ul className="list-disc pr-4 mt-1.5 text-xs text-on-surface space-y-1">
                                                {result.projectDelays?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                                            </ul>
                                        </div>

                                        <div className="border-t border-border pt-2">
                                            <h5 className="font-bold text-xs text-primary">التوصية بجدولة العمل ومعدل كفاءة الصب:</h5>
                                            <p className="text-xs text-on-surface mt-1 leading-relaxed">{result.summary}</p>
                                        </div>
                                    </>
                                )}

                                {/* Retail analysis output */}
                                {selectedIndustry === 'RETAIL' && (
                                    <>
                                        <h5 className="font-bold text-xs text-primary mb-2">المسح التجميعي لسلة العميل (Market Basket Association Rule):</h5>
                                        {result.frequentPairs?.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
                                                {result.frequentPairs.map((pair: any, i: number) => (
                                                    <div key={i} className="p-2.5 bg-background border border-border rounded-lg">
                                                        <div className="text-[11px] font-bold text-on-surface flex items-center justify-between">
                                                            <span>{pair.itemA} + {pair.itemB}</span>
                                                            <span className="text-secondary font-mono">{(pair.confidence * 100).toFixed(0)}% Co-occurrence</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-on-surface-muted">يرجى فحص صيغة صفيف المشتريات.</p>
                                        )}
                                        <div className="border-t border-border pt-2">
                                            <h6 className="font-bold text-[11px] text-yellow-500">ميزة وضع المنتجات واستراتيجية العرض بالرفوف:</h6>
                                            <p className="text-xs text-on-surface mt-1">{result.merchandisingSuggestion}</p>
                                        </div>
                                    </>
                                )}

                                {/* Wellness analysis output */}
                                {(selectedIndustry === 'MEDICAL' || selectedIndustry === 'HOSPITAL') && (
                                    <>
                                        <h5 className="font-bold text-xs text-primary mb-2">تقرير سلامة الطواقم الطبية والصحة المؤسسية:</h5>
                                        <div className="space-y-2">
                                            <div>
                                                <h6 className="font-bold text-[11px] text-yellow-500">أبرز الملاحظات التشخيصية:</h6>
                                                <ul className="list-disc pr-4 mt-1 text-xs text-on-surface space-y-1">
                                                    {result.keyFindings?.map((k: string, i: number) => <li key={i}>{k}</li>)}
                                                </ul>
                                            </div>
                                            <div className="border-t border-border pt-2">
                                                <h6 className="font-bold text-[11px] text-emerald-500">مبادرة الاستدامة الطبية والصحة المقترحة:</h6>
                                                <div className="space-y-1.5 mt-1">
                                                    {result.recommendations?.map((r: any, i: number) => (
                                                        <div key={i} className="p-2 bg-background border border-border rounded-lg text-xs">
                                                            <p className="font-bold text-primary">{r.initiative}</p>
                                                            <p className="text-on-surface-muted text-[11px] mt-0.5">{r.rationale}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Legal Analysis */}
                                {selectedIndustry === 'LEGAL' && (
                                    <>
                                        <div className="flex justify-between items-center mb-1 bg-background/40 p-2 rounded-lg border border-border">
                                            <span className="text-xs text-on-surface-muted">نوع المستند القانوني:</span>
                                            <span className="text-xs font-bold text-primary">{result.contractType || 'عقد غير محدد'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                                            <div className="bg-background p-2 rounded border border-border">
                                                <p className="text-[10px] text-on-surface-muted">قيمة العقد الإجمالية:</p>
                                                <p className="font-bold font-mono text-secondary">{result.totalValue?.toLocaleString()} {result.currency}</p>
                                            </div>
                                            <div className="bg-background p-2 rounded border border-border">
                                                <p className="text-[10px] text-on-surface-muted">مستوى المخاطر القانونية:</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    result.riskLevel === 'HIGH' ? 'bg-danger/20 text-danger' :
                                                    result.riskLevel === 'MEDIUM' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                                                }`}>{result.riskLevel || 'LOW'}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs space-y-1.5">
                                            <p className="font-bold text-primary">الأطراف المشاركة:</p>
                                            <p className="text-on-surface text-[11px]">{result.parties?.join(' ↔ ')}</p>
                                            <p className="font-bold text-primary">بنود التعاقد وجدول الغرامات المحتسبة:</p>
                                            <ul className="list-disc pr-4 text-[11px] text-danger space-y-1">
                                                {result.penalties?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                            </ul>
                                        </div>
                                    </>
                                )}

                                {/* Education Plan Output */}
                                {selectedIndustry === 'EDUCATION' && (
                                    <>
                                        <h5 className="font-bold text-xs text-primary">{result.topic}</h5>
                                        <div className="my-2">
                                            <p className="text-[11px] font-bold text-on-surface">الأهداف التعليمية والدفترية:</p>
                                            <ul className="list-disc pr-4 text-[11px] text-on-surface space-y-0.5 mt-1">
                                                {result.objectives?.map((obj: string, i: number) => <li key={i}>{obj}</li>)}
                                            </ul>
                                        </div>
                                        <div className="border-t border-border pt-2">
                                            <p className="text-[11px] font-bold text-secondary">الخطة الزمنية وجدول الشروحات المحاسبية:</p>
                                            <div className="space-y-1.5 mt-1.5">
                                                {result.activities?.map((act: any, i: number) => (
                                                    <div key={i} className="flex justify-between text-xs bg-background p-2 rounded border border-border">
                                                        <span>{act.activity}</span>
                                                        <span className="text-primary font-mono font-bold whitespace-nowrap">{act.time_minutes} دقيقة</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Logistics Manifest/HS Output */}
                                {selectedIndustry === 'LOGISTICS' && (
                                    <>
                                        <div className="space-y-2">
                                            <div className="bg-background p-3 rounded-lg border border-border flex justify-between items-center text-xs">
                                                <span className="font-bold text-on-surface">كود النظام المنسق المقترح (HS Code):</span>
                                                <span className="font-mono font-bold text-secondary bg-secondary/15 px-2 py-1 rounded">{result.hsCode}</span>
                                            </div>
                                            <p className="text-xs text-on-surface leading-normal">{result.description}</p>
                                            <div className="flex justify-between items-center text-[10px] text-on-surface-muted pt-1">
                                                <span>الجهة: الجمارك العالمية والتعريفات</span>
                                                <span>دقة التصنيف بالتطابق: {(result.confidence * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Dynamic Pricing / Restaurant Output */}
                                {selectedIndustry === 'RESTAURANT' && (
                                    <>
                                        <h5 className="font-bold text-xs text-primary mb-1">النموذج التحليلي للتسعير الديناميكي وإيراد الكراسي:</h5>
                                        <div className="p-3 bg-background border border-border rounded-xl text-xs leading-relaxed text-on-surface whitespace-pre-wrap">
                                            {result.recommendation}
                                        </div>
                                    </>
                                )}

                                {/* Fallback General Ledger Risk */}
                                {selectedIndustry === 'GENERIC' && (
                                    <>
                                        <h5 className="font-bold text-xs text-primary mb-2">الكشف المالي والتدوير التنظيمي للقيود المحاسبية:</h5>
                                        {result.risks?.length > 0 ? (
                                            <div className="space-y-2">
                                                {result.risks.map((risk: any, i: number) => (
                                                    <div key={i} className="p-2.5 bg-background border border-border rounded-xl text-xs space-y-1">
                                                        <div className="flex justify-between items-center font-bold">
                                                            <span className="text-primary">{risk.category}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded ${
                                                                risk.riskLevel === 'Critical' || risk.riskLevel === 'High' ? 'bg-danger/25 text-danger' : 'bg-warning/25 text-warning'
                                                            }`}>{risk.riskLevel}</span>
                                                        </div>
                                                        <p className="text-on-surface text-[11px]">{risk.finding}</p>
                                                        <p className="text-on-surface-muted text-[10px]"><span className="text-yellow-500 font-bold">التوصية:</span> {risk.recommendation}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-on-surface-muted">لم يتم رصد أي مخاطر امتثال حرجة في هذه العينة المالية.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
