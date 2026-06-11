
import { ERIInputData, SimulationPoint, ScenarioType } from '../types';

export class AccountingCoreEngine {
    private inputData: ERIInputData;
    private scenario: ScenarioType;

    constructor(inputData: ERIInputData, scenario: ScenarioType = 'Base') {
        this.inputData = inputData;
        this.scenario = scenario;
    }

    // 1. Gross Profit = Revenue – COGS
    public calculateGrossProfit(revenue: number, cogs: number): number {
        return revenue - cogs;
    }

    // 2. EBITDA = Gross Profit – OPEX
    public calculateEBITDA(grossProfit: number, opex: number): number {
        return grossProfit - opex;
    }

    // 3. EBIT = EBITDA – Depreciation & Amortization
    public calculateEBIT(ebitda: number, depreciation: number): number {
        return ebitda - depreciation;
    }

    // 4. Net Profit = EBIT – Taxes
    public calculateNetProfit(ebit: number, taxes: number): number {
        return ebit - taxes;
    }

    // 5. Operating Cash Flow = Net Profit + Depreciation – ΔWorking Capital
    public calculateOperatingCashFlow(netProfit: number, depreciation: number, workingCapitalChange: number): number {
        return netProfit + depreciation - workingCapitalChange;
    }

    // 6. Free Cash Flow = Operating Cash Flow – CAPEX
    public calculateFreeCashFlow(operatingCashFlow: number, capex: number): number {
        return operatingCashFlow - capex;
    }

    // 7. Main Processing Function
    public generateSimulationResult(
        currentRevenue: number, 
        currentCOGS: number, 
        currentOPEX: number, 
        depreciation: number, 
        wcChange: number
    ): Partial<SimulationPoint> {
        
        // Calculate Tax based on rate
        const preTaxIncome = (currentRevenue - currentCOGS - currentOPEX - depreciation);
        const taxes = preTaxIncome > 0 ? preTaxIncome * (this.inputData.taxRate / 100) : 0;

        const grossProfit = this.calculateGrossProfit(currentRevenue, currentCOGS);
        const ebitda = this.calculateEBITDA(grossProfit, currentOPEX);
        const ebit = this.calculateEBIT(ebitda, depreciation);
        const netIncome = this.calculateNetProfit(ebit, taxes);
        const operatingCashFlow = this.calculateOperatingCashFlow(netIncome, depreciation, wcChange);
        const freeCashFlow = this.calculateFreeCashFlow(operatingCashFlow, this.inputData.capex);

        return {
            grossProfit,
            ebitda,
            ebit,
            netIncome,
            profit: netIncome, // Mapping for unified UI
            operatingCashFlow,
            freeCashFlow,
            scenario: this.scenario
        };
    }
}
