
import { SimulationPoint, ScenarioType, MacroDataType } from '../types';

export class MacroEngine {
    private inputResult: Partial<SimulationPoint>;
    private macroData: MacroDataType;
    private scenario: ScenarioType;
    private adjustedResult: Partial<SimulationPoint>;

    constructor(inputResult: Partial<SimulationPoint>, macroData: MacroDataType, scenario: ScenarioType = 'Base') {
        this.inputResult = { ...inputResult };
        this.macroData = macroData;
        this.scenario = scenario;
        this.adjustedResult = { ...inputResult };
    }

    // 1. Inflation Adjustment
    // Adjusts Revenue and OPEX based on purchasing power
    public adjustRevenueForInflation(): void {
        if (!this.adjustedResult.revenue) return;
        
        // Revenue typically lags inflation slightly unless pricing power is high
        const pricingPower = this.scenario === 'BestCase' ? 1.2 : 0.8; 
        const adjustmentFactor = 1 + ((this.macroData.inflationRate / 100) * pricingPower);
        
        this.adjustedResult.revenue *= adjustmentFactor;
    }

    // 2. Commodity Price Impact on COGS
    // Adjusts Cost of Goods Sold based on raw material fluctuations
    public adjustCOGSForCommodity(): void {
        // Assume default COGS is 40% of revenue for calculation if not present
        // In real ERI, we'd map specific commodities to specific BOM items
        
        const oilImpact = this.macroData.commodityPrices['Oil'] ? (this.macroData.commodityPrices['Oil'] / 80) : 1; // Baseline $80
        const metalImpact = this.macroData.commodityPrices['Steel'] ? (this.macroData.commodityPrices['Steel'] / 100) : 1;
        
        // Weighted average of commodity basket
        const commodityFactor = (oilImpact * 0.6) + (metalImpact * 0.4); 
        
        // Apply to gross margin logic indirectly by modifying implied COGS
        // We reduce Gross Profit if commodities are expensive
        if (this.adjustedResult.grossProfit && this.adjustedResult.revenue) {
            const currentCOGS = this.adjustedResult.revenue - this.adjustedResult.grossProfit;
            const newCOGS = currentCOGS * commodityFactor;
            this.adjustedResult.grossProfit = this.adjustedResult.revenue - newCOGS;
        }
    }

    // 3. Interest Rate Impact on OPEX
    // Higher rates increase debt servicing costs (part of OPEX or separate line)
    public adjustOPEXForInterestRate(): void {
        if (!this.adjustedResult.ebitda) return;
        
        // Simplified Debt Service Proxy: 20% of EBITDA is assumed leverage-dependent
        const leverageRatio = 0.2; 
        const baseRate = 0.05; // 5% baseline
        const rateDelta = (this.macroData.interestRate / 100) - baseRate;
        
        // If rates rise, EBITDA shrinks (assuming EBITDA includes some financial ops or we treat this as pre-EBIT adjustment)
        // Usually Interest is below EBITDA, but for this simulation engine we might adjust Free Cash Flow directly
        // Let's adjust Net Income/FCF directly
        
        const interestImpact = (this.adjustedResult.revenue || 0) * leverageRatio * rateDelta;
        
        if (this.adjustedResult.netIncome) {
            this.adjustedResult.netIncome -= interestImpact;
        }
        if (this.adjustedResult.freeCashFlow) {
            this.adjustedResult.freeCashFlow -= interestImpact;
        }
    }

    // 4. FX Adjustment
    // Impact of currency fluctuation on Revenue (Export) or Cost (Import)
    public applyFXAdjustments(exportRatio: number = 0.3): void {
        const fxMult = this.macroData.fxRate; // e.g. 1.1 means home currency stronger (Exports hurt, Imports cheaper)
        
        if (this.adjustedResult.revenue) {
            // Exports become more expensive/harder to sell if home currency rises
            // Or revenue converts to less if home currency rises
            // Simplified: If rate > 1, revenue drops slightly on export portion
            const impact = fxMult > 1 ? (1 / fxMult) : fxMult;
            const affectedRevenue = this.adjustedResult.revenue * exportRatio;
            const unaffected = this.adjustedResult.revenue * (1 - exportRatio);
            
            this.adjustedResult.revenue = unaffected + (affectedRevenue * impact);
        }
    }

    // 5. Regulatory Impact
    // Direct fines or compliance costs
    public applyRegulatoryImpact(): void {
        if (this.macroData.regulatoryCosts > 0) {
            if (this.adjustedResult.netIncome) {
                this.adjustedResult.netIncome -= this.macroData.regulatoryCosts;
            }
            if (this.adjustedResult.freeCashFlow) {
                this.adjustedResult.freeCashFlow -= this.macroData.regulatoryCosts;
            }
        }
    }

    // 6. Generate Final Result
    public generateAdjustedResults(): Partial<SimulationPoint> {
        this.adjustRevenueForInflation();
        this.adjustCOGSForCommodity();
        this.applyFXAdjustments();
        this.adjustOPEXForInterestRate();
        this.applyRegulatoryImpact();
        
        return this.adjustedResult;
    }
}
