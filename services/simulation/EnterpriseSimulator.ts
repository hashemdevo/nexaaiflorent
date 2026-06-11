
import { SimulationParameters, SimulationResult, SimulationPoint, ERIInputData, MacroDataType, MicroDataType, RiskEventType } from './types';
import { AccountingCoreEngine } from './engines/AccountingCoreEngine';
import { MacroEngine } from './engines/MacroEngine';
import { MicroEngine } from './engines/MicroEngine';
import { RiskEngine } from './engines/RiskEngine';
import { InvestigationEngine } from './engines/InvestigationEngine';
import { MathCore } from './math/distributions';

export const EnterpriseSimulator = {
    run(params: SimulationParameters): SimulationResult {
        const data: SimulationPoint[] = [];
        const flags: string[] = [];
        
        let currentUsers = params.initialCustomers || (params.baseRevenue / (params.arpu || 100));
        
        // Use real starting cash if provided, else start from 0 (delta mode)
        let cumulativeCash = params.initialCash || 0;
        
        // --- DEEP STATE VARIABLES (Memory) ---
        let reputationScore = 100; // 0-100, affects Churn & Acquisition
        let systemHealth = 100;    // 0-100, affects Cost efficiency
        let competitorAggression = params.marketForces?.competitorAggression || 1.0; 
        
        // Base Unit Economics
        const arpu = params.arpu || 100;
        
        // 1. Initialize Accounting Core
        const accountingInput: ERIInputData = {
            revenue: params.baseRevenue,
            cogs: params.baseRevenue * ((params.costRatio || 60) / 100) * 0.4,
            opex: params.baseRevenue * ((params.costRatio || 60) / 100) * 0.6,
            capex: 0,
            taxRate: params.taxRate || 20,
            inventory: params.inventoryLevel || 0,
            arDays: params.daysSalesOutstanding || 30,
            apDays: params.daysPayableOutstanding || 30,
            resilienceScore: params.operationalResilience,
            volatility: params.volatility
        };
        const accountingEngine = new AccountingCoreEngine(accountingInput, 'Base');

        // 2. Initialize Micro Engine Data (Dynamic)
        const microData: MicroDataType = {
            churnRate: params.churnRate || 5,
            latePaymentRate: 5, // Default start
            returnRate: 2,
            supplyChainDelay: 0,
            employeeTurnover: 5,
            orderVolumeChanges: { 'cust-001': -5, 'cust-002': 2 },
            productReturns: { 'prod-A': 1.5, 'prod-B': 3.0 }
        };

        // 3. Initialize Macro Engine Data
        const macroData: MacroDataType = {
            inflationRate: params.inflationRate,
            interestRate: params.interestRate || 5,
            fxRate: 1.0,
            commodityPrices: { "Oil": 80 },
            regulatoryCosts: 0
        };

        // 4. Initialize Risk Events Pool
        const riskEvents: RiskEventType[] = [
            { name: 'Supply Chain Break', type: 'Operational', magnitude: 30, probability: 0.02, severity: 'MEDIUM' },
            { name: 'Cyber Attack', type: 'Operational', magnitude: 15, probability: 0.01, severity: 'HIGH' },
            { name: 'Regulatory Fine', type: 'Regulatory', magnitude: 10, probability: 0.05, severity: 'HIGH' },
            { name: 'Market Crash', type: 'Market', magnitude: 40, probability: 0.005, severity: 'CATASTROPHIC' },
            { name: 'Server Outage', type: 'Operational', magnitude: 25, probability: 0.03, severity: 'MEDIUM' } 
        ];

        for (let i = 1; i <= params.months; i++) {
            let activeAutoActions: string[] = [];

            // --- A. Market Dynamics & Competition (Adaptive Churn) ---
            
            // Competitor Reaction: If we grow fast (>5% MoM), competitors aggressive (+10% impact)
            const growthRate = data.length > 0 ? (currentUsers - data[data.length-1].activeUsers!) / data[data.length-1].activeUsers! : 0;
            if (growthRate > 0.05) competitorAggression = Math.min(2.0, competitorAggression + 0.05);
            else competitorAggression = Math.max(1.0, competitorAggression - 0.02); // Cool down

            // Reputation Decay/Recovery (Clamped 0-100)
            reputationScore = MathCore.clamp(reputationScore + 2, 0, 100); 

            // Volatile Churn Logic + Behavioral Modifiers
            let effectiveChurn = params.churnRate || 5;
            
            // Reputation Impact: Low reputation = High Churn
            effectiveChurn += (100 - reputationScore) * 0.1;
            
            // Competitor Impact
            effectiveChurn *= competitorAggression;

            if (params.churnVolatility && params.churnVolatility > 0) {
                const churnNoise = MathCore.gaussianRandom(0, params.churnVolatility / 100);
                effectiveChurn = Math.max(0, effectiveChurn + (effectiveChurn * churnNoise));
            }
            
            // Safety: Cap Churn at 100% per year equivalent (approx 8% monthly is high enough)
            microData.churnRate = Math.min(100, effectiveChurn);

            // --- B. Operational Physics & System Health ---
            
            // Apply Growth
            const growthNoise = MathCore.gaussianRandom(0, (params.volatility / 100));
            // Reputation limits acquisition (Viral Coeff dampened by rep)
            const viralFactor = (params.viralCoefficient || 0) * (reputationScore / 100);
            
            // New Users Calculation
            currentUsers *= (1 + (params.growthRate/100/12) + growthNoise + viralFactor);
            // Churn Calculation
            currentUsers = Math.max(0, currentUsers * (1 - (effectiveChurn/100/12)));

            let currentRevenue = currentUsers * arpu;

            // Capacity & Health Physics
            let capacityPenaltyCost = 0;
            let operationalLoad = 0;
            
            if (params.capacityCeiling) {
                operationalLoad = (currentRevenue / params.capacityCeiling) * 100;
                
                // Adaptive Throttling
                if (currentRevenue > params.capacityCeiling) {
                    const overshoot = currentRevenue - params.capacityCeiling;
                    
                    if (params.capacityPenalty) {
                        // System Strain: Health drops
                        systemHealth = MathCore.clamp(systemHealth - 10, 0, 100);
                        
                        // Cost Penalty (Overtime/Emergency)
                        capacityPenaltyCost = overshoot * 0.8; // Expensive to serve over capacity
                        
                        // Reputation Hit due to poor service
                        reputationScore = MathCore.clamp(reputationScore - 5, 0, 100);
                        
                        flags.push('CAPACITY_OVERLOAD');
                    } else {
                        // Hard Stop
                        currentRevenue = params.capacityCeiling; 
                    }
                } else if (operationalLoad > 85) {
                    // Soft Strain
                    systemHealth = MathCore.clamp(systemHealth - 2, 0, 100);
                } else {
                    // Recovery
                    systemHealth = MathCore.clamp(systemHealth + 5, 0, 100);
                }
            }

            // Circuit Breaker: If System Health < 20, revenue efficiency drops (crashes, errors)
            if (systemHealth < 20) {
                currentRevenue *= 0.7; // 30% performance penalty
                flags.push('SYSTEM_CRITICAL');
            }

            // --- C. Decision Node (Auto-Mitigation) ---
            if (params.strategy?.cashPreservationMode) {
                // If cash runway < 2 months (approx), cut OPEX automatically
                // Estimated burn ~ opex
                const estimatedOpex = currentRevenue * 0.6; 
                if (cumulativeCash < estimatedOpex * 2) {
                    activeAutoActions.push('AUTO_CUT_SPEND');
                    // Reduce OPEX by 20%, but hurt Growth by 10% next month (lagged effect simulated by rep)
                    reputationScore = MathCore.clamp(reputationScore - 1, 0, 100);
                }
            }

            // --- D. Accounting Core ---
            const wcChange = 0; 
            const depreciation = (params.capacityUpgradeCost || 0) / 60;
            
            let currentCOGS = currentRevenue * 0.4;
            let currentOPEX = currentRevenue * 0.3 + capacityPenaltyCost;

            // Apply Auto-Cut
            if (activeAutoActions.includes('AUTO_CUT_SPEND')) {
                currentOPEX *= 0.8; 
                currentCOGS *= 0.95; // Squeeze suppliers
            }

            let coreResult = accountingEngine.generateSimulationResult(
                currentRevenue,
                currentCOGS,
                currentOPEX,
                depreciation,
                wcChange
            );

            // --- E. Macro/Micro Adjustments ---
            macroData.inflationRate = params.inflationRate + (i * 0.1); 
            const macroEngine = new MacroEngine(coreResult, macroData);
            let macroResult = macroEngine.generateAdjustedResults();

            microData.supplyChainDelay = i > 6 ? 5 : 0; 
            if ((params.operationalResilience || 100) < 50) {
                microData.latePaymentRate = 15; 
                if(macroResult.operatingCashFlow) macroResult.operatingCashFlow *= 0.9; 
            }

            const microEngine = new MicroEngine(macroResult, microData);
            let microResult = microEngine.run(); 

            // --- F. Risk Engine & Event Injection ---
            const riskEngine = new RiskEngine(microResult, params, riskEvents, 'Base');
            const riskResult = riskEngine.run();

            // Handle Risk Events affecting State
            if (riskResult.activeRisks && riskResult.activeRisks.length > 0) {
                // Risks permanently damage system health until fixed
                // Apply defined severity penalty logic if available, else default
                let healthPenalty = 5;
                let repPenalty = 5;
                
                // Check distinct events for severity
                const triggeredEvents = riskEvents.filter(e => riskResult.activeRisks?.includes(e.name));
                triggeredEvents.forEach(e => {
                    if (e.severity === 'HIGH') { healthPenalty = 15; repPenalty = 20; }
                    if (e.severity === 'CATASTROPHIC') { healthPenalty = 40; repPenalty = 50; }
                });

                systemHealth = MathCore.clamp(systemHealth - healthPenalty, 0, 100);
                reputationScore = MathCore.clamp(reputationScore - repPenalty, 0, 100);
            }

            // --- G. Final Data Point Assembly ---
            const finalPoint: SimulationPoint = {
                ...riskResult, 
                month: i,
                activeUsers: Math.floor(currentUsers),
                alerts: [...(microResult.alerts || []), ...(riskResult.alerts || [])],
                operationalLoad: operationalLoad,
                reputationScore: reputationScore,
                systemHealth: systemHealth,
                autoActions: activeAutoActions
            } as SimulationPoint;

            // Recalculate Cash Flow
            finalPoint.profit = (finalPoint.revenue || 0) - (finalPoint.cost || 0);
            cumulativeCash += (finalPoint.freeCashFlow || finalPoint.profit || 0);
            finalPoint.cashBalance = cumulativeCash;

            // --- H. Investigation Engine ---
            const pointFlags = InvestigationEngine.audit(finalPoint, data[data.length - 1]);
            
            if (pointFlags.length > 0) {
                finalPoint.activeRisks = [...(finalPoint.activeRisks || []), ...pointFlags];
                flags.push(...pointFlags);
            }

            data.push(finalPoint);
        }

        const uniqueFlags = Array.from(new Set(flags));

        return {
            modelName: 'Enterprise Risk Intelligence (ERI) v3.0 [Deep Logic]',
            modelType: 'ERI_FULL_STACK',
            data,
            summary: {
                totalRevenue: data.reduce((sum, p) => sum + (p.revenue || 0), 0),
                totalProfit: data.reduce((sum, p) => sum + (p.netIncome || p.profit || 0), 0),
                endingCash: cumulativeCash,
                riskScore: uniqueFlags.length * 15,
                investigationFlags: uniqueFlags,
                eriScore: Math.max(0, 100 - (uniqueFlags.length * 10)),
                valueAtRisk: data[data.length - 1]?.riskMetrics?.valueAtRisk,
                physicsAlert: uniqueFlags.includes('CAPACITY_OVERLOAD') ? 'System Health critical due to capacity overload.' : undefined
            }
        };
    }
};
