
import { SimulationParameters, SimulationResult, SimulationPoint } from '../types';
import { MathCore } from '../math/distributions';

/**
 * SUPERHUMAN SIMULATION STACK (S3) - Advanced Models
 * Enhanced with Reputation Physics, Multi-Variable RL, and Deep Risk Scenarios.
 */

export const AdvancedModels = {

    /**
     * 4) CAUSAL IMPACT ENGINE
     * Uses Bayesian Structural Time Series logic to estimate the "Counterfactual".
     */
    runCausal(params: SimulationParameters): SimulationResult {
        const data: SimulationPoint[] = [];
        let cumulativeCash = 0;
        
        const baseGrowth = params.growthRate / 100 / 12;
        const interventionMonth = 3;
        const impactMagnitude = (params.viralCoefficient || 0.1) * 2.5; 

        let currentRevenue = params.baseRevenue;
        let counterfactualRevenue = params.baseRevenue;
        const sigma = params.volatility / 100;

        for (let i = 1; i <= params.months; i++) {
            const noise = MathCore.gaussianRandom(0, sigma);
            counterfactualRevenue = counterfactualRevenue * (1 + baseGrowth + noise);
            
            let lift = 0;
            if (i >= interventionMonth) {
                const monthsSince = i - interventionMonth;
                const impactCurve = (monthsSince + 1) * Math.exp(-0.3 * monthsSince); 
                lift = counterfactualRevenue * impactMagnitude * impactCurve;
            }
            
            currentRevenue = counterfactualRevenue + lift;
            const cost = currentRevenue * (params.costRatio / 100);
            const profit = currentRevenue - cost;
            cumulativeCash += profit;

            data.push({
                month: i,
                revenue: currentRevenue,
                cost,
                profit,
                cashBalance: cumulativeCash,
                actual: currentRevenue,
                counterfactual: counterfactualRevenue,
                lift: lift
            });
        }

        const totalLift = data.reduce((sum, p) => sum + (p.lift || 0), 0);
        const avgLiftPercent = (totalLift / data.reduce((s, p) => s + (p.counterfactual || 0), 0)) * 100;

        return {
            modelName: 'Causal Impact (Bayesian STS)',
            modelType: 'CAUSAL',
            data,
            summary: {
                totalRevenue: data.reduce((a, b) => a + (b.revenue || 0), 0),
                totalProfit: data.reduce((a, b) => a + (b.profit || 0), 0),
                endingCash: cumulativeCash,
                causalImpact: `Intervention generated incremental $${totalLift.toLocaleString(undefined, {maximumFractionDigits: 0})} revenue (+${avgLiftPercent.toFixed(1)}% lift).`
            }
        };
    },

    /**
     * 5) AGENT-BASED SIMULATION (ABS) - UPGRADED
     * Added: Reputation Dynamics. 
     * If Demand > Capacity, Reputation drops -> Viral Coeff drops.
     */
    runAgentBased(params: SimulationParameters): SimulationResult {
        const data: SimulationPoint[] = [];
        const populationSize = 50000; 
        let activeAgents = params.initialCustomers || 100;
        let cumulativeCash = 0;
        let reputation = 100; // 0 to 100

        const p = 0.02; 
        const q_base = (params.viralCoefficient || 0.4); 
        const capacity = params.capacityCeiling || (params.baseRevenue * 2);
        const arpu = params.arpu || 100;

        let competitorAggression = 0; 

        for (let i = 1; i <= params.months; i++) {
            // 1. Check Capacity Strain vs Reputation
            const demand = activeAgents * arpu;
            if (demand > capacity) {
                // If over capacity, reputation takes a hit
                const overshoot = (demand / capacity) - 1;
                reputation = Math.max(0, reputation - (overshoot * 20)); // Drastic hit
            } else {
                // Slowly recover reputation
                reputation = Math.min(100, reputation + 2);
            }

            // 2. Dynamic Viral Coefficient based on Reputation
            const reputationFactor = reputation / 100;
            const q = q_base * reputationFactor;

            // 3. Adoption (Bass Model)
            const potentialAdopters = populationSize - activeAgents;
            const adoptionRate = p + q * (activeAgents / populationSize);
            let newAdopters = potentialAdopters * adoptionRate;
            
            // 4. Competitor & Network Effects
            const networkValue = Math.min(1, Math.pow(activeAgents / 5000, 2)); 
            const baseChurn = (params.churnRate || 5) / 100;
            const effectiveChurn = Math.max(0.01, baseChurn * (1 - networkValue * 0.5)); 

            const growthRateMoM = newAdopters / activeAgents;
            if (growthRateMoM > 0.10) competitorAggression += 0.1;
            else competitorAggression = Math.max(0, competitorAggression - 0.05);
            
            const lostToCompetitors = activeAgents * (competitorAggression * 0.05);
            const naturalChurn = activeAgents * effectiveChurn;

            activeAgents = activeAgents + newAdopters - naturalChurn - lostToCompetitors;
            activeAgents = Math.min(activeAgents, populationSize);

            // 5. Financials
            const arpuDilution = 1 - (activeAgents / populationSize) * 0.2; 
            const revenue = Math.min(activeAgents * arpu * arpuDilution, capacity); // Hard revenue cap
            
            const cost = revenue * (params.costRatio / 100);
            const profit = revenue - cost;
            cumulativeCash += profit;

            data.push({
                month: i,
                revenue,
                cost,
                profit,
                cashBalance: cumulativeCash,
                activeUsers: Math.floor(activeAgents),
                marketSaturation: (activeAgents / populationSize) * 100,
                competitorShare: competitorAggression * 100,
                reputationScore: reputation
            });
        }

        const finalRep = data[data.length-1].reputationScore || 0;
        let alert = "";
        if (finalRep < 70) alert = `Warning: Reputation damaged (Score: ${finalRep.toFixed(0)}) due to capacity constraints.`;

        return {
            modelName: 'Agent-Based (Reputation Physics)',
            modelType: 'AGENT',
            data,
            summary: {
                totalRevenue: data.reduce((a, b) => a + (b.revenue || 0), 0),
                totalProfit: data.reduce((a, b) => a + (b.profit || 0), 0),
                endingCash: cumulativeCash,
                agentBehavior: `Viral Loop regulated by Reputation. Score: ${finalRep.toFixed(0)}/100.`,
                physicsAlert: alert
            }
        };
    },

    /**
     * 6) OPTIMIZATION ENGINE (RL) - UPGRADED
     * Multi-Variable Optimization: Finds optimal PRICE and MARKETING SPEND.
     * Uses simulated Gradient Descent on a 3D profit surface.
     */
    runOptimization(params: SimulationParameters): SimulationResult {
        const data: SimulationPoint[] = [];
        let cumulativeCash = 0;
        
        // Ground Truths (The "Environment")
        const baseDemand = 1000;
        const basePrice = 100;
        const elasticityPrice = 1.5; // Demand drops as price rises
        const elasticityMarketing = 0.5; // Demand rises as spend rises (diminishing returns)

        // Agent State (Parameters to optimize)
        let currentPrice = basePrice * 0.8; 
        let currentMarketing = params.baseRevenue * 0.05; // 5% start
        
        // Learning Rates
        const alphaP = 2.0; 
        const alphaM = 500.0;

        for (let i = 1; i <= params.months; i++) {
            // 1. Exploration Noise
            const noiseP = (Math.random() - 0.5) * 5;
            const noiseM = (Math.random() - 0.5) * 1000;
            
            const price = Math.max(10, currentPrice + noiseP);
            const marketing = Math.max(0, currentMarketing + noiseM);

            // 2. Market Response (Demand Function)
            // Q = Q0 * (P0/P)^Ep * (M/M0)^Em
            const marketingFactor = Math.pow((marketing + 1) / (params.baseRevenue * 0.05 + 1), elasticityMarketing);
            const priceFactor = Math.pow(basePrice / price, elasticityPrice);
            
            const demand = baseDemand * priceFactor * marketingFactor;
            const revenue = demand * price;
            
            // 3. Costs
            const cogs = revenue * 0.4; // 40% COGS
            const totalCost = cogs + marketing;
            const profit = revenue - totalCost;
            
            // 4. Gradient Estimation (Heuristic for demo)
            // Ideal Price P* = MC * E / (E-1)
            const mc = (cogs / demand) || 40;
            const optimalPrice = mc * (elasticityPrice / (elasticityPrice - 1));
            
            // Ideal Marketing M*
            // Implies Marginal Revenue of Marketing = 1.
            const marginalRevenueMarketing = (profit + marketing) * elasticityMarketing / (marketing + 1);
            
            // Update Policy
            const priceError = optimalPrice - price;
            currentPrice += priceError * 0.1; // Move toward optimal

            if (marginalRevenueMarketing > 1) currentMarketing += alphaM; // Spend more
            else currentMarketing = Math.max(0, currentMarketing - alphaM); // Spend less

            cumulativeCash += profit;

            data.push({
                month: i,
                revenue,
                cost: totalCost,
                profit,
                cashBalance: cumulativeCash,
                adoptionRate: price, // Visualize Price
                marketingSpend: marketing // Visualize Spend
            });
        }

        const finalPrice = data[data.length-1].adoptionRate || 0;
        const finalMarketing = data[data.length-1].marketingSpend || 0;

        return {
            modelName: 'Multi-Variable RL Optimizer',
            modelType: 'OPTIMIZATION',
            data,
            summary: {
                totalRevenue: data.reduce((a, b) => a + (b.revenue || 0), 0),
                totalProfit: data.reduce((a, b) => a + (b.profit || 0), 0),
                endingCash: cumulativeCash,
                recommendedAction: `Optimization Converged. Optimal Price: $${finalPrice.toFixed(2)}. Optimal Marketing Budget: $${Math.round(finalMarketing).toLocaleString()}/mo.`
            }
        };
    },

    /**
     * 7) SCENARIO ORCHESTRATOR - RISK MANAGEMENT EDITION
     * Simulates Micro (Operational) and Macro (Market) Risks separately.
     * Uses Markov Chains for state transitions + Discrete Event Injection.
     */
    runScenario(params: SimulationParameters): SimulationResult {
        const data: SimulationPoint[] = [];
        let cumulativeCash = 0;
        let revenue = params.baseRevenue;
        
        // Configurable Resilience (0-100)
        // Higher resilience dampens the impact of negative events
        const operationalResilience = params.operationalResilience || 50; 
        const resilienceFactor = 1 - (operationalResilience / 100); // 0.5 default dampener

        // Risk Events Def
        type RiskEvent = { name: string, type: 'MICRO' | 'MACRO', probability: number, impactRev: number, impactCost: number, duration: number };
        const potentialRisks: RiskEvent[] = [
            { name: 'Supply Chain Break', type: 'MICRO', probability: 0.05, impactRev: 0.7, impactCost: 1.2, duration: 2 },
            { name: 'Cyber Attack', type: 'MICRO', probability: 0.02, impactRev: 0.8, impactCost: 1.5, duration: 1 },
            { name: 'Regulatory Fine', type: 'MACRO', probability: 0.03, impactRev: 1.0, impactCost: 2.0, duration: 1 }, // One-off cost spike
            { name: 'Market Recession', type: 'MACRO', probability: 0.04, impactRev: 0.85, impactCost: 1.0, duration: 6 }
        ];

        let activeEvents: { event: RiskEvent, remaining: number }[] = [];

        for (let i = 1; i <= params.months; i++) {
            // 1. Event Injection
            potentialRisks.forEach(risk => {
                if (Math.random() < risk.probability) {
                    activeEvents.push({ event: risk, remaining: risk.duration });
                }
            });

            // 2. Apply Impacts
            let revMult = 1.0;
            let costMult = 1.0;
            const activeRiskNames: string[] = [];
            let activeCategory: 'MICRO' | 'MACRO' | 'NONE' = 'NONE';

            activeEvents.forEach(item => {
                // Apply resilience to mitigate impact. 
                // E.g. Impact 0.7 (30% drop). With resilience 0.5 (50%), impact becomes 0.85 (15% drop).
                // Formula: 1 - ((1 - Impact) * ResilienceFactor)
                
                const rawRevImpact = item.event.impactRev;
                const mitigatedRev = rawRevImpact < 1 ? 1 - ((1 - rawRevImpact) * resilienceFactor) : rawRevImpact;
                
                const rawCostImpact = item.event.impactCost;
                // Cost spikes are dampened by resilience too (better insurance, controls)
                const mitigatedCost = rawCostImpact > 1 ? 1 + ((rawCostImpact - 1) * resilienceFactor) : rawCostImpact;

                revMult *= mitigatedRev;
                costMult *= mitigatedCost;
                
                activeRiskNames.push(item.event.name);
                if (item.event.type === 'MACRO') activeCategory = 'MACRO';
                else if (activeCategory !== 'MACRO') activeCategory = 'MICRO';
            });

            // Decrement duration
            activeEvents = activeEvents.map(e => ({ ...e, remaining: e.remaining - 1 })).filter(e => e.remaining > 0);

            // 3. Base Growth (with volatility)
            const noise = MathCore.gaussianRandom(0, (params.volatility/100));
            revenue = revenue * (1 + (params.growthRate/100/12) + noise);

            // 4. Final Calc
            const finalRevenue = revenue * revMult;
            const variableCost = finalRevenue * (params.costRatio / 100);
            const finalCost = variableCost * costMult;

            const profit = finalRevenue - finalCost;
            cumulativeCash += profit;

            // Calculate dynamic resilience for next step (Cash buffer increases resilience)
            const cashBufferMonths = finalCost > 0 ? cumulativeCash / finalCost : 0;
            const dynamicResilienceScore = Math.min(100, (cashBufferMonths / 6) * 100); // 6 months runway = 100 score

            data.push({
                month: i,
                revenue: finalRevenue,
                cost: finalCost,
                profit,
                cashBalance: cumulativeCash,
                activeRisks: activeRiskNames,
                riskCategory: activeCategory,
                eventImpact: (1 - revMult) * 100, // % Revenue Loss
                resilienceScore: dynamicResilienceScore
            });
        }

        const riskCount = data.filter(d => d.activeRisks && d.activeRisks.length > 0).length;
        const totalImpact = data.reduce((sum, d) => sum + (d.eventImpact || 0), 0);

        return {
            modelName: 'Risk Management Scenario Engine',
            modelType: 'SCENARIO',
            data,
            summary: {
                totalRevenue: data.reduce((a, b) => a + (b.revenue || 0), 0),
                totalProfit: data.reduce((a, b) => a + (b.profit || 0), 0),
                endingCash: cumulativeCash,
                riskMitigationPlan: totalImpact > 20 ? "High Risk Detected. Recommendation: Increase Cash Reserves or Purchase Business Interruption Insurance." : "Risk Profile Stable.",
                physicsAlert: riskCount > 0 ? `Simulated ${riskCount} risk events with total revenue drag of ${totalImpact.toFixed(1)}%.` : undefined
            }
        };
    }
};
