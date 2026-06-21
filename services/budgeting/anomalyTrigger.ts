import { DbEngine } from '../core/db';
import { BudgetService } from './manager';
import { AuditService } from '../admin/audit';
import { NotificationService } from '../system/notifications';
import { JournalEntry } from '../../types';

export const AnomalyTriggerService = {
    /**
     * Scans all Cost Centers in real-time and alerts on margin variances or overruns.
     * Can be run on transaction post or periodically.
     */
    async scanAndAlert(postedEntry?: JournalEntry): Promise<void> {
        try {
            const fiscalYear = new Date().getFullYear();
            const costCenters = await BudgetService.getCostCenterBudgets(fiscalYear);

            for (const cc of costCenters) {
                const percent = cc.percent;
                const overBudget = cc.actual > cc.budget;
                const approachingLimit = percent >= 90;

                // Let's check if we recently posted a large amount into this cost center
                let isHighVelocity = false;
                let triggerAmount = 0;

                if (postedEntry && postedEntry.costCenter) {
                    const normalizedCC = postedEntry.costCenter.trim().toLowerCase();
                    const ccMatches = normalizedCC === cc.id.toLowerCase() ||
                                      normalizedCC === cc.code.toLowerCase() ||
                                      normalizedCC === cc.name.toLowerCase();

                    if (ccMatches) {
                        // Sum up lines
                        const entryDebit = postedEntry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
                        // If a single debit is > 15% of the annual budget, it is high-velocity
                        if (entryDebit > 0 && entryDebit > (cc.budget * 0.15)) {
                            isHighVelocity = true;
                            triggerAmount = entryDebit;
                        }
                    }
                }

                if (overBudget || approachingLimit || isHighVelocity) {
                    const statusType = overBudget ? 'DEFICIT_OVERRUN' : isHighVelocity ? 'HIGH_VELOCITY_SPIKE' : 'BUDGET_WARNING';
                    
                    let title = '';
                    let details = '';
                    let notificationSeverity: 'ERROR' | 'WARNING' = 'WARNING';

                    if (overBudget) {
                        title = `🚨 CRITICAL BUDGET DEFICIT: ${cc.name} (${cc.code})`;
                        details = `GAAP-Standard Exception: Cost Center spent $${cc.actual.toLocaleString()} exceeding set budget limit of $${cc.budget.toLocaleString()} (${percent}% usage). High risk of material variance overrun. Adjust allocation immediately.`;
                        notificationSeverity = 'ERROR';
                    } else if (isHighVelocity) {
                        title = `⚡ HIGH-VELOCITY COST SPIKE: ${cc.name} (${cc.code})`;
                        details = `High-velocity cost overrun scan flagged a single transaction of $${triggerAmount.toLocaleString()} absorbing ${(triggerAmount / cc.budget * 100).toFixed(1)}% of total annual category limits. Cumulative actual: $${cc.actual.toLocaleString()} / budget $${cc.budget.toLocaleString()} (${percent}%).`;
                        notificationSeverity = 'ERROR';
                    } else {
                        title = `⚠️ Margin Warning: ${cc.name} (${cc.code})`;
                        details = `Warning: Cost Center budget limit approached. Currently at $${cc.actual.toLocaleString()} consumed out of $${cc.budget.toLocaleString()} (${percent}%). Pre-emptive variance audit is recommended.`;
                        notificationSeverity = 'WARNING';
                    }

                    // 1. Audit Log Insertion to active system feed
                    const alreadyLogged = await this.isAlreadyLoggedToday(statusType, cc.id, percent);
                    if (!alreadyLogged) {
                        await AuditService.log(
                            'sys-forensic',
                            'Nexa AI Risk Shield',
                            'SECURITY',
                            `Cost Center ${cc.code}`,
                            JSON.stringify({
                                statusType,
                                costCenterId: cc.id,
                                code: cc.code,
                                actual: cc.actual,
                                budget: cc.budget,
                                percent: percent,
                                warningMessage: details
                            })
                        );

                        // 2. Platform notification to system feeds
                        await NotificationService.send({
                            userId: 'admin',
                            title,
                            message: details,
                            type: notificationSeverity
                        });
                        
                        // Fire a browser storage update event to instantly alert the UI
                        if (typeof window !== 'undefined') {
                            const event = new CustomEvent('nexa-budget-alert', { detail: { cc, statusType, message: details } });
                            window.dispatchEvent(event);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("⚠️ [Forensic Anomaly Trigger] Failed to complete threshold validation run:", error);
        }
    },

    /**
     * Prevents duplicate alert spamming for the same variance percentage.
     */
    async isAlreadyLoggedToday(type: string, ccId: string, percent: number): Promise<boolean> {
        try {
            const logs = await AuditService.getLogs(30);
            return logs.some(log => {
                if (log.action === 'SECURITY' && log.target === `Cost Center ${ccId}`) {
                    try {
                        const parsed = JSON.parse(log.details || '{}');
                        return parsed.statusType === type && parsed.percent === percent;
                    } catch {
                        return false;
                    }
                }
                return false;
            });
        } catch {
            return false;
        }
    }
};
