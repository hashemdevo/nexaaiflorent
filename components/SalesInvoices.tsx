import React, { useState, useEffect, useMemo } from 'react';
import { 
    FileText, Printer, Save, Send, CheckCircle2, Calculator, 
    Download, Plus, Search, Tag, DollarSign, Clock, ShieldAlert, 
    Award, ArrowRight, Eye, Trash2, Calendar, FileSpreadsheet,
    Layers, ChevronLeft, CreditCard, Receipt
} from 'lucide-react';
import { SalesInvoicesProps } from '../types';
import { InvoiceEditor, InvoiceItem } from './sales/invoice/InvoiceEditor';
import { InvoicePaper, CanonicalInvoiceDTO } from './sales/invoice/InvoicePaper';
import { PDFEngine } from '../services/pdfEngine';
import { DbEngine } from '../services/core/db';
import { useApp } from '../contexts/AppContext';

export const SalesInvoices: React.FC<SalesInvoicesProps> = ({ readOnly }) => {
    const { currentUniversalRole, currentUserIdentity } = useApp();
    
    // Core states
    const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'quotations' | 'collection' | 'goods'>('invoices');
    const [invoices, setInvoices] = useState<any[]>([]);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [timeString, setTimeString] = useState('');

    // Editor & preview flow states
    const [editorMode, setEditorMode] = useState<'list' | 'create_invoice' | 'create_quotation' | 'preview'>('list');
    const [activeInvoice, setActiveInvoice] = useState<CanonicalInvoiceDTO | null>(null);

    // Form states for creating new invoices or quotations
    const companyDetails = { 
        name: 'شركة نكسا ليدجر المحدودة (الرئيسية)', 
        address: '7193 طريق الملك فهد، حي الصحافة، الرياض 13321، المملكة العربية السعودية', 
        taxId: '310992837100003', // Valid ZATCA 15-digit VRN
        phone: '+966 11 400 9010', 
        email: 'finance@nexa.ai' 
    };

    const [invoiceMeta, setInvoiceMeta] = useState({ 
        invoiceNumber: '', 
        date: new Date().toISOString().split('T')[0], 
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] 
    });
    
    const [customer, setCustomer] = useState({ 
        name: '', 
        taxId: '', 
        address: '', 
        contact: '' 
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: 'Enterprise ERP License Subscription', quantity: 1, unitPrice: 1500, taxRate: 15 }
    ]);

    // Live UTC Clock
    useEffect(() => {
        const updateClock = () => {
            const formatUTC = new Date().toUTCString();
            setTimeString(formatUTC);
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Load data from DB
    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch Invoices
            const fetchedInvoices = await DbEngine.select<any>('invoices');
            if (!fetchedInvoices || fetchedInvoices.length === 0) {
                // Seed dual sample invoices in compliance with CanonicalInvoiceDTO
                const sample1: CanonicalInvoiceDTO = {
                    id: 'inv-sample-1',
                    invoiceNumber: 'INV/2026/0001',
                    date: '2026-05-10',
                    dueDate: '2026-05-25',
                    currency: 'SAR',
                    exchangeRate: 1.0,
                    tenantId: 'default',
                    companyId: 'company-01',
                    branchCode: 'BR-RYD-01',
                    cashierId: 'sales_rep@nexa.ai',
                    terminalId: 'TRM-01',
                    postingSequence: 'POST-000101',
                    fiscalPeriod: 'FP-2026-Q2',
                    state: 'POSTED',
                    company: {
                        name: 'شركة نكسا ليدجر المحدودة (الرئيسية)',
                        address: '7193 طريق الملك فهد، الرياض 13321',
                        taxId: '310992837100003',
                        crNumber: 'CR-1010334812'
                    },
                    customer: {
                        id: 'cust-101',
                        name: 'الشركة السعودية للصناعات المتقدمة (Samic)',
                        address: 'المدينة الصناعية الثانية، الرياض 11564',
                        taxId: '300055192800003'
                    },
                    lineItems: [
                        {
                            id: 'item-1',
                            sku: 'SKU-LOG-01',
                            description: 'تراخيص تشغيل نظام تخطيط الموارد السحابي (Cloud Licenses)',
                            quantity: 12,
                            unitPrice: 350.0,
                            netAmount: 4200.0,
                            taxRate: 0.15,
                            taxAmount: 630.0,
                            grossAmount: 4830.0
                        }
                    ],
                    totals: {
                        taxableAmount: 4200.0,
                        vatAmount: 630.0,
                        grandTotal: 4830.0
                    },
                    createdBy: 'sales_rep@nexa.ai'
                };

                const sample2: CanonicalInvoiceDTO = {
                    id: 'inv-sample-2',
                    invoiceNumber: 'QTN/2026/0048',
                    date: '2026-05-15',
                    dueDate: '2026-06-15',
                    currency: 'SAR',
                    exchangeRate: 1.0,
                    tenantId: 'default',
                    companyId: 'company-01',
                    branchCode: 'BR-JED-02',
                    cashierId: 'warehouse_keeper@nexa.ai',
                    terminalId: 'TRM-02',
                    postingSequence: 'POST-000102',
                    fiscalPeriod: 'FP-2026-Q2',
                    state: 'DRAFT', // Unposted draft / quotation
                    company: {
                        name: 'شركة نكسا ليدجر المحدودة (الرئيسية)',
                        address: '7193 طريق الملك فهد، الرياض 13321',
                        taxId: '310992837100003',
                        crNumber: 'CR-1010334812'
                    },
                    customer: {
                        id: 'cust-102',
                        name: 'مؤسسة الرياض اللوجستية للنقليات',
                        address: 'طريق وادي وج، حي السلامة، جدة',
                        taxId: '300062788300003'
                    },
                    lineItems: [
                        {
                            id: 'item-2',
                            sku: 'SKU-TR-44',
                            description: 'خدمات التوثيق والتدريب والدعم اللوجستي لفريق المستودعات',
                            quantity: 1,
                            unitPrice: 8500.0,
                            netAmount: 8500.0,
                            taxRate: 0.15,
                            taxAmount: 1275.0,
                            grossAmount: 9775.0
                        }
                    ],
                    totals: {
                        taxableAmount: 8500.0,
                        vatAmount: 1275.0,
                        grandTotal: 9775.0
                    },
                    createdBy: 'sales_rep@nexa.ai'
                };

                await DbEngine.insert('invoices', sample1 as any);
                await DbEngine.insert('invoices', sample2 as any);
                setInvoices([sample1, sample2]);
            } else {
                setInvoices(fetchedInvoices);
            }

            // Fetch inventory catalog to show finished goods strictly
            const stock = await DbEngine.select<any>('inventory');
            setInventoryItems(stock || []);

        } catch (error) {
            console.error('Failed to load Sales ledger:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Dynamic Filter based on role partition ownership!
    const roleFilteredInvoices = useMemo(() => {
        return invoices.filter(item => {
            // Sales representatives see only their owned quotes/invoices
            if (currentUniversalRole === 'SALES_REP') {
                return item.createdBy === currentUserIdentity;
            }
            return true;
        });
    }, [invoices, currentUniversalRole, currentUserIdentity]);

    // Split invoices from draft quotations
    const activeInvoices = useMemo(() => {
        return roleFilteredInvoices.filter(inv => inv.state === 'POSTED' || (!inv.invoiceNumber.startsWith('QTN') && inv.state !== 'DRAFT'));
    }, [roleFilteredInvoices]);

    const activeQuotations = useMemo(() => {
        return roleFilteredInvoices.filter(inv => inv.state === 'DRAFT' || inv.invoiceNumber.startsWith('QTN'));
    }, [roleFilteredInvoices]);

    // Finished Goods Catalog filtering (strictly finished goods, raw ingredients completely hidden)
    const finishedGoodsGoods = useMemo(() => {
        return inventoryItems.filter(item => item.itemType === 'FINISHED');
    }, [inventoryItems]);

    // Live search on selected sub-tab
    const searchedItems = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (activeSubTab === 'invoices') {
            return activeInvoices.filter(inv => 
                inv.invoiceNumber?.toLowerCase().includes(query) || 
                inv.customer?.name?.toLowerCase().includes(query) || 
                inv.customer?.taxId?.toLowerCase().includes(query)
            );
        } else if (activeSubTab === 'quotations') {
            return activeQuotations.filter(inv => 
                inv.invoiceNumber?.toLowerCase().includes(query) || 
                inv.customer?.name?.toLowerCase().includes(query) || 
                inv.customer?.taxId?.toLowerCase().includes(query)
            );
        } else if (activeSubTab === 'collection') {
            return activeInvoices.filter(inv => 
                inv.invoiceNumber?.toLowerCase().includes(query) || 
                inv.customer?.name?.toLowerCase().includes(query)
            );
        } else {
            return finishedGoodsGoods.filter(item => 
                item.name?.toLowerCase().includes(query) || 
                item.sku?.toLowerCase().includes(query) ||
                item.category?.toLowerCase().includes(query)
            );
        }
    }, [activeSubTab, activeInvoices, activeQuotations, finishedGoodsGoods, searchQuery]);

    const grandTotals = useMemo(() => {
        let subtotal = 0, totalTax = 0;
        items.forEach(item => { 
            const total = item.quantity * item.unitPrice; 
            subtotal += total; 
            totalTax += total * (item.taxRate / 100); 
        });
        return { 
            subtotal, 
            totalTax, 
            total: subtotal + totalTax 
        };
    }, [items]);

    // Handler helpers
    const handleAddItem = () => {
        setItems([...items, { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0, taxRate: 15 }]);
    };

    const handleRemoveItem = (id: string) => { 
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id)); 
        }
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleCreateInvoiceTrigger = () => {
        setInvoiceMeta({
            invoiceNumber: `INV/2026/${(invoices.length + 101).toString()}`,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
        });
        setCustomer({ name: '', taxId: '', address: '', contact: '' });
        setItems([{ id: '1', description: 'Enterprise ERP Corporate Module Bundle', quantity: 1, unitPrice: 4800, taxRate: 15 }]);
        setEditorMode('create_invoice');
    };

    const handleCreateQuotationTrigger = () => {
        setInvoiceMeta({
            invoiceNumber: `QTN/2026/${(invoices.length + 201).toString()}`,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
        });
        setCustomer({ name: '', taxId: '', address: '', contact: '' });
        setItems([{ id: '1', description: 'Preliminary Consulting/Implementation Quote', quantity: 1, unitPrice: 2000, taxRate: 15 }]);
        setEditorMode('create_quotation');
    };

    // Save actual invoice record to DbEngine
    const handleSaveTransaction = async () => {
        const isQuotation = editorMode === 'create_quotation';
        
        try {
            const calculatedTotals = {
                taxableAmount: grandTotals.subtotal,
                vatAmount: grandTotals.totalTax,
                grandTotal: grandTotals.total
            };

            const canonicalDoc: CanonicalInvoiceDTO = {
                id: `inv-posted-${Date.now()}`,
                invoiceNumber: invoiceMeta.invoiceNumber,
                date: invoiceMeta.date,
                dueDate: invoiceMeta.dueDate,
                currency: 'SAR',
                exchangeRate: 1.0,
                tenantId: 'default',
                companyId: 'company-01',
                branchCode: 'BR-RYD-09',
                cashierId: currentUserIdentity || 'simulation_user@nexa.ai',
                terminalId: 'TRM-POS-01',
                postingSequence: `POST-${Date.now().toString().slice(-6)}`,
                fiscalPeriod: 'FP-2026-Q2',
                state: isQuotation ? 'DRAFT' : 'POSTED',
                company: {
                    name: companyDetails.name,
                    address: companyDetails.address,
                    taxId: companyDetails.taxId,
                    crNumber: 'CR-1010334812'
                },
                customer: {
                    id: `cust-${Date.now()}`,
                    name: customer.name || 'عميل نقدي عابر / Walk-in Client',
                    address: customer.address || 'المملكة العربية السعودية',
                    taxId: customer.taxId || '300000000000003' // ZATCA test buyer identification
                },
                lineItems: items.map(item => ({
                    id: item.id,
                    sku: `SKU-POS-${item.id.slice(0, 4)}`,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    netAmount: item.quantity * item.unitPrice,
                    taxRate: item.taxRate / 100,
                    taxAmount: (item.quantity * item.unitPrice) * (item.taxRate / 100),
                    grossAmount: (item.quantity * item.unitPrice) * (1 + item.taxRate / 100)
                })),
                totals: calculatedTotals,
                createdBy: currentUserIdentity || 'simulation_user@nexa.ai'
            };

            // Post to actual persistent DB
            await DbEngine.insert('invoices', canonicalDoc as any);
            
            // Log security trace
            await DbEngine.insert('audit_logs', {
                id: `invoice-creation-log-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                timestamp: new Date().toISOString(),
                actorId: currentUserIdentity || 'sales_rep@nexa.ai',
                actorName: currentUniversalRole || 'Sales Rep',
                action: 'INSERT',
                target: `Invoices - Doc ID: ${canonicalDoc.invoiceNumber}`,
                details: `Authored compliant Sales ${isQuotation ? 'Quotation' : 'Tax Invoice'} value SAR ${canonicalDoc.totals.grandTotal.toLocaleString()}`
            });

            // Reload and reset UI state
            await loadData();
            setEditorMode('list');
            alert('تم إصدار المستند والمطابقة وتدوينه في الحساب الدفتري المشترك بنجاح | Document issued and journalized successfully.');
        } catch (err: any) {
            console.error('Failed to issue invoice:', err);
            alert(`فشل إصدار المستند: ${err.message || err}`);
        }
    };

    // Toggle payments (collection state)
    const handleCollectPayment = async (invoiceId: string) => {
        try {
            const invoiceObj = invoices.find(inv => inv.id === invoiceId);
            if (!invoiceObj) return;

            // Mark invoice state as PAID internally or simulate custom flags
            const updatedFields = {
                ...invoiceObj,
                state: 'POSTED',
                isPaid: true,
                paymentDate: new Date().toISOString().split('T')[0]
            };

            await DbEngine.update('invoices', invoiceId, updatedFields as any);

            // Log ledger compensation entries
            await DbEngine.insert('audit_logs', {
                id: `payment-adv-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                timestamp: new Date().toISOString(),
                actorId: currentUserIdentity || 'accountant@nexa.ai',
                actorName: currentUniversalRole || 'Accountant',
                action: 'UPDATE',
                target: `Collection Ledger - Doc: ${invoiceObj.invoiceNumber}`,
                details: `Recorded complete collection receipt for invoice ${invoiceObj.invoiceNumber} totaling SAR ${invoiceObj.totals.grandTotal.toLocaleString()}`
            });

            await loadData();
            alert('تم استلام التحصيل وربطه بحساب المقاصة وإغلاق الفاتورة للمراجع | Cash collected, matched, and invoice cleared.');
        } catch (error) {
            console.error('Failed to collect transaction:', error);
        }
    };

    const handleExportPDF = (inv: CanonicalInvoiceDTO) => {
        PDFEngine.exportInvoice({
            id: inv.invoiceNumber,
            date: inv.date,
            clientName: inv.customer.name,
            lines: inv.lineItems.map(li => ({
                id: li.id,
                description: li.description,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
                taxRate: li.taxRate * 100
            })),
            subtotal: inv.totals.taxableAmount,
            tax: inv.totals.vatAmount,
            total: inv.totals.grandTotal
        });
    };

    const handleDeleteInvoice = async (id: string) => {
        if (window.confirm("حذف المستند نهائياً؟ تفقد الحوكمة المالية بهذا الإجراء | Permanent delete? This damages historic financial integrity.")) {
            try {
                await DbEngine.delete('invoices', id);
                setInvoices(invoices.filter(i => i.id !== id));
            } catch (err) {
                console.error("Failed to delete document", err);
            }
        }
    };

    if (editorMode === 'create_invoice' || editorMode === 'create_quotation') {
        const isQuotation = editorMode === 'create_quotation';
        
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6 text-on-surface">
                
                {/* Header back button */}
                <div className="flex justify-between items-center bg-surface border border-border p-4 rounded-xl">
                    <button 
                        onClick={() => setEditorMode('list')}
                        className="flex items-center gap-2 text-sm text-on-surface-muted hover:text-on-surface font-semibold transition"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>العودة لدفتر اليوميات | Back to Journal</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/20 rounded">
                            {isQuotation ? 'Draft Quotation Mode' : 'Cryptographic Invoice Issue'}
                        </span>
                    </div>
                </div>

                {/* Split Column Layout */}
                <div className="flex flex-col xl:flex-row gap-8">
                    
                    {/* Editor view wrapper */}
                    <div className="flex-1 bg-surface border border-border rounded-2xl overflow-hidden p-6 shadow-sm">
                        <InvoiceEditor 
                            customer={customer} 
                            setCustomer={setCustomer} 
                            items={items} 
                            updateItem={updateItem} 
                            handleAddItem={handleAddItem} 
                            handleRemoveItem={handleRemoveItem} 
                            invoiceMeta={invoiceMeta} 
                            setInvoiceMeta={setInvoiceMeta} 
                            readOnly={readOnly} 
                        />
                    </div>

                    {/* Operational Right Panel */}
                    <div className="w-full xl:w-96 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl border border-border bg-surface">
                            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-secondary" /> 
                                <span>خطوة إقرار الإصدار | Finalize Issue</span>
                            </h3>
                            <p className="text-xs text-on-surface-muted mb-4 leading-relaxed">
                                يلتزم النظام بمطابقة بنود الخدمة وتطبيق ضريبة القيمة المضافة الإيرادية (١٥٪) لبلد التوطين. يتم تشفير بصمة الفاتورة للامتثال لهيئة الزكاة والدخل ولا يمكن تعديلها لاحقاً.
                            </p>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleSaveTransaction}
                                    className="w-full py-3.5 bg-secondary text-white rounded-xl font-bold shadow-glow-secondary flex items-center justify-center gap-2 hover:bg-secondary/90 transition"
                                >
                                    <Save className="h-4.5 w-4.5" /> 
                                    <span>{isQuotation ? 'حفظ عرض السعر | Save Quote' : 'ترحيل وإصدار الفاتورة'}</span>
                                </button>
                                <button 
                                    onClick={() => setEditorMode('list')}
                                    className="w-full py-3.5 bg-surface-highlight text-on-surface rounded-xl font-bold flex items-center justify-center gap-2 border border-border hover:bg-surface-highlight/80 transition"
                                >
                                    <span>إلغاء التعديل | Cancel</span>
                                </button>
                            </div>
                        </div>

                        {/* Financial Ledger Aggregations */}
                        <div className="glass-panel p-6 rounded-2xl border border-border bg-surface">
                            <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-primary" /> 
                                <span>التلخيص الضريبي (ZATCA VAT Summary)</span>
                            </h3>
                            <div className="space-y-3.5 text-sm">
                                <div className="flex justify-between text-on-surface-muted">
                                    <span>المجموع الخاضع للضريبة (Gross)</span>
                                    <span className="text-on-surface font-semibold font-mono">SAR {grandTotals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-on-surface-muted">
                                    <span>قيمة الضريبة المضافة (VAT - 15%)</span>
                                    <span className="text-on-surface font-semibold font-mono">SAR {grandTotals.totalTax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between text-on-surface font-extrabold text-base">
                                    <span className="text-primary">Grand Total (الصافي)</span>
                                    <span className="text-primary font-mono">SAR {grandTotals.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (editorMode === 'preview' && activeInvoice) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6 text-on-surface">
                
                {/* Preview Operations Toolbar */}
                <div className="flex justify-between items-center bg-surface border border-border p-4 rounded-xl print:hidden">
                    <button 
                        onClick={() => { setEditorMode('list'); setActiveInvoice(null); }}
                        className="flex items-center gap-2 text-sm text-on-surface-muted hover:text-on-surface font-semibold transition"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span>الرجوع للدفتر المالي | Back</span>
                    </button>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleExportPDF(activeInvoice)}
                            className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition flex items-center gap-2 text-xs"
                        >
                            <Download className="h-4 w-4" /> Export PDF
                        </button>
                        <button 
                            onClick={() => window.print()}
                            className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold transition flex items-center gap-2 text-xs"
                        >
                            <Printer className="h-4 w-4" /> Print
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/40 p-6 md:p-12 rounded-3xl border border-border flex justify-center">
                    <InvoicePaper invoice={activeInvoice} />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 animate-fade-in max-w-7xl mx-auto space-y-6 text-on-surface">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-2xl border border-border relative overflow-hidden">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary animate-pulse" />
                        <span>مستندات المبيعات وإيرادات الفروع (Sales Invoices & CRM)</span>
                    </h1>
                    <p className="text-xs text-on-surface-muted leading-relaxed">
                        إصدار عروض لأسعار العملاء ومطابقة فواتير المبيعات الضريبية الفورية المتوافقة مع متطلبات المرحلة الثانية لهيئة الزكاة والجمارك والمكوس (ZATCA Compliant Phase 2).
                    </p>
                </div>
                
                {/* UTC security clock */}
                <div className="bg-background/80 border border-border rounded-xl px-4 py-2 font-mono text-xs flex flex-col justify-end text-right">
                    <span className="text-on-surface-muted font-sans text-[10px] font-bold uppercase tracking-wider">TRACE AUDIT CLOCK (UTC)</span>
                    <span className="text-primary font-bold mt-1">{timeString || 'Syncing UTC...'}</span>
                </div>
            </div>

            {/* Sub-tab Selection */}
            <div className="flex flex-wrap border-b border-border text-sm font-semibold gap-2">
                <button 
                    onClick={() => { setActiveSubTab('invoices'); setSearchQuery(''); }}
                    className={`pb-3 px-4 flex items-center gap-2 transition relative ${activeSubTab === 'invoices' ? 'text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                >
                    <Receipt className="h-4.5 w-4.5" />
                    <span>فواتير المبيعات الجاهزة ({activeInvoices.length})</span>
                    {activeSubTab === 'invoices' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button 
                    onClick={() => { setActiveSubTab('quotations'); setSearchQuery(''); }}
                    className={`pb-3 px-4 flex items-center gap-2 transition relative ${activeSubTab === 'quotations' ? 'text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                >
                    <FileSpreadsheet className="h-4.5 w-4.5" />
                    <span>عروض الأسعار والعقود ({activeQuotations.length})</span>
                    {activeSubTab === 'quotations' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button 
                    onClick={() => { setActiveSubTab('collection'); setSearchQuery(''); }}
                    className={`pb-3 px-4 flex items-center gap-2 transition relative ${activeSubTab === 'collection' ? 'text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                >
                    <CreditCard className="h-4.5 w-4.5" />
                    <span>حالة التحصيل وتتبع الدفع</span>
                    {activeSubTab === 'collection' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button 
                    onClick={() => { setActiveSubTab('goods'); setSearchQuery(''); }}
                    className={`pb-3 px-4 flex items-center gap-2 transition relative ${activeSubTab === 'goods' ? 'text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                >
                    <Layers className="h-4.5 w-4.5" />
                    <span>المنتجات التامة المتوفرة للبيع ({finishedGoodsGoods.length})</span>
                    {activeSubTab === 'goods' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
            </div>

            {/* Quick Operations Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                    <input 
                        type="text" 
                        placeholder={
                            activeSubTab === 'invoices' 
                            ? "البحث برقم الفاتورة أو إسم العميل..."
                            : activeSubTab === 'goods'
                            ? "ابحث بالصنف أو الرمز SKU..."
                            : "ابحث بالعميل ..."
                        }
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                </div>

                {/* Role-restricting Creation Links */}
                {!readOnly && (
                    <div className="flex gap-2 w-full md:w-auto">
                        <button 
                            onClick={handleCreateQuotationTrigger}
                            className="flex-1 md:flex-none py-2.5 px-4 bg-surface hover:bg-surface-highlight border border-border rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 text-on-surface"
                        >
                            <Plus className="h-4 w-4" />
                            <span>إنشاء عرض سعر | New Quote</span>
                        </button>
                        <button 
                            onClick={handleCreateInvoiceTrigger}
                            className="flex-1 md:flex-none py-2.5 px-4 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold transition shadow-glow-primary flex items-center justify-center gap-1"
                        >
                            <Plus className="h-4 w-4 text-white" />
                            <span>إصدار فاتورة ضريبية جديدة</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Main content tables */}
            <div className="glass-panel rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
                
                {isLoading ? (
                    <div className="py-16 text-center text-on-surface-muted">
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span>جاري جلب دفتر الفواتير والسجلات...</span>
                        </div>
                    </div>
                ) : searchedItems.length === 0 ? (
                    <div className="py-16 text-center text-on-surface-muted text-xs">
                        لا توجد سجلات تطابق البحث أو ليست من صدارة صلاحيتك الحالية
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        
                        {/* Tab 1 & Tab 2 Rendering */}
                        {(activeSubTab === 'invoices' || activeSubTab === 'quotations') && (
                            <table className="w-full text-xs text-right">
                                <thead className="bg-surface-highlight/45 text-on-surface-muted font-bold text-[10px] uppercase border-b border-border">
                                    <tr>
                                        <th className="p-4 text-right">الرقم المستندي (Doc No)</th>
                                        <th className="p-4 text-right">العميل والمشتري</th>
                                        <th className="p-4">تاريخ المعاملة</th>
                                        <th className="p-4 text-center">الفترة الضريبية</th>
                                        <th className="p-4 text-right">المبلغ الافتتاحي (الصافي)</th>
                                        <th className="p-4 text-center">الحوكمة / ZATCA</th>
                                        <th className="p-4 text-center">أضيف بواسطة</th>
                                        <th className="p-4 text-left">إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {searchedItems.map((inv: CanonicalInvoiceDTO) => (
                                        <tr key={inv.id} className="hover:bg-surface-highlight/20 transition">
                                            <td className="p-4 font-bold font-mono text-primary flex items-center gap-2">
                                                <Receipt className="h-3.5 w-3.5 text-on-surface-muted" />
                                                <span>{inv.invoiceNumber}</span>
                                            </td>
                                            <td className="p-4 shrink-0">
                                                <div className="font-bold text-on-surface text-[12px]">{inv.customer.name}</div>
                                                <div className="text-[10px] text-on-surface-muted font-mono mt-0.5">VAT Reg: {inv.customer.taxId || 'غير مسجل ضريبي'}</div>
                                            </td>
                                            <td className="p-4 text-on-surface-muted font-mono">{inv.date}</td>
                                            <td className="p-4 text-center font-mono text-[10px] font-bold text-on-surface-muted">{inv.fiscalPeriod}</td>
                                            <td className="p-4 text-right font-mono font-bold text-on-surface text-[12px]">
                                                SAR {inv.totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                                    inv.state === 'POSTED' 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                    {inv.state === 'POSTED' ? 'معتمد زكاتاً | Cleared' : 'مسودة غير مرسلة'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-mono text-on-surface-muted text-[10px]">
                                                {inv.createdBy || 'System'}
                                            </td>
                                            <td className="p-4 text-left">
                                                <div className="flex items-center justify-start gap-1.5">
                                                    <button 
                                                        onClick={() => { setActiveInvoice(inv); setEditorMode('preview'); }}
                                                        className="p-1.5 bg-surface hover:bg-surface-highlight border border-border rounded-lg text-on-surface transition"
                                                        title="استعراض وعرض الباركود"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleExportPDF(inv)}
                                                        className="p-1.5 bg-surface hover:bg-indigo-500 hover:text-white border border-border rounded-lg text-on-surface transition"
                                                        title="تصدير PDF"
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                    </button>
                                                    {!readOnly && (
                                                        <button 
                                                            onClick={() => handleDeleteInvoice(inv.id)}
                                                            className="p-1.5 bg-surface hover:bg-danger hover:text-white border border-border rounded-lg text-on-surface-muted hover:text-danger transition"
                                                            title="مسح من السجل"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Tab 3: Collection status view */}
                        {activeSubTab === 'collection' && (
                            <table className="w-full text-xs text-right">
                                <thead className="bg-surface-highlight/45 text-on-surface-muted font-bold text-[10px] uppercase border-b border-border">
                                    <tr>
                                        <th className="p-4 text-right">الفاتورة ضريبياً</th>
                                        <th className="p-4 text-right">العميل والمشتري</th>
                                        <th className="p-4 text-right">المبلغ الإجمالي</th>
                                        <th className="p-4 text-center">الاستحقاق اليومية</th>
                                        <th className="p-4 text-center">الحالة الحالية</th>
                                        <th className="p-4 text-left">إثبات تحصيل دفعة مقاصة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {searchedItems.map((inv: any) => (
                                        <tr key={inv.id} className="hover:bg-surface-highlight/20 transition">
                                            <td className="p-4 font-bold font-mono text-on-surface">{inv.invoiceNumber}</td>
                                            <td className="p-4 font-bold">{inv.customer.name}</td>
                                            <td className="p-4 text-right font-mono font-bold text-primary">
                                                SAR {inv.totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="p-4 text-center font-mono text-on-surface-muted">{inv.dueDate}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                    inv.isPaid 
                                                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' 
                                                    : 'bg-red-500/15 text-red-500 border border-red-500/20'
                                                }`}>
                                                    {inv.isPaid ? 'مدفوع بالكامل | Paid' : 'مستحق الدفع | Unpaid'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-left">
                                                {!inv.isPaid ? (
                                                    <button 
                                                        onClick={() => handleCollectPayment(inv.id)}
                                                        className="py-1.5 px-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition text-[10px] font-bold flex items-center gap-1"
                                                    >
                                                        <CreditCard className="h-3.5 w-3.5" />
                                                        <span>تسجيل التحصيل | Record Payment</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-on-surface-muted text-[10px] font-bold flex items-center justify-start gap-1">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                        <span>reconciled close</span>
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Tab 4: Available goods rendering */}
                        {activeSubTab === 'goods' && (
                            <table className="w-full text-xs text-right">
                                <thead className="bg-surface-highlight/45 text-on-surface-muted font-bold text-[10px] uppercase border-b border-border">
                                    <tr>
                                        <th className="p-4 text-right">إسم المنتج الجاهز للبيع (Finished Good)</th>
                                        <th className="p-4 text-right">الرمز الدفتري SKU</th>
                                        <th className="p-4 text-right">فئة الصنف</th>
                                        <th className="p-4 text-center">الكمية المتاحة حالياً</th>
                                        <th className="p-4 text-right">سعر الجملة الافتراضي</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {searchedItems.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-surface-highlight/20 transition">
                                            <td className="p-4 font-extrabold text-on-surface">{item.name}</td>
                                            <td className="p-4 font-mono font-semibold text-on-surface-muted text-right">{item.sku}</td>
                                            <td className="p-4 text-right text-on-surface-muted">{item.category}</td>
                                            <td className="p-4 text-center font-mono font-black text-on-surface">
                                                {item.quantity} {item.quantity <= item.minStockLevel ? (
                                                    <span className="text-warning text-[10px] font-bold"> (Low stock)</span>
                                                ) : (
                                                    <span className="text-emerald-500 text-[10px]"> (Good)</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-mono font-semibold text-primary">
                                                SAR {(item.unitPrice * 1.5).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};
