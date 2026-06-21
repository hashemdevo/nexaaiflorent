
import React, { useState, useEffect } from 'react';
import { Target, RefreshCw, Loader2, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BudgetService } from '../../services/budgeting';

interface CostCenterBudget {
  id: string;
  name: string;
  code: string;
  budget: number;
  actual: number;
  variance: number;
  percent: number;
}

export const CostControl: React.FC = () => {
  const [costCenters, setCostCenters] = useState<CostCenterBudget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCostCenterData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 2026 is the current active year from the workspace context
      const data = await BudgetService.getCostCenterBudgets(2026);
      setCostCenters(data);
    } catch (err: any) {
      console.error('Error fetching cost center budgets:', err);
      setError('Failed to query real-time budget data from the Budgets service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCostCenterData();
  }, []);

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Cost Control & Centers</h2>
          <p className="text-xs text-on-surface-muted mt-1 uppercase tracking-wider">
            Real-time financial budget allocation vs actual double-entry debit totals
          </p>
        </div>
        <button
          onClick={fetchCostCenterData}
          disabled={isLoading}
          className="px-4 py-2 bg-surface border border-border text-on-surface-muted hover:text-white rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-surface-highlight transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Fetching Audit Trail...' : 'Refresh Ledger Data'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-surface/30 border border-border/50 rounded-2xl">
          <Loader2 className="h-8 w-8 text-secondary animate-spin" />
          <span className="text-xs text-on-surface-muted font-medium uppercase tracking-wider">
            Aggregating G/L Account Balances...
          </span>
        </div>
      ) : error ? (
        <div className="p-6 bg-danger/10 border border-danger/30 rounded-2xl text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-danger mx-auto" />
          <p className="text-sm font-bold text-danger">{error}</p>
          <button
            onClick={fetchCostCenterData}
            className="px-4 py-2 bg-danger/20 hover:bg-danger text-white rounded-xl text-xs font-medium transition"
          >
            Retry Fetching
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {costCenters.map((cc) => {
            const isOverrun = cc.variance < 0;
            const progressWidth = Math.min(cc.percent, 100);

            return (
              <div 
                key={cc.id} 
                className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition duration-300 flex flex-col justify-between min-h-[260px]"
              >
                {/* Visual indicator bar */}
                <div 
                  className={`absolute top-0 left-0 w-full h-1 ${
                    isOverrun 
                      ? 'bg-danger shadow-[0_0_15px_rgba(236,72,153,0.6)]' 
                      : 'bg-secondary shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                  }`}
                ></div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-on-surface tracking-tight leading-snug">
                        {cc.name}
                      </h3>
                      <p className="text-[10px] text-on-surface-muted font-mono mt-1 uppercase tracking-wider">
                        Code: {cc.code} ⏐ ID: {cc.id}
                      </p>
                    </div>
                    <div className={`p-2 rounded-xl transition ${
                      isOverrun 
                        ? 'bg-danger/10 text-danger' 
                        : 'bg-secondary/10 text-secondary'
                    }`}>
                      <Target className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {/* Warning banner for overruns */}
                  {isOverrun && (
                    <div className="mb-4 px-3 py-1.5 bg-danger/5 border border-danger/15 rounded-xl flex items-center gap-1.5 text-danger animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        Budget Overrun Detected
                      </span>
                    </div>
                  )}

                  <div className="space-y-3.5 mt-2">
                    <div className="flex justify-between text-xs items-end">
                      <span className="text-on-surface-muted text-[11px] uppercase font-bold tracking-wider">
                        Budget Utilization
                      </span>
                      <span className={`font-mono font-bold text-xs ${
                        isOverrun ? 'text-danger' : 'text-secondary'
                      }`}>
                        {cc.percent}%
                      </span>
                    </div>

                    <div className="w-full bg-surface-highlight h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          isOverrun 
                            ? 'bg-danger shadow-glow-danger' 
                            : 'bg-secondary shadow-glow-secondary'
                        }`} 
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
                    <div>
                      <span className="text-[10px] text-on-surface-muted block uppercase tracking-wider">
                        Allocated
                      </span>
                      <span className="font-mono text-xs font-bold text-on-surface">
                        ${cc.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-on-surface-muted block uppercase tracking-wider">
                        Actual Debits
                      </span>
                      <span className="font-mono text-xs font-bold text-on-surface">
                        ${cc.actual.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className={`flex justify-between items-center px-2.5 py-1.5 rounded-xl text-[11px] font-semibold tracking-wide ${
                    isOverrun 
                      ? 'bg-danger/5 text-danger border border-danger/10' 
                      : 'bg-secondary/5 text-secondary border border-secondary/10'
                  }`}>
                    <span>{isOverrun ? 'Deficit' : 'Surplus Variance'}</span>
                    <span className="font-mono font-bold">
                      {isOverrun ? '-' : '+'}${Math.abs(cc.variance).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
