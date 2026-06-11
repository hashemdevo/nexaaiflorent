
import { SimulationParameters } from './config';
import { SimulationResult } from './results';

export interface RiskEventType {
  name: string;
  magnitude: number;
  probability?: number;
  type: 'Market' | 'Operational' | 'Credit' | 'Regulatory' | 'Macro';
  description?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CATASTROPHIC';
}

export interface ScenarioAnalysisReport {
    detectedFactors: {
        factor: string;
        category: 'RISK' | 'GROWTH' | 'OPERATIONAL' | 'MACRO';
        confidence: number;
        interpretation: string;
    }[];
    strategicImplications: string;
    recommendedEngineReasoning: string;
    engineConfig: Partial<SimulationParameters>;
}

export type MitigationType = 'CAPACITY_UPGRADE' | 'CHURN_REDUCTION' | 'DSO_IMPROVEMENT' | 'PRICE_OPTIMIZATION' | 'COST_CUTTING';

export interface MitigationAction {
    id: string;
    type: MitigationType;
    label: string;
    impactDescription: string;
    paramAdjustments: Partial<SimulationParameters>;
    costEstimate?: number;
}

export interface StrategicAnalysis {
    solvencyGap: number;
    burnRate: number;
    runwayMonths: number;
    failureMonth?: number;
    cashVsProfitCorrelation: number;
    gapAnalysis: string;
}

export interface ScenarioComparison {
    baseline: SimulationResult;
    mitigated: SimulationResult;
    improvement: {
        revenue: number;
        profit: number;
        cash: number;
        riskScore: number;
    };
    activeMitigations: string[];
}

export interface ERIInputData {
    revenue: number;
    cogs: number;
    opex: number;
    capex: number;
    taxRate: number;
    inventory: number;
    arDays: number;
    apDays: number;
    resilienceScore?: number;
    volatility?: number;
    [key: string]: number | undefined;
}

export interface MacroDataType {
    inflationRate: number;
    interestRate: number;
    fxRate: number;
    commodityPrices: Record<string, number>; 
    regulatoryCosts: number;
}

export interface MicroDataType {
    churnRate: number;
    latePaymentRate: number;
    returnRate: number;
    supplyChainDelay: number;
    employeeTurnover: number;
    customerPaymentDelays?: Record<string, number>;
    supplierDeliveryDelays?: Record<string, number>;
    orderVolumeChanges?: Record<string, number>;
    productReturns?: Record<string, number>;
}

export interface CalibrationSuggestion {
    parameter: keyof SimulationParameters;
    currentValue: number;
    suggestedValue: number;
    reason: string;
}
