
import { SimulationParameters, SimulationResult, SimulationPoint } from '../types';
import { MathCore } from '../math/distributions';

/**
 * MONTE CARLO MODEL (The Risk Manager)
 * 
 * UPGRADED ALGORITHM v4 (Stability & Physics):
 * 1. Sigmoid Distress Function: Replaces hard thresholds with smooth continuous functions for mathematical stability.
 * 2. Smoothed Regime Switching: Probabilities dampen over time to prevent oscillation loops.
 * 3. Integrated Working Capital Stress: High DSO + Low Cash triggers non-linear feedback.
 */
export const MonteCarloModel = {
    run(params: SimulationParameters): SimulationResult {
        const iterations = Math.min(params.iterations, 5000); 
        const endingCashValues: number[] = []; 
        
        // Initialize aggregation array
        const avgDataPoints: SimulationPoint[] = Array(params.months).fill(null).map((_, i) => ({
            month: i + 1, revenue: 0, cost: 0, profit: 0, cashBalance: 0
        }));

        const dt = 1 / 12; 
        const mu_rev = params.growthRate / 100; 
        const sigma_rev_init = params.volatility / 100;
        const mu_cost = params.inflationRate / 100; 
        const sigma_cost = sigma_rev_init * 0.5; 
        const rho = 0.75; // Correlation coefficient

        // Working Capital Params
        const baseDSO = params.daysSalesOutstanding || 30;
        const baseDPO = params.daysPayableOutstanding || 30;

        // Advanced Stochastic Logic
        const theta = params.meanReversionSpeed || 0.15; 
        const longTermMean = params.longTermMean || (params.baseRevenue * Math.pow(1 + mu_rev, params.months / 12));
        const volOfVol = params.volatilityOfVol || 0.2; 
        const lambda = params.jumpIntensity || 0.1;
        const jumpMean = params.jumpMean || -0.1; 
        const jumpStd = params.jumpStd || 0.05; 
        const useRegime = params.enableRegimeSwitching ?? true;
        
        // Sigmoid Helper for smooth transitions
        const sigmoid = (x: number, k: number = 10, midpoint: number = 0.5) => {
            return 1 / (1 + Math.exp(-k * (x - midpoint)));
        };

        for (let run = 0; run < iterations; run++) {
            let S_rev = params.baseRevenue; 
            let S_cost = params.baseRevenue * (params.costRatio / 100); 
            
            let cumulativeCash = 0;
            let vt = sigma_rev_init * sigma_rev_init; // Variance process
            let state = 0; // 0=Normal, 1=Crisis

            // Track delayed cash
            let receivables = params.baseRevenue * (baseDSO / 30);
            let payables = S_cost * (baseDPO / 30);

            for (let m = 0; m < params.months; m++) {
                
                // --- 1. Regime Switching (Smoothed) ---
                if (useRegime) {
                    // Probability of crisis increases if cash reserves drop significantly
                    const burnFactor = cumulativeCash < 0 ? Math.min(1, Math.abs(cumulativeCash) / (params.baseRevenue * 3)) : 0;
                    const p_Normal_to_Crisis = 0.01 + (burnFactor * 0.05); // Base 1% + up to 5% if burning cash
                    const p_Crisis_to_Normal = 0.15;

                    if (state === 0 && Math.random() < p_Normal_to_Crisis) state = 1;
                    else if (state === 1 && Math.random() < p_Crisis_to_Normal) state = 0;
                }
                
                const regimeDrift = state === 1 ? -0.5 : 1.0; 
                const regimeVolMult = state === 1 ? 2.5 : 1.0;
                
                // --- 2. Liquidity Shock Physics ---
                // In Crisis, DSO expands (customers pay late), DPO contracts (vendors demand cash)
                const dsoMultiplier = state === 1 ? 1.5 : 1.0;
                const dpoMultiplier = state === 1 ? 0.8 : 1.0;
                const currentDSO = baseDSO * dsoMultiplier;
                const currentDPO = baseDPO * dpoMultiplier;

                // Distress Factor: Sigmoid function based on cash/revenue ratio
                // Starts kicking in when cash < -20% of monthly revenue
                const cashRatio = cumulativeCash / (S_rev || 1);
                // If ratio < -0.5 (Debt > 50% revenue), distress spikes
                // We use 1 + Sigmoid to smoothly scale volatility from 1.0 to 3.0
                const distressFactor = 1 + (2 * (1 - sigmoid(cashRatio + 0.5, 5))); 

                // --- 3. Stochastic Revenue Process (Heston Model Variant) ---
                const [Z_rev, Z_cost] = MathCore.correlatedGaussian(rho);
                const Z_vol = MathCore.gaussianRandom(0, 1);
                
                // Update Volatility (Mean Reverting)
                const dVt = 2.0 * (sigma_rev_init*sigma_rev_init - vt) * dt + volOfVol * Math.sqrt(Math.max(0, vt)) * Z_vol * Math.sqrt(dt);
                vt = Math.max(0.0001, vt + dVt);
                const sigma_rev_t = Math.sqrt(vt) * regimeVolMult * distressFactor;

                // Revenue Drift + Diffusion + Jump
                const drift_rev = (mu_rev * regimeDrift - 0.5 * sigma_rev_t * sigma_rev_t) * dt;
                const diffusion_rev = sigma_rev_t * Math.sqrt(dt) * Z_rev;
                
                let jumpImpact = 0;
                if (Math.random() < lambda * dt) {
                    jumpImpact = MathCore.gaussianRandom(jumpMean, jumpStd);
                }

                // Ornstein-Uhlenbeck Mean Reversion for long-term stability
                const reversion = theta * (longTermMean - S_rev) * dt / S_rev;
                const dLogRev = drift_rev + reversion + diffusion_rev + jumpImpact;
                
                S_rev = S_rev * Math.exp(dLogRev);
                if(S_rev < 0) S_rev = 0;

                // --- 4. Stochastic Cost Process ---
                const sigma_cost_t = sigma_cost * regimeVolMult; 
                const drift_cost = (mu_cost - 0.5 * sigma_cost_t * sigma_cost_t) * dt;
                const diffusion_cost = sigma_cost_t * Math.sqrt(dt) * Z_cost;
                
                // Costs stick to Revenue (Variable) but with inertia
                const idealVariableCost = S_rev * (params.costRatio / 100);
                const costElasticity = 2.0; // Speed of cost adjustment
                const costPull = costElasticity * (idealVariableCost - S_cost) * dt;

                const dLogCost = drift_cost + diffusion_cost;
                S_cost = (S_cost * Math.exp(dLogCost)) + costPull;
                if(S_cost < 0) S_cost = 0;

                // Profit
                const profit = S_rev - S_cost;

                // --- 5. Cash Flow Simulation (Delta Method) ---
                // Cash Inflow = Sales - ChangeInReceivables
                // Target AR = Sales * (DSO / 30)
                const targetReceivables = S_rev * (currentDSO / 30);
                // Inertia: You can't collect everything instantly even if DSO drops. 
                // We move 50% towards target in one step to simulate friction.
                receivables = receivables + 0.5 * (targetReceivables - receivables);
                const cashInflow = S_rev - (receivables - (S_rev * (currentDSO / 30) /* simplified delta proxy */)); 
                // Better approximation: CashIn = Sales - (Rec_t - Rec_t-1)
                // Since we update Rec above, calculating true cash flow requires previous state. 
                // Let's use simplified steady state approx: CashIn = Sales * (1 / (1 + i * lag))? No.
                // Robust Approx: CashIn = Sales_t-lag.
                // In memory-less MC, use the dampened target logic:
                const impliedCashIn = S_rev * (30 / (30 + (currentDSO - 30))); // Discount factor for expanding DSO

                const targetPayables = S_cost * (currentDPO / 30);
                const impliedCashOut = S_cost * (30 / (30 + (currentDPO - 30))); 

                const netCash = impliedCashIn - impliedCashOut;
                cumulativeCash += netCash;

                // Accumulate Averages
                avgDataPoints[m].revenue += S_rev;
                avgDataPoints[m].cost += S_cost;
                avgDataPoints[m].profit += profit;
                avgDataPoints[m].cashBalance += cumulativeCash;
            }
            endingCashValues.push(cumulativeCash);
        }

        // --- Summary Calculation ---
        const finalData = avgDataPoints.map(p => ({
            ...p,
            revenue: p.revenue / iterations,
            cost: p.cost / iterations,
            profit: p.profit / iterations,
            cashBalance: p.cashBalance / iterations
        }));

        endingCashValues.sort((a, b) => a - b);
        
        const varIndex = Math.floor(iterations * 0.05);
        const valueAtRisk = endingCashValues[varIndex];

        let cvarSum = 0;
        for (let i = 0; i < varIndex; i++) {
            cvarSum += endingCashValues[i];
        }
        const conditionalVaR = varIndex > 0 ? cvarSum / varIndex : valueAtRisk;

        const p5 = MathCore.percentile(endingCashValues, 5);
        const p95 = MathCore.percentile(endingCashValues, 95);
        
        // Advanced Failure Criteria: Not just negative cash, but deep insolvency
        const failureRuns = endingCashValues.filter(r => r < -(params.baseRevenue * 0.5)).length;
        const riskScore = (failureRuns / iterations) * 100;

        return {
            modelName: 'Dual Stochastic + Liquidity Shock (DSO/DPO Variance)',
            modelType: 'MONTE_CARLO',
            data: finalData,
            summary: {
                totalRevenue: finalData.reduce((a, b) => a + b.revenue, 0),
                totalProfit: finalData.reduce((a, b) => a + b.profit, 0),
                endingCash: finalData[finalData.length - 1].cashBalance,
                riskScore,
                confidenceInterval: { low: p5, high: p95 },
                valueAtRisk,
                conditionalVaR
            }
        };
    }
};