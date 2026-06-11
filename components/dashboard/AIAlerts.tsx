import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export const AIAlerts: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-primary/10 text-primary shadow-glow-primary">
            <Sparkles className="h-6 w-6 animate-pulse-slow" />
        </div>
        <div>
            <h3 className="font-bold text-on-surface">AI Alerts</h3>
            <div className="flex items-center gap-2 text-sm text-on-surface-muted mt-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Analyzing for insights...
            </div>
        </div>
      </div>
      <button className="px-4 py-2 text-xs font-bold bg-surface border border-border rounded-lg text-on-surface hover:bg-surface-highlight transition">
        View History
      </button>
    </div>
  );
};
