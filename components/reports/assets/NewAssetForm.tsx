
import React, { useRef } from 'react';
import { CreditCard, Banknote, FileCheck, Upload, Loader2, FileText, X, Check, Trash2, Plus, Save } from 'lucide-react';

// Define localized types to avoid circular dependency if possible or just rely on parent passing validated data
interface StagedAsset {
    tempId: string;
    name?: string;
    purchaseDate?: string;
    cost?: number;
    usefulLife?: number;
    salvageValue?: number;
    quantity?: number;
    depreciationMethod?: string;
    serialNumber?: string;
}

interface NewAssetFormProps {
    invoiceInfo: any;
    setInvoiceInfo: (info: any) => void;
    stagedAssets: StagedAsset[];
    setStagedAssets: (assets: StagedAsset[]) => void;
    paymentDetails: any;
    isScanningReceipt: boolean;
    handleReceiptSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    receiptInputRef: React.RefObject<HTMLInputElement>;
    onSave: () => void;
    onCancel: () => void;
    PAYMENT_ACCOUNTS: {id: string, name: string}[];
}

export const NewAssetForm: React.FC<NewAssetFormProps> = ({
    invoiceInfo, setInvoiceInfo, stagedAssets, setStagedAssets, 
    paymentDetails, isScanningReceipt, handleReceiptSelect, receiptInputRef, 
    onSave, onCancel, PAYMENT_ACCOUNTS
}) => {
    
    const updateStagedAsset = (tempId: string, field: keyof StagedAsset, value: any) => {
        setStagedAssets(stagedAssets.map(a => a.tempId === tempId ? { ...a, [field]: value } : a));
    };

    const handleAddManualItem = () => {
        setStagedAssets([...stagedAssets, {
            tempId: `temp-${Date.now()}`,
            name: '',
            purchaseDate: invoiceInfo.date,
            cost: 0,
            usefulLife: 5,
            salvageValue: 0,
            quantity: 1,
            depreciationMethod: 'Straight Line'
        }]);
    };

    const handleRemoveStagedItem = (tempId: string) => {
        setStagedAssets(stagedAssets.filter(a => a.tempId !== tempId));
    };

    const totalStagedCost = stagedAssets.reduce((acc, curr) => acc + ((curr.cost || 0) * (curr.quantity || 1)), 0);
    const grandTotal = totalStagedCost + (invoiceInfo.tax || 0);

    return (
        <div className="p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-on-surface">Assets from Invoice</h3>
                    <p className="text-sm text-on-surface-muted">Review, edit, or remove items before registering them.</p>
                </div>
            </div>

            {/* Invoice Header Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Vendor</label>
                    <input 
                        type="text"
                        value={invoiceInfo.vendor}
                        onChange={(e) => setInvoiceInfo({...invoiceInfo, vendor: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                        placeholder="Vendor Name"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Invoice Date</label>
                    <input 
                        type="date"
                        value={invoiceInfo.date}
                        onChange={(e) => {
                            setInvoiceInfo({...invoiceInfo, date: e.target.value});
                            setStagedAssets(stagedAssets.map(a => ({...a, purchaseDate: e.target.value})));
                        }}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Invoice Number</label>
                    <input 
                        type="text"
                        value={invoiceInfo.invoiceNumber}
                        onChange={(e) => setInvoiceInfo({...invoiceInfo, invoiceNumber: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                        placeholder="INV-0000"
                    />
                </div>
                
                {/* Payment Status Toggle */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Payment Status</label>
                    <div className="flex bg-background border border-border rounded-xl p-1">
                        <button 
                            onClick={() => setInvoiceInfo({...invoiceInfo, paymentStatus: 'Paid'})}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition ${invoiceInfo.paymentStatus === 'Paid' ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}
                        >
                            Paid
                        </button>
                        <button 
                            onClick={() => setInvoiceInfo({...invoiceInfo, paymentStatus: 'Unpaid'})}
                            className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition ${invoiceInfo.paymentStatus === 'Unpaid' ? 'bg-warning text-black shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}
                        >
                            Unpaid
                        </button>
                    </div>
                </div>
            </div>

            {/* Account Selection Based on Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-highlight/10 p-4 rounded-xl border border-border mb-6">
                {invoiceInfo.paymentStatus === 'Paid' ? (
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-secondary uppercase flex items-center gap-2">
                            <CreditCard className="h-3 w-3" /> Payment Account
                        </label>
                        <div className="relative">
                            <select
                                value={invoiceInfo.paymentAccount}
                                onChange={(e) => setInvoiceInfo({...invoiceInfo, paymentAccount: e.target.value})}
                                className="w-full bg-background border border-border rounded-xl pl-3 pr-3 py-2 text-sm text-on-surface outline-none focus:border-secondary appearance-none"
                            >
                                {PAYMENT_ACCOUNTS.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-warning uppercase flex items-center gap-2">
                            <Banknote className="h-3 w-3" /> Liability Account (AP)
                        </label>
                        <input 
                            type="text"
                            value={invoiceInfo.liabilityAccount}
                            onChange={(e) => setInvoiceInfo({...invoiceInfo, liabilityAccount: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-warning font-mono"
                        />
                    </div>
                )}
            </div>

            {/* Receipt Upload & Totals */}
            {invoiceInfo.paymentStatus === 'Paid' && (
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-on-surface-muted uppercase flex items-center gap-2">
                            <FileCheck className="h-3 w-3" /> Attach Receipt / Proof
                        </label>
                        
                        {!invoiceInfo.receiptFile ? (
                            <div 
                                onClick={() => receiptInputRef.current?.click()}
                                className="border border-dashed border-border rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer hover:bg-surface-highlight/30 transition h-[80px]"
                            >
                                <input 
                                    type="file" 
                                    ref={receiptInputRef} 
                                    className="hidden" 
                                    accept="image/*,application/pdf"
                                    onChange={handleReceiptSelect}
                                />
                                {isScanningReceipt ? (
                                    <div className="flex items-center gap-2 text-primary">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 text-on-surface-muted" />
                                        <span className="text-sm text-on-surface-muted">Upload File</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-surface-highlight/20 border border-border rounded-xl p-3 flex items-center justify-between h-[80px]">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium text-on-surface truncate max-w-[150px]">{invoiceInfo.receiptFile.name}</span>
                                </div>
                                <button 
                                    onClick={() => { setInvoiceInfo({...invoiceInfo, receiptFile: null}); }}
                                    className="text-on-surface-muted hover:text-danger transition"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Payment Analysis Result */}
                    {paymentDetails && (
                        <div className="bg-surface-highlight/30 p-4 rounded-xl border border-primary/20 animate-fade-in">
                            <h4 className="text-xs font-bold text-primary uppercase mb-3 flex items-center gap-2">
                                <Check className="h-3 w-3" /> Verified Payment Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-on-surface-muted text-xs block">Amount</span>
                                    <span className="font-mono font-bold text-on-surface">${paymentDetails.amount}</span>
                                </div>
                                <div>
                                    <span className="text-on-surface-muted text-xs block">Date</span>
                                    <span className="font-mono font-bold text-on-surface">{paymentDetails.date}</span>
                                </div>
                                <div>
                                    <span className="text-on-surface-muted text-xs block">Method</span>
                                    <span className="text-on-surface">{paymentDetails.method}</span>
                                </div>
                                <div>
                                    <span className="text-on-surface-muted text-xs block">Reference</span>
                                    <span className="font-mono text-on-surface">{paymentDetails.reference}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 bg-surface-highlight/20 p-4 rounded-xl border border-border mb-6">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Tax / VAT</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-xs font-bold">$</span>
                        <input 
                            type="number"
                            value={invoiceInfo.tax}
                            onChange={(e) => setInvoiceInfo({...invoiceInfo, tax: parseFloat(e.target.value)})}
                            className="w-full bg-background border border-border rounded-xl pl-6 pr-3 py-2 text-sm font-mono text-on-surface outline-none focus:border-primary"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Total Invoice</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-xs font-bold">$</span>
                        <input 
                            type="number"
                            value={invoiceInfo.totalAmount}
                            onChange={(e) => setInvoiceInfo({...invoiceInfo, totalAmount: parseFloat(e.target.value)})}
                            className="w-full bg-background border border-border rounded-xl pl-6 pr-3 py-2 text-sm font-mono font-bold text-primary outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Staging Table */}
            <div className="overflow-x-auto rounded-2xl border border-border mb-6">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight text-on-surface-muted uppercase text-xs font-bold">
                        <tr>
                            <th className="px-4 py-4">Asset Name</th>
                            <th className="px-4 py-4 w-20">Qty</th>
                            <th className="px-4 py-4 w-32">Unit Cost ($)</th>
                            <th className="px-4 py-4 w-24">Life (Yrs)</th>
                            <th className="px-4 py-4 w-32">Salvage ($)</th>
                            <th className="px-4 py-4">Serial No.</th>
                            <th className="px-4 py-4 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                        {stagedAssets.map((asset) => (
                            <tr key={asset.tempId} className="group hover:bg-surface-highlight/20">
                                <td className="px-4 py-2">
                                    <input 
                                        type="text" 
                                        value={asset.name}
                                        onChange={(e) => updateStagedAsset(asset.tempId, 'name', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none py-1 text-on-surface font-medium"
                                        placeholder="Asset Name"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input 
                                        type="number"
                                        min="1" 
                                        value={asset.quantity || 1}
                                        onChange={(e) => updateStagedAsset(asset.tempId, 'quantity', parseInt(e.target.value))}
                                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none py-1 text-on-surface font-mono text-center"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input 
                                        type="number" 
                                        value={asset.cost}
                                        onChange={(e) => updateStagedAsset(asset.tempId, 'cost', parseFloat(e.target.value))}
                                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none py-1 text-on-surface font-mono"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input 
                                        type="number" 
                                        value={asset.usefulLife}
                                        onChange={(e) => updateStagedAsset(asset.tempId, 'usefulLife', parseFloat(e.target.value))}
                                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none py-1 text-on-surface text-center"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input 
                                        type="number" 
                                        value={asset.salvageValue}
                                        onChange={(e) => updateStagedAsset(asset.tempId, 'salvageValue', parseFloat(e.target.value))}
                                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none py-1 text-on-surface font-mono"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input 
                                        type="text" 
                                        value={asset.serialNumber || ''}
                                        onChange={(e) => updateStagedAsset(asset.tempId, 'serialNumber', e.target.value)}
                                        className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none py-1 text-on-surface-muted focus:text-on-surface text-xs"
                                        placeholder="Optional"
                                    />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button 
                                        onClick={() => handleRemoveStagedItem(asset.tempId)}
                                        className="p-2 text-on-surface-muted hover:text-danger hover:bg-danger/10 rounded-lg transition"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {stagedAssets.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-on-surface-muted">
                                    No assets added yet. Scan a document or add manually.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot className="bg-surface-highlight/10 border-t border-border">
                        <tr>
                            <td colSpan={7} className="px-4 py-2">
                                <button 
                                    onClick={handleAddManualItem}
                                    className="flex items-center gap-2 text-primary text-sm font-bold hover:underline py-2"
                                >
                                    <Plus className="h-4 w-4" /> Add Item
                                </button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="text-sm space-y-1">
                    <div className="flex items-center gap-4">
                        <span className="text-on-surface-muted w-24">Assets Value:</span>
                        <span className="text-on-surface font-mono font-bold">${totalStagedCost.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-on-surface-muted w-24">Total Tax:</span>
                        <span className="text-on-surface font-mono">${(invoiceInfo.tax || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                        <span className="text-on-surface font-bold w-24">Grand Total:</span>
                        <span className="text-xl font-bold text-primary font-mono">${grandTotal.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex gap-4 items-end">
                    <button 
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onSave}
                        className="px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-glow-primary hover:bg-primary-hover transition flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" /> Save {stagedAssets.reduce((acc, curr) => acc + (curr.quantity || 1), 0)} Assets
                    </button>
                </div>
            </div>
        </div>
    );
};
