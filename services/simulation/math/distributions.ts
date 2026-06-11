
/**
 * MATH CORE: Statistical Distributions & Helpers
 * Pure mathematical functions for financial modeling.
 */

export const MathCore = {
    /**
     * Box-Muller Transform
     * Generates standard normal random variables (Mean=0, StdDev=1)
     */
    gaussianRandom(mean: number = 0, stdev: number = 1): number {
        const u = 1 - Math.random(); // Converting [0,1) to (0,1]
        const v = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdev + mean;
    },

    /**
     * Generates a pair of correlated standard normal random variables using Cholesky decomposition.
     * @param rho Correlation coefficient (-1 to 1)
     */
    correlatedGaussian(rho: number): [number, number] {
        const z1 = this.gaussianRandom(0, 1);
        const z2 = this.gaussianRandom(0, 1);
        const x1 = z1;
        const x2 = (rho * z1) + (Math.sqrt(1 - rho * rho) * z2);
        return [x1, x2];
    },

    /**
     * Poisson Random Number Generator
     * Used for simulating the number of "jumps" or "shocks" in a time period.
     * Knuth's algorithm.
     */
    poissonRandom(lambda: number): number {
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
            k++;
            p *= Math.random();
        } while (p > L);
        return k - 1;
    },

    /**
     * Calculate percentile from a sorted array
     */
    percentile(arr: number[], p: number): number {
        if (arr.length === 0) return 0;
        const index = Math.floor(arr.length * (p / 100));
        return arr[Math.min(index, arr.length - 1)];
    },

    /**
     * Calculate Standard Deviation
     */
    stdDev(arr: number[]): number {
        const n = arr.length;
        if (n === 0) return 0;
        const mean = arr.reduce((a, b) => a + b, 0) / n;
        const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
        return Math.sqrt(variance);
    },

    /**
     * Clamps a number between min and max
     */
    clamp(num: number, min: number, max: number): number {
        return Math.min(Math.max(num, min), max);
    },

    /**
     * Estimates initial seasonal indices from history
     */
    estimateSeasonality(history: number[], period: number = 12): number[] {
        if (history.length < period) return Array(period).fill(1.0);
        
        const avg = history.reduce((a, b) => a + b, 0) / history.length;
        const indices = [];
        // Simplified estimation: Average of (Actual / OverallAverage) for each period index
        for (let i = 0; i < period; i++) {
            let sum = 0;
            let count = 0;
            for (let j = i; j < history.length; j += period) {
                sum += history[j] / avg;
                count++;
            }
            indices.push(count > 0 ? sum / count : 1.0);
        }
        return indices;
    },

    /**
     * Markov Chain State Transition
     * Selects the next state based on current state and probability matrix.
     */
    markovStep<T extends string>(currentState: T, matrix: Record<T, Record<T, number>>): T {
        const probs = matrix[currentState];
        const rand = Math.random();
        let cumulative = 0;
        
        for (const nextState in probs) {
            cumulative += probs[nextState as unknown as T];
            if (rand <= cumulative) {
                return nextState as unknown as T;
            }
        }
        return currentState; // Fallback
    }
};
