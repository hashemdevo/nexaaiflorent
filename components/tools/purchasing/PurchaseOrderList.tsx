import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { PurchaseOrderService } from '../../../services/purchasing/orders';
import { WorkflowEngine } from '../../../services/workflow/engine';
import { DbEngine } from '../../../services/core/db';
import { PurchaseOrder, ApprovalRequest } from '../../../services/core/types';
import { 
  FileText, Plus, ShieldCheck, UserCheck, AlertOctagon, 
  CheckCircle, Ban, ArrowRight, ShieldAlert, DollarSign, Calendar, Eye,
  RefreshCw
} from 'lucide-react';

export const PurchaseOrderList: React.FC = () => {
  const { currentUniversalRole, currentUserIdentity } = useApp();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states for creating a PO
  const [vendorName, setVendorName] = useState<string>('National Supply Hub');
  const [poAmount, setPoAmount] = useState<number>(6500); // Defaults to >5000 to trigger multistage
  const [itemName, setItemName] = useState<string>('Premium Coffee Processing Machine');

  const loadData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      // 1. Fetch real POs
      const poList = await PurchaseOrderService.getAll();
      setOrders(poList);

      // 2. Fetch active workflow requests
      const userEmail = currentUserIdentity || 'default_user@acme.com';
      const requests = await WorkflowEngine.getPendingRequests(userEmail, currentUniversalRole || undefined);
      setPendingApprovals(requests);
    } catch (e: any) {
      console.error(e);
      setFeedback('Error loading procurement list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUniversalRole, currentUserIdentity]);

  const handleCreateMockPO = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const userEmail = currentUserIdentity || 'procure@acme.com';
      
      // Call PurchaseOrderService inside core backend layer
      const po = await PurchaseOrderService.create({
        vendorId: 'vendor-n-991',
        date: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        requesterId: userEmail,
        items: [
          {
            description: itemName,
            amount: poAmount,
            expenseAccountId: 'accounts-payable-01'
          }
        ]
      });

      // Quick override vendor name check
      await DbEngine.update('purchase_orders', po.id, {
        vendorId: 'vendor-n-991',
        branchId: 'branch-ruh-01' // branch RLS assigned
      } as any);

      setFeedback(`Purchase Order ${po.id} generated! Computed amount: SAR ${poAmount.toLocaleString()}. Approval evaluate is complete.`);
      loadData();
    } catch (err: any) {
      console.error(err);
      setFeedback('Error creating PO: ' + err.message);
    }
  };

  // Execute approval progress (Stage 1 or Stage 2)
  const handleApproveRequest = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    setFeedback(null);
    try {
      const userEmail = currentUserIdentity || 'cfo@acme.com';
      const updated = await WorkflowEngine.processAction(requestId, action, userEmail);
      
      if (action === 'APPROVE') {
        if (updated.status === 'PENDING') {
          setFeedback('Stage 1 Approved! Promoted to Stage 2 for CFO sign-off.');
        } else {
          setFeedback('Workflow completed! Purchase Order fully APPROVED and released to vendors.');
        }
      } else {
        setFeedback('Purchase sequence rejected successfully.');
      }
      
      loadData();
    } catch (err: any) {
      console.error(err);
      setFeedback('Workflow process failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 text-on-surface">
      
      {feedback && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-start gap-2.5 text-xs">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid Layout splits Create Form & List View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Create PO Generator (to trigger threshold checks) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel border border-border rounded-xl p-5 space-y-4 bg-surface-highlight/10">
            <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-muted flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-indigo-400" /> Issue Purchase Order
            </h3>
            
            <form onSubmit={handleCreateMockPO} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-on-surface-muted mb-1 font-medium">Vendor Partner Name</label>
                <input 
                  type="text"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-on-surface font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-on-surface-muted mb-1 font-medium">Item / Asset Title</label>
                <input 
                  type="text"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-2 text-on-surface focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-on-surface-muted mb-2 font-medium">Order Total Valued (SAR)</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPoAmount(3200)}
                    className={`flex-1 py-1.5 rounded-lg border font-bold font-mono transition ${
                      poAmount === 3200 ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-border bg-background hover:bg-surface-highlight'
                    }`}
                  >
                    SAR 3,200
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPoAmount(12000)}
                    className={`flex-1 py-1.5 rounded-lg border font-bold font-mono transition ${
                      poAmount === 12000 ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-border bg-background hover:bg-surface-highlight'
                    }`}
                  >
                    SAR 12,000
                  </button>
                </div>
                <p className="text-[10px] text-on-surface-muted mt-1.5 leading-relaxed">
                  * Note: Submitting order rates over <strong>SAR 5,000</strong> enforces Stage-Gate approval layers automatically.
                </p>
              </div>

              <button 
                type="submit"
                disabled={poAmount <= 0 || !vendorName}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition text-center shadow-md shadow-indigo-600/10"
              >
                Submit Purchase Sequence
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Active PO entries list & active stage controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Approvals Action Section (Need to Know) */}
          {pendingApprovals.length > 0 && (
            <div className="p-5 border-2 border-dashed border-indigo-500/30 bg-indigo-600/5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-400 animate-pulse" />
                <h4 className="font-black text-sm text-indigo-300">Compliance Authorizations Assigned to Your Role</h4>
              </div>
              
              <div className="space-y-3">
                {pendingApprovals.map(req => {
                  const targetPo = orders.find(po => po.id === req.entityId);
                  return (
                    <div key={req.id} className="bg-background border border-indigo-500/20 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-indigo-400">{req.entityType} ({req.entityId})</span>
                          <span>•</span>
                          <span className="font-bold text-on-surface-muted bg-surface-highlight px-1.5 py-0.5 rounded text-[10px]">
                            Stage {req.stage || 1} of {req.maxStages || 1}
                          </span>
                        </div>
                        <p className="text-on-surface-muted text-[11px] leading-relaxed">{req.comments}</p>
                        {targetPo && (
                          <p className="text-[10px] text-on-surface-muted">
                            Order Value: <strong className="text-indigo-300">SAR {targetPo.totalAmount.toLocaleString()}</strong> 
                            | Requested by: {req.requesterId}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveRequest(req.id, 'APPROVE')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve Stage
                        </button>
                        <button 
                          onClick={() => handleApproveRequest(req.id, 'REJECT')}
                          className="bg-red-650 hover:bg-red-700 text-white font-black text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                        >
                          <Ban className="h-3.5 w-3.5" /> Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Orders Section */}
          <div className="glass-panel border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-muted flex items-center gap-2">
              <FileText className="h-4 w-4" /> Active Procurements & Status
            </h3>

            {loading ? (
              <div className="py-12 text-center text-xs text-on-surface-muted gap-2 flex flex-col items-center">
                <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin" />
                <span>Reading live procurement ledger...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-on-surface-muted border border-dashed border-border rounded-xl">
                No active Purchase Orders on file. Insert a procurement using the panel to test.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(po => {
                  const associatedReq = pendingApprovals.find(req => req.entityId === po.id);
                  return (
                    <div key={po.id} className="bg-background border border-border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-500/20 transition">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-400 font-bold">{po.id}</span>
                          <span className="text-[10px] text-on-surface-muted">{new Date(po.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-bold text-on-surface">{po.vendorName || 'Acme Trading Inc.'}</p>
                        {po.items?.[0] && (
                          <p className="text-[10px] text-on-surface-muted italic">Item: {po.items[0].name}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <p className="text-[10px] text-on-surface-muted">Total Amount</p>
                          <p className="font-bold text-on-surface font-mono text-sm">SAR {po.totalAmount.toLocaleString()}</p>
                        </div>
                        
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase border ${
                          po.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          po.status === 'COMPLETED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          po.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          po.status === 'PENDING_APPROVAL' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                          'bg-surface-highlight text-on-surface-muted border-border'
                        }`}>
                          {po.status === 'PENDING_APPROVAL' ? 'PENDING CFO' : po.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
