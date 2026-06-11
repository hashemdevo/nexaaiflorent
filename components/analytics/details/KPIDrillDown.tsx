
import React from 'react';
import { X, Activity, Calculator, Calendar, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { generateKpiHistory } from '../config/kpiDefinitions';

// Reusing PulsingDot for consistency, ideally moving to shared UI later
const PulsingDot = (props: any) => {
  const { cx, cy, stroke } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} stroke={stroke} strokeWidth={2} fill="none" opacity={0.5}>
         <animate attributeName="r" from="4" to="25" dur="1.5s" begin="0s" repeatCount="indefinite" />
         <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" begin="0s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={5} fill={stroke} stroke="#fff" strokeWidth={2} />
    </g>
  );
};

interface KPIDrillDownProps {
    selectedKpi: any;
    onClose: () => void;
}

export const KPIDrillDown: React.FC<KPIDrillDownProps> = ({ selectedKpi, onClose }) => {
    if (!selectedKpi) return null;

    return (
       <div className="mt-8 animate-fade-in">
           <div className="glass-panel rounded-3xl border border-primary/30 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary),0.15)]">
                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-surface-highlight/10">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow-primary">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-on-surface">{selectedKpi.name}</h3>
                            <p className="text-sm text-on-surface-muted">{selectedKpi.desc}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-surface-highlight rounded-full text-on-surface-muted hover:text-on-surface transition border border-transparent hover:border-border"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3">
                    <div className="p-6 md:p-8 border-r border-border/50 space-y-8">
                         <div>
                            <h4 className="text-xs font-bold text-on-surface-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Calculator className="h-3 w-3" /> Formula
                            </h4>
                            <div className="bg-background/60 border border-border rounded-xl p-4 font-mono text-sm text-primary shadow-inner break-words">
                                {selectedKpi.formula}
                            </div>
                         </div>

                         <div>
                            <h4 className="text-xs font-bold text-on-surface-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Period Analysis
                            </h4>
                            <div className="rounded-xl border border-border overflow-hidden">
                                <div className="flex justify-between p-3 bg-surface-highlight/20 text-xs font-bold text-on-surface-muted uppercase border-b border-border">
                                    <span>Component</span>
                                    <span>Value</span>
                                </div>
                                <div className="divide-y divide-border/30 bg-surface/30">
                                    <div className="flex justify-between p-3 text-sm hover:bg-surface-highlight/30 transition">
                                        <span className="text-on-surface-muted">Variable A</span>
                                        <span className="font-mono font-bold text-on-surface">{(selectedKpi.value * 1200).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-3 text-sm hover:bg-surface-highlight/30 transition">
                                        <span className="text-on-surface-muted">Variable B</span>
                                        <span className="font-mono font-bold text-on-surface">{(selectedKpi.value * 450).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between p-3 text-sm bg-primary/5 border-t border-primary/20">
                                        <span className="text-primary font-bold">Calculated Result</span>
                                        <span className="font-mono font-bold text-primary">{selectedKpi.value}</span>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>

                    <div className="col-span-2 p-6 md:p-8 bg-gradient-to-br from-surface via-transparent to-transparent">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-secondary" /> 6-Month Trend
                            </h4>
                            <div className="flex gap-2">
                                <span className="text-xs font-bold bg-surface-highlight px-2 py-1 rounded text-on-surface-muted">YTD</span>
                                <span className="text-xs font-bold hover:bg-surface-highlight px-2 py-1 rounded text-on-surface-muted cursor-pointer transition">1Y</span>
                            </div>
                        </div>
                        
                        <div className="h-[250px] md:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={generateKpiHistory(selectedKpi.value, selectedKpi.prev)}>
                                    <defs>
                                        <linearGradient id="colorKpi" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" strokeOpacity={0.3} />
                                    <XAxis dataKey="month" stroke="rgb(var(--on-surface-muted))" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '12px', border: '1px solid rgb(var(--border))', color: 'rgb(var(--on-surface))' }}
                                        itemStyle={{ color: 'rgb(var(--primary))' }}
                                        formatter={(value: number, name: string) => [value.toFixed(2), name === 'prevValue' ? `Previous` : 'Current']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="rgb(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorKpi)" activeDot={<PulsingDot />} name="Current" />
                                    <Line type="monotone" dataKey="prevValue" stroke="rgb(var(--on-surface-muted))" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} opacity={0.5} name="Previous" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
           </div>
       </div>
    );
};
