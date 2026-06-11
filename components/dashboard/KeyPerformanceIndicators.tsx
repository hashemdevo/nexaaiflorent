import React from 'react';
import { TrendingUp, TrendingDown, Percent, Ratio, ShieldCheck, Scale } from 'lucide-react';

const kpis = [
    { name: 'Gross Profit Margin', value: '68.4%', trend: 'up', change: '+3.2%', icon: Percent },
    { name: 'Net Profit Margin', value: '18.9%', trend: 'up', change: '+1.5%', icon: Percent },
    { name: 'Current Ratio', value: '1.8', trend: 'up', change: '+0.3', icon: Scale },
    { name: 'Debt-to-Equity', value: '0.45', trend: 'down', change: '-0.05', icon: ShieldCheck },
];

export const KeyPerformanceIndicators: React.FC = () => {
    return (
        <div className="glass-panel p-6 rounded-2xl border border-border h-full flex flex-col animate-fade-in">
            <h3 className="font-bold text-on-surface text-lg mb-4">Key Performance Indicators</h3>
            <div className="flex-1 space-y-4 flex flex-col justify-around">
                {kpis.map((kpi, index) => {
                    const isGoodTrendUp = kpi.name !== 'Debt-to-Equity';
                    const trendIsUp = kpi.trend === 'up';
                    const isPositive = isGoodTrendUp ? trendIsUp : !trendIsUp;

                    return (
                        <div key={index} className="flex items-center justify-between bg-surface/50 p-3 rounded-xl border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isPositive ? 'bg-secondary/10 text-secondary' : 'bg-danger/10 text-danger'}`}>
                                    <kpi.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-on-surface">{kpi.name}</p>
                                    <p className="text-xs text-on-surface-muted">{kpi.change} vs last period</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-bold text-lg text-on-surface">{kpi.value}</p>
                                <div className={`flex items-center justify-end gap-1 text-xs font-bold ${isPositive ? 'text-secondary' : 'text-danger'}`}>
                                    {trendIsUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    <span>{trendIsUp ? 'Improving' : 'Declining'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
