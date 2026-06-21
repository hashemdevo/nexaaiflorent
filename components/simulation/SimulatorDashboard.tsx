
import React, { useState, useEffect, useMemo } from 'react';
import { Target, Shuffle, TrendingUp, Activity, Users, BrainCircuit, GitBranch, Building2 } from 'lucide-react';
import { Nexa } from '../../services/api';
import { SimulationParameters, SimulationResult, SimulationEngineType, ModelPerformance, CalibrationSuggestion, ScenarioAnalysisReport, MitigationAction, ScenarioComparison, StrategicAnalysis } from '../../services/simulation/types';
import { SimulationHeader } from './dashboard/SimulationHeader';
import { SimulationLab } from './dashboard/SimulationLab';
import { ModelArena } from './dashboard/ModelArena';

const DEFAULT_PARAMS: SimulationParameters = {
    baseRevenue: 100000,
    growthRate: 5,
    costRatio: 60, 
    volatility: 15,
    inflationRate: 3,
    iterations: 1000,
    months: 12,
    blackSwanProbability: 0.02,
    blackSwanImpact: -25,
    daysSalesOutstanding: 30,
    daysPayableOutstanding: 30,
    capacityCeiling: 200000,
    churnRate: 5,
    viralCoefficient: 0.1,
    operationalResilience: 50,
    interestRate: 5,
    taxRate: 20,
    fxExposure: 10,
    fxVolatility: 5,
    supplyChainReliability: 95
};

const ENGINES: { id: SimulationEngineType, name: string, icon: any, color: string, desc: string }[] = [
    { id: 'DETERMINISTIC', name: 'Baseline Planning', icon: Target, color: 'text-blue-400', desc: 'P&L, Cash Flow, Operational Physics.' },
    { id: 'MONTE_CARLO', name: 'Monte Carlo Risk', icon: Shuffle, color: 'text-emerald-400', desc: 'Uncertainty Modeling: Liquidity shocks.' },
    { id: 'STATISTICAL', name: 'Statistical AI', icon: TrendingUp, color: 'text-amber-400', desc: 'Forecasting: Trends & Seasonality.' },
    { id: 'CAUSAL', name: 'Causal Impact', icon: Activity, color: 'text-purple-400', desc: 'Causality: Counterfactual analysis.' },
    { id: 'AGENT', name: 'Agent-Based', icon: Users, color: 'text-pink-400', desc: 'Behavior: Reputation dynamics.' },
    { id: 'OPTIMIZATION', name: 'Optimization (RL)', icon: BrainCircuit, color: 'text-cyan-400', desc: 'RL: Optimizes Price & Marketing mix.' },
    { id: 'SCENARIO', name: 'Risk Scenarios', icon: GitBranch, color: 'text-orange-400', desc: 'Simulates Supply Chain, Cyber, & Regulations.' },
    { id: 'ERI_FULL_STACK', name: 'Enterprise Risk Intelligence', icon: Building2, color: 'text-red-500', desc: 'Full-Stack: GAAP Core + Macro/Micro + Fraud Engines.' },
];

export const SimulatorDashboard: React.FC = () => {
    const [viewMode, setViewMode] = useState<'LAB' | 'ARENA'>('LAB');
    const [labState, setLabState] = useState<'INPUT' | 'ANALYSIS_REVIEW' | 'RESULTS' | 'STRATEGY'>('INPUT');
    const [scenarioText, setScenarioText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false); // Managed inside Hydrator/Sync if needed, but simplified here
    const [analysisReport, setAnalysisReport] = useState<ScenarioAnalysisReport | null>(null);
    const [selectedEngine, setSelectedEngine] = useState<SimulationEngineType>('DETERMINISTIC');
    const [params, setParams] = useState<SimulationParameters>(DEFAULT_PARAMS);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [selectedMitigations, setSelectedMitigations] = useState<string[]>([]);
    const [comparisonResult, setComparisonResult] = useState<ScenarioComparison | null>(null);
    const [strategicAnalysis, setStrategicAnalysis] = useState<StrategicAnalysis | null>(null);
    const [leaderboard, setLeaderboard] = useState<ModelPerformance[]>([]);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
    const [driftData, setDriftData] = useState<any[]>([]); 
    const [suggestions, setSuggestions] = useState<CalibrationSuggestion[]>([]);

    useEffect(() => {
        if (viewMode === 'ARENA') loadLeaderboard();
    }, [viewMode]);

    const mitigationOptions: MitigationAction[] = useMemo(() => [
        { id: 'upgrade_cap', type: 'CAPACITY_UPGRADE', label: 'Upgrade Capacity (+20%)', impactDescription: 'Reduces nonlinear burnout costs.', paramAdjustments: { capacityCeiling: (params.capacityCeiling || 200000) * 1.2 } },
        { id: 'reduce_churn', type: 'CHURN_REDUCTION', label: 'Churn Prevention (-2%)', impactDescription: 'Stabilizes recurring revenue.', paramAdjustments: { churnRate: Math.max(0, (params.churnRate || 5) - 2), churnVolatility: 0 } },
        { id: 'improve_dso', type: 'DSO_IMPROVEMENT', label: 'Accelerate Collection (-10 Days)', impactDescription: 'Improves Cash Flow Gap.', paramAdjustments: { daysSalesOutstanding: Math.max(0, (params.daysSalesOutstanding || 30) - 10) } },
        { id: 'resilience', type: 'COST_CUTTING', label: 'Boost Resilience (Insurance)', impactDescription: 'Dampens Risk Shock impact.', paramAdjustments: { operationalResilience: Math.min(100, (params.operationalResilience || 50) + 30) } }
    ], [params]);

    const loadLeaderboard = async () => {
        setIsLoadingLeaderboard(true);
        try {
            const data = await Nexa.Simulation.Learning.getEngineLeaderboard();
            setLeaderboard(data);
            if (data.length > 0) {
                const history = await Nexa.Simulation.Learning.getHistory();
                const latestRun = history.find(h => h.modelType === data[0].modelType);
                if (latestRun) {
                    const calib = await Nexa.Simulation.Learning.calibrateParameters(latestRun.id);
                    setSuggestions(calib);
                    const reports = await Nexa.Simulation.Learning.evaluateAccuracy(latestRun.id);
                    setDriftData(reports.map(r => ({ period: r.period, Predicted: r.predictedCash, Actual: r.actualCash, Drift: r.variance })));
                }
            }
        } catch (e) { console.error(e); } finally { setIsLoadingLeaderboard(false); }
    };

    const handleApplyCalibration = (sug: CalibrationSuggestion) => {
        setParams(prev => ({ ...prev, [sug.parameter]: sug.suggestedValue }));
        setSuggestions(prev => prev.filter(s => s.parameter !== sug.parameter));
        setViewMode('LAB');
        setLabState('INPUT');
        alert(`Parameter updated! ${sug.parameter} set to ${sug.suggestedValue}.`);
    };

    const handleSyncLedger = async () => {
        try {
            const hydrated = await Nexa.Simulation.Engine.hydrateParametersFromDB();
            setParams(prev => ({ ...prev, ...hydrated }));
            alert("Parameters synced with live ledger data.");
        } catch (e) { alert("Sync failed"); }
    };

    const handleAnalyze = async () => {
        if (!scenarioText.trim()) return;
        setIsAnalyzing(true);
        try {
            const report = await Nexa.Simulation.Engine.analyzeScenario(scenarioText);
            setAnalysisReport(report);
            if (report.engineConfig) setParams(prev => ({ ...prev, ...report.engineConfig }));
            if (report.engineConfig.recommendedEngine) setSelectedEngine(report.engineConfig.recommendedEngine as SimulationEngineType);
            setLabState('ANALYSIS_REVIEW');
        } catch (e) { alert("Analysis failed."); } finally { setIsAnalyzing(false); }
    };

    const handleRun = async () => {
        setIsRunning(true);
        try {
            const res = Nexa.Simulation.Engine.run(selectedEngine, params);
            const commentary = await Nexa.Simulation.Engine.generatePostRunAnalysis(res, params);
            res.cfoCommentary = commentary;
            setResult(res);
            setStrategicAnalysis(Nexa.Simulation.Engine.analyzeStrategy(res));
            await Nexa.Simulation.Learning.saveRun(res, params);
            setLabState('RESULTS');
        } catch (e) { alert("Simulation Error"); } finally { setIsRunning(false); }
    };

    const handleToggleMitigation = (id: string) => {
        const newSelection = selectedMitigations.includes(id) ? selectedMitigations.filter(m => m !== id) : [...selectedMitigations, id];
        setSelectedMitigations(newSelection);
        const activeActions = mitigationOptions.filter(m => newSelection.includes(m.id));
        const comparison = Nexa.Simulation.Engine.runMitigationComparison(params, activeActions);
        setComparisonResult(comparison);
    };

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-20">
            <SimulationHeader viewMode={viewMode} setViewMode={setViewMode} />
            
            {viewMode === 'LAB' && (
                <SimulationLab 
                    labState={labState} setLabState={setLabState} scenarioText={scenarioText} setScenarioText={setScenarioText}
                    isAnalyzing={isAnalyzing} handleAnalyze={handleAnalyze} handleSyncLedger={handleSyncLedger}
                    selectedEngine={selectedEngine} setSelectedEngine={setSelectedEngine} engines={ENGINES}
                    analysisReport={analysisReport} isRunning={isRunning} handleRun={handleRun} params={params} setParams={setParams}
                    result={result} strategicAnalysis={strategicAnalysis} mitigationOptions={mitigationOptions}
                    selectedMitigations={selectedMitigations} handleToggleMitigation={handleToggleMitigation} comparisonResult={comparisonResult}
                />
            )}

            {viewMode === 'ARENA' && (
                <ModelArena 
                    leaderboard={leaderboard} isLoading={isLoadingLeaderboard} driftData={driftData} 
                    suggestions={suggestions} handleApplyCalibration={handleApplyCalibration} 
                />
            )}
        </div>
    );
};
