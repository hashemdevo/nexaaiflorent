
import React from 'react';
import { ArrowLeftRight, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MappingField {
  id: string;
  sourceField: string;
  sampleData: string;
  targetField: string;
  status: 'matched' | 'unmatched' | 'ignored';
  confidence: number;
}

interface ImportMapperProps {
    mappings: MappingField[];
    onUpdateMapping: (id: string, value: string) => void;
    onImport: () => void;
    readOnly?: boolean;
}

export const ImportMapper: React.FC<ImportMapperProps> = ({ mappings, onUpdateMapping, onImport, readOnly }) => {
    return (
        <div className="glass-panel p-0 rounded-3xl border border-border overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-border flex justify-between items-center bg-surface-highlight/10">
                <div>
                    <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                        <ArrowLeftRight className="h-5 w-5 text-primary" /> Data Mapping
                    </h2>
                    <p className="text-sm text-on-surface-muted">AI Auto-Map confidence: <span className="text-secondary font-bold">94%</span></p>
                </div>
                <button 
                    onClick={onImport}
                    disabled={readOnly}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-glow-primary hover:bg-primary-hover transition flex items-center gap-2 disabled:opacity-50"
                >
                    Proceed <ArrowRight className="h-4 w-4" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight text-on-surface-muted uppercase text-xs font-bold">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Source Field</th>
                            <th className="px-4 py-3">Sample Data</th>
                            <th className="px-4 py-3"><ArrowRight className="h-4 w-4 mx-auto text-on-surface-muted/50" /></th>
                            <th className="px-4 py-3">Target Field (Nexa)</th>
                            <th className="px-4 py-3 rounded-tr-lg text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {mappings.map(m => (
                            <tr key={m.id} className="hover:bg-surface-highlight/20 transition group">
                                <td className="px-4 py-3 font-mono text-on-surface">{m.sourceField}</td>
                                <td className="px-4 py-3 text-on-surface-muted italic truncate max-w-[150px]">{m.sampleData}</td>
                                <td className="px-4 py-3 text-center text-on-surface-muted">→</td>
                                <td className="px-4 py-3">
                                    <select 
                                        value={m.targetField}
                                        onChange={(e) => onUpdateMapping(m.id, e.target.value)}
                                        disabled={readOnly}
                                        className={`w-full bg-background border rounded-lg px-3 py-1.5 outline-none focus:border-primary transition ${m.status === 'unmatched' ? 'border-warning text-warning' : 'border-border text-on-surface'}`}
                                    >
                                        <option>Customer ID</option>
                                        <option>Customer Name</option>
                                        <option>Transaction Amount</option>
                                        <option>Date</option>
                                        <option>Tags</option>
                                        <option>Ignore Field</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {m.status === 'matched' ? (
                                        <span className="text-xs font-bold text-secondary flex items-center justify-end gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> {(m.confidence * 100).toFixed(0)}%
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-warning flex items-center justify-end gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Review
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
