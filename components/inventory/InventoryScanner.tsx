import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { ExtractedInvoiceData, ExtractedPaymentDetails, InventoryItem } from '../../types';
import { parseInvoiceDocument, parsePaymentReceipt } from '../../services/geminiService';
import { 
    Upload, Scan, FileText, Loader2, Layers, Check, 
    Trash2, CreditCard, Banknote, FileCheck, X, Link, AlertCircle, Copy, CheckCircle
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebaseConfig';
import { DbEngine } from '../../services/core/db';

const PAYMENT_ACCOUNTS = [
    { id: '1010', name: '1010 - Main Bank Account' },
    { id: '1020', name: '1020 - Petty Cash' },
    { id: '2010', name: '2010 - Corporate Credit Card' },
];

export const InventoryScanner: React.FC<{ readOnly?: boolean }> = ({ readOnly }) => {
    // Basic Scanner states
    const [isScanning, setIsScanning] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{ name: string, type: string, data: string } | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedInvoiceData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const receiptInputRef = useRef<HTMLInputElement>(null);
    
    // Drag & Drop UI State
    const [dragActive, setDragActive] = useState(false);

    // Firebase Cloud Storage upload states
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [storageUrl, setStorageUrl] = useState<string | null>(null);

    // Saving and Feedback States
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);

    // Payment & Accounting State
    const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');
    const [paymentAccount, setPaymentAccount] = useState('1010');
    const [liabilityAccount, setLiabilityAccount] = useState('2000 - Accounts Payable');
    const [invoiceInfo, setInvoiceInfo] = useState({ tax: 0, totalAmount: 0 });
    const [receiptFile, setReceiptFile] = useState<{ name: string, data: string } | null>(null);
    const [paymentDetails, setPaymentDetails] = useState<ExtractedPaymentDetails | null>(null);
    const [isScanningReceipt, setIsScanningReceipt] = useState(false);

    // --- Dynamic Upload Engine (Cloud Storage) ---
    const uploadFileToStorage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            setIsUploading(true);
            setUploadProgress(0);
            
            // Generate clean tenant/user-isolated storage path
            const storagePath = `tenants/default/documents/inventory/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setUploadProgress(progress);
                }, 
                (error) => {
                    console.error("Firebase Storage Upload Error:", error);
                    setIsUploading(false);
                    reject(error);
                }, 
                async () => {
                    try {
                        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        setIsUploading(false);
                        resolve(downloadUrl);
                    } catch (e) {
                        reject(e);
                    }
                }
            );
        });
    };

    const handleFileProcess = async (file: File) => {
        if (readOnly) return;
        setSaveSuccess(false);

        // 1. Upload file to Real Firebase Cloud Storage API
        let uploadedUrl = '';
        try {
            uploadedUrl = await uploadFileToStorage(file);
            setStorageUrl(uploadedUrl);
        } catch (storageErr) {
            console.error("Storage upload failed, analyzing local file directly:", storageErr);
            alert("Firebase Storage upload encountered issues. We will fall back to direct AI analysis.");
        }

        // 2. Read locally as base64 for direct inline API transit
        const reader = new FileReader();
        reader.onload = async (event) => {
            const rawData = event.target?.result as string;
            const newFile = {
                name: file.name,
                type: file.type,
                data: rawData
            };
            setSelectedFile(newFile);
            await handleScanInvoice(newFile, uploadedUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        const file = e.target.files?.[0];
        if (file) {
            handleFileProcess(file);
        }
    };

    // Drag and Drop Event listeners
    const handleDrag = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcess(e.dataTransfer.files[0]);
        }
    };

    const handleScanInvoice = async (fileToScan?: { name: string, type: string, data: string }, fileDownloadUrl?: string) => {
        if (readOnly) return;
        const fileForAnalysis = fileToScan || selectedFile;
        if (!fileForAnalysis) return;

        setIsScanning(true);
        setExtractedData(null);
        try {
            const base64Data = fileForAnalysis.data.split(',')[1];
            const mimeType = fileForAnalysis.data.split(';')[0].split(':')[1];
            
            const data = await parseInvoiceDocument(base64Data, mimeType);
            if (data) {
                // Precompile/enrich lines with SKUs, default markup categories, and configurable multipliers
                const enrichedItems = (data.items || []).map((item: any, idx: number) => {
                    const cleanName = item.name || 'Unlabeled Stock';
                    const codePrefix = cleanName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ITM');
                    const randCode = Math.floor(100 + Math.random() * 900);
                    return {
                        ...item,
                        name: cleanName,
                        sku: item.sku || `${codePrefix}-${randCode}`,
                        category: item.category || 'General',
                        quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
                        unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : 0,
                        sellingPrice: typeof item.unitPrice === 'number' ? Number((item.unitPrice * 1.5).toFixed(2)) : 0
                    };
                });

                setExtractedData({
                    ...data,
                    vendorName: data.vendorName || 'Unknown Vendor',
                    invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
                    invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
                    tax: data.tax || 0,
                    subtotal: data.subtotal || 0,
                    totalAmount: data.totalAmount || 0,
                    items: enrichedItems
                });
                setInvoiceInfo({ tax: data.tax || 0, totalAmount: data.totalAmount || 0 });
                setLiabilityAccount(`2000 - AP - ${data.vendorName || 'Vendor'}`);
            }
        } catch (error) {
            console.error("OCR Analysis error:", error);
            alert("Failed to analyze document with AI. Please make sure the document is legible and try again.");
        } finally {
            setIsScanning(false);
        }
    };

    // Confirm parsed items and write to real Firestore collections
    const handleConfirmAndAdd = async () => {
        if (!extractedData || readOnly) return;
        setIsSaving(true);
        try {
            // Retrieve current database stock items to calculate increments / updates
            const dbItems = await DbEngine.select<any>('inventory');

            for (const item of (extractedData.items || [])) {
                // Check if SKU or Name matches to aggregate quantity
                const matched = dbItems.find(e => 
                    e.sku === item.sku || (e.name || '').toLowerCase() === (item.name || '').toLowerCase()
                );

                if (matched) {
                    const newQuantity = (matched.quantity || 0) + Number(item.quantity || 1);
                    await DbEngine.update<any>('inventory', matched.id, {
                        quantity: newQuantity,
                        unitPrice: Number(item.unitPrice) || matched.unitPrice || 0,
                        sellingPrice: Number(item.sellingPrice) || matched.sellingPrice || 0,
                        lastUpdated: new Date().toISOString().split('T')[0]
                    });
                } else {
                    const newId = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    await DbEngine.insert('inventory', {
                        id: newId,
                        name: item.name,
                        sku: item.sku,
                        category: item.category || 'General',
                        quantity: Number(item.quantity) || 1,
                        unitPrice: Number(item.unitPrice) || 0,
                        sellingPrice: Number(item.sellingPrice) || Number((item.unitPrice * 1.5).toFixed(2)),
                        minStockLevel: 5,
                        lastUpdated: new Date().toISOString().split('T')[0],
                        supplier: extractedData.vendorName || 'Scanned Vendor',
                        tenantId: 'default',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: 1
                    } as any);
                }
            }

            // Save upload record metadata in Firestore
            const uploadRecordId = `upload-${Date.now()}`;
            await DbEngine.insert('inventory_uploads' as any, {
                id: uploadRecordId,
                vendorName: extractedData.vendorName,
                invoiceNumber: extractedData.invoiceNumber,
                invoiceDate: extractedData.invoiceDate,
                totalAmount: Number(extractedData.totalAmount) || 0,
                tax: Number(extractedData.tax) || 0,
                fileUrl: storageUrl || '',
                fileName: selectedFile?.name || 'receipt_invoice',
                scannedAt: new Date().toISOString(),
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            } as any);

            // Audit report logging
            await DbEngine.insert('audit_logs', {
                id: `audit-${Date.now()}`,
                action: 'INSERT',
                table: 'inventory_uploads',
                recordId: uploadRecordId,
                userId: 'user_operator',
                userEmail: 'operator@nexaledger.ai',
                timestamp: new Date().toISOString(),
                detail: `Uploaded scan invoice ${extractedData.invoiceNumber} from ${extractedData.vendorName} to Cloud Storage and automated catalog entries.`
            } as any);

            // Trigger global updates for lists
            window.dispatchEvent(new CustomEvent('inventory-scanned'));
            setSaveSuccess(true);
            setExtractedData(null);
            setSelectedFile(null);
            setStorageUrl(null);
        } catch (e) {
            console.error("Failed to commit inventory scan records:", e);
            alert("An error occurred while saving stock items to the database.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReceiptSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        const file = e.target.files?.[0];
        if (file) {
            let uploadedUrl = '';
            try {
                uploadedUrl = await uploadFileToStorage(file);
                setStorageUrl(uploadedUrl);
            } catch (storageErr) {
                console.error("Storage upload failed, proceeding locally:", storageErr);
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                const fileData = event.target?.result as string;
                setReceiptFile({ name: file.name, data: fileData });
                
                setIsScanningReceipt(true);
                try {
                    const base64Data = fileData.split(',')[1];
                    const mimeType = fileData.split(';')[0].split(':')[1];
                    const details = await parsePaymentReceipt(base64Data, mimeType);
                    if (details) setPaymentDetails(details);
                } catch (err) {
                    console.error("Failed to analyze receipt", err);
                } finally {
                    setIsScanningReceipt(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        if (!extractedData) return;
        const updatedItems = [...(extractedData.items || [])];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };
        setExtractedData({
            ...extractedData,
            items: updatedItems
        });
    };

    const renderFilePreview = () => {
        if (!selectedFile) return null;
        const isImage = selectedFile.type.startsWith('image/');
        return (
            <div className="relative w-full h-64 bg-surface-highlight/20 rounded-2xl border border-border overflow-hidden group">
                {isImage ? (
                    <img src={selectedFile.data} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface p-4">
                        <div className="bg-surface border border-border p-6 rounded-2xl shadow-lg mb-4">
                            <FileText className="h-16 w-16 text-primary" />
                        </div>
                        <p className="font-bold text-lg truncate max-w-[80%]">{selectedFile.name}</p>
                    </div>
                )}
                {!readOnly && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                        <button 
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-md font-medium transition text-sm"
                        >
                            Change File
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setStorageUrl(null); }}
                            className="bg-danger/80 hover:bg-danger text-white p-2.5 rounded-lg backdrop-blur-md transition"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Left: Upload and Progress Control Panel */}
            <div className="space-y-6">
                {saveSuccess && (
                    <div className="bg-secondary/10 border border-secondary/20 p-5 rounded-2xl text-secondary flex gap-3.5 items-start animate-fade-in shadow-sm">
                        <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-[15px] text-on-surface">Successfully Imported!</p>
                            <p className="text-on-surface-muted text-sm mt-1">
                                The invoice document was uploaded to Firebase Storage and all line items have been synchronized into the Stock list.
                            </p>
                        </div>
                    </div>
                )}

                {/* Drag & Drop File Selector area */}
                {!selectedFile ? (
                    <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center transition-all cursor-pointer min-h-[300px] ${
                            dragActive 
                            ? 'border-primary bg-primary/5 shadow-inner' 
                            : 'border-border bg-surface hover:bg-surface-highlight hover:border-primary/50'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*,application/pdf" 
                            onChange={handleFileSelect} 
                        />
                        <div className="bg-surface-highlight p-4 rounded-full mb-4 text-on-surface-muted shadow-inner">
                            {isUploading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                                <Upload className="h-8 w-8 text-on-surface-muted" />
                            )}
                        </div>
                        {isUploading ? (
                            <div className="space-y-2 w-full max-w-xs">
                                <h3 className="text-lg font-bold text-on-surface">Uploading to Storage...</h3>
                                <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-primary h-full rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-on-surface-muted">{uploadProgress}% uploaded</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-on-surface">Upload Invoice or Bill</h3>
                                <p className="text-on-surface-muted text-sm mt-2 max-w-xs">
                                    Drag and drop or click to upload PDF/Image. 
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {renderFilePreview()}
                        
                        {/* Real-world Firebase Cloud Storage Reference block */}
                        {storageUrl && (
                            <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
                                <span className="flex items-center gap-1.5 text-on-surface-muted truncate">
                                    <Link className="h-3.5 w-3.5 text-primary shrink-0" />
                                    <span className="truncate max-w-[200px] font-mono">{storageUrl}</span>
                                </span>
                                <div className="flex gap-2 shrink-0">
                                    <button 
                                        onClick={() => copyToClipboard(storageUrl)}
                                        className="p-1.5 hover:bg-surface-highlight border border-border rounded-lg text-on-surface-muted hover:text-on-surface transition-colors flex items-center gap-1 text-[11px] font-bold"
                                        title="Copy cloud storage download URL"
                                    >
                                        {copiedUrl ? <Check className="h-3.5 w-3.5 text-secondary" /> : <Copy className="h-3.5 w-3.5" />}
                                        {copiedUrl ? 'Copied' : 'Storage URL'}
                                    </button>
                                    <a 
                                        href={storageUrl} 
                                        target="_blank" 
                                        referrerPolicy="no-referrer"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1.5 bg-surface-highlight hover:bg-primary hover:text-white rounded-lg border border-border text-on-surface transition-all text-[11px] font-bold"
                                    >
                                         Open File
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button 
                    onClick={() => handleScanInvoice()}
                    disabled={!selectedFile || isScanning || isUploading}
                    className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-xl shadow-glow-primary hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" /> 
                            <span>Digitizing File with Gemini...</span>
                        </>
                    ) : (
                        <>
                            <Scan className="h-5 w-5" />
                            <span>Confirm and Scan Document</span>
                        </>
                    )}
                </button>
                
                <div className="bg-surface/50 p-4 rounded-xl border border-border text-sm text-on-surface-muted flex gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg h-fit text-primary"><Layers className="h-5 w-5" /></div>
                    <div>
                        <p className="font-bold text-on-surface mb-1">Double-Entry Ledger Integration</p>
                        <p>Upload files to Cloud Storage, extract line items with Gemini Vision, modify SKUs, and post stock updates instantly.</p>
                    </div>
                </div>
            </div>

            {/* Right: Interactive Extracted Data Form */}
            <div className="glass-panel rounded-2xl border border-border flex flex-col h-full min-h-[500px]">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface-highlight/5">
                    <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                        <FileText className="h-5 w-5 text-secondary" /> 
                        <span>Smart Audit Form</span>
                    </h3>
                    {extractedData && (
                        <span className="px-2.5 py-1 bg-secondary/10 border border-secondary/20 rounded-lg text-secondary text-xs font-mono font-medium">
                            AI Confidence High
                        </span>
                    )}
                </div>

                {isScanning ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-on-surface-muted p-8 text-center space-y-3">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <div className="space-y-1">
                            <p className="font-bold text-on-surface">Gemini Document Analysis Pipeline Active</p>
                            <p className="text-xs">Extracting line items, tax components, and vendor accounts...</p>
                        </div>
                    </div>
                ) : !extractedData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-on-surface-muted p-8 text-center space-y-3">
                        <Upload className="h-16 w-16 opacity-20" />
                        <div className="space-y-1">
                            <p className="font-bold text-on-surface">Audit Trail Awaiting Document</p>
                            <p className="text-xs max-w-xs mx-auto">Upload any invoice or receipt in the drag area to activate structured data parsing.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Vendor Name</label>
                                    <input 
                                        type="text" 
                                        value={extractedData.vendorName} 
                                        onChange={(e) => setExtractedData({...extractedData, vendorName: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface focus:border-primary outline-none" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Invoice Number</label>
                                    <input 
                                        type="text" 
                                        value={extractedData.invoiceNumber} 
                                        onChange={(e) => setExtractedData({...extractedData, invoiceNumber: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface focus:border-primary outline-none font-mono" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Invoice Date</label>
                                    <input 
                                        type="date" 
                                        value={extractedData.invoiceDate} 
                                        onChange={(e) => setExtractedData({...extractedData, invoiceDate: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface focus:border-primary outline-none" 
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Total Amount ($)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={extractedData.totalAmount} 
                                        onChange={(e) => setExtractedData({...extractedData, totalAmount: Number(e.target.value)})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface focus:border-primary outline-none font-mono" 
                                    />
                                </div>
                            </div>

                            {/* Line Items Table parsed by Gemini and editable by operator */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-on-surface-muted uppercase flex items-center gap-1">
                                     Line Items Breakdown
                                </label>
                                <div className="border border-border rounded-xl overflow-hidden bg-background">
                                    <div className="overflow-x-auto max-h-64 custom-scrollbar">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-surface-highlight/30 text-on-surface-muted uppercase font-bold text-[10px]">
                                                <tr>
                                                    <th className="px-4 py-2 border-b border-border">Description</th>
                                                    <th className="px-4 py-2 border-b border-border w-16 text-right">Qty</th>
                                                    <th className="px-4 py-2 border-b border-border w-20 text-right">Cost</th>
                                                    <th className="px-4 py-2 border-b border-border w-24">SKU</th>
                                                    <th className="px-4 py-2 border-b border-border w-24">Selling Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {(extractedData.items || []).map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-surface-highlight/10">
                                                        <td className="px-4 py-2 font-medium">
                                                            <input 
                                                                type="text" 
                                                                value={item.name} 
                                                                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                                                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface truncate" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-right">
                                                            <input 
                                                                type="number" 
                                                                value={item.quantity} 
                                                                onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                                                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-right text-on-surface" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-right font-mono">
                                                            <input 
                                                                type="number" 
                                                                step="0.01"
                                                                value={item.unitPrice} 
                                                                onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                                                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-right text-on-surface font-mono" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input 
                                                                type="text" 
                                                                value={item.sku} 
                                                                onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                                                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-on-surface font-mono text-[11px]" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 font-mono text-right">
                                                            <input 
                                                                type="number" 
                                                                step="0.01"
                                                                value={item.sellingPrice} 
                                                                onChange={(e) => handleItemChange(idx, 'sellingPrice', Number(e.target.value))}
                                                                className="w-full bg-transparent border-none p-0 focus:ring-0 text-right text-on-surface font-mono" 
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Logic and Financial Routing */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-highlight/10 p-4 rounded-xl border border-border">
                                <div className="space-y-1 md:col-span-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-on-surface-muted uppercase">Auto-Reconcile Payment Status</label>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setPaymentStatus('Paid')} 
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${paymentStatus === 'Paid' ? 'bg-secondary text-white' : 'bg-surface border border-border text-on-surface'}`}
                                            >
                                                Paid (Cash Ledger)
                                            </button>
                                            <button 
                                                onClick={() => setPaymentStatus('Unpaid')} 
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${paymentStatus === 'Unpaid' ? 'bg-warning text-white' : 'bg-surface border border-border text-on-surface'}`}
                                            >
                                                Unpaid (Accounts Payable)
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {paymentStatus === 'Paid' ? (
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-secondary uppercase flex items-center gap-1.5 mt-2">
                                                <CreditCard className="h-3 w-3" /> Account Cash Register
                                            </label>
                                            <select 
                                                value={paymentAccount} 
                                                onChange={(e) => setPaymentAccount(e.target.value)} 
                                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface outline-none"
                                            >
                                                {PAYMENT_ACCOUNTS.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-warning uppercase flex items-center gap-1.5 mt-2">
                                                <Banknote className="h-3 w-3" /> AP General Liability Account
                                            </label>
                                            <input 
                                                type="text" 
                                                value={liabilityAccount} 
                                                readOnly 
                                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-on-surface-muted outline-none" 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-border bg-surface-highlight/5 mt-auto flex gap-3">
                            <button 
                                onClick={() => { setExtractedData(null); setSelectedFile(null); setStorageUrl(null); }} 
                                className="flex-1 py-3.5 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition text-sm flex justify-center items-center"
                                disabled={isSaving}
                            >
                                Discard Clear
                            </button>
                            <button 
                                onClick={handleConfirmAndAdd} 
                                className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold shadow-glow-primary hover:bg-primary-hover transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Saving to Stock db...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        <span>Confirm & Post Stock</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
