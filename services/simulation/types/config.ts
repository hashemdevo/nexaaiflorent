
export type SimulationEngineType = 
    | 'DETERMINISTIC' | 'MONTE_CARLO' | 'STATISTICAL' | 'CAUSAL' | 'AGENT' | 'OPTIMIZATION' | 'SCENARIO' | 'ERI_FULL_STACK';

export interface StrategyConfig {
    pricingStrategy: 'AGGRESSIVE' | 'PREMIUM' | 'MATCH_MARKET';
    marketingReaction: 'CUT_COSTS' | 'SPEND_THROUGH' | 'MAINTAIN';
    cashPreservationMode: boolean;
    debtTolerance: 'NONE' | 'CONSERVATIVE' | 'AGGRESSIVE';
}

export interface MarketForces {
    competitorAggression: number;
    marketSentiment: number;
    innovationCycle: 'STAGNANT' | 'DISRUPTIVE' | 'MATURE';
}

export interface DataProvenance {
    parameter: string;
    value: number;
    sourceTable: string;
    recordCount: number;
    lastTransactionDate: string;
    confidenceScore: number;
    integrityCheck: 'MATCH' | 'VARIANCE' | 'ESTIMATED' | 'MISSING';
}

export interface SimulationParameters {
    baseRevenue: number;
    initialCash?: number;
    growthRate: number; 
    costRatio: number; 
    volatility: number; 
    inflationRate: number;
    iterations: number;
    months: number;
    
    dataProvenance?: DataProvenance[];
    seasonalityFactors?: number[];
    blackSwanProbability?: number;
    blackSwanImpact?: number;
    
    smoothingAlpha?: number;
    smoothingBeta?: number;
    smoothingGamma?: number;
    dampingFactor?: number;

    meanReversionSpeed?: number;
    longTermMean?: number;
    volatilityOfVol?: number;
    enableRegimeSwitching?: boolean;
    jumpIntensity?: number; 
    jumpMean?: number; 
    jumpStd?: number; 

    economiesOfScale?: boolean;
    scaleEfficiency?: number;
    marketCap?: number;
    churnRate?: number; 
    viralCoefficient?: number; 
    initialCustomers?: number;
    arpu?: number; 

    daysSalesOutstanding?: number; 
    daysPayableOutstanding?: number; 
    capacityCeiling?: number; 
    capacityUpgradeCost?: number;
    capacityPenalty?: boolean;

    macroRiskWeight?: number; 
    microRiskWeight?: number; 
    operationalResilience?: number; 

    scenarioDescription?: string;
    detectedVariables?: string[];
    recommendedEngine?: SimulationEngineType;
    reasoning?: string;

    interestRate?: number;
    taxRate?: number;
    fxExposure?: number;
    fxVolatility?: number;
    supplyChainReliability?: number;
    churnVolatility?: number;
    
    strategy?: StrategyConfig;
    marketForces?: MarketForces;
    
    cogs?: number;
    opex?: number;
    capex?: number;
    inventoryLevel?: number;
    arDays?: number;
    apDays?: number;
}
