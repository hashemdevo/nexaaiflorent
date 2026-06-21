
import React from 'react';
import { Upload, RefreshCw, Cpu, CloudCog, DownloadCloud, Loader2 } from 'lucide-react';

interface ImportUploaderProps {
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    readOnly?: boolean;
    engineStatus: 'idle' | 'checking' | 'updating' | 'ready';
    engineVersion: string;
    analysisLog: string[];
    step: string;
}

export const ImportUploader: React.FC<ImportUploaderProps> = ({ 
    onFileSelect, fileInputRef, readOnly, engineStatus, engineVersion, analysisLog, step 
}) => {
    if (step === 'analyzing') {
        return (
            <div className="glass-panel p-8 rounded-3xl border border-border h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-4">
                        {engineStatus === 'updating' || engineStatus === 'checking' ? (
                            <DownloadCloud className="h-6 w-6 text-primary animate-bounce" />
                        ) : (
                            <Loader2 className="h-6 w-6 text-secondary animate-spin" />
                        )}
                        <h2 className="text-xl font-bold text-on-surface">
                            {engineStatus === 'updating' ? 'Updating Definitions...' : 'Analysis in Progress'}
                        </h2>
                     </div>
                     <span className="font-mono text-xs text-on-surface-muted bg-surface-highlight px-2 py-1 rounded">
                         v{engineVersion}
                     </span>
                </div>
                <div className="flex-1 bg-black/50 rounded-xl p-4 font-mono text-xs text-green-400 overflow-y-auto border border-border/50 shadow-inner custom-scrollbar space-y-1">
                    {analysisLog.map((log, i) => (
                        <div key={i} className="animate-fade-in opacity-80">
                            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                        </div>
                    ))}
                    <div className="animate-pulse">_</div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="h-[400px] border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center bg-surface hover:bg-surface-highlight/50 transition cursor-pointer group"
            onClick={() => !readOnly && fileInputRef.current?.click()}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".bak,.tar,.db,.sqlite,.qbb,.xml,.json,.csv,.sql" 
                onChange={onFileSelect} 
                disabled={readOnly}
            />
            <div className="w-20 h-20 bg-surface-highlight rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition duration-300">
                <Upload className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">{readOnly ? 'Import Disabled (Read Only)' : 'Drop Backup File Here'}</h2>
            <p className="text-on-surface-muted mt-2 max-w-md text-center">
                Supports .bak (SQL Server), .tar (Odoo), .qbb (QuickBooks), .db (SQLite), and raw data files.
            </p>
            {!readOnly && (
                <div className="mt-8 flex flex-col items-center gap-2">
                     <div className="text-[10px] text-on-surface-muted uppercase tracking-widest">Automated Engine Check</div>
                     <div className="flex gap-2 items-center text-xs font-mono text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        <RefreshCw className="h-3 w-3" /> Auto-Updates Enabled
                     </div>
                </div>
            )}
        </div>
    );
};
