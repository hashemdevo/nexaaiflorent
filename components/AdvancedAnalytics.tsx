
import React, { useState, useRef, useEffect } from 'react';
import { Layers, Calendar, ChevronDown, BarChart3, LineChart as LineChartIcon, Maximize2, Minimize2, Filter, Check, PieChart as PieChartIcon, Zap, Percent, Activity, DollarSign, Calculator, Briefcase, ShieldAlert, Truck } from 'lucide-react';
import { generateTrendData } from './analytics/config/kpiDefinitions';
import { KPIGrid } from './analytics/widgets/KPIGrid';
import { DynamicTrendChart } from './analytics/charts/DynamicTrendChart';
import { KPIDrillDown } from './analytics/details/KPIDrillDown';

interface AdvancedAnalyticsProps {
    currentTheme: string;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ currentTheme }) => {
  const [activeTab, setActiveTab] = useState<'ratios' | 'efficiency' | 'profitability' | 'risk' | 'investment' | 'cost_variance' | 'logistics_ops'>('ratios');
  const [compareMode, setCompareMode] = useState(true);
  const [selectedKpi, setSelectedKpi] = useState<any | null>(null);
  const detailSectionRef = useRef<HTMLDivElement>(null);
  
  // Chart State
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line' | 'pie'>('area');
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  
  // Customize Menu State
  const [showCustomizeMenu, setShowCustomizeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>({ revenue: true, expenses: true, netProfit: true });

  // Date Range State
  const [period1, setPeriod1] = useState({ start: '2023-01-01', end: '2023-06-30' });
  const [period2, setPeriod2] = useState({ start: '2022-01-01', end: '2022-06-30' });
  const [preset, setPreset] = useState('This Year');
  const [comparisonLabel, setComparisonLabel] = useState("");

  const trendData = generateTrendData();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowCustomizeMenu(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedKpi && detailSectionRef.current) {
        setTimeout(() => {
            detailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  }, [selectedKpi]);
  
  useEffect(() => {
    if (compareMode && period2.start && period2.end) {
        setComparisonLabel(`${period2.start} - ${period2.end}`);
    } else {
        setComparisonLabel("");
    }
  }, [compareMode, period2]);

  const toggleSeries = (key: string) => {
      setVisibleSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SERIES_CONFIG = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'netProfit', label: 'Net Profit' }
  ];

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in max-w-7xl mx-auto relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary drop-shadow-glow-primary" />
            Advanced Analytics
          </h1>
          <p className="text-on-surface-muted mt-1">Deep dive into financial performance indicators.</p>
        </div>
        
        {/* Advanced Date Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 bg-surface/60 backdrop-blur-xl border border-border p-2 rounded-2xl shadow-lg w-full xl:w-auto">
           <div className="relative group flex-1 sm:flex-none">
             <button className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-surface-highlight/50 hover:bg-surface-highlight rounded-xl border border-border/50 text-sm font-bold text-on-surface transition">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {preset}
                </div>
                <ChevronDown className="h-3 w-3 text-on-surface-muted" />
             </button>
           </div>
           <div className="h-8 w-[1px] bg-border hidden sm:block self-center mx-1"></div>
           <div className="flex items-center gap-2 bg-surface-highlight/20 px-3 py-1.5 rounded-xl border border-border/50 flex-1 sm:flex-none justify-between sm:justify-start">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Current</span>
              <input type="date" value={period1.start} onChange={(e) => setPeriod1({...period1, start: e.target.value})} className="bg-transparent text-xs font-mono text-on-surface border-none focus:ring-0 p-0 w-20 sm:w-24" />
              <span className="text-on-surface-muted">-</span>
              <input type="date" value={period1.end} onChange={(e) => setPeriod1({...period1, end: e.target.value})} className="bg-transparent text-xs font-mono text-on-surface border-none focus:ring-0 p-0 w-20 sm:w-24" />
           </div>
           <div className="flex items-center gap-2 px-2 justify-center sm:justify-start">
             <button onClick={() => setCompareMode(!compareMode)} className={`w-10 h-5 rounded-full transition-all duration-300 relative ${compareMode ? 'bg-secondary shadow-[0_0_10px_-2px_rgba(var(--secondary),0.6)]' : 'bg-surface-highlight'}`} title="Toggle Comparison">
               <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${compareMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
             </button>
             <span className="text-xs font-bold text-on-surface-muted uppercase">Vs</span>
           </div>
            {compareMode && (
               <div className="flex items-center gap-2 bg-surface-highlight/20 px-3 py-1.5 rounded-xl border border-border/50 animate-fade-in flex-1 sm:flex-none justify-between sm:justify-start">
                  <span className="text-[10px] font-bold text-on-surface-muted uppercase tracking-wider">Previous</span>
                  <input type="date" value={period2.start} onChange={(e) => setPeriod2({...period2, start: e.target.value})} className="bg-transparent text-xs font-mono text-on-surface-muted border-none focus:ring-0 p-0 w-20 sm:w-24" />
                  <span className="text-on-surface-muted">-</span>
                  <input type="date" value={period2.end} onChange={(e) => setPeriod2({...period2, end: e.target.value})} className="bg-transparent text-xs font-mono text-on-surface-muted border-none focus:ring-0 p-0 w-20 sm:w-24" />
               </div>
            )}
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className={`glass-panel p-4 md:p-8 rounded-3xl transition-all duration-500 ease-in-out border border-border/50 shadow-2xl relative overflow-hidden ${isChartExpanded ? 'fixed inset-0 z-50 m-0 rounded-none bg-background/95 backdrop-blur-xl flex flex-col' : 'relative'}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-surface-highlight/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-col">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-glow-primary"><Zap className="h-5 w-5" /></div>
                Performance Trends
                {isChartExpanded && <span className="text-xs font-normal text-on-surface-muted bg-surface-highlight px-2 py-1 rounded-full border border-border">Full Screen Mode</span>}
                {compareMode && comparisonLabel && (
                    <span className="text-xs text-on-surface-muted bg-surface-highlight px-2 py-1 rounded-lg border border-border ml-2 animate-fade-in hidden md:inline-block">
                        Vs <span className="text-on-surface font-mono font-bold">{comparisonLabel}</span>
                    </span>
                )}
              </h2>
          </div>
          
          <div className="flex items-center gap-2 bg-surface/50 backdrop-blur-md rounded-xl border border-border/50 p-1 shadow-sm w-full md:w-auto overflow-x-auto">
            <button onClick={() => setChartType('bar')} className={`p-2 rounded-lg transition flex-1 md:flex-none flex justify-center ${chartType === 'bar' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-highlight/50'}`}><BarChart3 className="h-4 w-4" /></button>
            <button onClick={() => setChartType('line')} className={`p-2 rounded-lg transition flex-1 md:flex-none flex justify-center ${chartType === 'line' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-highlight/50'}`}><LineChartIcon className="h-4 w-4" /></button>
            <button onClick={() => setChartType('area')} className={`p-2 rounded-lg transition flex-1 md:flex-none flex justify-center ${chartType === 'area' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-highlight/50'}`}><Layers className="h-4 w-4" /></button>
            <button onClick={() => setChartType('pie')} className={`p-2 rounded-lg transition flex-1 md:flex-none flex justify-center ${chartType === 'pie' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-highlight/50'}`}><PieChartIcon className="h-4 w-4" /></button>
            <div className="w-[1px] h-6 bg-border mx-1 hidden md:block"></div>
            
            <div className="relative flex-1 md:flex-none" ref={menuRef}>
                <button onClick={() => setShowCustomizeMenu(!showCustomizeMenu)} className={`w-full md:w-auto p-2 rounded-lg transition flex items-center justify-center gap-2 ${showCustomizeMenu ? 'bg-surface-highlight text-on-surface' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-highlight/50'}`}><Filter className="h-4 w-4" /></button>
                {showCustomizeMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl p-2 z-50 animate-fade-in backdrop-blur-xl">
                        {SERIES_CONFIG.map((opt) => (
                            <div key={opt.key} className="flex items-center justify-between p-2 hover:bg-surface-highlight rounded-lg cursor-pointer transition group" onClick={() => toggleSeries(opt.key)}>
                                <span className={`text-sm font-medium transition ${visibleSeries[opt.key] ? 'text-on-surface' : 'text-on-surface-muted group-hover:text-on-surface'}`}>{opt.label}</span>
                                {visibleSeries[opt.key] && <Check className="h-3 w-3 text-primary" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={() => setIsChartExpanded(!isChartExpanded)} className="hidden md:block p-2 rounded-lg text-on-surface-muted hover:text-on-surface hover:bg-surface-highlight/50 transition">
                {isChartExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div className={`w-full transition-all duration-300 ${isChartExpanded ? 'flex-1 p-8' : 'h-[300px] md:h-[400px]'}`}>
          <DynamicTrendChart 
            data={trendData} chartType={chartType} visibleSeries={visibleSeries} 
            compareMode={compareMode} comparisonLabel={comparisonLabel} isExpanded={isChartExpanded} currentTheme={currentTheme} 
          />
        </div>
      </div>

      {/* KPI Sections */}
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-border/50 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: 'ratios', label: 'Financial Ratios', icon: Percent },
            { id: 'efficiency', label: 'Operational Efficiency', icon: Activity },
            { id: 'profitability', label: 'Profitability & Leverage', icon: DollarSign },
            { id: 'cost_variance', label: 'Cost & Variance', icon: Calculator },
            { id: 'investment', label: 'Investment & EVA', icon: Briefcase },
            { id: 'risk', label: 'Risk Analysis', icon: ShieldAlert },
            { id: 'logistics_ops', label: 'Logistics & Operations', icon: Truck },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-glow-primary"></div>}
            </button>
          ))}
        </div>

        <KPIGrid activeTab={activeTab} selectedKpi={selectedKpi} onSelectKpi={setSelectedKpi} />

        <div ref={detailSectionRef}>
            <KPIDrillDown selectedKpi={selectedKpi} onClose={() => setSelectedKpi(null)} />
        </div>
      </div>
    </div>
  );
};
