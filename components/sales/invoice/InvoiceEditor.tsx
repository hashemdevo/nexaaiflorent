
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

interface InvoiceEditorProps {
    customer: any;
    setCustomer: (c: any) => void;
    items: InvoiceItem[];
    updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
    handleAddItem: () => void;
    handleRemoveItem: (id: string) => void;
    invoiceMeta: any;
    setInvoiceMeta: (m: any) => void;
    readOnly?: boolean;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ 
    customer, setCustomer, items, updateItem, handleAddItem, handleRemoveItem, invoiceMeta, setInvoiceMeta, readOnly 
}) => {
    return (
        <div className="bg-white text-black p-8 md:p-12 shadow-2xl rounded-none md:rounded-lg w-full max-w-[210mm] min-h-[297mm] mx-auto scale-95">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 uppercase tracking-tighter mb-2">Tax Invoice</h2>
                    <span className="text-xs font-bold bg-gray-900 text-white px-2 py-1 uppercase">Original Copy</span>
                </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Bill To</h4>
                    <div className="space-y-2">
                        <input type="text" placeholder="Customer Name" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} disabled={readOnly} />
                        <input type="text" placeholder="Tax ID" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none" value={customer.taxId} onChange={e => setCustomer({...customer, taxId: e.target.value})} disabled={readOnly} />
                        <textarea placeholder="Address" className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none resize-none h-16" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} disabled={readOnly} />
                    </div>
                </div>
                <div className="text-right space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1">Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-500">Invoice No:</span>
                        <input type="text" value={invoiceMeta.invoiceNumber} onChange={e => setInvoiceMeta({...invoiceMeta, invoiceNumber: e.target.value})} className="text-right border border-gray-300 rounded px-1 font-bold outline-none" disabled={readOnly} />
                        <span className="text-gray-500">Date:</span>
                        <input type="date" value={invoiceMeta.date} onChange={e => setInvoiceMeta({...invoiceMeta, date: e.target.value})} className="text-right border border-gray-300 rounded px-1 outline-none" disabled={readOnly} />
                    </div>
                </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-gray-800 text-left">
                            <th className="py-3 font-bold text-gray-900 uppercase">Description</th>
                            <th className="py-3 font-bold text-gray-900 uppercase text-right">Qty</th>
                            <th className="py-3 font-bold text-gray-900 uppercase text-right">Price</th>
                            <th className="py-3 font-bold text-gray-900 uppercase text-right">Total</th>
                            {!readOnly && <th className="py-3 w-[5%]"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className="py-3"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1 outline-none" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} disabled={readOnly} /></td>
                                <td className="py-3"><input type="number" className="w-full text-right border border-gray-300 rounded px-1 py-1 outline-none" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} disabled={readOnly} /></td>
                                <td className="py-3"><input type="number" className="w-full text-right border border-gray-300 rounded px-1 py-1 outline-none" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))} disabled={readOnly} /></td>
                                <td className="py-3 text-right font-bold text-gray-900">{((item.quantity * item.unitPrice)).toFixed(2)}</td>
                                {!readOnly && (
                                    <td className="py-3 text-center"><button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="h-4 w-4" /></button></td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!readOnly && <button onClick={handleAddItem} className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition"><Plus className="h-4 w-4" /> Add Line Item</button>}
            </div>
        </div>
    );
};
