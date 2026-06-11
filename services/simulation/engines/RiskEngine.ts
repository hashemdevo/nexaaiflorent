
import { SimulationPoint, SimulationParameters, RiskEventType, ScenarioType, RiskMetrics } from '../types';
import { MathCore } from '../math/distributions';

export class RiskEngine {
    private inputResult: Partial<SimulationPoint>;
    private params: SimulationParameters;
    private riskEvents: RiskEventType[];
    private scenario: ScenarioType;
    
    // Internal State
    private activeRisks: string[] = [];
    private eventsTriggered: RiskEventType[] = [];

    constructor(
        inputResult: Partial<SimulationPoint>, 
        params: SimulationParameters, 
        riskEvents: RiskEventType[] = [],
        scenario: ScenarioType = 'Base'
    ) {
        this.inputResult = { ...inputResult };
        this.params = params;
        this.riskEvents = riskEvents;
        this.scenario = scenario;
    }

    /**
     * 1. Stochastic Shock Simulation (Monte Carlo Step)
     * Applies standard deviation volatility to the current step's revenue.
     */
    public simulateStochasticShocks(): void {
        if (!this.inputResult.revenue) return;

        const vol = (this.params.volatility || 10) / 100;
        // In a real MC, we'd run this 1000 times. Here we simulate one path of the random walk.
        const noise = MathCore.gaussianRandom(0, vol);
        
        // Apply noise
        this.inputResult.revenue *= (1 + noise);
        
        // Volatility might also impact costs (e.g. urgent fixes)
        if (this.inputResult.cost) {
            // Costs stickiness: they rise easier than they fall
            const costNoise = noise > 0 ? noise * 0.5 : noise * 0.2; 
            this.inputResult.cost *= (1 + costNoise);
        }
    }

    /**
     * 2. Stress Testing
     * Applies determininstic shocks based on scenario selection.
     */
    public applyStressTest(): void {
        let revenueShock = 0;
        let costSpike = 0;

        switch (this.scenario) {
            case 'WorstCase':
                revenueShock = -0.25; // -25% Revenue
                costSpike = 0.10;     // +10% Cost
                break;
            case 'BlackSwan':
                revenueShock = (this.params.blackSwanImpact || -50) / 100;
                costSpike = 0.20;
                this.activeRisks.push('BLACK_SWAN_EVENT');
                break;
            case 'BestCase':
                revenueShock = 0.15;
                costSpike = -0.05;
                break;
            default:
                break;
        }

        // Apply Resilience Mitigation to Negative Shocks
        const resilience = (this.params.operationalResilience || 50) / 100;
        if (revenueShock < 0) {
            // Resilience dampens the blow. 100% resilience = 50% impact reduction (physics rule)
            revenueShock = revenueShock * (1 - (resilience * 0.5));
        }

        // Safety Clamp: Shock cannot be worse than -100% (Revenue -> 0)
        revenueShock = Math.max(-1.0, revenueShock);

        if (this.inputResult.revenue) {
            this.inputResult.revenue *= (1 + revenueShock);
        }
        if (this.inputResult.cost) {
            this.inputResult.cost *= (1 + costSpike);
        }
    }

    /**
     * 3. Discrete Risk Event Injection
     * Iterates through potential risks (Cyber, Supply Chain) and checks probability.
     */
    public applyRiskEvents(): void {
        this.riskEvents.forEach(event => {
            const prob = event.probability || 0.01;
            // Roll dice
            if (Math.random() < prob) {
                // Event Occurred
                // Clamp impact to max 1.0 (100%) to prevent sign inversion
                const impact = Math.min(1.0, event.magnitude / 100); 
                
                // Impact Logic based on Type
                if (event.type === 'Market' || event.type === 'Macro') {
                    if (this.inputResult.revenue) {
                        // Apply reduction (1 - impact)
                        // If catastrophic (impact 1.0), revenue becomes 0
                        this.inputResult.revenue *= (1 - impact);
                    }
                } else if (event.type === 'Operational' || event.type === 'Regulatory') {
                    if (this.inputResult.cost) {
                        this.inputResult.cost *= (1 + impact);
                    }
                }

                this.activeRisks.push(event.name);
                this.eventsTriggered.push(event);
            }
        });
    }

    /**
     * 4. Calculate Value at Risk (VaR)
     * Estimates potential max loss at 95% confidence for this period.
     */
    public calculateVaR(): number {
        if (!this.inputResult.revenue) return 0;
        
        // Parametric VaR (Normal Distribution assumption)
        // VaR = Exposure * Volatility * Z-Score(95%)
        // Z-Score for 95% = 1.645
        
        const exposure = this.inputResult.revenue;
        const vol = (this.params.volatility || 15) / 100;
        const zScore = 1.645;
        
        return exposure * vol * zScore;
    }

    /**
     * 5. Generate Alerts
     */
    public generateRiskAlerts(): void {
        if (this.scenario === 'BlackSwan') {
            this.activeRisks.push('CRITICAL: Black Swan Scenario Active');
        }
        
        // Insolvency Check
        if (this.inputResult.cashBalance && this.inputResult.cashBalance < 0) {
            this.activeRisks.push('INSOLVENCY_WARNING: Negative Cash Balance');
        }

        // Margin Call Check
        if (this.inputResult.grossProfit && this.inputResult.revenue) {
            const margin = this.inputResult.grossProfit / this.inputResult.revenue;
            if (margin < 0.15) {
                this.activeRisks.push('MARGIN_COMPRESSION: Gross Margin < 15%');
            }
        }
    }

    /**
     * 6. Generate Final Result
     */
    public generateRiskResults(): Partial<SimulationPoint> {
        this.simulateStochasticShocks();
        this.applyStressTest();
        this.applyRiskEvents();
        this.generateRiskAlerts();

        const vaR = this.calculateVaR();
        const stressLoss = (this.inputResult.revenue || 0) * 0.25; // Approximate stress loss

        const riskMetrics: RiskMetrics = {
            valueAtRisk: vaR,
            stressTestLoss: stressLoss,
            volatilityScore: this.params.volatility,
            riskAdjustedRevenue: (this.inputResult.revenue || 0) - vaR // Conservatism
        };

        return {
            ...this.inputResult,
            activeRisks: this.activeRisks,
            riskMetrics
        };
    }

    // Wrapper for compatibility
    public run(): Partial<SimulationPoint> {
        return this.generateRiskResults();
    }
}
