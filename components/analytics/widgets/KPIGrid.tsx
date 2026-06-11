
import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { KPI_DEFINITIONS } from '../config/kpiDefinitions';

interface KPIGridProps {
    activeTab: string;
    selectedKpi: any | null;
    onSelectKpi: (kpi: any) => void;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ activeTab, selectedKpi, onSelectKpi }) => {
    
    const renderKpiCard = (kpi: any) => {
        const diff = kpi.value - kpi.prev;
        const percentChange = ((diff / kpi.prev) * 100).toFixed(1);
        const isPositive = diff >= 0;
        const isSelected = selectedKpi && selectedKpi.id === kpi.id;
        
        const isGood = (kpi.id === 'dso' || kpi.id === 'debt_equity' || kpi.id === 'burn_rate') ? !isPositive : isPositive;

        return (
          <div 
            key={kpi.id}
            onClick={() => onSelectKpi(isSelected ? null : kpi)}
            className={`glass-panel p-4 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 group relative overflow-hidden
                ${isSelected ? 'border-primary shadow-glow-primary ring-1 ring-primary' : 'border-border/50 hover:border-primary/50 hover:-translate-y-1'}
            `}
          >
            {/* Subtle inner glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-2 rounded-xl transition-colors shadow-inner ${isSelected ? 'bg-primary text-white' : 'bg-surface-highlight text-on-surface-muted group-hover:text-primary'}`}>
                <Activity className="h-5 w-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border backdrop-blur-md ${isGood ? 'bg-secondary/10 text-secondary border-secondary/20 shadow-[0_0_10px_-3px_rgba(var(--secondary),0.3)]' : 'bg-danger/10 text-danger border-danger/20 shadow-[0_0_10px_-3px_rgba(var(--danger),0.3)]'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(Number(percentChange))}%
              </div>
            </div>
            
            <h3 className={`text-xs font-bold uppercase tracking-widest relative z-10 ${isSelected ? 'text-primary' : 'text-on-surface-muted'}`}>{kpi.name}</h3>
            <div className="mt-2 flex flex-wrap items-end gap-2 relative z-10">
              <span className="text-2xl md:text-3xl font-bold text-on-surface font-mono tracking-tight drop-shadow-sm">
                {kpi.unit === '$' ? '$' : ''}{kpi.value.toLocaleString()}{kpi.unit !== '$' ? kpi.unit : ''}
              </span>
              <span className="text-xs text-on-surface-muted mb-1 opacity-70">vs {kpi.prev.toLocaleString()}</span>
            </div>
            
            {/* Mini Sparkline simulation */}
            <div className="h-1 w-full bg-surface-highlight mt-4 rounded-full overflow-hidden relative z-10">
              <div className={`h-full rounded-full shadow-[0_0_8px_currentColor] ${isGood ? 'bg-secondary text-secondary' : 'bg-danger text-danger'}`} style={{ width: `${Math.random() * 40 + 30}%` }}></div>
            </div>
          </div>
        );
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {KPI_DEFINITIONS[activeTab].map(renderKpiCard)}
        </div>
    );
};
