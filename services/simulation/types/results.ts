
import { BaseEntity } from '../../core/types';
import { SimulationParameters, SimulationEngineType } from './config';

export type ScenarioType = 'Base' | 'BestCase' | 'WorstCase' | 'BlackSwan';

export interface RiskMetrics {
    valueAtRisk: number;
    stressTestLoss: number;
    volatilityScore: number;
    riskAdjustedRevenue: number;
}

export interface SimulationPoint {
    month: number;
    revenue?: number;
    cost?: number;
    profit?: number;
    cashBalance?: number;
    
    actual?: number;
    counterfactual?: number;
    lift?: number;

    adoptionRate?: number;
    competitorShare?: number;
    marketSaturation?: number;
    activeUsers?: number;
    reputationScore?: number;
    systemHealth?: number;

    eventImpact?: number;
    probability?: number;
    activeRisks?: string[]; 
    riskCategory?: 'MICRO' | 'MACRO' | 'NONE';
    resilienceScore?: number; 

    receivables?: number;
    payables?: number;
    
    operationalLoad?: number; 
    holdingCost?: number; 
    marketingSpend?: number; 

    grossProfit?: number;
    ebitda?: number;
    ebit?: number;
    netIncome?: number;
    freeCashFlow?: number;
    operatingCashFlow?: number;
    
    scenario?: ScenarioType;
    alerts?: string[];
    riskMetrics?: RiskMetrics;
    autoActions?: string[]; 
}

export interface SensitivityMetric {
    parameter: string;
    impactScore: number; 
    direction: 'POSITIVE' | 'NEGATIVE';
    description: string;
}

export interface SimulationResult {
    modelName: string;
    modelType: SimulationEngineType;
    data: SimulationPoint[];
    summary: {
        totalRevenue: number;
        totalProfit: number;
        endingCash: number;
        activeUserEnd?: number;
        riskScore?: number;
        confidenceInterval?: { low: number, high: number };
        valueAtRisk?: number; 
        conditionalVaR?: number; 
        optimizationSuggestion?: string; 
        breakEvenMonth?: number; 
        sensitivity?: SensitivityMetric[];
        causalImpact?: string;
        agentBehavior?: string;
        recommendedAction?: string;
        physicsAlert?: string;
        riskMitigationPlan?: string;
        investigationFlags?: string[];
        eriScore?: number;
    };
    cfoCommentary?: string;
}

export interface SavedSimulation extends BaseEntity {
    runDate: string; 
    startDate: string; 
    params: SimulationParameters;
    forecastData: SimulationPoint[]; 
    modelType: string;
    status: 'ACTIVE' | 'ARCHIVED';
}

export interface AccuracyReport {
    simulationId: string;
    period: string; 
    predictedCash: number;
    actualCash: number;
    variance: number; 
    errorPercent: number; 
    bias: 'OVERESTIMATED' | 'UNDERESTIMATED' | 'ACCURATE';
}

export interface ModelPerformance {
    modelType: SimulationEngineType;
    rank: number;
    accuracyScore: number; 
    averageError: number; 
    biasTrend: 'OPTIMISTIC' | 'PESSIMISTIC' | 'NEUTRAL';
    wins: number; 
    lastRunDate: string;
}
