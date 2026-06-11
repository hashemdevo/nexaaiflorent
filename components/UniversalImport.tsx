
import React, { useState, useRef } from 'react';
import { 
  Database, ArrowLeft, Upload, CloudCog, ArrowLeftRight, CheckCircle2, Settings, RefreshCw, FileText, Cpu 
} from 'lucide-react';
import { UniversalImportProps } from '../types';
import { ImportUploader } from './tools/import/ImportUploader';
import { ImportMapper } from './tools/import/ImportMapper';
import { ImportPreview } from './tools/import/ImportPreview';

interface MappingField {
  id: string;
  sourceField: string;
  sampleData: string;
  targetField: string;
  status: 'matched' | 'unmatched' | 'ignored';
  confidence: number;
}

export const UniversalImport: React.FC<UniversalImportProps> = ({ onBack, readOnly }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'mapping' | 'preview' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedSystem, setDetectedSystem] = useState<{ name: string, type: string, engine: string } | null>(null);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);
  const [mappings, setMappings] = useState<MappingField[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [engineVersion, setEngineVersion] = useState('4.2.0');
  const [engineStatus, setEngineStatus] = useState<'idle' | 'checking' | 'updating' | 'ready'>('idle');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      startAnalysis(file);
    }
  };

  const startAnalysis = (file: File) => {
    setStep('analyzing');
    setAnalysisLog([]);
    setEngineStatus('checking');
    
    const logs = [`Initiating Pre-Import Safety Check...`, `Connecting to Nexa Cloud Registry...`];

    setTimeout(() => {
        setEngineStatus('updating');
        setAnalysisLog(prev => [...prev, `New Schema Definitions Found. Downloading v4.2.1...`]);
        setTimeout(() => {
            setEngineVersion('4.2.1');
            setEngineStatus('ready');
            setAnalysisLog(prev => [...prev, `Engine Updated to v4.2.1 successfully.`, `Integrity Check Passed.`]);
            continueFileAnalysis(file);
        }, 1500);
    }, 1500);

    let delay = 0;
    logs.forEach((log) => {
        delay += 600;
        setTimeout(() => setAnalysisLog(prev => [...prev, log]), delay);
    });
  };

  const continueFileAnalysis = (file: File) => {
    const logs: string[] = [];
    logs.push(`Reading Header Signature: ${file.name.split('.').pop()?.toUpperCase()}`);
    let detected = { name: 'Unknown', type: 'Generic', engine: 'Parser' };
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'bak') detected = { name: 'SAP Business One / Custom ERP', type: 'SQL Server', engine: 'MSSQL' };
    else if (ext === 'tar') detected = { name: 'Odoo / ERPNext', type: 'PostgreSQL Dump', engine: 'Postgres' };
    else if (ext === 'qbb') detected = { name: 'QuickBooks Desktop', type: 'Proprietary', engine: 'Intuit SDK' };
    else if (ext === 'db' || ext === 'sqlite') detected = { name: 'Mobile/Light ERP', type: 'SQLite', engine: 'SQLite' };
    else detected = { name: 'Cloud Export (Zoho/Xero)', type: 'Flat File', engine: 'Generic Parser' };

    setDetectedSystem(detected);
    logs.push(`Detected ${detected.name}. Loading Schema...`);

    let delay = 0;
    logs.forEach((log, index) => {
        delay += 800;
        setTimeout(() => {
            setAnalysisLog(prev => [...prev, log]);
            if (index === logs.length - 1) setTimeout(() => generateMockMappings(detected), 1000);
        }, delay);
    });
  };

  const generateMockMappings = (system: any) => {
    const mockMappings: MappingField[] = [
        { id: 'm1', sourceField: 'CardCode', sampleData: 'C20000', targetField: 'Customer ID', status: 'matched', confidence: 0.98 },
        { id: 'm2', sourceField: 'CardName', sampleData: 'Alpha Logistics', targetField: 'Customer Name', status: 'matched', confidence: 0.99 },
        { id: 'm3', sourceField: 'DocTotal', sampleData: '1450.00', targetField: 'Transaction Amount', status: 'matched', confidence: 0.95 },
        { id: 'm4', sourceField: 'DocDate', sampleData: '2023-10-01', targetField: 'Date', status: 'matched', confidence: 0.97 },
        { id: 'm5', sourceField: 'U_CustomField', sampleData: 'Region_East', targetField: 'Tags', status: 'unmatched', confidence: 0.4 },
    ];
    if (system.engine === 'Postgres') {
        mockMappings[0] = { id: 'm1', sourceField: 'partner_id', sampleData: '4201', targetField: 'Customer ID', status: 'matched', confidence: 0.92 };
        mockMappings[1] = { id: 'm2', sourceField: 'display_name', sampleData: 'Acme Corp', targetField: 'Customer Name', status: 'matched', confidence: 0.95 };
    }
    setMappings(mockMappings);
    setStep('mapping');
    setEngineStatus('idle');
  };

  const handleImport = () => {
    if (readOnly) return;
    setStep('preview');
    let p = 0;
    const interval = setInterval(() => {
        p += Math.random() * 10;
        if (p >= 100) {
            p = 100;
            clearInterval(interval);
            setTimeout(() => setStep('success'), 1000);
        }
        setImportProgress(p);
    }, 300);
  };

  const updateMapping = (id: string, newTarget: string) => {
    if (readOnly) return;
    setMappings(mappings.map(m => m.id === id ? { ...m, targetField: newTarget, status: 'matched' } : m));
  };

  return (
    <div className="p-6 animate-fade-in max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {onBack && <button onClick={onBack} className="p-2 rounded-xl bg-surface hover:bg-surface-highlight border border-border text-on-surface transition"><ArrowLeft className="h-6 w-6" /></button>}
          <div>
            <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                <Database className="h-8 w-8 text-secondary" /> Universal Import Engine
            </h1>
            <p className="text-on-surface-muted mt-1">Restore data from any ERP backup (SAP, Odoo, QuickBooks, etc.)</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 text-xs font-mono border px-3 py-2 rounded-lg transition-all duration-500 ${engineStatus === 'updating' || engineStatus === 'checking' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-on-surface-muted'}`}>
           {engineStatus === 'checking' || engineStatus === 'updating' ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Settings className="h-3 w-3" />}
           <div className="flex flex-col"><span className="font-bold uppercase leading-none">{engineStatus === 'updating' ? 'Updating Engine...' : engineStatus === 'checking' ? 'Checking Registry...' : 'Adapter Engine'}</span><span className="leading-none mt-1">v{engineVersion} (SQL/NoSQL Universal)</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-border">
                <h3 className="font-bold text-on-surface mb-6 uppercase text-xs tracking-wider">Process Status</h3>
                <div className="space-y-6 relative">
                     <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border/50"></div>
                     {[
                        { id: 'upload', label: 'Upload & Detect', icon: Upload },
                        { id: 'analyzing', label: 'Engine Update & Restore', icon: CloudCog },
                        { id: 'mapping', label: 'Schema Mapping', icon: ArrowLeftRight },
                        { id: 'preview', label: 'Validation & Import', icon: Database },
                     ].map((s, idx) => {
                        const isActive = step === s.id;
                        const isPast = ['upload', 'analyzing', 'mapping', 'preview', 'success'].indexOf(step) > idx;
                        return (
                             <div key={s.id} className="relative flex items-center gap-4">
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${isActive ? 'bg-primary scale-110 shadow-glow-primary' : isPast ? 'bg-secondary' : 'bg-surface border border-border'}`}>
                                     {isPast ? <CheckCircle2 className="h-3 w-3 text-white" /> : <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-black' : 'bg-on-surface-muted'}`}></div>}
                                 </div>
                                 <div>
                                     <span className={`text-sm font-bold transition-colors ${isActive ? 'text-primary' : isPast ? 'text-on-surface' : 'text-on-surface-muted'}`}>{s.label}</span>
                                     {isActive && step === 'analyzing' && <span className="block text-[10px] text-primary animate-pulse">Syncing Definitions...</span>}
                                 </div>
                             </div>
                        );
                     })}
                </div>
            </div>
            {selectedFile && (
                <div className="glass-panel p-6 rounded-2xl border border-border animate-fade-in">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-surface-highlight rounded-xl"><FileText className="h-6 w-6 text-on-surface" /></div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-on-surface truncate">{selectedFile.name}</h4>
                            <p className="text-xs text-on-surface-muted mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            {detectedSystem && <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold text-primary uppercase"><Cpu className="h-3 w-3" /> {detectedSystem.name}</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="lg:col-span-2">
            {(step === 'upload' || step === 'analyzing') && <ImportUploader onFileSelect={handleFileSelect} fileInputRef={fileInputRef} readOnly={readOnly} engineStatus={engineStatus} engineVersion={engineVersion} analysisLog={analysisLog} step={step} />}
            {step === 'mapping' && <ImportMapper mappings={mappings} onUpdateMapping={updateMapping} onImport={handleImport} readOnly={readOnly} />}
            {(step === 'preview' || step === 'success') && <ImportPreview step={step} importProgress={importProgress} detectedSystemName={detectedSystem?.name} onReset={() => setStep('upload')} />}
        </div>
      </div>
    </div>
  );
};
