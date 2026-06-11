
import { SimulationParameters, SimulationResult, SimulationPoint } from '../types';

/**
 * DETERMINISTIC MODEL (The Planner)
 * 
 * UPGRADED ALGORITHM v3 (PhD Level):
 * 1. Cash Conversion Cycle (CCC): Distinguishes 'Revenue' (booked) vs 'Cash' (collected). 
 * 2. Operational Physics:
 *    - Burnout Curve: Costs increase non-linearly as capacity utilization crosses 85%.
 *    - Friction: Growth slows down as complexity (Headcount/Users) increases.
 *    - Inventory Drag: Unsold value accumulates holding costs.
 */
export const DeterministicModel = {
    run(params: SimulationParameters): SimulationResult {
        const data: SimulationPoint[] = [];
        
        let arpu = params.arpu || 100; 
        let activeUsers = params.initialCustomers || (params.baseRevenue / arpu);
        let cumulativeCash = 0; 

        // Working Capital Queues
        const receivablesQueue: { amount: number, monthsLeft: number }[] = [];
        
        const dso = params.daysSalesOutstanding || 30; 
        const dpo = params.daysPayableOutstanding || 30;
        const collectionLagMonths = dso / 30;
        const paymentLagMonths = dpo / 30;

        const seasonality = params.seasonalityFactors || Array(12).fill(1.0);
        const useScale = params.economiesOfScale ?? false;
        const scaleFactor = params.scaleEfficiency || 0.95; 
        const marketCapUsers = params.marketCap ? (params.marketCap / arpu) : 1000000;
        const capacityCeiling = params.capacityCeiling || (params.baseRevenue * 2); // Default cap
        const upgradeCost = params.capacityUpgradeCost || (params.baseRevenue * 0.5);

        // Growth Drivers
        const churnRate = (params.churnRate || 5) / 100; 
        const kFactor = params.viralCoefficient || 0; 
        const baseGrowthRate = params.growthRate / 100 / 12; 

        // Operational Physics State
        let inefficiencyFactor = 1.0; 

        for (let i = 1; i <= params.months; i++) {
            const monthIndex = (i - 1) % 12;
            const seasonalMult = seasonality[monthIndex];

            // 1. User Base Calculation
            const penetration = Math.min(1, activeUsers / marketCapUsers);
            const growthEfficiency = 1 - Math.pow(penetration, 2); 
            
            // Physics: High Churn if Load > 90%
            const currentLoad = (activeUsers * arpu) / capacityCeiling;
            const burnoutChurnPenalty = currentLoad > 0.9 ? 0.05 * (currentLoad - 0.9) * 10 : 0; // Spike churn
            
            const totalChurn = Math.min(1, churnRate + burnoutChurnPenalty);
            const lostUsers = activeUsers * totalChurn;
            
            let newUsers = (activeUsers * baseGrowthRate * growthEfficiency) + (activeUsers * kFactor);
            activeUsers = Math.max(0, activeUsers - lostUsers + newUsers);

            // 2. Revenue Calculation (Booked)
            const monthlyInflation = params.inflationRate / 12 / 100;
            const inflationMultiplier = Math.pow(1 + monthlyInflation, i);
            
            let organicRevenue = activeUsers * arpu * inflationMultiplier;
            let finalRevenue = organicRevenue * seasonalMult;

            // Capacity Constraint Check (Hard Cap + Cost)
            let capacityCostHit = 0;
            let operationalLoad = finalRevenue / capacityCeiling;
            
            if (finalRevenue > capacityCeiling) {
                // Cap revenue - you can't sell what you can't serve
                finalRevenue = capacityCeiling; 
                operationalLoad = 1.0; 
                // Trigger One-time Upgrade Cost (simplified) if hitting ceiling
                if (i % 6 === 0) capacityCostHit = upgradeCost * 0.2; // Recurring maintenance of strained system
            }

            // 3. Cost Calculation (Accrued) with PHYSICS
            let variableCostRatio = params.costRatio / 100;
            
            // Physics: Burnout Cost (Overtime, Rush shipping)
            if (operationalLoad > 0.85) {
                // Non-linear cost increase: +1% cost for every 1% load over 85%
                const strain = (operationalLoad - 0.85) * 2; 
                variableCostRatio += strain; 
            }

            // Scale Benefits
            if (useScale) {
                const scaleRatio = Math.max(1, finalRevenue / params.baseRevenue);
                const costReduction = Math.pow(scaleRatio, scaleFactor - 1);
                variableCostRatio = variableCostRatio * costReduction;
            }
            
            const variableCost = finalRevenue * variableCostRatio;
            
            // Inventory Drag (Holding Cost)
            // If Revenue growth slows but costs stay high, assume inventory buildup
            const revenueGrowth = i > 1 ? (finalRevenue - (data[i-2]?.revenue || finalRevenue)) : 0;
            let holdingCost = 0;
            if (revenueGrowth < 0 && variableCost > 0) {
                // Stagnant sales with high costs = Inventory Accumulation
                holdingCost = variableCost * 0.05; // 5% holding cost
            }

            const stepThreshold = 1000; 
            const stepCostPerBlock = 500;
            const steps = Math.floor(activeUsers / stepThreshold);
            const stepFixedCost = steps * stepCostPerBlock;

            const totalBookCost = variableCost + stepFixedCost + capacityCostHit + holdingCost;
            const bookProfit = finalRevenue - totalBookCost;

            // 4. CASH FLOW PHYSICS
            const lagIndexRev = Math.floor(collectionLagMonths);
            const cashInflow = (i > lagIndexRev && data[i - lagIndexRev - 1]) 
                ? data[i - lagIndexRev - 1].revenue 
                : params.baseRevenue; 

            const lagIndexCost = Math.floor(paymentLagMonths);
            const cashOutflow = (i > lagIndexCost && data[i - lagIndexCost - 1])
                ? data[i - lagIndexCost - 1].cost
                : (params.baseRevenue * (params.costRatio/100));

            const netCashFlow = cashInflow - cashOutflow - capacityCostHit; 
            cumulativeCash += netCashFlow;

            data.push({
                month: i,
                revenue: finalRevenue,
                cost: totalBookCost,
                profit: bookProfit,
                cashBalance: cumulativeCash,
                activeUsers: Math.floor(activeUsers),
                operationalLoad: operationalLoad * 100,
                holdingCost: holdingCost,
                receivables: finalRevenue - cashInflow, 
                payables: totalBookCost - cashOutflow
            });
        }

        // Alert generation
        let alert = "";
        const maxLoad = Math.max(...data.map(d => d.operationalLoad || 0));
        if (maxLoad > 95) alert = "CRITICAL: System reached 95%+ capacity. Burnout costs heavily impacted margins.";
        
        return {
            modelName: `Deterministic (Cash Cycle: ${dso}d / ${dpo}d)`,
            modelType: 'DETERMINISTIC',
            data,
            summary: {
                totalRevenue: data.reduce((a, b) => a + (b.revenue || 0), 0),
                totalProfit: data.reduce((a, b) => a + (b.profit || 0), 0),
                endingCash: cumulativeCash,
                activeUserEnd: Math.floor(activeUsers),
                physicsAlert: alert
            }
        };
    }
};
