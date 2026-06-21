
import React from 'react';
import { SimulationParameters, SimulationEngineType } from '../../services/simulation/types';
import { Info, Globe, Clock, Zap, Activity, Layers, ArrowRight } from 'lucide-react';

interface VariableExplainerProps {
    engineType: SimulationEngineType;
    params: SimulationParameters;
}

interface VariableInsight {
    key: string;
    label: string;
    value: string | number;
    impactWeight: number; // 0 to 100
    description: string;
    source: 'INTERNAL_SYSTEM' | 'EXTERNAL_MARKET' | 'HYBRID';
    timeSensitivity: 'STATIC' | 'DYNAMIC_COMPOUNDING' | 'EVENT_DRIVEN';
    category: 'GROWTH' | 'RISK' | 'OPERATIONAL' | 'BEHAVIORAL';
}

export const VariableExplainer: React.FC<VariableExplainerProps> = ({ engineType, params }) => {

    const getInsights = (): VariableInsight[] => {
        const insights: VariableInsight[] = [];

        // Common Variables
        insights.push({
            key: 'baseRevenue',
            label: 'Base Revenue',
            value: `$${params.baseRevenue.toLocaleString()}`,
            impactWeight: 85,
            description: 'The starting point for all projections. Acts as the anchor for growth calculations.',
            source: 'INTERNAL_SYSTEM',
            timeSensitivity: 'STATIC',
            category: 'GROWTH'
        });

        // Engine Specific Logic
        switch (engineType) {
            case 'DETERMINISTIC':
                insights.push({
                    key: 'growthRate',
                    label: 'Growth Rate',
                    value: `${params.growthRate}%`,
                    impactWeight: 95,
                    description: 'Compounding monthly growth factor. Small changes here result in exponential differences over time.',
                    source: 'HYBRID',
                    timeSensitivity: 'DYNAMIC_COMPOUNDING',
                    category: 'GROWTH'
                });
                insights.push({
                    key: 'costRatio',
                    label: 'Cost Structure',
                    value: `${params.costRatio}%`,
                    impactWeight: 70,
                    description: 'Percentage of revenue consumed by expenses. Affected by "Burnout Physics" if capacity is exceeded.',
                    source: 'INTERNAL_SYSTEM',
                    timeSensitivity: 'DYNAMIC_COMPOUNDING',
                    category: 'OPERATIONAL'
                });
                insights.push({
                    key: 'capacityCeiling',
                    label: 'Capacity Ceiling',
                    value: `$${params.capacityCeiling?.toLocaleString()}`,
                    impactWeight: 60,
                    description: 'Hard limit on revenue generation. Hitting this trigger nonlinear cost penalties.',
                    source: 'INTERNAL_SYSTEM',
                    timeSensitivity: 'EVENT_DRIVEN',
                    category: 'OPERATIONAL'
                });
                break;

            case 'MONTE_CARLO':
                insights.push({
                    key: 'volatility',
                    label: 'Market Volatility',
                    value: `${params.volatility}%`,
                    impactWeight: 90,
                    description: 'Standard deviation of returns. Higher values widen the cone of uncertainty and risk.',
                    source: 'EXTERNAL_MARKET',
                    timeSensitivity: 'DYNAMIC_COMPOUNDING',
                    category: 'RISK'
                });
                insights.push({
                    key: 'daysSalesOutstanding',
                    label: 'DSO (Receivables)',
                    value: `${params.daysSalesOutstanding} Days`,
                    impactWeight: 75,
                    description: 'Time lag between sales and cash collection. Critical during liquidity shocks.',
                    source: 'HYBRID',
                    timeSensitivity: 'DYNAMIC_COMPOUNDING',
                    category: 'OPERATIONAL'
                });
                break;

            case 'AGENT':
                insights.push({
                    key: 'viralCoefficient',
                    label: 'Viral Coefficient (K)',
                    value: params.viralCoefficient || 0,
                    impactWeight: 98,
                    description: 'Number of new users each existing user invites. >1.0 creates exponential viral growth.',
                    source: 'EXTERNAL_MARKET',
                    timeSensitivity: 'DYNAMIC_COMPOUNDING',
                    category: 'BEHAVIORAL'
                });
                insights.push({
                    key: 'churnRate',
                    label: 'Churn Rate',
                    value: `${params.churnRate}%`,
                    impactWeight: 80,
                    description: 'Attrition rate of active agents. Adjusted dynamically by "Reputation Score".',
                    source: 'BEHAVIORAL' as any, // Visual trick
                    timeSensitivity: 'DYNAMIC_COMPOUNDING',
                    category: 'BEHAVIORAL'
                });
                break;
                
            case 'SCENARIO':
                insights.push({
                    key: 'operationalResilience',
                    label: 'Resilience Score',
                    value: `${params.operationalResilience}/100`,
                    impactWeight: 85,
                    description: 'Ability of the system to dampen the impact of negative macro/micro events.',
                    source: 'INTERNAL_SYSTEM',
                    timeSensitivity: 'STATIC',
                    category: 'RISK'
                });
                insights.push({
                    key: 'blackSwanImpact',
                    label: 'Black Swan Impact',
                    value: `${params.blackSwanImpact}%`,
                    impactWeight: 100,
                    description: 'Magnitude of revenue drop during a rare catastrophic event.',
                    source: 'EXTERNAL_MARKET',
                    timeSensitivity: 'EVENT_DRIVEN',
                    category: 'RISK'
                });
                break;

            case 'ERI_FULL_STACK':
                if (params.capacityCeiling && params.capacityCeiling > 0) {
                    insights.push({
                        key: 'capacityCeiling',
                        label: 'Capacity & Overload',
                        value: `$${params.capacityCeiling.toLocaleString()}`,
                        impactWeight: 90,
                        description: params.capacityPenalty ? 'Hard ceiling active. Breach triggers non-linear cost penalties (Physics Mode).' : 'Soft ceiling active.',
                        source: 'INTERNAL_SYSTEM',
                        timeSensitivity: 'EVENT_DRIVEN',
                        category: 'OPERATIONAL'
                    });
                }
                
                if (params.churnVolatility && params.churnVolatility > 0) {
                    insights.push({
                        key: 'churnVolatility',
                        label: 'Volatile Churn',
                        value: `±${params.churnVolatility}%`,
                        impactWeight: 80,
                        description: 'Customer attrition is unstable. Random spikes simulate market aggression.',
                        source: 'EXTERNAL_MARKET',
                        timeSensitivity: 'DYNAMIC_COMPOUNDING',
                        category: 'BEHAVIORAL'
                    });
                }

                insights.push({
                    key: 'inflationRate',
                    label: 'Inflation Rate',
                    value: `${params.inflationRate}%`,
                    impactWeight: 65,
                    description: 'Macro-economic factor eroding purchasing power and increasing OPEX over time.',
                    source: 'EXTERNAL_MARKET',
                    timeSensitivity: 'DYNAMIC_COMPOUNDING',
                    category: 'RISK'
                });
                insights.push({
                    key: 'supplyChainReliability',
                    label: 'Supply Chain Reliability',
                    value: `${params.supplyChainReliability}%`,
                    impactWeight: 75,
                    description: 'Probability of on-time delivery. Low scores trigger inventory shocks and sales loss.',
                    source: 'HYBRID',
                    timeSensitivity: 'EVENT_DRIVEN',
                    category: 'OPERATIONAL'
                });
                insights.push({
                    key: 'fxExposure',
                    label: 'FX Exposure',
                    value: `${params.fxExposure}%`,
                    impactWeight: 55,
                    description: 'Percentage of revenue/cost exposed to foreign exchange volatility.',
                    source: 'EXTERNAL_MARKET',
                    timeSensitivity: 'DYNAMIC_COMPOUNDING',
                    category: 'RISK'
                });
                break;

            default:
                insights.push({
                    key: 'general_growth',
                    label: 'Growth Factor',
                    value: `${params.growthRate}%`,
                    impactWeight: 50,
                    description: 'General linear projection parameter.',
                    source: 'HYBRID',
                    timeSensitivity: 'STATIC',
                    category: 'GROWTH'
                });
        }

        return insights.sort((a, b) => b.impactWeight - a.impactWeight);
    };

    const insights = getInsights();

    const getSourceIcon = (source: string) => {
        if (source === 'INTERNAL_SYSTEM') return <Layers className="h-3 w-3" />;
        if (source === 'EXTERNAL_MARKET') return <Globe className="h-3 w-3" />;
        return <Activity className="h-3 w-3" />;
    };

    const getSensitivityColor = (sens: string) => {
        if (sens === 'DYNAMIC_COMPOUNDING') return 'text-secondary bg-secondary/10 border-secondary/20';
        if (sens === 'EVENT_DRIVEN') return 'text-warning bg-warning/10 border-warning/20';
        return 'text-on-surface-muted bg-surface-highlight border-border';
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-border animate-fade-in">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Zap className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-on-surface">Variable Impact Analysis</h3>
                    <p className="text-xs text-on-surface-muted">Breakdown of active drivers in the {engineType.replace('_', ' ')} engine.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((item) => (
                    <div key={item.key} className="bg-surface/50 border border-border/50 rounded-xl p-4 hover:border-primary/30 transition group relative overflow-hidden">
                        {/* Background Impact Bar */}
                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-primary/50" style={{ width: `${item.impactWeight}%` }}></div>
                        
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="text-xs font-bold text-on-surface-muted uppercase tracking-wider mb-1 flex items-center gap-2">
                                    {item.category}
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] border flex items-center gap-1 ${getSensitivityColor(item.timeSensitivity)}`}>
                                        <Clock className="h-2 w-2" /> {item.timeSensitivity.replace('_', ' ')}
                                    </span>
                                </div>
                                <h4 className="font-bold text-on-surface text-base">{item.label}</h4>
                            </div>
                            <div className="text-right">
                                <span className="font-mono font-bold text-lg text-primary">{item.value}</span>
                            </div>
                        </div>

                        <p className="text-xs text-on-surface-muted leading-relaxed mb-4 min-h-[40px]">
                            {item.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-on-surface-muted pt-3 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                                <span className="uppercase font-bold">Source:</span>
                                <span className="flex items-center gap-1 bg-surface-highlight px-1.5 py-0.5 rounded text-on-surface">
                                    {getSourceIcon(item.source)} {item.source.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="uppercase font-bold">Impact:</span>
                                <div className="w-16 h-1.5 bg-surface-highlight rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${item.impactWeight > 80 ? 'bg-danger' : item.impactWeight > 50 ? 'bg-warning' : 'bg-secondary'}`} 
                                        style={{ width: `${item.impactWeight}%` }}
                                    ></div>
                                </div>
                                <span className="font-mono">{item.impactWeight}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
