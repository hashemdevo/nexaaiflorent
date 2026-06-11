
import React from 'react';
import { ZatcaQrCode } from './ZatcaQrCode';

// Complete Enterprise Structured Invoice Data Transfer Object
export interface CanonicalInvoiceDTO {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    currency: string;
    exchangeRate: number;
    tenantId: string;
    companyId: string;
    branchCode: string;
    cashierId: string;
    terminalId: string;
    postingSequence: string;
    fiscalPeriod: string;
    state: 'DRAFT' | 'POSTED' | 'VOIDED' | 'CANCELLED' | 'REVERSED';
    costCenterCode?: string;
    createdBy?: string;
    
    company: {
        name: string;
        address: string;
        taxId: string;
        crNumber: string; // Commercial Registration
    };
    customer: {
        id: string;
        name: string;
        address: string;
        taxId?: string;
        phone?: string;
    };
    lineItems: Array<{
        id: string;
        sku: string;
        description: string;
        quantity: number;
        unitPrice: number;
        netAmount: number; // Immutable persisted precalculated total
        taxRate: number; // e.g. 0.15 for 15%
        taxAmount: number; // Precalculated tax
        grossAmount: number; // Precalculated items + tax
        costCenterId?: string;
    }>;
    totals: {
        taxableAmount: number; // Total Net
        vatAmount: number; // Total VAT
        grandTotal: number; // Grand gross total in ledger
    };
}

interface InvoicePaperProps {
    invoice: CanonicalInvoiceDTO;
}

export const InvoicePaper: React.FC<InvoicePaperProps> = ({ invoice }) => {
    const {
        invoiceNumber,
        date,
        dueDate,
        currency,
        state,
        company,
        customer,
        lineItems,
        totals,
        branchCode,
        cashierId,
        postingSequence,
        fiscalPeriod
    } = invoice;

    // Direct translation dictionary
    const statesAr: Record<string, string> = {
        'DRAFT': 'مسودة',
        'POSTED': 'مرحل ومقيد دفترية',
        'VOIDED': 'ملغي مجمد',
        'CANCELLED': 'ملغي',
        'REVERSED': 'عكس محاسبي'
    };

    return (
        <div className="bg-white text-black p-8 md:p-12 shadow-2xl rounded-none md:rounded-lg w-full max-w-[210mm] min-h-[297mm] mx-auto scale-100 print:shadow-none print:p-0 print:max-w-full print:min-h-0 print:border-none relative">
            
            {/* Watermark for non-POSTED or Voided States */}
            {state !== 'POSTED' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]">
                    <span className="text-gray-900 border-8 border-gray-900 px-12 py-6 text-7xl font-extrabold uppercase tracking-widest leading-none rotate-12">
                        {state} / {statesAr[state]}
                    </span>
                </div>
            )}

            {/* Header Block: Multi-Tenant & Branch Traceability */}
            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 uppercase tracking-tighter mb-1">Tax Invoice (فاتورة ضريبية)</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 uppercase tracking-wide">
                            ZATCA Phase II Compliant
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide border ${
                            state === 'POSTED' 
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                        }`}>
                            {state} ({statesAr[state]})
                        </span>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <h3 className="font-extrabold text-lg text-gray-900">{company.name}</h3>
                    <p className="text-xs text-gray-600 max-w-[240px] ml-auto leading-relaxed">{company.address}</p>
                    <div className="text-[10px] font-semibold text-gray-600 space-y-0.5">
                        <p className="font-mono">Tax Registration ID: <span className="text-gray-900 font-bold">{company.taxId}</span></p>
                        <p className="font-mono">CR No (الرقم التجاري): <span className="text-gray-900 font-bold">{company.crNumber}</span></p>
                    </div>
                </div>
            </div>

            {/* Metadata Rows: Traceability Parameters */}
            <div className="grid grid-cols-4 gap-4 bg-gray-50 border border-gray-100 rounded-lg p-3 text-[10px] mb-8 font-mono text-gray-600">
                <div>
                    <span className="block text-gray-400 font-sans uppercase font-bold text-[8px]">Branch Code / الفرع</span>
                    <span className="font-bold text-gray-900">{branchCode}</span>
                </div>
                <div>
                    <span className="block text-gray-400 font-sans uppercase font-bold text-[8px]">Cashier / أمين الحساب</span>
                    <span className="font-bold text-gray-900">{cashierId}</span>
                </div>
                <div>
                    <span className="block text-gray-400 font-sans uppercase font-bold text-[8px]">Posting Seq / قيد الترحيل</span>
                    <span className="font-bold text-gray-900">{postingSequence}</span>
                </div>
                <div>
                    <span className="block text-gray-400 font-sans uppercase font-bold text-[8px]">Fiscal Period / الفترة المالية</span>
                    <span className="font-bold text-gray-900">{fiscalPeriod}</span>
                </div>
            </div>

            {/* Billed Parties */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Bill To / العميل</h4>
                    <div className="text-sm mt-2 space-y-1">
                        <p className="font-extrabold text-base text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-600 max-w-sm leading-relaxed">{customer.address}</p>
                        {customer.taxId && (
                            <p className="text-xs font-mono text-gray-800">
                                Customer VAT (الرقم الضريبي للمشتري): <span className="font-bold">{customer.taxId}</span>
                            </p>
                        )}
                        <p className="text-[10px] text-gray-400 font-mono">ID: {customer.id}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Invoice Info / التفاصيل</h4>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-2 font-mono">
                        <span className="text-gray-500 font-sans text-right">Invoice ID:</span>
                        <span className="font-bold text-gray-900">{invoiceNumber}</span>
                        
                        <span className="text-gray-500 font-sans text-right">Document Date:</span>
                        <span className="font-medium text-gray-900">{date}</span>
                        
                        <span className="text-gray-500 font-sans text-right">Maturity Date:</span>
                        <span className="font-medium text-gray-900">{dueDate}</span>
                    </div>
                </div>
            </div>

            {/* Table Matrix */}
            <div className="mb-8">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b-2 border-gray-800 text-left">
                            <th className="py-2.5 font-bold text-gray-900 uppercase w-[35%]">SKU & Item Description (الوصف وكود الصنف)</th>
                            <th className="py-2.5 font-bold text-gray-900 uppercase text-right w-[10%]">Qty (الكمية)</th>
                            <th className="py-2.5 font-bold text-gray-900 uppercase text-right w-[15%]">Unit Price (السعر)</th>
                            <th className="py-2.5 font-bold text-gray-900 uppercase text-right w-[15%]">VAT (١٥٪)</th>
                            <th className="py-2.5 font-bold text-gray-900 uppercase text-right w-[25%]">Net Amount (المجموع النهائي)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {lineItems.map((item) => (
                            <tr key={item.id} className="align-top">
                                <td className="py-3">
                                    <div className="space-y-0.5">
                                        <span className="text-gray-900 font-bold block">{item.description}</span>
                                        <span className="text-[9px] text-gray-400 font-mono block uppercase">SKU: {item.sku}</span>
                                        {item.costCenterId && (
                                            <span className="text-[8px] bg-blue-500/10 border border-blue-500/10 text-blue-700 px-1 py-0.2 rounded font-mono inline-block">
                                                CC: {item.costCenterId}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 text-right font-mono">{item.quantity}</td>
                                <td className="py-3 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                                <td className="py-3 text-right font-mono text-gray-500">{item.taxAmount.toFixed(2)}</td>
                                <td className="py-3 text-right font-bold text-gray-900 font-mono">{item.netAmount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* QR Stamp & Totals Columns */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-gray-800 pt-6 gap-6">
                <div className="w-full md:max-w-md shrink-0">
                    <ZatcaQrCode
                        sellerName={company.name || 'Nexa Tech KSA'}
                        taxNumber={company.taxId || '310123456700003'}
                        timestamp={date ? `${date}T12:00:00Z` : new Date().toISOString()}
                        totalAmount={totals.grandTotal.toFixed(2)}
                        vatAmount={totals.vatAmount.toFixed(2)}
                        invoiceId={invoiceNumber}
                    />
                </div>
                <div className="w-full md:w-72 space-y-2.5 text-right font-mono">
                    <div className="flex justify-between text-xs text-gray-600">
                        <span className="font-sans">Subtotal (الفرعي)</span>
                        <span>{totals.taxableAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                        <span className="font-sans">VAT 15% (الضريبة)</span>
                        <span>{totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                    <div className="flex justify-between text-lg font-extrabold text-gray-900 border-t border-gray-300 pt-2.5">
                        <span className="font-sans uppercase">Grand Total (الإجمالي)</span>
                        <span>{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                </div>
            </div>

            {/* Legal compliance footer section & return policies */}
            <div className="mt-12 pt-6 border-t-2 border-gray-100 text-center text-[10px] text-gray-500 space-y-2">
                <p className="leading-relaxed">
                    هذه الفاتورة محررة إلكترونياً وموقعة بختم تشفير مالي معتمد. البضائع تخضع لسياسة الاستبدال والاسترجاع الرسمية خلال ١٤ يوماً من تاريخ التوريد.
                </p>
                <p className="font-semibold text-gray-600">
                    Make checks payable according to IFRS allocations mapped to company registration context.
                </p>
                <div className="font-mono text-[8px] text-gray-400 uppercase tracking-widest pt-2">
                    Nexa Ledger AI • Enterprise Ledger Gateway v7
                </div>
            </div>
        </div>
    );
};

