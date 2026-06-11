
export type AccountingStandard = 'GAAP' | 'IFRS';

export const StandardLogic = {
    /**
     * IFRS prohibits LIFO (Last-In, First-Out).
     * GAAP allows LIFO.
     */
    validateInventoryMethod(method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVG', standard: AccountingStandard): boolean {
        if (standard === 'IFRS' && method === 'LIFO') {
            return false; // Strict IFRS violation
        }
        return true;
    },

    /**
     * IFRS allows Revaluation Model (Fair Value).
     * GAAP requires Historical Cost (mostly).
     */
    calculateAssetValue(
        historicalCost: number, 
        accumulatedDepreciation: number, 
        fairMarketValue: number, 
        standard: AccountingStandard
    ): { bookValue: number, revaluationSurplus: number } {
        const costModelValue = historicalCost - accumulatedDepreciation;

        if (standard === 'IFRS') {
            // IFRS allows revaluation to Fair Market Value
            if (fairMarketValue > costModelValue) {
                return {
                    bookValue: fairMarketValue,
                    revaluationSurplus: fairMarketValue - costModelValue
                };
            }
        }

        // GAAP (or IFRS Cost Model)
        return {
            bookValue: costModelValue,
            revaluationSurplus: 0
        };
    },

    /**
     * IFRS allows capitalizing development costs if criteria met.
     * GAAP expenses them (mostly, excluding software).
     */
    treatRndCosts(amount: number, phase: 'RESEARCH' | 'DEVELOPMENT', standard: AccountingStandard): 'EXPENSE' | 'CAPITALIZE' {
        if (standard === 'GAAP') return 'EXPENSE'; // General rule
        if (standard === 'IFRS' && phase === 'DEVELOPMENT') return 'CAPITALIZE'; // IAS 38
        return 'EXPENSE';
    }
};
