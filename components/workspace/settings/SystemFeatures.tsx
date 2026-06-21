
import React from 'react';
import { Store, Monitor, Power, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../../contexts/AppContext';

export const SystemFeatures: React.FC = () => {
    const { isPosEnabled, setPosEnabled } = useApp();

    return (
        <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" /> System Modules & Features
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
                {/* POS Toggle Card */}
                <div className={`p-6 rounded-2xl border transition-all duration-300 ${isPosEnabled ? 'bg-surface border-primary/30 shadow-glow-primary' : 'bg-surface border-border opacity-80'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl transition-colors ${isPosEnabled ? 'bg-primary text-black' : 'bg-surface-highlight text-on-surface-muted'}`}>
                                <Store className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-on-surface">Point of Sale (POS) System</h4>
                                <p className="text-sm text-on-surface-muted mt-1 max-w-md">
                                    Enable the full retail terminal interface and cashier management. 
                                    <span className="block mt-1 text-xs opacity-70">
                                        {isPosEnabled ? "Currently visible in the main sidebar." : "Hidden from the main sidebar."}
                                    </span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className={`text-right hidden sm:block`}>
                                <span className={`text-xs font-bold uppercase tracking-wider block ${isPosEnabled ? 'text-primary' : 'text-on-surface-muted'}`}>
                                    {isPosEnabled ? 'Active' : 'Disabled'}
                                </span>
                                <span className="text-[10px] text-on-surface-muted">
                                    {isPosEnabled ? 'Module Loaded' : 'Module Suspended'}
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => setPosEnabled(!isPosEnabled)}
                                className={`w-16 h-9 rounded-full relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary ${isPosEnabled ? 'bg-primary' : 'bg-surface-highlight border border-border'}`}
                            >
                                <div className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${isPosEnabled ? 'translate-x-8 left-0' : 'translate-x-1 left-0'}`}>
                                    {isPosEnabled ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-on-surface-muted" />}
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    {isPosEnabled && (
                        <div className="mt-4 pt-4 border-t border-border flex gap-2 animate-fade-in">
                            <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded border border-primary/20 flex items-center gap-1 font-medium">
                                <Power className="h-3 w-3" /> Retail Terminal Running
                            </div>
                        </div>
                    )}
                </div>

                {/* Placeholder for future modules */}
                <div className="p-6 rounded-2xl border border-border bg-surface/50 opacity-60 relative overflow-hidden group hover:opacity-80 transition-opacity">
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <span className="bg-surface border border-border px-3 py-1 rounded-full text-xs font-bold text-on-surface-muted shadow-sm">Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-surface-highlight text-on-surface-muted">
                                <Monitor className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-on-surface">Warehouse Kiosk</h4>
                                <p className="text-sm text-on-surface-muted mt-1">
                                    Dedicated interface for inventory scanning and barcode management.
                                </p>
                            </div>
                        </div>
                        <div className="w-14 h-8 rounded-full bg-surface-highlight border border-border relative">
                            <div className="absolute top-1 left-1 w-6 h-6 bg-on-surface-muted/20 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
