
import { SimulationPoint } from '../types';

export const InvestigationEngine = {
    /**
     * Scans the simulated period for red flags.
     */
    audit(point: SimulationPoint, prevPoint?: SimulationPoint): string[] {
        const flags: string[] = [];

        // 1. Cash Burn Anomaly
        // If profit is positive but cash is dropping fast -> Divergence
        if (point.profit && point.profit > 0 && prevPoint && point.cashBalance && prevPoint.cashBalance) {
            const cashChange = point.cashBalance - prevPoint.cashBalance;
            if (cashChange < -(point.revenue || 0) * 0.1) {
                flags.push('CASH_PROFIT_DIVERGENCE');
            }
        }

        // 2. Margin Collapse
        if (point.grossProfit && point.revenue) {
            const margin = point.grossProfit / point.revenue;
            if (margin < 0.1) { // Below 10% gross margin is suspicious for software/services
                flags.push('MARGIN_COMPRESSION');
            }
        }

        // 3. Solvency Risk
        if (point.cashBalance && point.payables && point.cashBalance < point.payables) {
            flags.push('INSOLVENCY_RISK');
        }

        return flags;
    }
};
