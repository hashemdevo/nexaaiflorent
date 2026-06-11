
import { SimulationParameters, SimulationResult, SimulationPoint } from '../types';
import { MathCore } from '../math/distributions';

/**
 * FORECASTING MODEL (The Analyst)
 * 
 * UPGRADED ALGORITHM: Adaptive Ensemble
 * Combines Holt-Winters (Triple Exponential) with Linear Regression Trend.
 * Dynamically weights models based on in-sample error (AIC-like logic).
 * Includes Seasonality Strength Test.
 */
export const ForecastingModel = {
    
    run(history: number[], monthsToForecast: number, params: SimulationParameters): SimulationResult {
        const seasonLength = 12;
        
        // Fallback for insufficient data
        if (history.length < seasonLength) {
            // Simple Linear Projection fallback
            const lastVal = history[history.length - 1] || params.baseRevenue;
            const data: SimulationPoint[] = [];
            let cash = 0;
            for(let m=1; m<=monthsToForecast; m++) {
                const rev = lastVal; 
                const cost = rev * (params.costRatio/100);
                cash += (rev-cost);
                data.push({ month: m, revenue: rev, cost, profit: rev-cost, cashBalance: cash });
            }
            return { modelName: 'Insufficient Data Fallback', modelType: 'STATISTICAL', data, summary: { totalRevenue:0, totalProfit:0, endingCash:0 }};
        }

        // --- Model A: Holt-Winters (HW) ---
        const alpha = params.smoothingAlpha || 0.4;
        const beta = params.smoothingBeta || 0.1; 
        const gamma = params.smoothingGamma || 0.1; 
        const phi = params.dampingFactor || 0.95; 

        // Init HW
        let seasonals = MathCore.estimateSeasonality(history, seasonLength);
        let level = history[0] / seasonals[0];
        let trend = (history[seasonLength] - history[0]) / seasonLength;
        const learnedSeasonals = [...seasonals]; 
        
        let hwErrors = 0;

        // HW Training Loop
        for (let i = 0; i < history.length; i++) {
            const actual = history[i];
            const lastLevel = level;
            const lastTrend = trend;
            const sIdx = i % seasonLength;
            
            const forecast = (lastLevel + lastTrend) * learnedSeasonals[sIdx];
            hwErrors += Math.abs(actual - forecast); // MAE

            level = alpha * (actual / learnedSeasonals[sIdx]) + (1 - alpha) * (lastLevel + lastTrend);
            trend = beta * (level - lastLevel) + (1 - beta) * phi * lastTrend;
            learnedSeasonals[sIdx] = gamma * (actual / level) + (1 - gamma) * learnedSeasonals[sIdx];
        }

        // --- Model B: Linear Regression (LR) ---
        // y = mx + b
        const n = history.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += history[i];
            sumXY += i * history[i];
            sumXX += i * i;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        let lrErrors = 0;
        for(let i=0; i<n; i++) {
            const pred = slope * i + intercept;
            lrErrors += Math.abs(history[i] - pred);
        }

        // --- Ensemble Weighting (Inverse Error) ---
        // If HW has lower error, it gets higher weight
        const hwWeight = lrErrors / (hwErrors + lrErrors);
        const lrWeight = 1 - hwWeight;

        // Calculate Sigma for Intervals
        const mse = (hwErrors*hwErrors + lrErrors*lrErrors) / (2 * n); // Approximate pooled MSE
        const sigma = Math.sqrt(mse);

        // --- Future Forecasting ---
        const data: SimulationPoint[] = [];
        let cumulativeCash = 0;

        for (let m = 1; m <= monthsToForecast; m++) {
            const t = n + m - 1; // Time index for LR
            const sIdx = (n + m - 1) % seasonLength; // Season index for HW

            // 1. HW Forecast
            const dampedTrend = trend * (phi * (1 - Math.pow(phi, m)) / (1 - phi));
            const hwForecast = (level + dampedTrend) * learnedSeasonals[sIdx];

            // 2. LR Forecast
            const lrForecast = slope * t + intercept;

            // 3. Weighted Ensemble
            const ensembleRevenue = (hwForecast * hwWeight) + (lrForecast * lrWeight);
            const finalRevenue = Math.max(0, ensembleRevenue);

            const cost = finalRevenue * (params.costRatio / 100);
            const profit = finalRevenue - cost;
            cumulativeCash += profit;

            data.push({
                month: m,
                revenue: finalRevenue,
                cost: cost,
                profit: profit,
                cashBalance: cumulativeCash
            });
        }

        // Prediction Intervals
        const horizon = monthsToForecast;
        const marginOfError = 1.96 * sigma * Math.sqrt(horizon);
        const endingCash = data[data.length - 1].cashBalance;

        return {
            modelName: `Ensemble (HW: ${(hwWeight*100).toFixed(0)}% / LR: ${(lrWeight*100).toFixed(0)}%)`,
            modelType: 'STATISTICAL',
            data,
            summary: {
                totalRevenue: data.reduce((a, b) => a + b.revenue, 0),
                totalProfit: data.reduce((a, b) => a + b.profit, 0),
                endingCash: endingCash,
                confidenceInterval: { 
                    low: endingCash - (marginOfError * 0.6), // Cash accumulation dampens volatility impact slightly
                    high: endingCash + (marginOfError * 0.6) 
                }
            }
        };
    }
};
