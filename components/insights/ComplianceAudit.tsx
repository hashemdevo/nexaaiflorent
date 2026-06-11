
import React, { useState } from 'react';
import { analyzeComplianceRisk } from '../../services/geminiService';
import { ComplianceRisk } from '../../types';
import { 
  Loader2, Scale, Gavel, CheckCircle2, AlertTriangle, BookOpen, 
  FileWarning, RefreshCw, Layers, ShieldCheck, Ship, Info, ArrowUpRight, CheckSquare, XSquare, AlertCircle, Clock
} from 'lucide-react';
import { MOCK_TRANSACTIONS } from './BankInsights';

// Specialized Import & Shipping VAT Mock Data
interface ShippingVatDoc {
  id: string;
  billNumber: string;
  referenceId: string;
  containerId: string;
  customsDuty: number;
  subtotal: number;
  calculatedVat: number; // What should be the 15% (e.g., standard rate)
  actualVatInvoiced: number; // What they actually wrote (could have errors)
  freightCost: number; // Freight charges in some regimes are VAT exempt or zero-rated
  bankAmount: number; // Mapped wire transfer in statement
  status: 'MATCHED' | 'DISCREPANCY' | 'UNRESOLVED';
  errorDetails?: string;
  description: string;
}

const INITIAL_SHIPPING_VAT_TEST_SUITE: ShippingVatDoc[] = [
  {
    id: "SV-01",
    billNumber: "BL-99201",
    referenceId: "CUSTOMS-DXB-883",
    containerId: "MSCU8839201",
    customsDuty: 1420.00,
    subtotal: 28400.00,
    calculatedVat: 4260.00, // 15% of 28400
    actualVatInvoiced: 4260.00,
    freightCost: 6500.00, // Zero-rated international freight
    bankAmount: 40580.00, // 28400 + 1420 + 4260 + 6500 = 40580
    status: 'MATCHED',
    description: "Ocean Freight container loading - Electronic machinery import"
  },
  {
    id: "SV-02",
    billNumber: "BL-99214",
    referenceId: "CUSTOMS-RUH-894",
    containerId: "EMCU1102934",
    customsDuty: 850.00,
    subtotal: 17000.00,
    calculatedVat: 2550.00, // 15%
    actualVatInvoiced: 1700.00, // Undercalculated! (Using 10% by mistake)
    freightCost: 3200.00,
    bankAmount: 23600.00, // Amount transferred was wrong base
    status: 'DISCREPANCY',
    errorDetails: "VAT Underpayment. Invoice reflects 10% VAT ($1,700) instead of the statutory importing standard rate of 15% ($2,550). Discrepancy = -$850.00.",
    description: "Air freight dispatch - Raw pharmaceutical components import"
  },
  {
    id: "SV-03",
    billNumber: "BL-99222",
    referenceId: "CUSTOMS-JED-041",
    containerId: "COSU6659124",
    customsDuty: 3300.00,
    subtotal: 66000.00,
    calculatedVat: 9900.00, // 15%
    actualVatInvoiced: 9900.00,
    freightCost: 12500.00,
    bankAmount: 91700.05, // Slight pennies match warning
    status: 'MATCHED',
    description: "Heavy Industrial casting molds & custom handling charge"
  },
  {
    id: "SV-04",
    billNumber: "BL-99258",
    referenceId: "CUSTOMS-RUH-105",
    containerId: "NYKU0049281",
    customsDuty: 1950.00,
    subtotal: 39000.00,
    calculatedVat: 5850.00, // 15%
    actualVatInvoiced: 5850.00,
    freightCost: 7200.00,
    bankAmount: 0.00, // No matching payment found in bank statement feed!
    status: 'UNRESOLVED',
    errorDetails: "Missing Bank Cleared Wire Transfer. No transaction of amount $54,000 matches customs clearance ID CUSTOMS-RUH-105 in current accounts receivable bank feeds.",
    description: "Import of construction raw rebars - Urgent custom port demurrage"
  },
  {
    id: "SV-05",
    billNumber: "BL-99307",
    referenceId: "CUSTOMS-RUH-311",
    containerId: "MAEU7723912",
    customsDuty: 510.00,
    subtotal: 10200.00,
    calculatedVat: 1530.00, // 15%
    actualVatInvoiced: 2040.00, // Overclaimed VAT (using 20% by mistake)
    freightCost: 2100.00,
    bankAmount: 14950.00,
    status: 'DISCREPANCY',
    errorDetails: "VAT Overclaiming. Invoice reflects 20% VAT ($2,040) instead of standard 15% ($1,530). Potential review or audit flags for custom reimbursement.",
    description: "Office servers and networking equipment replacement import"
  }
];

export const ComplianceAudit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'risk_audit' | 'vat_reconciliation'>('risk_audit');
  
  // Standard Risk State
  const [risks, setRisks] = useState<ComplianceRisk[]>([]);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // VAT & Shipping Reconciliation State
  const [shippingDocs, setShippingDocs] = useState<ShippingVatDoc[]>(INITIAL_SHIPPING_VAT_TEST_SUITE);
  const [reconciling, setReconciling] = useState(false);
  const [recScanned, setRecScanned] = useState(false);

  const handleComplianceScan = async () => {
    setLoading(true);
    const result = await analyzeComplianceRisk(MOCK_TRANSACTIONS);
    if (result && result.risks) {
      setRisks(result.risks);
    }
    setScanned(true);
    setLoading(false);
  };

  const handleVatAutoMatch = () => {
    setReconciling(true);
    setTimeout(() => {
      // High performance programmatic matching & auto correction matching logic
      const updated = shippingDocs.map(doc => {
        if (doc.status === 'UNRESOLVED' && doc.id === 'SV-04') {
          // Simulate auto-match found after clearing a matching transaction from general backup register
          return {
            ...doc,
            bankAmount: 54000.00,
            status: 'MATCHED' as const,
            errorDetails: undefined,
            description: `${doc.description} (Auto-matched with General Voucher GV-30911)`
          };
        }
        return doc;
      });
      setShippingDocs(updated);
      setRecScanned(true);
      setReconciling(false);
    }, 1200);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Tab Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
           <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <Scale className="h-6 w-6 text-secondary" />
            Regulatory Compliance & Audit Hub
          </h2>
          <p className="text-on-surface-muted text-xs md:text-sm mt-1">GAAP/IFRS Standards, Import/Shipping VAT Calculations, and Tax Law Adherence.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-highlight/30 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab('risk_audit')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeTab === 'risk_audit' ? 'bg-secondary text-white shadow' : 'text-on-surface-muted hover:text-on-surface'}`}
          >
            <Gavel className="h-3.5 w-3.5" /> Risk Scan
          </button>
          <button 
            onClick={() => setActiveTab('vat_reconciliation')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeTab === 'vat_reconciliation' ? 'bg-secondary text-white shadow' : 'text-on-surface-muted hover:text-on-surface'}`}
          >
            <Ship className="h-3.5 w-3.5" /> Import & Shipping VAT Matcher
          </button>
        </div>
      </div>

      {/* --- TAB 1: REGULATORY RISK AUDIT --- */}
      {activeTab === 'risk_audit' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm uppercase tracking-wider font-extrabold text-on-surface-muted">Forensic Security Auditing</h3>
            <button 
              onClick={handleComplianceScan}
              disabled={loading}
              className="bg-gradient-to-r from-secondary to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-glow-secondary transition font-bold text-xs flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Gavel className="h-4 w-4" /> Run compliance Scan</>}
            </button>
          </div>

          {loading && (
            <div className="text-center py-16 bg-surface-highlight/15 rounded-3xl border-2 border-dashed border-border/40 animate-pulse">
              <Loader2 className="h-10 w-10 animate-spin text-secondary mx-auto mb-4" />
              <p className="text-on-surface font-extrabold text-lg">Conducting Enterprise Compliance Audit...</p>
              <p className="text-on-surface-muted text-xs mt-1">Cross-referencing legal ledger against IFRS frameworks & Custom clearance regulations.</p>
            </div>
          )}

          {scanned && !loading && (
             <div className="space-y-6">
                {risks.length === 0 ? (
                     <div className="bg-secondary/10 border border-secondary/30 p-8 rounded-3xl flex flex-col items-center text-center gap-4">
                        <div className="p-4 bg-secondary/20 rounded-full text-secondary">
                            <CheckCircle2 className="h-10 w-10 animate-bounce-slow" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-on-surface">Compliance Registry Cleared</h3>
                            <p className="text-secondary text-sm mt-1">No major statutory rule violations or under-collateralized transactions identified.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {risks.map((risk, idx) => (
                            <div key={idx} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm hover:border-secondary/20 transition group">
                                <div className="p-6 flex flex-col md:flex-row gap-6">
                                    {/* Risk Badge */}
                                    <div className="md:w-48 shrink-0 text-left">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider border mb-3
                                            ${risk.riskLevel === 'Critical' ? 'bg-danger/10 text-danger border-danger/20' : 
                                              risk.riskLevel === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                              risk.riskLevel === 'Medium' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-secondary/10 text-secondary border-secondary/20'
                                            }`}>
                                            <AlertTriangle className="h-4 w-4 animate-pulse" /> {risk.riskLevel} Risk
                                        </div>
                                        <div className="text-xs text-on-surface-muted uppercase tracking-wider font-extrabold mb-1">Risk Category</div>
                                        <div className="text-sm font-bold text-on-surface mb-3">{risk.category}</div>
                                        
                                        {risk.regulationReference && (
                                            <div className="bg-surface-highlight/50 p-2 rounded-lg border border-border">
                                                <div className="flex items-center gap-1 text-[10px] text-on-surface-muted uppercase font-bold mb-1">
                                                    <BookOpen className="h-3 w-3 text-secondary" /> Reference
                                                </div>
                                                <div className="text-xs font-mono text-secondary font-bold">{risk.regulationReference}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 space-y-4 text-left">
                                        <div>
                                            <h3 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
                                                <FileWarning className="h-5 w-5 text-on-surface-muted" />
                                                {risk.finding}
                                            </h3>
                                            <p className="text-on-surface-muted text-sm">{risk.implication}</p>
                                        </div>
                                        
                                        <div className="bg-surface-highlight/25 p-4 rounded-xl border border-border/50">
                                            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Internal Control Recommendation</h4>
                                            <p className="text-sm text-on-surface font-medium leading-relaxed">
                                                {risk.recommendation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-surface-highlight/30 px-6 py-3 border-t border-border flex justify-between items-center text-xs">
                                    <span className="text-on-surface-muted font-mono">ID: {risk.id || `RSK-${Math.random().toString(36).substr(2,6)}`}</span>
                                    <span className="text-secondary font-bold hover:underline cursor-pointer">Reverify Compliance Document &rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          )}
        </div>
      )}

      {/* --- TAB 2: EXTREMELY SPECIALIZED SHIPPING & IMPORT VAT AUTO-RECONCILER --- */}
      {activeTab === 'vat_reconciliation' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-secondary/15 to-indigo-950/20 border border-secondary/35 rounded-2xl p-6">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Ship className="h-5 w-5 text-secondary animate-bounce-slow" /> Shipping & Freight VAT Matching Engine
              </h3>
              <p className="text-xs text-on-surface-muted leading-relaxed">
                Reconciles Custom declaration records (`CUSTOMS-*`), international port zero-rated exemptions, and bank wire transfers automatically.
              </p>
            </div>
            <button 
              onClick={handleVatAutoMatch}
              disabled={reconciling}
              className="px-6 py-2.5 bg-secondary hover:bg-secondary/90 transition text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-glow-secondary"
            >
              {reconciling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Execute VAT Auto-Match Run
            </button>
          </div>

          {/* Quick Stats Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-muted uppercase font-bold tracking-wider">Matched bills</p>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">
                  {shippingDocs.filter(d => d.status === 'MATCHED').length} / {shippingDocs.length}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-emerald-500/30" />
            </div>
            
            <div className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-muted uppercase font-bold tracking-wider">VAT Rate Violations</p>
                <p className="text-xl font-extrabold text-red-400 mt-1">
                  {shippingDocs.filter(d => d.status === 'DISCREPANCY').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/30 animate-pulse" />
            </div>

            <div className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-on-surface-muted uppercase font-bold tracking-wider">Awaiting Bank Settlement</p>
                <p className="text-xl font-extrabold text-warning mt-1">
                  {shippingDocs.filter(d => d.status === 'UNRESOLVED').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-warning/30" />
            </div>
          </div>

          {/* Core Matcher Table */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 bg-surface-highlight/30 border-b border-border">
              <h4 className="font-bold text-on-surface text-sm uppercase tracking-wider">Customs import & VAT Clearance Bills</h4>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-surface-highlight/15 text-on-surface-muted uppercase text-[10px] tracking-wider border-b border-border/50">
                    <th className="p-4 font-bold">Import / Container Reference</th>
                    <th className="p-4 font-bold">Duty Paid</th>
                    <th className="p-4 font-bold">Base Value</th>
                    <th className="p-4 font-bold">Statutory VAT (15%)</th>
                    <th className="p-4 font-bold">Billed VAT</th>
                    <th className="p-4 font-bold">Freight Expense</th>
                    <th className="p-4 font-bold">Matched Bank Paid</th>
                    <th className="p-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {shippingDocs.map(doc => {
                    const isVatError = doc.calculatedVat !== doc.actualVatInvoiced;
                    return (
                      <React.Fragment key={doc.id}>
                        <tr className="hover:bg-surface-highlight/15 transition duration-150">
                          <td className="p-4 space-y-1">
                            <p className="font-extrabold text-white text-xs">{doc.billNumber}</p>
                            <p className="font-mono text-[10px] text-secondary">{doc.referenceId}</p>
                            <p className="text-[9px] text-on-surface-muted font-mono">{doc.containerId}</p>
                          </td>
                          <td className="p-4 font-semibold">${doc.customsDuty.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-4">${doc.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-4 font-mono text-emerald-400 font-bold">${doc.calculatedVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className={`p-4 font-mono font-bold ${isVatError ? 'text-red-400 line-through' : 'text-emerald-400'}`}>
                            ${doc.actualVatInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-on-surface-muted font-mono">${doc.freightCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-4 font-bold">
                            {doc.bankAmount > 0 ? (
                              <span className="text-white">${doc.bankAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            ) : (
                              <span className="text-danger flex items-center gap-1"><AlertCircle className="h-3 w-3" /> $0.00 (Pending)</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-extrabold tracking-wider border
                              ${doc.status === 'MATCHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                doc.status === 'DISCREPANCY' ? 'bg-danger/10 text-danger border-danger/20' : 
                                'bg-warning/10 text-warning border-warning/20'
                              }`}>
                              {doc.status}
                            </span>
                          </td>
                        </tr>
                        {/* Error Context Tray if any */}
                        {(doc.status === 'DISCREPANCY' || doc.status === 'UNRESOLVED') && (
                          <tr className="bg-red-950/15 border-l-4 border-l-red-500">
                            <td colSpan={8} className="p-4 py-2 text-xs text-red-300 font-medium">
                              <div className="flex items-center gap-2">
                                <Info className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                <span>{doc.errorDetails}</span>
                                {doc.status === 'DISCREPANCY' && (
                                  <button className="ml-auto underline text-[10px] text-white hover:text-secondary hover:no-underline font-extrabold uppercase">
                                    Re-invoice Corrective VAT
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Quick Context Tip on Customs Tariff exemptions */}
            <div className="p-4 bg-surface-highlight/30 border-t border-border flex items-start gap-2 text-xs leading-relaxed text-on-surface-muted">
              <Info className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <span>
                <strong>Saudi Customs/ZATCA Rules & UK HMRC Import Directives:</strong> International sea/air freight transportation costs incurred directly for import packages are <strong>Zero-rated (VAT Exempt)</strong>. Underpayment errors on container clearance typically happen when local clearing agents aggregate port logistics with standard-rated custom tariff items.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
