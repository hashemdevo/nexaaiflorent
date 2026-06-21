import React, { useState, useEffect } from 'react';
import { DbEngine } from '../../services/core/db';
import { JournalService } from '../../services/ledger/journal';
import { InventoryService } from '../../services/inventory/items';
import { 
  ClipboardCheck, AlertTriangle, CheckCircle, RefreshCw, FileText, 
  ArrowRight, ShieldCheck, Scale, DollarSign, Calendar, Eye
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  vendorId?: string;
  vendorName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items?: { itemId: string; name: string; sku: string; quantity: number; unitCost: number }[];
  branchId?: string;
}

interface GoodsReceipt {
  id: string;
  poId: string;
  receivedDate: string;
  receivedBy: string;
  items: { itemId: string; name: string; sku: string; qtyOrdered: number; qtyAccepted: number; qtyRejected: number; unitCost: number }[];
  branchId?: string;
}

interface SupplierInvoice {
  id: string;
  poId: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: { itemId: string; qtyBilled: number; billedPrice: number }[];
}

export const ThreeWayReconciliation: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Manual values to mock incoming Invoice fields for chosen PO
  const [billInvoiceNum, setBillInvoiceNum] = useState<string>('INV-ORD-5012');
  const [billBilledQty, setBillBilledQty] = useState<number>(0);
  const [billBilledAmt, setBillBilledAmt] = useState<number>(0);

  // Load actual collections from database
  const loadDatabaseRecords = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const pos = await DbEngine.select<any>('purchase_orders');
      const receipts = await DbEngine.select<any>('goods_receipts').catch(() => []);
      
      setPurchaseOrders(pos);
      setGoodsReceipts(receipts);

      // Seed default items if Database is clean
      if (pos.length === 0) {
        const uniqueSuffix = Math.random().toString(36).substr(2, 6);
        const seedPoId = 'PO-RECON-1002-' + uniqueSuffix;
        const newSeedPo = {
          id: seedPoId,
          tenantId: 'default',
          vendorName: 'Global Coffee Co. Ltd',
          totalAmount: 4800,
          status: 'APPROVED',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
          branchId: 'branch-ruh-01',
          items: [
            { itemId: 'item-grain-dark', name: 'Dark Roasted Coffee Beans', sku: 'RAW-COB', quantity: 1500, unitCost: 3.20 }
          ]
        };
        await DbEngine.insert('purchase_orders', newSeedPo as any);
        
        const seedReceipt = {
          id: 'GRN-REC-904-' + uniqueSuffix,
          poId: seedPoId,
          tenantId: 'default',
          receivedDate: new Date(Date.now() - 86450000).toISOString().split('T')[0],
          receivedBy: 'Hani Al-Shammari',
          branchId: 'branch-ruh-01',
          items: [
            { itemId: 'item-grain-dark', name: 'Dark Roasted Coffee Beans', sku: 'RAW-COB', qtyOrdered: 1500, qtyAccepted: 1450, qtyRejected: 50, unitCost: 3.20 }
          ]
        };
        await DbEngine.insert('goods_receipts', seedReceipt as any);

        // Reload
        const updatedPos = await DbEngine.select<any>('purchase_orders');
        const updatedReceipts = await DbEngine.select<any>('goods_receipts');
        setPurchaseOrders(updatedPos);
        setGoodsReceipts(updatedReceipts);
      }
    } catch (e: any) {
      console.error(e);
      setFeedback('Error loading database collections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseRecords();
  }, []);

  // Autofill bill quantities based on chosen purchase order
  useEffect(() => {
    const selectedPo = purchaseOrders.find(po => po.id === selectedPoId);
    if (selectedPo && selectedPo.items) {
      const q = selectedPo.items.reduce((sum, item) => sum + item.quantity, 0);
      setBillBilledQty(q);
      setBillBilledAmt(selectedPo.totalAmount);
    }
  }, [selectedPoId, purchaseOrders]);

  const selectedPoRecord = purchaseOrders.find(po => po.id === selectedPoId);
  const associatedGrn = goodsReceipts.find(gr => gr.poId === selectedPoId);

  // 3-Way Matching computation engine
  const matchEvaluation = React.useMemo(() => {
    if (!selectedPoRecord) return null;
    
    const poQty = selectedPoRecord.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const poRate = selectedPoRecord.items?.[0]?.unitCost || 0;
    const poTotal = selectedPoRecord.totalAmount;

    if (!associatedGrn) {
      return {
        status: 'MISSING_GRN',
        poQty,
        grnQty: 0,
        grnRejected: 0,
        grnBy: '',
        invoiceQty: billBilledQty,
        invoiceAmt: billBilledAmt,
        messageAr: '⚠️ مفقود سند الاستلام المستودعي الدال على وصول البضائع لموقعنا.',
        messageEn: '🔴 Deficit Warning: No Goods Receipt Note (GRN) is on file for this purchase sequence yet.'
      };
    }

    const grnQty = associatedGrn.items.reduce((sum, item) => sum + item.qtyAccepted, 0);
    const grnRejected = associatedGrn.items.reduce((sum, item) => sum + item.qtyRejected, 0);
    const grnBy = associatedGrn.receivedBy;

    // Standard evaluations
    let matchStatus: 'COMPLETE_MATCH' | 'QTY_MISMATCH' | 'VALUE_MISMATCH' = 'COMPLETE_MATCH';
    let messageAr = '🟢 مطابقة ثلاثية صحيحة ١٠٠٪ ومصادق عليها تلقائياً. جاهز للترحيل الدفتري العام وبأمان.';
    let messageEn = '🟢 Perfect 3-Way Match established. Financial controls clear this vendor invoice for processing.';

    if (billBilledQty !== grnQty) {
      matchStatus = 'QTY_MISMATCH';
      messageAr = `⚠️ تنبيه تباين كميات! المورد يطالب بـ ${billBilledQty} وحدة بينما وقع أمين المستودع على قبول ${grnQty} وحدة مادية فعلياً (حيث تم استبعاد تالف).`;
      messageEn = `🔴 Quantity Mismatch! Invoice lists ${billBilledQty} units, but storehouse accepted only ${grnQty} actual units (Damaged Count: ${grnRejected}).`;
    } else if (Math.abs(billBilledAmt - (grnQty * poRate)) > 0.05) {
      matchStatus = 'VALUE_MISMATCH';
      messageAr = `⚠️ تباين مالي! القيمة المحسوبة للفاتورة ($${billBilledAmt.toFixed(2)}) لا تطابق العقد التعاقدي المتفق عليه بالأسعار أساساً.`;
      messageEn = `🔴 Financial Discrepancy! Value demanded ($${billBilledAmt.toFixed(2)}) deviates from contract pricing agreement.`;
    }

    return {
      status: matchStatus,
      poQty,
      grnQty,
      grnRejected,
      grnBy,
      invoiceQty: billBilledQty,
      invoiceAmt: billBilledAmt,
      messageAr,
      messageEn
    };
  }, [selectedPoRecord, associatedGrn, billBilledQty, billBilledAmt]);

  // Execute actual ledger double-entry post and adjust stock in DB to finalize reconciliation
  const handleResolveAndPostJournal = async () => {
    if (!selectedPoRecord || !associatedGrn || !matchEvaluation) return;

    setActionLoading(true);
    setFeedback(null);

    try {
      const orderRate = selectedPoRecord.items?.[0]?.unitCost || 3.20;
      const reconciliationAmount = matchEvaluation.grnQty * orderRate; // only post what is accepted

      // Post dynamic general ledger double-entry
      await JournalService.postEntry({
        transactionDate: new Date().toISOString().split('T')[0],
        postedDate: new Date().toISOString(),
        reference: `3WAY-${selectedPoRecord.id}`,
        description: `تسوية ومطابقة ثلاثية تلقائية لأمر التوريد ${selectedPoRecord.id} - الاستلام الفعلي بالمستودع ${associatedGrn.id}`,
        lines: [
          // Debit Inventory Account
          { 
            accountId: '1200', 
            accountName: 'الأصول المخزنية الجارية - السلع الغذائية والمواد المستلمة', 
            debit: reconciliationAmount, 
            credit: 0 
          },
          // Credit Accounts Payable
          { 
            accountId: '2000', 
            accountName: 'حساب ذمم الموردين الدائنة', 
            debit: 0, 
            credit: reconciliationAmount 
          }
        ],
        totalAmount: reconciliationAmount,
        createdBy: 'The Financial Accountant / Nexa 3-Way matching protocol'
      });

      // Update PO Status in DB
      await DbEngine.update('purchase_orders', selectedPoRecord.id, {
        status: 'COMPLETED',
        updatedAt: new Date().toISOString()
      } as any);

      // Adjust physical stock automatically
      if (selectedPoRecord.items?.[0]) {
        await InventoryService.adjustStock(
          selectedPoRecord.items[0].itemId,
          matchEvaluation.grnQty,
          `Stock balance matched and incremented via 3-way match PO ${selectedPoRecord.id}`,
          'Financial Accountant Automatic Audit'
        );
      }

      setFeedback(`Matched Ledger Entries posted successfully! Allocated Credit to AP Ledger of SAR ${reconciliationAmount.toLocaleString()}. Ordered Stock incremented.`);
      loadDatabaseRecords();
    } catch (e: any) {
      console.error(e);
      setFeedback('Error ledger posting the matching ledger. ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper mock to seed custom mismatch or create custom Goods receipt for test
  const handleGenerateTestingGrn = async () => {
    if (!selectedPoId) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const po = purchaseOrders.find(p => p.id === selectedPoId);
      if (!po) return;

      const matchedQty = po.items?.[0]?.quantity || 1500;
      const randomGrn = {
        id: `GRN-TEST-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        poId: selectedPoId,
        tenantId: 'default',
        receivedDate: new Date().toISOString().split('T')[0],
        receivedBy: 'Hani Al-Shammari',
        branchId: 'branch-ruh-01',
        items: [
          { 
            itemId: po.items?.[0]?.itemId || 'item-grain-dark', 
            name: po.items?.[0]?.name || 'Roasted Beans', 
            sku: po.items?.[0]?.sku || 'RAW-COB', 
            qtyOrdered: matchedQty, 
            qtyAccepted: matchedQty - 120, // difference causes Qty Mismatch automatically
            qtyRejected: 120, 
            unitCost: po.items?.[0]?.unitCost || 3.20 
          }
        ]
      };
      await DbEngine.insert('goods_receipts', randomGrn as any);
      setFeedback('Generated a test Goods Receipt slip with 120 damaged units. Verify the 3-Way match mismatch!');
      loadDatabaseRecords();
    } catch (err: any) {
      console.error(err);
      setFeedback('Failed to generate test GRN.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1200px] mx-auto p-4 md:p-6 text-on-surface">
      
      {/* Dynamic Title Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-indigo-500" /> Automated 3-Way Reconciliation
          </h2>
          <p className="text-on-surface-muted mt-1 text-sm">
            Continuous auditing balancing contract rates, storehouse counts, and billing parameters.
          </p>
        </div>
        <div>
          <button 
            onClick={loadDatabaseRecords}
            disabled={loading}
            className="p-2.5 rounded-xl border border-border bg-surface-highlight hover:bg-border transition text-on-surface disabled:opacity-50 flex items-center gap-2 font-bold text-xs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Records
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-start gap-2 text-xs">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-background border border-border rounded-2xl gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-mono text-on-surface-muted">Extracting purchase registers and warehouse receipts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List selection area */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-panel border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-muted flex items-center gap-2">
                <FileText className="h-4 w-4" /> Unresolved Purchase Orders
              </h3>
              
              {purchaseOrders.filter(po => po.status !== 'COMPLETED').length === 0 ? (
                <div className="py-8 text-center text-xs text-on-surface-muted border border-dashed border-border rounded-xl bg-background/50">
                  No pending procurements detected. Create POs to evaluate matching.
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {purchaseOrders.filter(po => po.status !== 'COMPLETED').map(po => {
                    const receipt = goodsReceipts.find(gr => gr.poId === po.id);
                    return (
                      <button 
                        key={po.id}
                        onClick={() => setSelectedPoId(po.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 ${
                          selectedPoId === po.id 
                            ? 'bg-indigo-600/10 border-indigo-500' 
                            : 'bg-background hover:bg-surface-highlight border-border'
                        }`}
                      >
                        <div className="flex justify-between w-full items-center">
                          <span className="font-bold text-xs font-mono text-indigo-400">{po.id}</span>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                            receipt ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {receipt ? 'GRN Filed' : 'Missing Receipt'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface">{po.vendorName}</p>
                          <p className="text-[10px] text-on-surface-muted flex gap-2 mt-0.5">
                            <span>{new Date(po.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-bold text-indigo-300">SAR {po.totalAmount.toLocaleString()}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Core Matching Board */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedPoId ? (
              <div className="flex flex-col items-center justify-center py-20 bg-background/30 border border-dashed border-border rounded-2xl text-on-surface-muted gap-2">
                <ClipboardCheck className="h-10 w-10 text-on-surface-muted" />
                <p className="text-sm">Select an outstanding Purchase Order from the left panel to execute 3-Way validation.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Visual Reconciliation Card */}
                <div className="glass-panel border border-border rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-on-surface">Compliance Matching Matrix</h3>
                      <p className="text-xs text-on-surface-muted mt-0.5">Reconciliation comparison under CFO authorization constraints.</p>
                    </div>
                    {associatedGrn ? (
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-bold text-on-surface-muted">GRN Number</p>
                        <p className="text-xs font-mono font-bold text-indigo-400">{associatedGrn.id}</p>
                      </div>
                    ) : (
                      <button 
                        onClick={handleGenerateTestingGrn}
                        disabled={actionLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-2 rounded-lg transition"
                      >
                        Generate Discrepant Test GRN
                      </button>
                    )}
                  </div>

                  {/* Matrix Comparators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Contract PO Item */}
                    <div className="bg-background/40 border border-border p-4 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-bold text-on-surface-muted">1. Purchase Order (Contract)</p>
                      <div className="text-center py-3">
                        <p className="text-2xl font-mono font-bold text-on-surface">
                          {matchEvaluation?.poQty.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-on-surface-muted uppercase mt-1">Agreement Total Units</p>
                      </div>
                      <div className="pt-2 border-t border-border text-[11px] text-on-surface-muted flex justify-between">
                        <span>Unit Rate:</span>
                        <span className="font-mono text-on-surface">SAR {selectedPoRecord?.items?.[0]?.unitCost.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* GRN Vault Item */}
                    <div className="bg-background/40 border border-border p-4 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-bold text-on-surface-muted">2. Goods Receipt (Storehouse)</p>
                      <div className="text-center py-3">
                        <p className="text-2xl font-mono font-bold text-emerald-400">
                          {matchEvaluation?.grnQty.toLocaleString() || '—'}
                        </p>
                        <p className="text-[10px] text-on-surface-muted uppercase mt-1">Physically Accepted</p>
                      </div>
                      <div className="pt-2 border-t border-border text-[11px] text-on-surface-muted flex justify-between">
                        <span>Inspection:</span>
                        <span className="text-red-400">-{matchEvaluation?.grnRejected} Rejected</span>
                      </div>
                    </div>

                    {/* Invoice Input Item */}
                    <div className="bg-background/40 border border-border p-4 rounded-xl space-y-2">
                      <p className="text-[10px] uppercase font-bold text-on-surface-muted">3. Billing Invoice (Demand)</p>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-on-surface-muted">Billed Qty</label>
                          <input 
                            type="number"
                            value={billBilledQty}
                            onChange={e => setBillBilledQty(Number(e.target.value))}
                            className="w-full bg-background border border-border p-1 rounded font-mono text-xs text-right text-on-surface"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-on-surface-muted">Total Price (SAR)</label>
                          <input 
                            type="number"
                            value={billBilledAmt}
                            onChange={e => setBillBilledAmt(Number(e.target.value))}
                            className="w-full bg-background border border-border p-1 rounded font-mono text-xs text-right text-on-surface"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Matching Evaluation Alert Message */}
                  {matchEvaluation && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 mt-4 text-xs ${
                      matchEvaluation.status === 'COMPLETE_MATCH' 
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/25 text-red-400'
                    }`}>
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-xs">Matching State Notification</h4>
                        <p className="mt-1 leading-relaxed">{matchEvaluation.messageEn}</p>
                        <p className="mt-1 leading-relaxed text-right font-medium" dir="rtl">{matchEvaluation.messageAr}</p>
                      </div>
                    </div>
                  )}

                  {/* Match Control Buttons */}
                  <div className="flex gap-2 justify-end pt-3 border-t border-border">
                    {matchEvaluation?.status === 'COMPLETE_MATCH' && (
                      <button 
                        onClick={handleResolveAndPostJournal}
                        disabled={actionLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition"
                      >
                        <Scale className="h-4 w-4" /> Resolve and Post Balanced Journaling
                      </button>
                    )}
                    
                    {matchEvaluation?.status === 'QTY_MISMATCH' && (
                      <div className="text-xs text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Reconciliation blocked. Rectify billed amount based on accepted inventory count to clear mismatch.</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
