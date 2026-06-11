
import { SimulationParameters, SimulationResult, SimulationPoint, ERIInputData, MacroDataType, MicroDataType, RiskEventType, ScenarioAnalysisReport, MitigationAction, ScenarioComparison, StrategicAnalysis, SimulationEngineType, CalibrationSuggestion, SensitivityMetric } from './types';
import { DeterministicModel } from './models/deterministic';
import { MonteCarloModel } from './models/monteCarlo';
import { ForecastingModel } from './models/forecasting';
import { AdvancedModels } from './models/advanced';
import { EnterpriseSimulator } from './EnterpriseSimulator';
import { SimulationHydrator } from './hydrator';
import { cleanAndParseJSON } from '../geminiService';
import { ai } from '../gemini/core';
import { Type } from '@google/genai';

/**
 * SIMULATION ENGINE FACADE (The Orchestrator)
 */
export const SimulationEngine = {

    // --- DATA PROVENANCE (Delegated) ---
    async hydrateParametersFromDB(): Promise<Partial<SimulationParameters>> {
        return SimulationHydrator.hydrateParametersFromDB();
    },

    // --- AI CONTEXT ANALYZER ---
    async analyzeScenario(description: string): Promise<ScenarioAnalysisReport> {
        if (!description) return { detectedFactors: [], strategicImplications: '', recommendedEngineReasoning: '', engineConfig: {} };

        try {
            const model = "gemini-3-pro-preview"; 
            const prompt = `
            Act as a CFO and CRO. Analyze the following scenario.
            GOAL: Deconstruct text into financial drivers, risks, and parameters.
            Scenario: "${description}"
            1. Identify factors (Risk, Growth, Operational, Macro).
            2. Determine simulation engine.
            3. Detect implicit strategy.
            Return strictly JSON matching schema.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            detectedFactors: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        factor: { type: Type.STRING },
                                        category: { type: Type.STRING, enum: ['RISK', 'GROWTH', 'OPERATIONAL', 'MACRO'] },
                                        confidence: { type: Type.NUMBER },
                                        interpretation: { type: Type.STRING }
                                    }
                                }
                            },
                            strategicImplications: { type: Type.STRING },
                            recommendedEngineReasoning: { type: Type.STRING },
                            engineConfig: {
                                type: Type.OBJECT,
                                properties: {
                                    recommendedEngine: { type: Type.STRING },
                                    growthRate: { type: Type.NUMBER },
                                    volatility: { type: Type.NUMBER },
                                    baseRevenue: { type: Type.NUMBER },
                                    churnRate: { type: Type.NUMBER },
                                    churnVolatility: { type: Type.NUMBER },
                                    viralCoefficient: { type: Type.NUMBER },
                                    daysSalesOutstanding: { type: Type.NUMBER },
                                    capacityCeiling: { type: Type.NUMBER },
                                    capacityPenalty: { type: Type.BOOLEAN },
                                    blackSwanImpact: { type: Type.NUMBER },
                                    operationalResilience: { type: Type.NUMBER },
                                    inflationRate: { type: Type.NUMBER },
                                    supplyChainReliability: { type: Type.NUMBER },
                                    marketForces: { type: Type.OBJECT, properties: { competitorAggression: { type: Type.NUMBER }, marketSentiment: { type: Type.NUMBER } } },
                                    strategy: { type: Type.OBJECT, properties: { cashPreservationMode: { type: Type.BOOLEAN }, pricingStrategy: { type: Type.STRING } } }
                                }
                            }
                        }
                    }
                }
            });

            const parsed = cleanAndParseJSON(response.text);
            return {
                detectedFactors: parsed.detectedFactors || [],
                strategicImplications: parsed.strategicImplications || '',
                recommendedEngineReasoning: parsed.recommendedEngineReasoning || '',
                engineConfig: parsed.engineConfig || {}
            };

        } catch (error) {
            console.error("AI Analysis Failed", error);
            return { detectedFactors: [], strategicImplications: 'Analysis Failed', recommendedEngineReasoning: '', engineConfig: {} };
        }
    },

    // --- CFO COMMENTARY GENERATOR ---
    async generatePostRunAnalysis(result: SimulationResult, params: SimulationParameters): Promise<string> {
        try {
            const model = "gemini-2.5-flash";
            const flaggedMonths = result.data.filter(d => (d.activeRisks && d.activeRisks.length > 0) || (d.alerts && d.alerts.length > 0) || (d.autoActions && d.autoActions.length > 0));
            const summary = result.summary;

            const prompt = `
            Act as a CFO. Explain these simulation results to the Board.
            Logic: ${result.modelType}. Inputs: Rev: ${params.baseRevenue}, Vol: ${params.volatility}%.
            Results: Profit: ${summary.totalProfit}, Cash: ${summary.endingCash}, Risk: ${summary.riskScore}.
            Events: ${JSON.stringify(flaggedMonths.map(m => ({ month: m.month, risks: m.activeRisks, alerts: m.alerts })))}
            Explain *why* the numbers ended up this way. Be concise.
            `;

            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text;
        } catch (error) {
            return "Analysis unavailable.";
        }
    },

    // --- STRATEGIC SANDBOX ---
    runMitigationComparison(baseParams: SimulationParameters, actions: MitigationAction[]): ScenarioComparison {
        const baseline = this.run('ERI_FULL_STACK', baseParams);
        let newParams = { ...baseParams };
        
        actions.forEach(action => {
            Object.entries(action.paramAdjustments).forEach(([key, val]) => {
                (newParams as any)[key] = val;
            });
        });

        const mitigated = this.run('ERI_FULL_STACK', newParams);

        return {
            baseline,
            mitigated,
            improvement: {
                revenue: mitigated.summary.totalRevenue - baseline.summary.totalRevenue,
                profit: mitigated.summary.totalProfit - baseline.summary.totalProfit,
                cash: mitigated.summary.endingCash - baseline.summary.endingCash,
                riskScore: (mitigated.summary.riskScore || 0) - (baseline.summary.riskScore || 0)
            },
            activeMitigations: actions.map(a => a.label)
        };
    },

    analyzeStrategy(result: SimulationResult): StrategicAnalysis {
        const data = result.data;
        let minCash = Infinity;
        let failureMonth = undefined;
        let totalBurn = 0;
        let burnMonths = 0;
        let maxGap = 0;

        data.forEach(p => {
            if (p.cashBalance !== undefined) {
                if (p.cashBalance < minCash) minCash = p.cashBalance;
                if (p.cashBalance < 0 && !failureMonth) failureMonth = p.month;
            }
            if (p.freeCashFlow && p.freeCashFlow < 0) {
                totalBurn += Math.abs(p.freeCashFlow);
                burnMonths++;
            }
            if (p.netIncome !== undefined && p.freeCashFlow !== undefined) {
                const gap = p.netIncome - p.freeCashFlow;
                if (gap > maxGap) maxGap = gap;
            }
        });

        const avgBurn = burnMonths > 0 ? totalBurn / burnMonths : 0;
        const lastCash = data[data.length - 1].cashBalance || 0;
        const runway = avgBurn > 0 ? (lastCash > 0 ? lastCash / avgBurn : 0) : 999;

        let gapAnalysis = "Healthy.";
        if (maxGap > (result.summary.totalRevenue / data.length) * 0.2) gapAnalysis = "Liquidity Trap Detected.";

        return { solvencyGap: maxGap, burnRate: avgBurn, runwayMonths: runway, failureMonth, cashVsProfitCorrelation: 0, gapAnalysis };
    },

    // --- ENGINE ROUTER ---
    run(type: SimulationEngineType, params: SimulationParameters): SimulationResult {
        switch (type) {
            case 'DETERMINISTIC': return this.runDeterministic(params);
            case 'MONTE_CARLO': return MonteCarloModel.run(params);
            case 'STATISTICAL': return ForecastingModel.run(Array.from({length: 12}, () => params.baseRevenue), params.months, params);
            case 'CAUSAL': return AdvancedModels.runCausal(params);
            case 'AGENT': return AdvancedModels.runAgentBased(params);
            case 'OPTIMIZATION': return AdvancedModels.runOptimization(params);
            case 'SCENARIO': return AdvancedModels.runScenario(params);
            case 'ERI_FULL_STACK': return EnterpriseSimulator.run(params);
            default: return this.runDeterministic(params);
        }
    },

    // --- BASE ENGINE & HELPERS ---
    runDeterministic(params: SimulationParameters): SimulationResult {
        const result = DeterministicModel.run(params);
        result.summary.sensitivity = this.analyzeSensitivity(params);
        result.summary.breakEvenMonth = this.findBreakEven(result);
        return result;
    },

    analyzeSensitivity(baseParams: SimulationParameters): SensitivityMetric[] {
        const baseline = DeterministicModel.run(baseParams).summary.endingCash;
        const metrics: SensitivityMetric[] = [];
        const testFactors: { key: keyof SimulationParameters, label: string, step: number }[] = [
            { key: 'growthRate', label: 'Growth Rate', step: 1 }, 
            { key: 'costRatio', label: 'Cost Structure', step: -1 }, 
            { key: 'daysSalesOutstanding', label: 'DSO (Collection)', step: -5 }, 
            { key: 'arpu', label: 'Pricing (ARPU)', step: 5 }, 
        ];

        testFactors.forEach(factor => {
            const val = baseParams[factor.key] as number;
            if (val === undefined) return;
            const newParams = { ...baseParams, [factor.key]: val + factor.step };
            const newResult = DeterministicModel.run(newParams).summary.endingCash;
            const delta = newResult - baseline;
            const impactScore = Math.abs(delta) / Math.abs(baseline || 1) * 100; 

            metrics.push({
                parameter: factor.label,
                impactScore: Math.min(100, impactScore),
                direction: delta > 0 ? 'POSITIVE' : 'NEGATIVE',
                description: delta > 0 ? `Improving ${factor.label} adds $${Math.abs(delta).toLocaleString()} cash.` : `Worsening ${factor.label} removes $${Math.abs(delta).toLocaleString()} cash.`
            });
        });
        return metrics.sort((a, b) => b.impactScore - a.impactScore);
    },

    findBreakEven(result: SimulationResult): number | undefined {
        const month = result.data.find((p, idx) => {
            if ((p.cashBalance || 0) > 0 && (p.profit || 0) > 0) {
                const next1 = result.data[idx+1];
                const next2 = result.data[idx+2];
                if (!next1 || !next2) return true; 
                return (next1.cashBalance || 0) > 0 && (next2.cashBalance || 0) > 0;
            }
            return false;
        });
        return month?.month;
    }
};
