import React, { useState, useEffect, useMemo } from 'react';
import { detectAnomalies, investigateBenfordAnomalies, speakText } from '../../services/geminiService';
import { AnomalyResult, Transaction } from '../../types';
import { 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  BarChart3, 
  Activity, 
  HelpCircle, 
  BookOpen, 
  Play, 
  Volume2, 
  AlertCircle, 
  TrendingUp, 
  Filter 
} from 'lucide-react';
import { MOCK_TRANSACTIONS } from './BankInsights';
import { Nexa } from '../../services/api';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

// Expected distribution per Benford's Law
const BENFORD_EXPECTED: Record<number, number> = {
  1: 0.301,
  2: 0.176,
  3: 0.125,
  4: 0.097,
  5: 0.079,
  6: 0.067,
  7: 0.058,
  8: 0.051,
  9: 0.046
};

// Rich transaction suite mimicking realistic enterprise activities
const FORENSIC_TEST_SUITE: Transaction[] = [
  ...MOCK_TRANSACTIONS,
  { id: 'TX101', date: '2023-11-01', description: 'Office Depot Purchase', amount: 145.20, category: 'Office Supplies', type: 'debit', status: 'cleared' },
  { id: 'TX102', date: '2023-11-02', description: 'Staples Technology Buy', amount: 189.99, category: 'Hardware', type: 'debit', status: 'cleared' },
  { id: 'TX103', date: '2023-11-03', description: 'Google Workspace License', amount: 120.00, category: 'Software', type: 'debit', status: 'cleared' },
  { id: 'TX104', date: '2023-11-04', description: 'FedEx Shipping fees', amount: 45.10, category: 'Logistics', type: 'debit', status: 'cleared' },
  { id: 'TX105', date: '2023-11-05', description: 'DHL Custom Duties', amount: 560.80, category: 'Logistics', type: 'debit', status: 'cleared' },
  { id: 'TX106', date: '2023-11-06', description: 'Lumber Supply Inc', amount: 13500.00, category: 'Construction', type: 'debit', status: 'cleared' },
  { id: 'TX107', date: '2023-11-07', description: 'Cement Portland Delivery', amount: 2470.00, category: 'Construction', type: 'debit', status: 'cleared' },
  { id: 'TX108', date: '2023-11-08', description: 'Rebar Steel Reinforces', amount: 5120.40, category: 'Construction', type: 'debit', status: 'flagged' },
  { id: 'TX109', date: '2023-11-09', description: 'Equipment Hire Caterpillar', amount: 8200.00, category: 'Construction', type: 'debit', status: 'cleared' },
  { id: 'TX110', date: '2023-11-10', description: 'Home Depot Supplies', amount: 110.00, category: 'Hardware', type: 'debit', status: 'cleared' },
  { id: 'TX111', date: '2023-11-11', description: 'Subcontractor - Masonry', amount: 5000.00, category: 'Professional Services', type: 'debit', status: 'flagged' },
  { id: 'TX112', date: '2023-11-12', description: 'Subcontractor - Plumber', amount: 4950.00, category: 'Professional Services', type: 'debit', status: 'flagged' },
  { id: 'TX113', date: '2023-11-13', description: 'Permit Application Authority', amount: 180.00, category: 'Regulatory', type: 'debit', status: 'cleared' },
  { id: 'TX114', date: '2023-11-14', description: 'Local Steel Foundry Corp', amount: 3150.00, category: 'Raw Materials', type: 'debit', status: 'cleared' },
  { id: 'TX115', date: '2023-11-15', description: 'Structural Engineering Review', amount: 1250.00, category: 'Professional Services', type: 'debit', status: 'cleared' },
  { id: 'TX116', date: '2023-11-16', description: 'Safety Helmet & Vests Bulk', amount: 620.00, category: 'Operations', type: 'debit', status: 'cleared' },
  { id: 'TX117', date: '2023-11-17', description: 'Electrical Cables & Conduits', amount: 215.30, category: 'Construction', type: 'debit', status: 'cleared' },
  { id: 'TX118', date: '2023-11-18', description: 'Architectural Project Fee', amount: 9500.00, category: 'Professional Services', type: 'debit', status: 'cleared' },
  { id: 'TX119', date: '2023-11-19', description: 'Crane Rental 24h Block', amount: 3200.00, category: 'Operations', type: 'debit', status: 'cleared' },
  { id: 'TX120', date: '2023-11-20', description: 'Site Security Fencing Guard', amount: 850.00, category: 'Operations', type: 'debit', status: 'cleared' },
  { id: 'TX121', date: '2023-11-21', description: 'Tax Consulting Ernst & Young', amount: 4900.00, category: 'Compliance', type: 'debit', status: 'flagged' },
  { id: 'TX122', date: '2023-11-22', description: 'Employee Overtime - Construction', amount: 532.00, category: 'Payroll', type: 'debit', status: 'cleared' },
  { id: 'TX123', date: '2023-11-23', description: 'Corporate Travel Hilton Tokyo', amount: 1112.50, category: 'Travel', type: 'debit', status: 'cleared' },
  { id: 'TX124', date: '2023-11-24', description: 'Vite Premium Server Ingress', amount: 35.00, category: 'Software', type: 'debit', status: 'cleared' },
  { id: 'TX125', date: '2023-11-25', description: 'Sales Revenue - Standard Retail', amount: 15430.00, category: 'Revenue', type: 'credit', status: 'cleared' },
  { id: 'TX126', date: '2023-11-26', description: 'Sales Revenue - Bulk Client Y', amount: 26500.00, category: 'Revenue', type: 'credit', status: 'cleared' },
  { id: 'TX127', date: '2023-11-27', description: 'Refund to Retail Customer #443', amount: 154.00, category: 'Operations', type: 'debit', status: 'cleared' },
  { id: 'TX128', date: '2023-11-28', description: 'Adobe Creative Suite licenses', amount: 115.00, category: 'Software', type: 'debit', status: 'cleared' },
  { id: 'TX129', date: '2023-11-29', description: 'Pest Control Services Site E', amount: 185.00, category: 'Maintenance', type: 'debit', status: 'cleared' },
  { id: 'TX130', date: '2023-11-30', description: 'Water Pipeline Utilities', amount: 980.00, category: 'Operations', type: 'debit', status: 'cleared' },
];

export const AnomalyDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classic' | 'benford'>('classic');
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(FORENSIC_TEST_SUITE);
  const [costCenterAlerts, setCostCenterAlerts] = useState<any[]>([]);
  
  // Benford state
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load real ledger transactions to blend them with forensic dataset
    Nexa.Ledger.Journal.getAll().then(entries => {
      if (entries && entries.length > 0) {
        const mapped: Transaction[] = entries.map(ent => ({
          id: ent.id,
          date: ent.transactionDate || ent.postedDate || new Date().toISOString().split('T')[0],
          description: ent.description || 'Ledger Entry',
          amount: ent.totalAmount,
          category: ent.costCenter || 'Ledger',
          type: 'debit',
          status: ent.status === 'POSTED' ? 'cleared' : 'pending'
        }));
        setAllTransactions([...mapped, ...FORENSIC_TEST_SUITE]);
      }
    }).catch(err => {
      console.error("Error loading real transactions for forensic analysis:", err);
    });

    // Fetch active cost center budgets to check for margin and threshold alerts
    Nexa.Budgeting.getCostCenterBudgets(2026).then(ccBudgets => {
      if (ccBudgets && ccBudgets.length > 0) {
        const alerts = ccBudgets.filter(cc => cc.percent >= 90 || cc.variance < 0);
        setCostCenterAlerts(alerts);
      }
    }).catch(err => {
      console.error("Error loading budgets for security warning scan:", err);
    });

    return () => {
      // Clean up audio on unmount if playing
      if (activeAudio) {
        activeAudio.pause();
      }
    };
  }, []);

  // Standard classic scan
  const handleScan = async () => {
    setLoading(true);
    try {
      const result = await detectAnomalies(allTransactions);
      if (result && result.anomalies) {
        setAnomalies(result.anomalies);
      }
    } catch (e) {
      console.error("Forensic scan error", e);
    } finally {
      setScanned(true);
      setLoading(false);
    }
  };

  // --- STATISTICAL BENFORD CALCULATIONS ---
  
  // Helper to extract first non-zero digit
  const getFirstDigit = (amount: number): number | null => {
    const absVal = Math.abs(amount);
    if (absVal === 0) return null;
    const match = absVal.toString().replace(/[^1-9]/g, '');
    if (match.length > 0) {
      return parseInt(match[0], 10);
    }
    return null;
  };

  const benfordAnalysis = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    let validCount = 0;

    allTransactions.forEach(t => {
      const fd = getFirstDigit(t.amount);
      if (fd !== null && fd >= 1 && fd <= 9) {
        counts[fd] = counts[fd] + 1;
        validCount++;
      }
    });

    // 1. Compute proportions and Z-Scores
    const stats = Object.entries(counts).map(([digitKey, count]) => {
      const digit = parseInt(digitKey, 10);
      const expectedProp = BENFORD_EXPECTED[digit];
      const observedProp = validCount > 0 ? count / validCount : 0;
      
      // Z-Score formula: (p_o - p_e) / sqrt( p_e * (1 - p_e) / n )
      let zScore = 0;
      if (validCount > 0) {
        const stdError = Math.sqrt((expectedProp * (1 - expectedProp)) / validCount);
        zScore = stdError > 0 ? (observedProp - expectedProp) / stdError : 0;
      }

      // We flag as anomalous if it breaks standard 95% confidence threshold limit (Z-Score > 1.96)
      const isAnomalous = Math.abs(zScore) > 1.96;

      return {
        digit,
        count,
        expectedCount: validCount * expectedProp,
        observedPercentage: observedProp * 100,
        expectedPercentage: expectedProp * 100,
        zScore,
        isAnomalous
      };
    });

    // 2. Chi-Square goodness of fit calculation
    let chiSquare = 0;
    if (validCount > 0) {
      stats.forEach(s => {
        const diff = s.count - s.expectedCount;
        chiSquare += (diff * diff) / s.expectedCount;
      });
    }

    // 3. Mathematical p-value calculation for Chi-Square distribution with DF=8
    // CDF approximation for even degrees of freedom k=8 (m=4)
    const computePValue8DF = (chiSq: number): number => {
      if (chiSq <= 0) return 1.0;
      const x = chiSq / 2;
      // sum of (x^i / i!) for i=0 to 3
      const sum = 1 + x + (x * x) / 2 + (x * x * x) / 6;
      return Math.max(0, Math.min(1.0, Math.exp(-x) * sum));
    };

    const pValue = computePValue8DF(chiSquare);
    const hasAuditOutliers = pValue < 0.05; // Reject null hypothesis if p < 0.05

    return {
      stats,
      totalCount: validCount,
      chiSquare,
      pValue,
      isAnomalous: hasAuditOutliers
    };
  }, [allTransactions]);

  // Filtered list of transactions matching the active card's first digit
  const filteredTransactionsByDigit = useMemo(() => {
    if (selectedDigit === null) return [];
    return allTransactions.filter(t => getFirstDigit(t.amount) === selectedDigit);
  }, [selectedDigit, allTransactions]);

  // AI-powered investigation request
  const handleAiInvestigate = async () => {
    setAiLoading(true);
    setAiReport(null);
    try {
      // Pick transactions in flagged ranges to send to Gemini
      const anomalousDigits = benfordAnalysis.stats
        .filter(s => s.isAnomalous)
        .map(s => s.digit);
      
      const sampleFlagged = allTransactions.filter(t => {
        const fd = getFirstDigit(t.amount);
        return fd !== null && anomalousDigits.includes(fd);
      });

      const statsSummary = {
        chiSquare: benfordAnalysis.chiSquare,
        pValue: benfordAnalysis.pValue,
        isAnomalous: benfordAnalysis.isAnomalous,
        deviations: benfordAnalysis.stats.map(s => ({
          digit: s.digit,
          observed: Number(s.observedPercentage.toFixed(2)),
          expected: Number(s.expectedPercentage.toFixed(2)),
          zScore: Number(s.zScore.toFixed(2)),
          status: s.isAnomalous ? "Anomalous Dev" : "Expected Limit"
        }))
      };

      const auditTextResult = await investigateBenfordAnomalies(statsSummary, sampleFlagged);
      setAiReport(auditTextResult);
    } catch (e) {
      console.error("AI Investigation error", e);
      setAiReport("Audit failed to execute. Highly suspicious values were detected locally.");
    } finally {
      setAiLoading(false);
    }
  };

  // Text-To-Speech Narration audio controller
  const handleSpeechToggle = async () => {
    if (!aiReport) return;
    
    if (speaking) {
      if (activeAudio) {
        activeAudio.pause();
      }
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    try {
      // Clean formatting for a smooth voice narrative
      const narratableText = aiReport
        .replace(/[#*`_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .substring(0, 1200); // Limit narration length for latency

      const result = await speakText(narratableText);
      if (result?.audioData) {
        const binary = atob(result.audioData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: result.mimeType || 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        audio.onended = () => {
          setSpeaking(false);
          setActiveAudio(null);
        };
        audio.onerror = () => {
          setSpeaking(false);
          setActiveAudio(null);
        };

        setActiveAudio(audio);
        await audio.play();
      } else {
        setSpeaking(false);
      }
    } catch (error) {
      console.error("Speech playback critical issue", error);
      setSpeaking(false);
    }
  };

  return (
    <div id="anomaly_detection_module" className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      
      {/* Module Title */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-amber-500 animate-pulse-slow" />
            Financial Forensic Audit Lab & Anomaly Radar
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time hybrid engine combining algorithmic heuristics, Benford's first-digit law, and Gemini Pro investigation.
          </p>
        </div>

        {/* Dynamic Tab Selector */}
        <div id="forensic_tabs" className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto shadow-inner">
          <button
            id="tab_classic_trigger"
            onClick={() => setActiveTab('classic')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-2 ${activeTab === 'classic' ? 'bg-amber-500 text-black shadow-md font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Activity className="h-4 w-4" />
            Classic Forensic Alarms
          </button>
          <button
            id="tab_benford_trigger"
            onClick={() => setActiveTab('benford')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center gap-2 ${activeTab === 'benford' ? 'bg-amber-500 text-black shadow-md font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <BarChart3 className="h-4 w-4" />
            Benford's Law (First Digits)
          </button>
        </div>
      </div>

      {/* Real-time Budget Deficit & Material Margin Variance Alerts */}
      {costCenterAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/40 to-amber-950/30 border border-red-500/20 rounded-2xl p-6 space-y-4 animate-fade-in shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-red-500 animate-pulse" />
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Active GAAP Margin & Deficit Alerts
              </h3>
              <p className="text-xs text-gray-400">
                Strategic cost center limits triggered by instant transaction posting. Immediate balance adjustment is requested.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {costCenterAlerts.map(cc => {
              const overrun = cc.variance < 0;
              return (
                <div key={cc.id} className="bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <p className="text-sm font-bold text-white">{cc.name} ({cc.code})</p>
                    </div>
                    <p className="text-xs font-mono text-gray-400">
                      Spend: <span className="text-red-400 font-bold">${cc.actual.toLocaleString()}</span> / Budget: ${cc.budget.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded ${overrun ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {overrun ? `${cc.percent}% OVER LIMIT` : `${cc.percent}% EXHAUSTED`}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">
                      {overrun ? 'Critical Deficit' : 'Margin Warning'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 1: CLASSIC SYSTEM OUTLIERS --- */}
      {activeTab === 'classic' && (
        <div id="classic_tab_container" className="space-y-6">
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Aggregated Ledger & Bank Scanner
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Scans transactions for double postings, holiday payments, and multi-sigma outliers.</p>
            </div>
            <button 
              id="run_scan_btn"
              onClick={handleScan}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-black px-6 py-2.5 rounded-xl shadow-md transition font-bold flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin text-black" /> : <ShieldAlert className="h-5 w-5" />}
              {loading ? 'Analyzing Transactions...' : 'Run Forensic Scan'}
            </button>
          </div>

          {loading && (
            <div id="scan_loading_indicator" className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg">
              <Loader2 className="h-10 w-10 animate-spin text-amber-500 mx-auto mb-4" />
              <p className="text-white font-medium">Gemini AI is analyzing transaction syntax and metadata...</p>
              <p className="text-xs text-gray-400 mt-2">Checking duplicate keys, ledger categories, and structured timing offsets.</p>
            </div>
          )}

          {scanned && !loading && (
            <div id="classic_anomalies_list" className="grid grid-cols-1 gap-4">
              {anomalies.length === 0 ? (
                <div id="no_anomalies_alert" className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl flex items-center gap-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-white text-lg">No Financial Violations Found</h3>
                    <p className="text-gray-400 text-sm mt-0.5">All transaction entries correspond nicely to regional thresholds and balance equations.</p>
                  </div>
                </div>
              ) : (
                anomalies.map((anomaly, idx) => {
                  const tx = allTransactions.find(t => t.id === anomaly.id);
                  return (
                    <div 
                      key={idx} 
                      id={`anomaly_card_${anomaly.id}`}
                      className="bg-white/5 border-l-4 border-amber-500 p-5 rounded-r-2xl border-y border-r border-white/10 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center gap-6 hover:bg-white/10 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 text-2xs font-bold uppercase rounded border ${anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/10' : 'bg-amber-500/20 text-amber-400 border-amber-500/10'}`}>
                            {anomaly.severity} priority
                          </span>
                          <span className="text-gray-400 text-xs font-mono">{anomaly.id}</span>
                        </div>
                        <h4 className="font-semibold text-white text-base font-sans">{anomaly.reason}</h4>
                        {tx && (
                          <div id={`tx_details_${anomaly.id}`} className="mt-3 bg-black/30 p-3 rounded-lg border border-white/5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-gray-300">
                            <div><span className="text-gray-500">Desc:</span> {tx.description}</div>
                            <div><span className="text-gray-500">Amount:</span> ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div><span className="text-gray-500">Date:</span> {tx.date}</div>
                            <div><span className="text-gray-500">Category:</span> {tx.category}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 self-start md:self-auto">
                        <button 
                          id={`ignore_btn_${anomaly.id}`}
                          onClick={() => setAnomalies(prev => prev.filter(item => item.id !== anomaly.id))}
                          className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 rounded-xl hover:bg-white/10 transition"
                        >
                          Dismiss
                        </button>
                        <button 
                          id={`audit_btn_${anomaly.id}`}
                          className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-600 transition shadow-sm"
                        >
                          Analyze Trail
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: BENFORD'S LAW MULTILATERAL AUDIT --- */}
      {activeTab === 'benford' && (
        <div id="benford_tab_container" className="space-y-6">
          
          {/* Benford Theory Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div id="benford_intro_card" className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">What is Benford's Law?</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Also known as the **First-Digit Law**, it states that in naturally occurring numerical datasets, the number **1** appears as the leading digit roughly **30.1%** of the time, while **9** appears only **4.6%** of the time.
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                When employees split invoices, falsify ledger data, or forge custom tax amounts to bypass authorization thresholds (e.g., repeatedly posting receipts at $4,999 to avoid a $5,000 audit trigger), the digits deviate significantly from this natural distribution.
              </p>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <h4 className="text-2xs uppercase tracking-wider text-amber-500 font-bold mb-1">Anomaly Thresholds</h4>
                <p className="text-2xs text-gray-400">
                  We calculate **Z-Scores** for every digit. Z-scores above <span className="text-amber-400 font-bold font-mono">1.96</span> indicate significant mathematical anomalies with over 95% confidence intervals.
                </p>
              </div>
            </div>

            {/* Statistical Verdict Widget */}
            <div id="benford_stats_verdict" className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                  Forensic Statistical Verdict
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-gray-400 text-2xs block">Total Analysed Pool</span>
                    <span className="text-white text-lg font-bold font-mono">{benfordAnalysis.totalCount} tx</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-gray-400 text-2xs block">Chi-Square Statistic</span>
                    <span className="text-white text-lg font-bold font-mono">{benfordAnalysis.chiSquare.toFixed(3)}</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 col-span-2 md:col-span-1">
                    <span className="text-gray-400 text-2xs block">Goodness of Fit (P-Value)</span>
                    <span className="text-white text-lg font-bold font-mono">{benfordAnalysis.pValue.toFixed(6)}</span>
                  </div>
                </div>
              </div>

              {/* Verdict Banner */}
              <div className="mt-4">
                {benfordAnalysis.isAnomalous ? (
                  <div id="verdict_danger" className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-400 text-sm">Material Anomaly Flagged</h4>
                      <p className="text-xs text-gray-300 mt-1">
                        P-value is below 0.05. The first-digit distribution of this ledger strongly violates Benford's expected curve. Highly probable duplicate structures, transaction splittings or unauthorized manipulations detected.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div id="verdict_safe" className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-emerald-400 text-sm">Ledger Pattern Authenticated</h4>
                      <p className="text-xs text-gray-300 mt-1">
                        P-value exceeds the alpha 0.05 limit. The digit distribution matches the logarithmic frequencies expected in professional accounting ledgers.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Recharts Chart Layout */}
          <div id="benford_distribution_pane" className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
            <h3 className="font-bold text-white text-base mb-4">Digit Frequency Distribution — Expected vs. Observed</h3>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={benfordAnalysis.stats}
                  margin={{ top: 20, right: 20, bottom: 20, left: -10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0d" />
                  <XAxis dataKey="digit" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis unit="%" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#ffffff20', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#ffffff' }}
                    formatter={(value: any, name: any) => [`${parseFloat(value).toFixed(1)}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#fff', marginTop: '10px' }} />
                  <Bar
                    name="Actual Ledger Distribution"
                    dataKey="observedPercentage"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                  />
                  <Line
                    name="Benford Expected Trend"
                    type="monotone"
                    dataKey="expectedPercentage"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pinpoint Grid Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-base">Forensic Digit Breakdown radar</h3>
                <p className="text-2xs text-gray-400 mt-0.5">Click a digit to query and navigate underlying transactions.</p>
              </div>
              {selectedDigit && (
                <button
                  id="clear_digital_filters"
                  onClick={() => setSelectedDigit(null)}
                  className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-semibold text-gray-300 transition flex items-center gap-1.5"
                >
                  <Filter className="h-3 w-3" />
                  Clear Selection (Filtering Digital: {selectedDigit})
                </button>
              )}
            </div>

            <div id="benford_digit_grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
              {benfordAnalysis.stats.map((s, idx) => (
                <button
                  type="button"
                  id={`digit_card_${s.digit}`}
                  key={idx}
                  onClick={() => setSelectedDigit(s.digit === selectedDigit ? null : s.digit)}
                  className={`p-4 rounded-xl border transition flex flex-col items-center justify-between text-center select-none ${
                    selectedDigit === s.digit 
                      ? 'bg-amber-500/20 border-amber-500 scale-[1.03] shadow-lg shadow-amber-500/5' 
                      : s.isAnomalous 
                        ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10' 
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className={`text-2xl font-black font-mono ${selectedDigit === s.digit ? 'text-amber-400' : s.isAnomalous ? 'text-red-400' : 'text-white'}`}>{s.digit}</span>
                  
                  <div className="my-2 w-full space-y-0.5">
                    <div className="flex justify-between text-3xs font-mono text-gray-400">
                      <span>Obs:</span>
                      <span className="font-semibold text-white">{s.observedPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-3xs font-mono text-gray-500">
                      <span>Exp:</span>
                      <span>{s.expectedPercentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  <span className={`px-1.5 py-0.5 text-4xs font-bold font-mono tracking-wide rounded-md w-full border text-center uppercase ${
                    s.isAnomalous 
                      ? 'bg-red-500/20 border-red-500/20 text-red-400' 
                      : 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400'
                  }`}>
                    Z: {s.zScore > 0 ? `+${s.zScore.toFixed(2)}` : s.zScore.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Drill-Down Transaction Explorer Drawer */}
          {selectedDigit !== null && (
            <div id="digit_drilldown_explorer" className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md animate-slide-up space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-amber-500" />
                  Drill-Down Auditor Explorer: Digit {selectedDigit}
                </h4>
                <span className="text-3xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded border border-white/5">
                  Found {filteredTransactionsByDigit.length} records matching leading digit
                </span>
              </div>

              {filteredTransactionsByDigit.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No records start with {selectedDigit} in this ledger period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-2xs">
                        <th className="py-2.5">Date</th>
                        <th>TX ID</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {filteredTransactionsByDigit.map((t, index) => (
                        <tr key={index} className="hover:bg-white/5">
                          <td className="py-2.5 text-gray-400">{t.date}</td>
                          <td className="text-amber-400 font-semibold">{t.id}</td>
                          <td className="font-sans text-white">{t.description}</td>
                          <td>{t.category}</td>
                          <td>
                            <span className={`px-2 py-0.5 rounded border text-3xs ${t.status === 'flagged' ? 'bg-red-500/25 text-red-400 border-red-500/15' : 'bg-emerald-500/25 text-emerald-400 border-emerald-500/15'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="text-right text-white font-bold">${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* AI Forensic Advisor Report Section */}
          <div id="ai_benford_report_pane" className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-amber-500" />
                  Gemini Pro Forensic AI investigator
                </h3>
                <p className="text-2xs text-gray-400 mt-0.5">Performs a PhD-level deep investigative audit on statistics and prints comprehensive regulatory reports.</p>
              </div>

              <div className="flex gap-2">
                {aiReport && (
                  <button
                    id="narrate_report_btn"
                    onClick={handleSpeechToggle}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                      speaking 
                        ? 'bg-red-500 text-white shadow-md animate-pulse' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                    }`}
                  >
                    <Volume2 className={`h-4 w-4 ${speaking ? 'animate-bounce' : ''}`} />
                    {speaking ? 'Stop Voice Narration' : 'Narrate Audit Logs'}
                  </button>
                )}

                <button
                  id="query_gemini_analysis"
                  onClick={handleAiInvestigate}
                  disabled={aiLoading}
                  className="bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-black px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      Auditing Digit Clusters...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Investigate Digit Outliers
                    </>
                  )}
                </button>
              </div>
            </div>

            {aiLoading && (
              <div id="ai_loading_spinner" className="text-center py-10 bg-black/20 rounded-xl border border-white/5">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-3" />
                <p className="text-white text-xs font-medium">Drafting Forensic Report...</p>
                <p className="text-4xs text-gray-400 mt-1">Cross-referencing chi-square curves and mapping transaction structures</p>
              </div>
            )}

            {aiReport && !aiLoading && (
              <div id="ai_report_markdown_box" className="bg-black/40 p-6 rounded-xl border border-white/5 text-gray-100 space-y-4 text-xs leading-relaxed max-h-[450px] overflow-y-auto whitespace-pre-wrap font-sans">
                {aiReport}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
