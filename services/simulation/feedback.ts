
import { DbEngine } from '../core/db';
import { SavedSimulation, SimulationResult, SimulationParameters, AccuracyReport, CalibrationSuggestion, ModelPerformance, SimulationEngineType } from './types';
import { AccountService } from '../ledger/accounts';
import { JournalService } from '../ledger/journal';
import { JournalEntry } from '../../types';

/**
 * SIMULATION FEEDBACK LOOP (The "Learning" Module)
 * 1. Persists forecasts.
 * 2. Compares Forecast vs Actuals (Ground Truth from Ledger).
 * 3. Calculates bias and suggests parameter tuning.
 */
export const SimulationFeedbackService = {

    /**
     * Save a simulation run to track its performance over time.
     */
    async saveRun(result: SimulationResult, params: SimulationParameters, startDate: string = new Date().toISOString()): Promise<SavedSimulation> {
        const saved: SavedSimulation = {
            id: `sim-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            runDate: new Date().toISOString(),
            startDate: startDate, 
            params: params,
            forecastData: result.data,
            modelType: result.modelType,
            status: 'ACTIVE'
        };

        await DbEngine.insert('simulation_runs', saved as any);
        return saved;
    },

    async getHistory(): Promise<SavedSimulation[]> {
        return DbEngine.select<SavedSimulation>('simulation_runs', { orderBy: 'runDate', orderDir: 'desc' });
    },

    /**
     * SEED HISTORICAL DATA
     * Injects fake "past" simulations so the leaderboard works immediately for demonstration.
     */
    async seedHistoricalData() {
        const existing = await this.getHistory();
        if (existing.length > 0) return; // Already seeded

        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - 6); // 6 months ago

        // 1. Pessimistic Deterministic Model
        await this.saveRun({
            modelName: 'Baseline Plan (Legacy)',
            modelType: 'DETERMINISTIC',
            data: Array.from({length: 6}, (_, i) => ({ month: i+1, profit: 5000 + (i*200) })), // Lowball prediction
            summary: { totalRevenue: 0, totalProfit: 0, endingCash: 0 }
        }, {} as any, pastDate.toISOString());

        // 2. Optimistic Agent Model
        await this.saveRun({
            modelName: 'Agent Growth V1',
            modelType: 'AGENT',
            data: Array.from({length: 6}, (_, i) => ({ month: i+1, profit: 15000 + (i*1000) })), // High prediction
            summary: { totalRevenue: 0, totalProfit: 0, endingCash: 0 }
        }, {} as any, pastDate.toISOString());

        console.log("seeded historical simulations");
    },

    /**
     * EVALUATE: Compare a past simulation against Real Ledger Data.
     */
    async evaluateAccuracy(simulationId: string): Promise<AccuracyReport[]> {
        const sims = await DbEngine.select<SavedSimulation>('simulation_runs', { where: { id: simulationId } });
        const sim = sims[0];
        if (!sim) throw new Error("Simulation not found");

        const reports: AccuracyReport[] = [];
        const ledger = await JournalService.getAll();
        const accounts = await AccountService.getAll();

        // Map Account IDs to Types for fast lookup
        const accountTypeMap = new Map<string, string>();
        accounts.forEach(a => accountTypeMap.set(a.id, a.type));

        // Helper: Get ACTUAL Net Profit from Ledger for a specific month
        const getActualProfitForMonth = (year: number, month: number) => {
            const target = `${year}-${String(month).padStart(2, '0')}`;
            
            // Filter entries for this month
            const entries = ledger.filter(e => e.transactionDate.startsWith(target));
            
            let revenue = 0;
            let expense = 0;

            entries.forEach(entry => {
                entry.lines.forEach(line => {
                    const type = accountTypeMap.get(line.accountId);
                    if (type === 'REVENUE') revenue += line.credit; // Revenue is Credit normal
                    if (type === 'EXPENSE') expense += line.debit;  // Expense is Debit normal
                });
            });

            return revenue - expense;
        };

        const start = new Date(sim.startDate);

        // Compare each month of forecast
        for (const point of sim.forecastData) {
            const current = new Date(start);
            current.setMonth(current.getMonth() + point.month - 1);
            
            const year = current.getFullYear();
            const month = current.getMonth() + 1;
            
            // Stop if we reach the future (no actuals yet)
            const today = new Date();
            if (current > today) continue;

            // Get Forecasted Profit
            const predicted = point.profit || 0; 
            
            // Get Actual Profit
            let actual = getActualProfitForMonth(year, month);
            
            // MOCK FALLBACK: If Ledger is empty (demo mode), simulate "Actuals" based on a stable reality
            if (actual === 0 && ledger.length < 5) {
                actual = 8500 + (point.month * 500); // Assume a "Real" growth curve
            }

            const variance = actual - predicted;
            const errorPercent = actual !== 0 ? Math.abs(variance / actual) * 100 : 0;
            
            let bias: AccuracyReport['bias'] = 'ACCURATE';
            if (errorPercent > 5) {
                // If Actual > Predicted, we Underestimated.
                // If Actual < Predicted, we Overestimated.
                bias = variance > 0 ? 'UNDERESTIMATED' : 'OVERESTIMATED';
            }

            reports.push({
                simulationId,
                period: `${year}-${String(month).padStart(2, '0')}`,
                predictedCash: predicted,
                actualCash: actual,
                variance,
                errorPercent,
                bias
            });
        }

        return reports;
    },

    /**
     * LEADERBOARD: Rank the engines based on historical accuracy.
     */
    async getEngineLeaderboard(): Promise<ModelPerformance[]> {
        // Ensure seeding happens if needed
        await this.seedHistoricalData();

        const history = await this.getHistory();
        const performanceMap: Record<string, { totalError: number, count: number, biasSum: number, wins: number }> = {};

        const types: SimulationEngineType[] = ['DETERMINISTIC', 'MONTE_CARLO', 'STATISTICAL', 'CAUSAL', 'AGENT', 'OPTIMIZATION', 'SCENARIO'];
        types.forEach(t => {
            performanceMap[t] = { totalError: 0, count: 0, biasSum: 0, wins: 0 };
        });

        // Evaluate all runs
        for (const sim of history) {
            const report = await this.evaluateAccuracy(sim.id);
            if (report.length === 0) continue;

            // Average error across all months in this run
            const runAvgError = report.reduce((sum, r) => sum + r.errorPercent, 0) / report.length;
            
            // Net Variance (Bias)
            const runBias = report.reduce((sum, r) => sum + r.variance, 0); 

            if (performanceMap[sim.modelType]) {
                performanceMap[sim.modelType].totalError += runAvgError;
                performanceMap[sim.modelType].biasSum += runBias;
                performanceMap[sim.modelType].count += 1;
            }
        }

        // Calculate Metrics
        const results: ModelPerformance[] = Object.keys(performanceMap).map(key => {
            const data = performanceMap[key];
            const avgError = data.count > 0 ? data.totalError / data.count : 0;
            
            // Score = 100 - Error. Min 0.
            const accuracyScore = data.count > 0 ? Math.max(0, 100 - avgError) : 0;
            
            let biasTrend: ModelPerformance['biasTrend'] = 'NEUTRAL';
            if (data.count > 0) {
                // If BiasSum is positive, Actuals > Predictions => We were Pessimistic
                if (data.biasSum > 5000) biasTrend = 'PESSIMISTIC'; 
                // If BiasSum is negative, Actuals < Predictions => We were Optimistic
                else if (data.biasSum < -5000) biasTrend = 'OPTIMISTIC'; 
            }

            return {
                modelType: key as SimulationEngineType,
                rank: 0, 
                accuracyScore: accuracyScore,
                averageError: avgError,
                biasTrend,
                wins: data.count, 
                lastRunDate: new Date().toISOString()
            };
        });

        const activeModels = results.filter(m => m.wins > 0);
        activeModels.sort((a, b) => b.accuracyScore - a.accuracyScore);
        activeModels.forEach((m, idx) => m.rank = idx + 1);

        return activeModels;
    },

    /**
     * LEARN: Generate suggested parameters based on historical error.
     */
    async calibrateParameters(simulationId: string): Promise<CalibrationSuggestion[]> {
        const accuracy = await this.evaluateAccuracy(simulationId);
        if (accuracy.length === 0) return [];

        const sims = await DbEngine.select<SavedSimulation>('simulation_runs', { where: { id: simulationId } });
        const params = sims[0]?.params;
        if (!params) return [];

        const suggestions: CalibrationSuggestion[] = [];

        // Aggregate stats
        const avgVariance = accuracy.reduce((sum, r) => sum + r.variance, 0) / accuracy.length;
        const avgErrorPct = accuracy.reduce((sum, r) => sum + r.errorPercent, 0) / accuracy.length;

        // Threshold for correction
        if (avgErrorPct < 5) return []; // Model is good enough

        // 1. Correction for Growth Rate
        if (avgVariance > 0) {
            // We Underestimated (Variance > 0). We need to boost growth.
            // Heuristic: Increase growth by half the error percentage
            const bump = params.growthRate * (avgErrorPct / 200); 
            suggestions.push({
                parameter: 'growthRate',
                currentValue: params.growthRate,
                suggestedValue: parseFloat((params.growthRate + bump).toFixed(2)),
                reason: `Model consistently underestimated profits by ~${(avgVariance/1000).toFixed(1)}k. Increasing growth assumption.`
            });
        } else {
            // We Overestimated (Variance < 0). Cut growth.
            const cut = params.growthRate * (avgErrorPct / 200);
            suggestions.push({
                parameter: 'growthRate',
                currentValue: params.growthRate,
                suggestedValue: Math.max(0, parseFloat((params.growthRate - cut).toFixed(2))),
                reason: `Model was too optimistic (Error: ${avgErrorPct.toFixed(1)}%). Lowering growth rate to match reality.`
            });
        }

        // 2. Correction for Volatility
        // Calculate standard deviation of the *errors*
        const varianceOfError = accuracy.reduce((sum, r) => sum + Math.pow(r.variance - avgVariance, 2), 0) / accuracy.length;
        const stdDevError = Math.sqrt(varianceOfError);
        
        // If error fluctuates wildly, increase volatility param to widen confidence intervals next time
        if (stdDevError > 2000) {
             suggestions.push({
                parameter: 'volatility',
                currentValue: params.volatility,
                suggestedValue: Math.min(100, params.volatility + 5),
                reason: `Actuals fluctuated significantly vs forecast. Increasing volatility factor to widen risk bands.`
            });
        }

        return suggestions;
    }
};
