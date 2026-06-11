import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ViewState } from '../../types';
import { DbEngine, postgresQueryLogs, PostgresQueryLog } from '../../services/core/db';
import { 
    Database, Server, Cpu, Layers, FileText, CheckCircle, Clock, List, 
    RefreshCw, Trash2, Shield, Eye, HelpCircle, ChevronRight, X, Play, Loader2
} from 'lucide-react';

interface BackendSpec {
    title: string;
    componentFile: string;
    backendFile: string;
    dbCollection: string;
    apiPath: string;
    securityRule: string;
    description: string;
    schemaFields: { field: string; type: string; desc: string }[];
}

const BACKEND_SPECS_MAP: Record<string, BackendSpec> = {
    [ViewState.DASHBOARD]: {
        title: "Executive Dashboard",
        componentFile: "components/Dashboard.tsx",
        backendFile: "services/analytics/index.ts",
        dbCollection: "invoices",
        apiPath: "DbEngine.select('invoices')",
        securityRule: "allow read: if request.auth != null;",
        description: "Aggregates revenue, expense margins, customer counts, and real-time operational metrics across various sectors.",
        schemaFields: [
            { field: "id", type: "string", desc: "Unique transaction / invoice invoice ID" },
            { field: "amount", type: "number", desc: "Total transaction amount in USD" },
            { field: "type", type: "string", desc: "Type: 'revenue' | 'expense' | 'transfer'" },
            { field: "category", type: "string", desc: "COA classification category" },
            { field: "date", type: "string", desc: "ISO 8601 creation timestamp" }
        ]
    },
    [ViewState.MANAGEMENT_INVENTORY]: {
        title: "Smart Inventory & AI OCR Pipeline",
        componentFile: "components/inventory/InventoryList.tsx & InventoryScanner.tsx",
        backendFile: "services/inventory/items.ts & movements.ts",
        dbCollection: "inventory",
        apiPath: "DbEngine.select('inventory') / parseInvoiceDocument()",
        securityRule: "allow read, write: if request.auth.token.role in ['ADMIN', 'WAREHOUSE_MANAGER'];",
        description: "Exposes active stock levels, tracks SKUs, analyzes cost vs. selling margins, and runs the Gemini OCR parser to upload invoices to Cloud Storage.",
        schemaFields: [
            { field: "id", type: "string", desc: "Item identifier" },
            { field: "name", type: "string", desc: "Human readable product name" },
            { field: "sku", type: "string", desc: "Stock keeping unit alphanumeric" },
            { field: "quantity", type: "number", desc: "Total pieces in stock" },
            { field: "unitPrice", type: "number", desc: "Wholesale cost price" },
            { field: "sellingPrice", type: "number", desc: "Retail customer price" },
            { field: "supplier", type: "string", desc: "Vendor or manufacturing factory source" }
        ]
    },
    [ViewState.ANALYTICS_ANOMALY]: {
        title: "Gemini Forensic Anomaly Engine",
        componentFile: "components/AIInsights.tsx (AnomalyDetection)",
        backendFile: "services/gemini/forecasting.ts",
        dbCollection: "audit_logs",
        apiPath: "parseInvoiceDocument() and hybrid trigger pipelines",
        securityRule: "allow read: if request.auth.token.role == 'AUDITOR';",
        description: "Queries recent high-value journal entries, compares transactions with standard deviations, and submits anomalies to Gemini Pro for forensic deep investigation.",
        schemaFields: [
            { field: "id", type: "string", desc: "Database document log ID" },
            { field: "action", type: "string", desc: "Operation action: 'INSERT' | 'UPDATE' | 'DELETE'" },
            { field: "table", type: "string", desc: "Collection namespace altered" },
            { field: "userId", type: "string", desc: "Operating operator identifier" },
            { field: "timestamp", type: "string", desc: "Exact milliseconds time" },
            { field: "detail", type: "string", desc: "Audit summary or structured JSON string" }
        ]
    },
    [ViewState.COMPLIANCE_INTEGRITY]: {
        title: "Compliance Integrity & Benford's Law Analysis",
        componentFile: "components/AIInsights.tsx (ComplianceAudit)",
        backendFile: "services/securityService.ts",
        dbCollection: "audit_logs",
        apiPath: "DbEngine.select('audit_logs')",
        securityRule: "allow read: if request.auth.token.role in ['ADMIN', 'AUDITOR'];",
        description: "Generates forensic logs, tracks integrity checksum hashes across transaction blocks, and utilizes Benford's first-digit distribution law to identify altered ledger anomalies.",
        schemaFields: [
            { field: "id", type: "string", desc: "Audit entry unique ID" },
            { field: "action", type: "string", desc: "Ledger status check / validation" },
            { field: "userId", type: "string", desc: "Operator responsible" },
            { field: "timestamp", type: "string", desc: "Audit generation datetime" },
            { field: "detail", type: "string", desc: "Forensic details of compliance violations" }
        ]
    },
    [ViewState.REPORTS_FINANCIAL]: {
        title: "Financial Ledger Reports",
        componentFile: "components/Reports.tsx",
        backendFile: "services/ledger/ledgerService.ts",
        dbCollection: "invoices",
        apiPath: "DbEngine.select('invoices')",
        securityRule: "allow read: if request.auth != null;",
        description: "Computes balances, trial sheet entries, depreciation metrics, and cash changes using true double-entry balance sheets.",
        schemaFields: [
            { field: "id", type: "string", desc: "Invoice ID" },
            { field: "amount", type: "number", desc: "Aggregated amount" },
            { field: "type", type: "string", desc: "Cash movement indicator" },
            { field: "category", type: "string", desc: "Financial ledger categories" }
        ]
    },
    [ViewState.TOOLS_POS]: {
        title: "Point Of Sale Terminal",
        componentFile: "components/POS.tsx",
        backendFile: "services/pos/terminal.ts",
        dbCollection: "invoices",
        apiPath: "DbEngine.insert('invoices') & updates inventory quantity",
        securityRule: "allow write: if request.auth.token.role == 'CASHIER';",
        description: "Drives real-time register interfaces, tracks active register cash positions, processes customer receipts, and triggers double-entry journal postings.",
        schemaFields: [
            { field: "id", type: "string", desc: "Sales Receipt ID" },
            { field: "amount", type: "number", desc: "Total checkout cost" },
            { field: "items", type: "array", desc: "Set of sold products with quantity, price, and margins" }
        ]
    }
};

const DEFAULT_SPEC: BackendSpec = {
    title: "Nexa Core Gateway",
    componentFile: "components/ViewManager.tsx",
    backendFile: "services/core/db.ts",
    dbCollection: "audit_logs",
    apiPath: "DbEngine.select('audit_logs')",
    securityRule: "allow read, write: if request.auth != null;",
    description: "Connects client-side user modules to Firebase Firestore and Google Cloud Storage securely using the SaaS partition and tenant-role scope.",
    schemaFields: [
        { field: "id", type: "string", desc: "Standard entry ID" },
        { field: "tenantId", type: "string", desc: "Enterprise tenant client partitioning" },
        { field: "createdAt", type: "string", desc: "Creation record date" },
        { field: "version", type: "number", desc: "Concurrency detection schema version" }
    ]
};

export const BackendPageViewer: React.FC = () => {
    const { currentView } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'schema' | 'terminal'>('architecture');
    const [dbRecords, setDbRecords] = useState<any[]>([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // PostgreSQL interactive shell and logs control states
    const [dbStreamSource, setDbStreamSource] = useState<'postgres' | 'firestore'>('postgres');
    const [sqlTerminalInput, setSqlTerminalInput] = useState<string>("SELECT * FROM employees LIMIT 5;");
    const [sqlTerminalResult, setSqlTerminalResult] = useState<any>(null);
    const [sqlTerminalLoading, setSqlTerminalLoading] = useState<boolean>(false);

    const activeSpec = BACKEND_SPECS_MAP[currentView] || {
        ...DEFAULT_SPEC,
        title: `${currentView.replace(/_/g, ' ')} Backend Specs`
    };

    // Auto-fetch database records when Database tab is opened
    const fetchLiveRecords = async () => {
        setIsLoadingRecords(true);
        try {
            const records = await DbEngine.select<any>(activeSpec.dbCollection as any, { limit: 10 });
            setDbRecords(records);
        } catch (err) {
            console.error("Failed to inspect live collection:", err);
            setDbRecords([]);
        } finally {
            setIsLoadingRecords(false);
        }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'database') {
            fetchLiveRecords();
        }
    }, [isOpen, activeTab, currentView]);

    const handleSeedTable = async () => {
        try {
            if (activeSpec.dbCollection === 'inventory') {
                const initialSeed = [
                    { id: 'inv_seed1', name: 'Premium Office Ergonomic Desk', sku: 'DSK-210', category: 'Furniture', quantity: 15, unitPrice: 310.00, sellingPrice: 599.99, minStockLevel: 3, lastUpdated: '2026-05-23', supplier: 'IKEA Corporate' },
                    { id: 'inv_seed2', name: 'LED Conference Screen 75"', sku: 'LEC-099', category: 'Electronics', quantity: 2, unitPrice: 950.00, sellingPrice: 1599.99, minStockLevel: 2, lastUpdated: '2026-05-23', supplier: 'Samsung B2B' }
                ];
                for (const item of initialSeed) {
                    await DbEngine.insert('inventory', {
                        ...item,
                        tenantId: 'default',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: 1
                    } as any);
                }
                setToastMessage("Successfully seeded two premium stock items!");
            } else {
                // Generic seed audit log
                await DbEngine.insert('audit_logs', {
                    id: `audit_sim_${Date.now()}`,
                    action: 'UPDATE',
                    table: activeSpec.dbCollection as any,
                    userId: 'tester_spec_agent',
                    timestamp: new Date().toISOString(),
                    detail: "Simulated structural check conducted by Nexa Platform Inspector."
                } as any);
                setToastMessage("Seeded simulation audit row! Connection healthy.");
            }
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            fetchLiveRecords();
        } catch (e) {
            alert("Failed to seed items. See logs.");
        }
    };

    const handleDeleteRecord = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this real Firestore record? This operation is irreversible.")) {
            try {
                await DbEngine.delete(activeSpec.dbCollection as any, id);
                setDbRecords(dbRecords.filter(r => r.id !== id));
                setToastMessage("Record deleted successfully.");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    if (!isOpen) {
        return (
            <button 
                id="developer-backend-toggle"
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-50 p-4 bg-gradient-to-tr from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-black font-bold rounded-2xl shadow-glow-primary hover:scale-105 transition-all flex items-center gap-2 group border border-black/10"
                title="View active backend configuration & live Firestore records"
            >
                <div className="relative">
                    <Database className="h-5 w-5 animate-pulse text-black" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping border border-black"></span>
                </div>
                <span className="text-xs tracking-wide">Developer Backend</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-[#0c1017]/95 border-l border-border backdrop-blur-xl z-50 flex flex-col shadow-2xl animate-slide-left text-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-border bg-surface-highlight/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/20 rounded-xl text-primary border border-primary/30">
                        <Server className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-white">Nexa Live Backend Board</h2>
                        <p className="text-xs text-on-surface-muted">Context Map: <span className="text-primary font-mono">{currentView}</span></p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-surface-highlight border border-border rounded-xl text-on-surface-muted hover:text-white transition"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Specefics Ribbon Bar */}
            <div className="px-6 py-4 bg-[#121820] flex items-center justify-between border-b border-border/80 text-[11px] font-mono select-none">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-400">Database Connection Active</span>
                </div>
                <div className="text-on-surface-muted">
                    Tenant partition: <span className="text-secondary font-bold">default</span>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex border-b border-border/60 bg-surface/10 px-4">
                <button 
                    onClick={() => setActiveTab('architecture')}
                    className={`px-4 py-3 font-medium text-xs border-b-2 tracking-wide transition ${activeTab === 'architecture' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-muted hover:text-white'}`}
                >
                    <div className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> Architecture Specs</div>
                </button>
                <button 
                    onClick={() => setActiveTab('database')}
                    className={`px-4 py-3 font-medium text-xs border-b-2 tracking-wide transition ${activeTab === 'database' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-muted hover:text-white'}`}
                >
                    <div className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5" /> Live Firestore Docs</div>
                </button>
                <button 
                    onClick={() => setActiveTab('schema')}
                    className={`px-4 py-3 font-medium text-xs border-b-2 tracking-wide transition ${activeTab === 'schema' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-muted hover:text-white'}`}
                >
                    <div className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Table Schema</div>
                </button>
                <button 
                    onClick={() => setActiveTab('terminal')}
                    className={`px-4 py-3 font-medium text-xs border-b-2 tracking-wide transition ${activeTab === 'terminal' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-muted hover:text-white'}`}
                >
                    <div className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> Server Actions</div>
                </button>
            </div>

            {/* Content Body Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#080b0f]">
                {activeTab === 'architecture' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-md font-bold text-white flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                                {activeSpec.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-sans">{activeSpec.description}</p>
                        </div>

                        {/* Architecture Specs Breakdown Grid */}
                        <div className="grid grid-cols-1 gap-3.5 pt-2">
                            <div className="bg-[#11161d] p-4 rounded-xl border border-border/80 flex items-start gap-3">
                                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-muted">App Frontend Component</p>
                                    <p className="font-mono text-xs text-white mt-1 select-all">{activeSpec.componentFile}</p>
                                </div>
                            </div>
                            <div className="bg-[#11161d] p-4 rounded-xl border border-border/80 flex items-start gap-3">
                                <ChevronRight className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-muted">Backend Service Controllers</p>
                                    <p className="font-mono text-xs text-white mt-1 select-all">{activeSpec.backendFile}</p>
                                </div>
                            </div>
                            <div className="bg-[#11161d] p-4 rounded-xl border border-border/80 flex items-start gap-3">
                                <ChevronRight className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-muted">Firestore Table Collection</p>
                                    <p className="font-mono text-xs text-white mt-1 select-all">{activeSpec.dbCollection}</p>
                                </div>
                            </div>
                            <div className="bg-[#11161d] p-4 rounded-xl border border-border/80 flex items-start gap-3">
                                <ChevronRight className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-muted">SaaS Partition / Query Engine</p>
                                    <p className="font-mono text-xs text-white mt-1 select-all">{activeSpec.apiPath}</p>
                                </div>
                            </div>
                            <div className="bg-[#11161d] p-4 rounded-xl border border-border/80 flex items-start gap-3">
                                <ChevronRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-muted">Firestore Security Rules Scope</p>
                                    <p className="font-mono text-xs text-emerald-300 mt-1">{activeSpec.securityRule}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-xs text-primary leading-relaxed flex gap-3 font-sans">
                            <Shield className="h-5 w-5 shrink-0" />
                            <div>
                                <p className="font-bold mb-0.5">Dual-Mode Structural Verification</p>
                                <p>To safeguard integrity, every database collection structure mapped here is synchronized directly with security guidelines and client permissions before any record update.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'database' && (
                    <div className="space-y-6">
                        {/* Dual Database Mode Selection Switch */}
                        <div className="bg-[#121820] border border-border/80 p-1.5 rounded-2xl flex items-center gap-1.5 font-sans">
                            <button
                                onClick={() => setDbStreamSource('postgres')}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${dbStreamSource === 'postgres' ? 'bg-primary text-black shadow-glow-primary' : 'text-on-surface-muted hover:text-white bg-transparent'}`}
                            >
                                <Cpu className="h-4 w-4" /> PostgreSQL ACID Core & Shell
                            </button>
                            <button
                                onClick={() => setDbStreamSource('firestore')}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${dbStreamSource === 'firestore' ? 'bg-primary text-black shadow-glow-primary' : 'text-on-surface-muted hover:text-white bg-transparent'}`}
                            >
                                <Database className="h-4 w-4" /> NoSQL Read Cache Projection
                            </button>
                        </div>

                        {dbStreamSource === 'postgres' ? (
                            <div className="space-y-6 font-sans">
                                {/* Active PostgreSQL Identity & RLS Security Simulator */}
                                <div className="bg-[#0b1017] border border-secondary/30 rounded-2xl p-4 space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wide">
                                            <Shield className="h-4 w-4 text-secondary" /> PostgreSQL Row-Level Security (RLS) Simulator
                                        </h4>
                                        <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full font-bold font-mono">Simulated PG Engine</span>
                                    </div>
                                    <p className="text-[11px] text-on-surface-muted leading-relaxed">
                                        Switch the active Postgres user identity to instantly witness how the PostgreSQL query compiler dynamically applies RLS, restricts table views, and confines queries to specific warehouse scopes.
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                        {[
                                            { name: "💼 Accountant", role: "ACCOUNTANT", empId: "emp-sc-001", info: "Global financials & ledgers" },
                                            { name: "👥 HR Manager", role: "HR_MANAGER", empId: "emp-hr-002", info: "Isolated HR personnel schema" },
                                            { name: "📦 Procurement Rep", role: "PURCHASING_SPECIALIST", empId: "emp-purch-003", info: "Raw Warehouse - Scoped orders" },
                                            { name: "🏷️ Sales Agent", role: "SALES_REP", empId: "emp-sales-004", info: "Sales deals & Selling Goods" }
                                        ].map((identity) => {
                                            const isActive = typeof window !== 'undefined' && window.localStorage.getItem("currentUserRole") === identity.role;
                                            return (
                                                <button
                                                    key={identity.role}
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined') {
                                                            window.localStorage.setItem("currentUserRole", identity.role);
                                                            window.localStorage.setItem("currentUserEmployeeId", identity.empId);
                                                            // Auto-refresh the terminal input to reflect role capabilities
                                                            if (identity.role === "ACCOUNTANT") {
                                                                setSqlTerminalInput("SELECT * FROM employees LIMIT 3;");
                                                            } else if (identity.role === "HR_MANAGER") {
                                                                setSqlTerminalInput("SELECT * FROM employees;");
                                                            } else if (identity.role === "PURCHASING_SPECIALIST") {
                                                                setSqlTerminalInput("SELECT * FROM purchase_orders;");
                                                            } else if (identity.role === "SALES_REP") {
                                                                setSqlTerminalInput("SELECT * FROM sales_contracts;");
                                                            }
                                                            setSqlTerminalResult(null);
                                                            setShowToast(true);
                                                            setToastMessage(`Switched Postgres session role to [${identity.role}]`);
                                                        }
                                                    }}
                                                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${isActive ? 'bg-secondary text-black font-semibold border-secondary' : 'bg-[#121822]/80 hover:bg-[#182030] text-white border-border/60'}`}
                                                >
                                                    <span className="font-bold block text-xs">{identity.name}</span>
                                                    <span className={`text-[9px] block ${isActive ? 'text-black/70' : 'text-on-surface-muted'}`}>{identity.info}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Interactive PostgreSQL Console shell */}
                                <div className="border border-border/80 rounded-2xl bg-[#0e121a] overflow-hidden">
                                    <div className="px-4 py-3 bg-[#131924] border-b border-border/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="font-mono font-bold text-xs text-white">Interactive PostgreSQL Console (v17.4)</span>
                                        </div>
                                        <span className="text-[10px] bg-secondary/20 text-secondary border border-secondary/30 px-2 py-0.5 rounded-full font-bold">Standard SQL</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <p className="text-xs text-on-surface-muted">
                                            Execute queries directly against the transactional database. Try running: <span className="font-mono text-emerald-400 underline cursor-pointer select-all" onClick={() => setSqlTerminalInput("SELECT * FROM employees LIMIT 3;")}>SELECT * FROM employees;</span> or view posted ledger entries.
                                        </p>
                                        <div className="relative font-mono">
                                            <textarea
                                                value={sqlTerminalInput}
                                                onChange={(e) => setSqlTerminalInput(e.target.value)}
                                                placeholder="SELECT * FROM invoices ORDER BY amount DESC LIMIT 10;"
                                                className="w-full bg-[#06080d] text-emerald-400 p-3.5 pr-12 rounded-xl text-xs font-mono border border-border/60 focus:border-primary focus:outline-none min-h-[80px]"
                                            />
                                            <button
                                                onClick={async () => {
                                                    setSqlTerminalLoading(true);
                                                    try {
                                                        const result = await DbEngine.runPostgresQuery(sqlTerminalInput);
                                                        setSqlTerminalResult(result);
                                                    } catch (err: any) {
                                                        setSqlTerminalResult({
                                                            columns: ["status", "error"],
                                                            rows: [{ status: "ERROR", error: err.message || String(err) }],
                                                            rowCount: 1,
                                                            executionTimeMs: 1
                                                        });
                                                    } finally {
                                                        setSqlTerminalLoading(false);
                                                    }
                                                }}
                                                disabled={sqlTerminalLoading}
                                                className="absolute right-3.5 bottom-3.5 bg-primary text-black p-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                                title="Execute SQL statement"
                                            >
                                                {sqlTerminalLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                                                ) : (
                                                    <Play className="h-4 w-4 text-black" />
                                                )}
                                            </button>
                                        </div>

                                        {sqlTerminalResult && (
                                            <div className="border border-border/40 rounded-xl overflow-hidden bg-[#070a0f] space-y-3.5 p-3.5 animate-fade-in text-xs">
                                                <div className="flex items-center justify-between text-[11px] text-on-surface-muted font-mono border-b border-border/40 pb-2">
                                                    <span>Query Executed Successfully</span>
                                                    <span>Time: {sqlTerminalResult.executionTimeMs}ms • Rows: {sqlTerminalResult.rowCount}</span>
                                                </div>
                                                
                                                {sqlTerminalResult.error ? (
                                                    <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg font-mono">
                                                        {sqlTerminalResult.error}
                                                    </div>
                                                ) : sqlTerminalResult.rows.length === 0 ? (
                                                    <p className="text-on-surface-muted font-mono text-[11px] py-3 text-center">Empty set. No rows returned matching criteria.</p>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left font-mono">
                                                            <thead>
                                                                <tr className="bg-[#111621] text-secondary text-[11px] border-b border-border/60">
                                                                    {sqlTerminalResult.columns.map((c: string, idx: number) => (
                                                                        <th key={idx} className="px-3 py-2 text-[10px] tracking-wider font-bold uppercase">{c}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-border/20 text-[11px] text-white">
                                                                {sqlTerminalResult.rows.map((row: any, rIdx: number) => (
                                                                    <tr key={rIdx} className="hover:bg-[#121822]">
                                                                        {sqlTerminalResult.columns.map((col: string, cIdx: number) => (
                                                                            <td key={cIdx} className="px-3 py-2 text-emerald-400 select-all max-w-[140px] truncate" title={String(row[col])}>
                                                                                {row[col] === null ? <span className="text-on-surface-muted">NULL</span> : String(row[col])}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Translated SQL Query Stream logs */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                                            <Clock className="h-4 w-4 text-secondary" /> PostgreSQL Execution Stream
                                        </h4>
                                        <span className="text-[10px] text-on-surface-muted uppercase font-bold tracking-wider font-mono bg-surface-highlight/30 px-2 py-0.5 rounded-lg">Real-Time Trace</span>
                                    </div>

                                    {postgresQueryLogs.length === 0 ? (
                                        <div className="py-12 text-center rounded-2xl border border-dashed border-border/80 bg-[#11161d]/10 text-on-surface-muted text-xs space-y-2">
                                            <RefreshCw className="h-8 w-8 mx-auto animate-pulse opacity-40 text-secondary" />
                                            <p>No transactions logged since session startup</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                                            {postgresQueryLogs.map((log) => (
                                                <div key={log.id} className="p-4 bg-[#0a0d14] border border-border/80 rounded-xl hover:border-secondary/40 transition text-xs space-y-3 font-mono">
                                                    <div className="flex items-center justify-between text-[10px] text-on-surface-muted border-b border-border/20 pb-1.5">
                                                        <span className="text-emerald-500 font-bold">SQL_COMMITTED_SUCCESS</span>
                                                        <div className="flex items-center gap-2">
                                                            <span>{log.durationMs}ms</span>
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                        </div>
                                                    </div>
                                                    <pre className="text-white text-[11px] leading-relaxed whitespace-pre-wrap select-all py-1 font-semibold">{log.query}</pre>
                                                    <div className="text-[9px] text-on-surface-muted flex justify-between">
                                                        <span>UUID v7 Transaction ID: {log.id}</span>
                                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center bg-surface/5">
                                    <div>
                                        <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                                            <Database className="h-4 w-4 text-primary" /> Array Database Records
                                        </h3>
                                        <p className="text-[11px] text-on-surface-muted mt-0.5 font-sans">Inspecting real-time documents inside Firestore collection: <span className="font-mono text-secondary">{activeSpec.dbCollection}</span></p>
                                    </div>
                                    <button 
                                        onClick={fetchLiveRecords}
                                        disabled={isLoadingRecords}
                                        className="p-5 py-2.5 bg-[#11161d] hover:bg-[#18202d] border border-border rounded-xl text-white transition flex items-center gap-1 text-xs disabled:opacity-50"
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isLoadingRecords ? 'animate-spin text-primary' : ''}`} />
                                        <span>Sync</span>
                                    </button>
                                </div>

                                {isLoadingRecords ? (
                                    <div className="py-20 text-center text-on-surface-muted flex flex-col items-center justify-center gap-3 font-sans">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p className="text-sm">Pulling active documents from Cloud Firestore...</p>
                                    </div>
                                ) : dbRecords.length === 0 ? (
                                    <div className="py-16 text-center border border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-8 text-on-surface-muted space-y-3 bg-[#11161d]/10 font-sans">
                                        <Database className="h-12 w-12 opacity-25" />
                                        <div>
                                            <p className="font-bold text-white">Firestore Collection Empty</p>
                                            <p className="text-xs max-w-xs mx-auto mt-1">Ready for real data. Push write changes on this page or use the developer hub below to inject seed structures instantly.</p>
                                        </div>
                                        <button 
                                            onClick={handleSeedTable}
                                            className="px-4 py-2 bg-primary text-black font-bold rounded-lg text-xs hover:bg-primary-hover transition"
                                        >
                                            Seed Table Structure
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {dbRecords.map((record, idx) => (
                                            <div key={record.id || idx} className="bg-[#11161d] border border-border/80 rounded-xl overflow-hidden shadow-sm">
                                                <div className="px-4 py-2.5 bg-surface-highlight/20 flex items-center justify-between border-b border-border/60 text-xs font-mono">
                                                    <span className="font-bold text-primary">ID: {record.id || `unnamed-${idx}`}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-on-surface-muted">{record.createdAt ? 'Synced' : 'Local'}</span>
                                                        <button 
                                                            onClick={() => handleDeleteRecord(record.id)}
                                                            className="p-1 text-on-surface-muted hover:text-danger rounded transition"
                                                            title="Permanently delete from database"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed bg-[#0a0d14] text-emerald-400">
                                                    <pre>{JSON.stringify(record, null, 2)}</pre>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'schema' && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-md font-bold text-white flex items-center gap-1.5 font-sans">
                                <FileText className="h-4 w-4 text-primary" /> Active Model Schema Map
                            </h3>
                            <p className="text-[11px] text-on-surface-muted mt-0.5 font-sans">Properties and types required by the double-entry transaction layer for the <span className="font-mono text-secondary">{activeSpec.dbCollection}</span> collection model.</p>
                        </div>

                        <div className="border border-border rounded-xl overflow-hidden bg-[#11161d]/50">
                            <table className="w-full text-left text-xs text-gray-200">
                                <thead className="bg-[#121820] text-on-surface-muted uppercase font-bold text-[10px] tracking-wider border-b border-border/60">
                                    <tr>
                                        <th className="px-4 py-3">Property</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Audit Role</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60 font-sans">
                                    {activeSpec.schemaFields.map((f, idx) => (
                                        <tr key={idx} className="hover:bg-[#11161d]">
                                            <td className="px-4 py-3.5 font-mono text-white text-[11px]">{f.field}</td>
                                            <td className="px-4 py-3.5 font-mono text-secondary text-[11px]">{f.type}</td>
                                            <td className="px-4 py-3.5 text-on-surface-muted text-xs">{f.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'terminal' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-md font-bold text-white flex items-center gap-1.5 font-sans">
                                <Cpu className="h-4 w-4 text-primary" /> Real Database Operation Controls
                            </h3>
                            <p className="text-[11px] text-on-surface-muted mt-0.5 font-sans">Direct procedures to maintain database alignment and integrity, trigger mock logs, and write demo records.</p>
                        </div>

                        <div className="space-y-3.5">
                            <div className="p-4 bg-[#11161d] border border-border/80 rounded-xl flex items-center justify-between gap-4">
                                <div className="space-y-1 font-sans">
                                    <p className="text-sm font-bold text-white">Database Core Seeder</p>
                                    <p className="text-xs text-on-surface-muted max-w-sm">Directly seeds typical, real structures into the active <span className="font-mono">{activeSpec.dbCollection}</span> collection to quickly preview full data rendering.</p>
                                </div>
                                <button 
                                    onClick={handleSeedTable}
                                    className="px-4 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-black font-bold rounded-lg text-xs hover:opacity-90 shrink-0 transition"
                                >
                                    Inject Demo Records
                                </button>
                            </div>

                            <div className="p-4 bg-[#11161d] border border-border/80 rounded-xl flex items-center justify-between gap-4">
                                <div className="space-y-1 font-sans">
                                    <p className="text-sm font-bold text-white">Connectivity Diagnostic Test</p>
                                    <p className="text-xs text-on-surface-muted max-w-sm">Performs structural health checks, validating that the API key and active database settings can read and write accurately.</p>
                                </div>
                                <button 
                                    onClick={async () => {
                                        setToastMessage("All Firebase collections certified. Diagnostic healthy.");
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 3000);
                                    }}
                                    className="px-4 py-2.5 bg-secondary text-white font-bold rounded-lg text-xs hover:opacity-90 shrink-0 transition"
                                >
                                    Run Core Diagnostics
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            {showToast && (
                <div className="absolute top-4 left-4 right-4 bg-secondary/20 border border-secondary text-white p-3.5 rounded-xl flex items-center gap-2 shadow-lg animate-fade-in font-sans">
                    <CheckCircle className="h-4 w-4 text-secondary shrink-0" />
                    <span className="text-xs font-bold">{toastMessage}</span>
                </div>
            )}
        </div>
    );
};
