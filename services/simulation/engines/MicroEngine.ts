
import { SimulationPoint, MicroDataType, ScenarioType } from '../types';

export class MicroEngine {
    private inputResult: Partial<SimulationPoint>;
    private microData: MicroDataType;
    private scenario: ScenarioType;
    private alerts: string[] = [];

    constructor(inputResult: Partial<SimulationPoint>, microData: MicroDataType, scenario: ScenarioType = 'Base') {
        this.inputResult = { ...inputResult, alerts: [] };
        this.microData = microData;
        this.scenario = scenario;
    }

    // 1. Adjust Revenue for Customer Behavior
    // Analyzes order volume drops and churn
    public adjustRevenueForCustomerBehavior(): void {
        if (!this.inputResult.revenue) return;

        // Base churn impact
        let totalChurnImpact = this.inputResult.revenue * (this.microData.churnRate / 100);

        // Granular analysis: Check specific customer order drops if data exists
        if (this.microData.orderVolumeChanges) {
            let granularDrop = 0;
            Object.values(this.microData.orderVolumeChanges).forEach(change => {
                if (change < 0) {
                    // Assuming change is percentage
                    granularDrop += Math.abs(change); 
                }
            });
            // If we have granular data, it might amplify the base churn
            if (granularDrop > 0) {
                // Heuristic: Granular data usually represents a subset, so we add a weighted impact
                totalChurnImpact += (this.inputResult.revenue * (granularDrop / 100) * 0.2); 
            }
        }

        // Circuit Breaker: Ensure we don't subtract more than existing revenue
        this.inputResult.revenue = Math.max(0, this.inputResult.revenue - totalChurnImpact);

        // Also adjust Gross Profit based on new revenue
        if (this.inputResult.grossProfit) {
            const originalRevenue = this.inputResult.revenue + totalChurnImpact;
            // Recalculate margin ratio safely
            const margin = originalRevenue > 0 ? this.inputResult.grossProfit / originalRevenue : 0;
            this.inputResult.grossProfit = this.inputResult.revenue * margin;
        }
    }

    // 2. Adjust COGS for Supplier Behavior
    // Penalizes delays with expediting costs or lost efficiency
    public adjustCOGSForSupplierBehavior(): void {
        let delayImpact = 0;

        // Base delay
        if (this.microData.supplyChainDelay > 7) {
            delayImpact += 0.05; // 5% cost penalty for delays > 1 week
        }

        // Granular supplier delays
        if (this.microData.supplierDeliveryDelays) {
            const delays = Object.values(this.microData.supplierDeliveryDelays);
            const avgDelay = delays.reduce((a, b) => a + b, 0) / (delays.length || 1);
            if (avgDelay > 5) {
                delayImpact += 0.02; // Additional 2% for systemic supplier issues
            }
        }

        if (delayImpact > 0 && this.inputResult.revenue && this.inputResult.grossProfit) {
            const costPenalty = this.inputResult.revenue * delayImpact;
            this.inputResult.grossProfit -= costPenalty;
            
            // Cascade to Net Income
            if (this.inputResult.netIncome) {
                this.inputResult.netIncome -= costPenalty;
            }
        }
    }

    // 3. Adjust Inventory & Profit for Returns
    // Handles product returns impact
    public adjustInventoryForReturns(): void {
        if (!this.inputResult.revenue) return;

        let returnRate = this.microData.returnRate;

        // Granular product return analysis
        if (this.microData.productReturns) {
            const productRates = Object.values(this.microData.productReturns);
            const maxReturn = Math.max(...productRates);
            if (maxReturn > 10) {
                // If any single product has >10% returns, boost overall impact
                returnRate = Math.max(returnRate, maxReturn * 0.5); 
            }
        }

        const returnCost = this.inputResult.revenue * (returnRate / 100);
        
        // Handling cost of returns (restocking, damage) - assumed 20% of return value
        const handlingCost = returnCost * 0.2;

        if (this.inputResult.netIncome) {
            this.inputResult.netIncome -= handlingCost;
        }
        
        // Returns technically reverse revenue, but for simulation flow we treat it as expense impact usually
        // unless we want to reduce top line directly. Here we modeled it as cost impact.
    }

    // 4. Operational Alerts
    // Generates flags for critical issues
    public flagOperationalAlerts(): void {
        this.alerts = [];

        // Churn Alert
        if (this.microData.churnRate > 8) {
            this.alerts.push('CRITICAL: High Churn Rate (>8%)');
        }

        // Supply Chain Alert
        if (this.microData.supplyChainDelay > 14) {
            this.alerts.push('WARNING: Severe Supply Chain Delays (>14 days)');
        }

        // Returns Alert
        if (this.microData.returnRate > 5) {
            this.alerts.push('WARNING: Product Return Rate Spike');
        }

        // Payment Delay Alert (DSO)
        if (this.microData.latePaymentRate > 15) {
            this.alerts.push('RISK: Significant Customer Payment Delays');
        }

        this.inputResult.alerts = this.alerts;
    }

    // 5. Generate Final Result
    public generateAdjustedResults(): Partial<SimulationPoint> {
        this.adjustRevenueForCustomerBehavior();
        this.adjustCOGSForSupplierBehavior();
        this.adjustInventoryForReturns();
        this.flagOperationalAlerts();
        
        return this.inputResult;
    }

    // Wrapper for orchestration compatibility
    public run(): Partial<SimulationPoint> {
        return this.generateAdjustedResults();
    }
}
