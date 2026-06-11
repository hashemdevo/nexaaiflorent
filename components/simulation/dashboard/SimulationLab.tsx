
import React from 'react';
import { Search, RefreshCw, BrainCircuit, Database, Lightbulb, Activity, Play, Box, ArrowRight, Layers } from 'lucide-react';
import { SimulationParameters, SimulationResult, ScenarioAnalysisReport, SimulationEngineType, MitigationAction, ScenarioComparison, StrategicAnalysis } from '../../../services/simulation/types';
import { VariableExplainer } from '../VariableExplainer';
import { SimulationChart } from './SimulationChart';
import { StrategicSandbox } from './StrategicSandbox'; // To be created next, for now inline simple or keep complex? I'll inline basics to avoid too many files if possible, but for 200 LOC rule, Sandbox should be split.
// Actually, let's keep StrategicSandbox inside this file or split if needed. The lab is big.
// I will split Sandbox to keep Lab clean.

interface SimulationLabProps {
    labState: 'INPUT' | 'ANALYSIS_REVIEW' | 'RESULTS' | 'STRATEGY';
    setLabState: (state: 'INPUT' | 'ANALYSIS_REVIEW' | 'RESULTS' | 'STRATEGY') => void;
    scenarioText: string;
    setScenarioText: (text: string) => void;
    isAnalyzing: boolean;
    handleAnalyze: () => void;
    handleSyncLedger: () => void;
    selectedEngine: SimulationEngineType;
    setSelectedEngine: (engine: SimulationEngineType) => void;
    engines: { id: SimulationEngineType, name: string, icon: any, color: string, desc: string }[];
    analysisReport: ScenarioAnalysisReport | null;
    isRunning: boolean;
    handleRun: () => void;
    params: SimulationParameters;
    setParams: (p: any) => void; // Helper for adjustments
    result: SimulationResult | null;
    strategicAnalysis: StrategicAnalysis | null;
    mitigationOptions: MitigationAction[];
    selectedMitigations: string[];
    handleToggleMitigation: (id: string) => void;
    comparisonResult: ScenarioComparison | null;
}

export const SimulationLab: React.FC<SimulationLabProps> = (props) => {
    const { 
        labState, setLabState, scenarioText, setScenarioText, isAnalyzing, handleAnalyze, 
        handleSyncLedger, selectedEngine, setSelectedEngine, engines, analysisReport, 
        isRunning, handleRun, params, result, strategicAnalysis, 
        mitigationOptions, selectedMitigations, handleToggleMitigation, comparisonResult 
    } = props;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT PANEL: Input & Config */}
            <div className="lg:col-span-4 space-y-6">
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-on-surface flex items-center gap-2">
                            <Search className="h-5 w-5 text-primary" /> Scenario Context
                        </h3>
                        {labState !== 'INPUT' && (
                            <button onClick={() => setLabState('INPUT')} className="text-xs bg-surface-highlight px-2 py-1 rounded text-on-surface border border-border hover:bg-surface">Edit</button>
                        )}
                    </div>
                    
                    {labState === 'INPUT' ? (
                        <>
                            <textarea 
                                value={scenarioText}
                                onChange={(e) => setScenarioText(e.target.value)}
                                placeholder="Describe your situation... e.g. 'What if we face a supply chain failure next quarter?'"
                                className="w-full h-32 bg-background border border-border rounded-xl p-4 text-sm text-on-surface focus:border-primary outline-none resize-none mb-4"
                            />
                            <div className="flex gap-2">
                                <button onClick={handleAnalyze} disabled={isAnalyzing || !scenarioText} className="flex-1 py-3 bg-surface-highlight hover:bg-surface border border-border rounded-xl text-sm font-bold text-on-surface transition flex items-center justify-center gap-2 disabled:opacity-50">
                                    {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze Scenario'}
                                </button>
                                <button onClick={handleSyncLedger} className="px-4 py-3 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-xl text-secondary transition flex items-center justify-center gap-2 disabled:opacity-50" title="Sync with Live Ledger">
                                    <Database className="h-4 w-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="bg-surface-highlight/10 p-4 rounded-xl border border-border text-sm text-on-surface-muted italic">"{scenarioText}"</div>
                    )}
                </div>

                {/* Engine Selector */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-on-surface-muted uppercase tracking-wider ml-1">Simulation Engine</label>
                    {engines.map(engine => (
                        <div key={engine.id} onClick={() => setSelectedEngine(engine.id)} className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 relative group ${selectedEngine === engine.id ? `bg-${engine.color.split('-')[1]}-500/10 border-${engine.color.split('-')[1]}-500 shadow-lg` : 'bg-surface border-border hover:border-surface-highlight'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedEngine === engine.id ? 'bg-background' : 'bg-surface-highlight'}`}>
                                    <engine.icon className={`h-5 w-5 ${engine.color}`} />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm ${selectedEngine === engine.id ? 'text-white' : 'text-on-surface'}`}>{engine.name}</h4>
                                    <p className="text-[10px] text-on-surface-muted mt-0.5">{engine.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: Dynamic Content */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* STEP 2: STRATEGIC REVIEW */}
                {labState === 'ANALYSIS_REVIEW' && analysisReport && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="glass-panel p-8 rounded-3xl border border-primary/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><Search className="h-48 w-48 text-primary" /></div>
                            <h2 className="text-2xl font-bold text-on-surface mb-2">Strategic Analysis Brief</h2>
                            <p className="text-on-surface-muted mb-6 max-w-2xl">{analysisReport.strategicImplications}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative z-10">
                                {analysisReport.detectedFactors.map((f, i) => (
                                    <div key={i} className="bg-surface/80 border border-border p-4 rounded-xl flex items-start gap-3 backdrop-blur-md">
                                        <div className={`p-2 rounded-lg ${f.category === 'RISK' ? 'bg-danger/20 text-danger' : 'bg-secondary/20 text-secondary'}`}><Activity className="h-5 w-5" /></div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-on-surface text-sm">{f.factor}</span>
                                                <span className="text-[10px] uppercase font-bold bg-surface-highlight px-1.5 py-0.5 rounded text-on-surface-muted">{f.category}</span>
                                            </div>
                                            <p className="text-xs text-on-surface-muted leading-relaxed">{f.interpretation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-surface-highlight/30 rounded-xl border border-border/50 mb-6">
                                <Lightbulb className="h-6 w-6 text-warning shrink-0" />
                                <div className="text-sm">
                                    <strong className="text-on-surface block mb-1">Recommended: {analysisReport.engineConfig.recommendedEngine?.replace('_', ' ')}</strong>
                                    <span className="text-on-surface-muted">{analysisReport.recommendedEngineReasoning}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={handleRun} disabled={isRunning} className="px-8 py-3 bg-primary text-black font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition flex items-center gap-2">
                                    {isRunning ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-current" />} Run Simulation
                                </button>
                                <button onClick={() => setLabState('INPUT')} className="px-6 py-3 bg-surface hover:bg-surface-highlight border border-border text-on-surface font-bold rounded-xl transition">Adjust Inputs</button>
                            </div>
                        </div>
                        <VariableExplainer engineType={selectedEngine} params={params} />
                    </div>
                )}

                {/* STEP 3 & 4: RESULTS */}
                {(labState === 'RESULTS' || labState === 'STRATEGY') && result && (
                    <div className="flex flex-col gap-6 animate-fade-in">
                        <SimulationChart 
                            result={result} 
                            comparisonResult={comparisonResult} 
                            labState={labState} 
                            setLabState={setLabState} 
                            selectedEngine={selectedEngine}
                        />
                        {labState === 'STRATEGY' && strategicAnalysis && (
                            <StrategicSandbox 
                                strategicAnalysis={strategicAnalysis}
                                mitigationOptions={mitigationOptions}
                                selectedMitigations={selectedMitigations}
                                handleToggleMitigation={handleToggleMitigation}
                                comparisonResult={comparisonResult}
                            />
                        )}
                    </div>
                )}

                {/* DEFAULT STATE */}
                {labState === 'INPUT' && (
                    <div className="h-full flex flex-col items-center justify-center text-on-surface-muted opacity-50 min-h-[400px]">
                        <Layers className="h-16 w-16 mb-4" />
                        <p className="text-lg">Describe a scenario to begin analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
