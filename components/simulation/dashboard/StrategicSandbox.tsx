
import React from 'react';
import { Crosshair, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { StrategicAnalysis, MitigationAction, ScenarioComparison } from '../../../services/simulation/types';

interface StrategicSandboxProps {
    strategicAnalysis: StrategicAnalysis;
    mitigationOptions: MitigationAction[];
    selectedMitigations: string[];
    handleToggleMitigation: (id: string) => void;
    comparisonResult: ScenarioComparison | null;
}

export const StrategicSandbox: React.FC<StrategicSandboxProps> = ({
    strategicAnalysis, mitigationOptions, selectedMitigations, handleToggleMitigation, comparisonResult
}) => {
    return (
        <div className="glass-panel p-8 rounded-3xl border border-border animate-fade-in">
            <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-3">
                <Crosshair className="h-6 w-6 text-primary" /> Strategic Sandbox & Mitigation
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Strategic Metrics */}
                <div className="space-y-4">
                    <div className="bg-surface-highlight/30 p-4 rounded-xl border border-border">
                        <div className="text-xs text-on-surface-muted uppercase mb-1">Cash Runway</div>
                        <div className={`text-2xl font-mono font-bold ${strategicAnalysis.runwayMonths < 6 ? 'text-danger' : 'text-primary'}`}>
                            {strategicAnalysis.runwayMonths === 999 ? 'Stable' : `${strategicAnalysis.runwayMonths.toFixed(1)} Months`}
                        </div>
                    </div>
                    <div className="bg-surface-highlight/30 p-4 rounded-xl border border-border">
                        <div className="text-xs text-on-surface-muted uppercase mb-1">Solvency Gap (Max)</div>
                        <div className="text-2xl font-mono font-bold text-warning">
                            ${strategicAnalysis.solvencyGap.toLocaleString(undefined, {maximumFractionDigits:0})}
                        </div>
                        <div className="text-[10px] text-on-surface-muted mt-1">{strategicAnalysis.gapAnalysis}</div>
                    </div>
                    {strategicAnalysis.failureMonth && (
                        <div className="bg-danger/20 border border-danger/40 p-4 rounded-xl animate-pulse">
                            <div className="flex items-center gap-2 text-danger font-bold text-sm mb-1">
                                <AlertTriangle className="h-4 w-4" /> Failure Point
                            </div>
                            <div className="text-lg font-bold text-white">Month {strategicAnalysis.failureMonth}</div>
                        </div>
                    )}
                </div>

                {/* Mitigation Controls */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mitigationOptions.map(action => (
                        <button
                            key={action.id}
                            onClick={() => handleToggleMitigation(action.id)}
                            className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between h-full ${
                                selectedMitigations.includes(action.id) 
                                ? 'bg-primary/20 border-primary shadow-glow-primary' 
                                : 'bg-surface border-border hover:border-primary/50'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${selectedMitigations.includes(action.id) ? 'bg-primary text-black' : 'bg-surface-highlight text-on-surface-muted'}`}>
                                        {action.type.split('_')[0]}
                                    </span>
                                    {selectedMitigations.includes(action.id) && <CheckCircle2 className="h-4 w-4 text-primary" />}
                                </div>
                                <h4 className="font-bold text-on-surface text-sm mb-1">{action.label}</h4>
                                <p className="text-xs text-on-surface-muted">{action.impactDescription}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Impact Summary */}
            {comparisonResult && (
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-500"><TrendingUp className="h-5 w-5" /></div>
                        <div>
                            <h4 className="font-bold text-emerald-400 text-sm">Mitigation Impact</h4>
                            <p className="text-xs text-emerald-300/80">Net improvement over baseline scenario.</p>
                        </div>
                    </div>
                    <div className="flex gap-6 text-right">
                        <div>
                            <span className="text-xs text-emerald-500/60 uppercase block">Cash Saved</span>
                            <span className="font-mono font-bold text-emerald-400">+${comparisonResult.improvement.cash.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                        </div>
                        <div>
                            <span className="text-xs text-emerald-500/60 uppercase block">Profit Lift</span>
                            <span className="font-mono font-bold text-emerald-400">+${comparisonResult.improvement.profit.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
