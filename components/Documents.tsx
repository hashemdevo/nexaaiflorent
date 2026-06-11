
import React from 'react';
import { FileText, Upload, Search, MoreHorizontal } from 'lucide-react';
import { DocumentsProps } from '../types';

export const Documents: React.FC<DocumentsProps> = ({ readOnly }) => {
  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Documents</h2>
        <div className="flex gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-muted h-4 w-4" />
                <input 
                    type="text" 
                    placeholder="Search invoices..." 
                    className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-on-surface placeholder-on-surface-muted focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
            </div>
            {!readOnly && (
                <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-glow-primary">
                    <Upload className="h-4 w-4" /> Upload
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface p-4 rounded-xl border border-border shadow-sm hover:bg-surface-highlight transition group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-danger/10 p-2 rounded-lg border border-danger/20">
                        <FileText className="h-6 w-6 text-danger" />
                    </div>
                    {!readOnly && (
                        <button className="text-on-surface-muted hover:text-on-surface">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <h4 className="font-medium text-on-surface truncate">Invoice_INV-{2023000 + i}.pdf</h4>
                <div className="flex justify-between items-center mt-4 text-xs text-on-surface-muted">
                    <span>2.4 MB</span>
                    <span>Oct {10 + i}, 2023</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
