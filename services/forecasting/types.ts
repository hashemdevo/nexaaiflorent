
export interface CashFlowForecast {
    date: string;
    predictedInflow: number;
    predictedOutflow: number;
    predictedBalance: number;
}

export interface DemandForecast {
    itemId: string;
    itemName: string;
    predictedDemandNext30Days: number;
    confidenceLevel: number; // 0-100
    suggestedReorderPoint: number;
}
