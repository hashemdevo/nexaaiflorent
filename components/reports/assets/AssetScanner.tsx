
import React from 'react';
import { Upload, FileText, Trash2, Loader2, Scan, Check, Calculator } from 'lucide-react';

interface AssetScannerProps {
    fileInputRef: React.RefObject<HTMLInputElement>;
    selectedFile: { name: string, type: string, data: string } | null;
    isScanning: boolean;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onScan: () => void;
    onClearFile: () => void;
}

export const AssetScanner: React.FC<AssetScannerProps> = ({ 
    fileInputRef, selectedFile, isScanning, onFileSelect, onScan, onClearFile 
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full min-h-[500px]">
            {/* Left: Upload */}
            <div className="p-8 border-r border-border flex flex-col justify-center">
                {!selectedFile ? (
                    <div 
                        className="border-2 border-dashed border-border bg-surface hover:bg-surface-highlight hover:border-primary/50 rounded-3xl flex flex-col items-center justify-center p-12 text-center transition-all cursor-pointer min-h-[300px]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*,application/pdf,application/msword" 
                            onChange={onFileSelect} 
                        />
                        <div className="bg-surface-highlight p-4 rounded-full mb-4 text-on-surface-muted shadow-inner">
                            <Upload className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-on-surface">Upload Asset Invoice</h3>
                        <p className="text-on-surface-muted text-sm mt-2 max-w-xs">
                            Upload receipt or invoice to extract asset details automatically.
                        </p>
                    </div>
                ) : (
                    <div className="relative w-full h-64 bg-surface-highlight/20 rounded-xl border border-border overflow-hidden group mb-6">
                        {selectedFile.type.startsWith('image/') ? (
                            <img src={selectedFile.data} alt="Preview" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <FileText className="h-16 w-16 text-primary mb-2" />
                                <span className="font-bold text-on-surface">{selectedFile.name}</span>
                            </div>
                        )}
                        <button 
                            onClick={(e) => { e.stopPropagation(); onClearFile(); }}
                            className="absolute top-2 right-2 bg-danger text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <button 
                    onClick={onScan}
                    disabled={!selectedFile || isScanning}
                    className="w-full py-4 mt-4 bg-gradient-to-r from-secondary to-emerald-600 text-white font-bold rounded-xl shadow-glow-secondary hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isScanning ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</>
                    ) : (
                        <><Scan className="h-5 w-5" /> Re-Analyze Document</>
                    )}
                </button>
            </div>

            {/* Right: Info */}
            <div className="p-8 flex flex-col justify-center space-y-6 bg-surface-highlight/5">
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <Check className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-on-surface">Multi-Item Extraction</h4>
                        <p className="text-sm text-on-surface-muted mt-1">
                            The AI will identify and list all distinct assets found in the invoice for your review.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-on-surface">Depreciation Engine</h4>
                        <p className="text-sm text-on-surface-muted mt-1">
                            Automatically calculates current book value using Straight Line Depreciation standards upon registration.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
