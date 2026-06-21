
import React, { useState } from 'react';
import { Bot, ArrowRight } from 'lucide-react';
import { automateEntrySuggestion } from '../../services/geminiService';

export const AutomationTools: React.FC = () => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAutomate = async () => {
    if (!desc || !amount) return;
    setLoading(true);
    const res = await automateEntrySuggestion(desc, parseFloat(amount));
    if (res) setSuggestion(JSON.parse(res));
    setLoading(false);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto mt-6">
      <div className="glass-panel p-8 rounded-3xl border border-border">
        <h2 className="text-2xl font-bold text-on-surface flex items-center gap-3 mb-8">
          <div className="bg-primary/20 p-2 rounded-xl text-primary"><Bot className="h-6 w-6" /></div>
          Smart Entry Automation
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-muted uppercase tracking-wider">Transaction Description</label>
              <input 
                type="text" 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="e.g., Purchase of 5 laptops for dev team"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-muted focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-muted uppercase tracking-wider">Amount</label>
              <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-muted">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface border border-border rounded-xl pl-8 pr-4 py-3 text-on-surface placeholder-on-surface-muted focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition font-mono"
                  />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleAutomate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-hover text-white font-bold py-3.5 rounded-xl transition hover:shadow-glow-primary flex justify-center items-center gap-2"
          >
            {loading ? 'Processing...' : 'Generate Double Entry Suggestion'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {suggestion && (
          <div className="mt-8 bg-surface-highlight/30 rounded-2xl border border-border p-6 animate-fade-in">
            <h4 className="text-xs font-bold text-on-surface-muted uppercase mb-4 flex items-center gap-2">
                <div className="h-2 w-2 bg-secondary rounded-full animate-pulse"></div> AI Suggested Ledger Entry
            </h4>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-surface p-4 rounded-xl border border-border">
                <div className="text-xs text-on-surface-muted mb-1">Debit Account</div>
                <div className="font-bold text-primary text-lg">{suggestion.debitAccount}</div>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border">
                <div className="text-xs text-on-surface-muted mb-1">Credit Account</div>
                <div className="font-bold text-secondary text-lg">{suggestion.creditAccount}</div>
              </div>
            </div>
            <div className="text-sm text-on-surface bg-primary/5 p-4 rounded-xl border-l-2 border-primary italic">
              "{suggestion.explanation || suggestion.reason}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
