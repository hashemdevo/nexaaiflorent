
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// --- Custom Active Dot Component (Radar Pulse Effect) ---
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

// Custom Glassmorphic Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/60 backdrop-blur-xl border border-border/50 p-4 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <p className="text-on-surface font-bold mb-3 border-b border-border/30 pb-2 text-xs uppercase tracking-widest">{label}</p>
        <div className="space-y-3">
          {payload.map((entry: any, index: number) => {
            const value = entry.value;
            const name = entry.name;
            const color = entry.stroke || entry.fill;
            return (
              <div key={index} className="flex items-center justify-between gap-6 min-w-[160px]">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color: color }}></div>
                   <span className="text-xs text-on-surface-muted font-medium">{name}</span>
                </div>
                <span className="font-mono font-bold text-on-surface text-sm drop-shadow-sm">
                  ${Number(value).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

interface DynamicTrendChartProps {
    data: any[];
    chartType: 'area' | 'bar' | 'line' | 'pie';
    visibleSeries: Record<string, boolean>;
    compareMode: boolean;
    comparisonLabel: string;
    isExpanded: boolean;
    currentTheme: string;
}

export const DynamicTrendChart: React.FC<DynamicTrendChartProps> = ({ 
    data, chartType, visibleSeries, compareMode, comparisonLabel, isExpanded, currentTheme 
}) => {
    
    const SERIES_CONFIG = [
        { key: 'revenue', label: 'Revenue', colorVar: '--primary', gradientId: 'colorRev' },
        { key: 'expenses', label: 'Expenses', colorVar: '--danger', gradientId: 'colorExp' },
        { key: 'netProfit', label: 'Net Profit', colorVar: '--secondary', gradientId: 'colorNet' }
    ];

    if (chartType === 'pie') {
        const pieData = SERIES_CONFIG
            .filter(s => visibleSeries[s.key])
            .map(s => ({
                name: s.label,
                value: data.reduce((acc, cur) => acc + (cur[s.key as keyof typeof cur] as number), 0),
                color: `rgb(var(${s.colorVar}))`
            }));

        return (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={pieData}
                        innerRadius={isExpanded ? 120 : 80}
                        outerRadius={isExpanded ? 160 : 100}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    const ChartComponent = chartType === 'bar' ? BarChart : chartType === 'line' ? LineChart : AreaChart;
    const commonProps = { data, margin: { top: 20, right: 10, left: 0, bottom: 0 } };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ChartComponent {...commonProps}>
                <defs>
                    <filter id="neonGlow" height="300%" width="300%" x="-100%" y="-100%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="rgb(var(--border))" fillOpacity="0.3" />
                        <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="20 20" dur="20s" repeatCount="indefinite" />
                    </pattern>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(var(--secondary))" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="rgb(var(--secondary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(var(--danger))" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="rgb(var(--danger))" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                
                <rect x="0" y="0" width="100%" height="100%" fill="url(#dotGrid)" />
                
                <XAxis dataKey="month" stroke="rgb(var(--on-surface-muted))" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12, fontWeight: 600, fill: 'rgb(var(--on-surface-muted))' }} />
                <YAxis stroke="rgb(var(--on-surface-muted))" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'rgb(var(--on-surface-muted))' }} tickFormatter={(value) => `$${value / 1000}k`} />
                
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgb(var(--on-surface))', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.3 }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span className="text-on-surface font-medium text-sm ml-1">{value}</span>} />
                
                {visibleSeries.revenue && (
                    chartType === 'area' ? <Area type="monotone" dataKey="revenue" stroke="rgb(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" filter="url(#neonGlow)" activeDot={<PulsingDot />} name="Revenue" /> :
                    chartType === 'bar' ? <Bar dataKey="revenue" fill="rgb(var(--primary))" radius={[6, 6, 0, 0]} name="Revenue" /> :
                    <Line type={currentTheme.includes('analytics') ? 'step' : 'monotone'} dataKey="revenue" stroke="rgb(var(--primary))" strokeWidth={3} dot={{r: 5, strokeWidth: 2, fill: 'rgb(var(--surface))'}} activeDot={<PulsingDot />} filter="url(#neonGlow)" name="Revenue" />
                )}

                {visibleSeries.expenses && (
                    chartType === 'area' ? <Area type="monotone" dataKey="expenses" stroke="rgb(var(--danger))" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" filter="url(#neonGlow)" activeDot={<PulsingDot />} name="Expenses" /> :
                    chartType === 'bar' ? <Bar dataKey="expenses" fill="rgb(var(--danger))" radius={[6, 6, 0, 0]} name="Expenses" /> :
                    <Line type={currentTheme.includes('analytics') ? 'step' : 'monotone'} dataKey="expenses" stroke="rgb(var(--danger))" strokeWidth={3} dot={{r: 5, strokeWidth: 2, fill: 'rgb(var(--surface))'}} activeDot={<PulsingDot />} filter="url(#neonGlow)" name="Expenses" />
                )}

                {visibleSeries.netProfit && (
                    chartType === 'area' ? <Area type="monotone" dataKey="netProfit" stroke="rgb(var(--secondary))" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" filter="url(#neonGlow)" activeDot={<PulsingDot />} name="Net Profit" /> :
                    chartType === 'bar' ? <Bar dataKey="netProfit" fill="rgb(var(--secondary))" radius={[6, 6, 0, 0]} name="Net Profit" /> :
                    <Line type={currentTheme.includes('analytics') ? 'step' : 'monotone'} dataKey="netProfit" stroke="rgb(var(--secondary))" strokeWidth={3} dot={{r: 5, strokeWidth: 2, fill: 'rgb(var(--surface))'}} activeDot={<PulsingDot />} filter="url(#neonGlow)" name="Net Profit" />
                )}
                
                {compareMode && (
                    <>
                        {visibleSeries.revenue && (
                            chartType === 'bar' ? <Bar dataKey="revenuePrev" fill="rgb(var(--primary))" fillOpacity={0.3} radius={[6, 6, 0, 0]} name={`Rev (${comparisonLabel || 'Prev'})`} /> :
                            <Line type="monotone" dataKey="revenuePrev" stroke="rgb(var(--primary))" strokeOpacity={0.5} strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} name={`Rev (${comparisonLabel || 'Prev'})`} />
                        )}
                        {visibleSeries.expenses && (
                            chartType === 'bar' ? <Bar dataKey="expensesPrev" fill="rgb(var(--danger))" fillOpacity={0.3} radius={[6, 6, 0, 0]} name={`Exp (${comparisonLabel || 'Prev'})`} /> :
                            <Line type="monotone" dataKey="expensesPrev" stroke="rgb(var(--danger))" strokeOpacity={0.5} strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} name={`Exp (${comparisonLabel || 'Prev'})`} />
                        )}
                        {visibleSeries.netProfit && (
                            chartType === 'bar' ? <Bar dataKey="netProfitPrev" fill="rgb(var(--secondary))" fillOpacity={0.3} radius={[6, 6, 0, 0]} name={`Net (${comparisonLabel || 'Prev'})`} /> :
                            <Line type="monotone" dataKey="netProfitPrev" stroke="rgb(var(--secondary))" strokeOpacity={0.5} strokeDasharray="5 5" strokeWidth={2} dot={false} activeDot={false} name={`Net (${comparisonLabel || 'Prev'})`} />
                        )}
                    </>
                )}
            </ChartComponent>
        </ResponsiveContainer>
    );
};
