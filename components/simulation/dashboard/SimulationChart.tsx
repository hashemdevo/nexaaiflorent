
import React from 'react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, Area } from 'recharts';
import { SimulationResult, ScenarioComparison, SimulationEngineType } from '../../../services/simulation/types';
import { FileText, ArrowRight, Box, ShieldAlert } from 'lucide-react';

interface SimulationChartProps {
    result: SimulationResult;
    comparisonResult: ScenarioComparison | null;
    labState: 'RESULTS' | 'STRATEGY' | 'INPUT' | 'ANALYSIS_REVIEW';
    setLabState: (state: 'RESULTS' | 'STRATEGY') => void;
    selectedEngine: SimulationEngineType;
}

export const SimulationChart: React.FC<SimulationChartProps> = ({ result, comparisonResult, labState, setLabState, selectedEngine }) => {
    
    const renderChart = () => {
        const commonProps = { width: '100%', height: '100%' };
        const data = comparisonResult ? comparisonResult.mitigated.data : result.data;

        if (selectedEngine === 'ERI_FULL_STACK') {
            return (
                <ResponsiveContainer {...commonProps}>
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="month" stroke="#666" />
                        <YAxis yAxisId="left" stroke="#666" tickFormatter={v => `$${v/1000}k`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#666" tickFormatter={v => `$${v/1000}k`} />
                        <Tooltip contentStyle={{ backgroundColor: '#111' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
                        <Bar yAxisId="left" dataKey="ebitda" fill="#10b981" name="EBITDA" />
                        <Line yAxisId="right" type="monotone" dataKey="netIncome" stroke="#f59e0b" strokeWidth={3} name="Net Income" />
                        {comparisonResult && <Line type="monotone" dataKey="cashBalance" data={result.data} stroke="#666" strokeDasharray="5 5" name="Baseline Cash" dot={false} yAxisId="right" />}
                    </ComposedChart>
                </ResponsiveContainer>
            );
        }

        // Default / Generic View
        return (
            <ResponsiveContainer {...commonProps}>
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#666" tickFormatter={v => `$${v/1000}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#111' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Line yAxisId="left" type="monotone" dataKey="cashBalance" stroke="#10b981" strokeWidth={3} name="Cash" />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* CFO Commentary */}
            <div className="glass-panel p-6 rounded-2xl border border-secondary/30 bg-secondary/5 relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 bg-secondary/20 rounded-xl text-secondary border border-secondary/30"><FileText className="h-6 w-6" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-on-surface mb-2">CFO Executive Summary</h3>
                        <div className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap font-medium opacity-90">{result.cfoCommentary || "Generating insight..."}</div>
                    </div>
                </div>
                <div className="absolute top-4 right-4">
                    <button onClick={() => setLabState(labState === 'RESULTS' ? 'STRATEGY' : 'RESULTS')} className="px-4 py-2 bg-surface hover:bg-surface-highlight border border-border rounded-xl text-xs font-bold text-on-surface transition flex items-center gap-2">
                        {labState === 'RESULTS' ? <Box className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                        {labState === 'RESULTS' ? 'Open Strategic Sandbox' : 'Close Sandbox'}
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="glass-panel p-6 rounded-2xl border border-border flex-1 min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-on-surface">Projections</h3>
                    <div className="flex gap-2">
                        <span className="text-xs bg-surface-highlight px-2 py-1.5 rounded text-on-surface-muted border border-border">{result.modelName}</span>
                    </div>
                </div>
                <div className="flex-1 w-full">{renderChart()}</div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-border text-center">
                    <div className="text-xs text-on-surface-muted uppercase">Ending Profit</div>
                    <div className="font-mono font-bold text-lg text-emerald-400">${result.summary.totalProfit.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border text-center">
                    <div className="text-xs text-on-surface-muted uppercase">Final Cash</div>
                    <div className="font-mono font-bold text-lg text-blue-400">${result.summary.endingCash.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border text-center">
                    <div className="text-xs text-on-surface-muted uppercase">Risk Score</div>
                    <div className="font-mono font-bold text-lg text-purple-400">{result.summary.riskScore?.toFixed(1) || 0}/100</div>
                </div>
            </div>

            {/* Flags */}
            {result.summary.investigationFlags && result.summary.investigationFlags.length > 0 && (
                <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-danger font-bold text-sm mb-1"><ShieldAlert className="h-4 w-4" /> Operational Flags</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {result.summary.investigationFlags.map(flag => (
                            <span key={flag} className="px-2 py-1 bg-danger/20 border border-danger/30 rounded text-xs text-danger font-bold">{flag}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
