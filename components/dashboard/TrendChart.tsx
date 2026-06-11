
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, Layers, PieChart as PieChartIcon, Filter, RefreshCw } from 'lucide-react';
import { Nexa } from '../../services/api';

export const TrendChart: React.FC = () => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'line' | 'pie'>('bar');
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });

  useEffect(() => {
      const fetchData = async () => {
          // In a real implementation, this would use a robust analytics endpoint that groups by month
          // For now, we use the Sales Analytics Service we built
          const salesTrend = await Nexa.Analytics.Sales.getRevenueTrend(6); // Last 6 months
          
          // Map to chart format
          const formattedData = salesTrend.map(metric => ({
              name: new Date(metric.period + '-01').toLocaleString('default', { month: 'short' }),
              income: metric.revenue,
              // For expense, we might need a dedicated expense trend service, mocking for now based on income
              expense: metric.revenue * 0.6 // Mock ratio for visualization until expense analytics is built
          }));

          setData(formattedData);
          
          const totalInc = formattedData.reduce((acc, curr) => acc + curr.income, 0);
          const totalExp = formattedData.reduce((acc, curr) => acc + curr.expense, 0);
          setTotals({ income: totalInc, expense: totalExp });
      };

      fetchData();
      
      const handleUpdate = () => fetchData();
      window.addEventListener('nexa-storage-update', handleUpdate);
      return () => window.removeEventListener('nexa-storage-update', handleUpdate);
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border h-[450px] flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-on-surface text-lg">Financial Trends</h3>
        
        <div className="flex items-center gap-2 bg-surface/50 p-1 rounded-xl border border-border">
            <button onClick={() => setChartType('bar')} className={`p-2 rounded-lg transition ${chartType === 'bar' ? 'bg-primary text-black shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`} title="Bar"><BarChart3 className="h-4 w-4" /></button>
            <button onClick={() => setChartType('line')} className={`p-2 rounded-lg transition ${chartType === 'line' ? 'bg-primary text-black shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`} title="Line"><LineChartIcon className="h-4 w-4" /></button>
            <button onClick={() => setChartType('area')} className={`p-2 rounded-lg transition ${chartType === 'area' ? 'bg-primary text-black shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`} title="Area"><Layers className="h-4 w-4" /></button>
            <button onClick={() => setChartType('pie')} className={`p-2 rounded-lg transition ${chartType === 'pie' ? 'bg-primary text-black shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`} title="Pie"><PieChartIcon className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="flex-1 w-full">
        {data.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-on-surface-muted">
                <RefreshCw className="h-8 w-8 mb-2 opacity-50 animate-spin-slow" />
                <p>Gathering data...</p>
            </div>
        ) : (
            <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                    <PieChart>
                        <Pie data={[{name: 'Revenue', value: totals.income}, {name: 'Expenses', value: totals.expense}]} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                            <Cell fill="rgb(var(--primary))" />
                            <Cell fill="rgb(var(--danger))" />
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--surface))', borderColor: 'rgb(var(--border))', borderRadius: '12px' }} />
                        <Legend />
                    </PieChart>
                ) : (
                    <BarChart data={data} barGap={8}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(var(--danger))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="rgb(var(--danger))" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgb(var(--on-surface-muted))', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgb(var(--on-surface-muted))', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.1)', color: 'rgb(var(--on-surface))' }} 
                        />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        {chartType === 'bar' && (
                            <>
                                <Bar dataKey="income" name="Revenue" fill="url(#colorIncome)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar dataKey="expense" name="Expenses" fill="url(#colorExpense)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </>
                        )}
                        {chartType === 'line' && (
                            <>
                                <Line type="monotone" dataKey="income" name="Revenue" stroke="rgb(var(--primary))" strokeWidth={3} dot={{r: 4, fill: 'rgb(var(--surface))'}} />
                                <Line type="monotone" dataKey="expense" name="Expenses" stroke="rgb(var(--danger))" strokeWidth={3} dot={{r: 4, fill: 'rgb(var(--surface))'}} />
                            </>
                        )}
                        {chartType === 'area' && (
                            <>
                                <Area type="monotone" dataKey="income" name="Revenue" stroke="rgb(var(--primary))" fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="expense" name="Expenses" stroke="rgb(var(--danger))" fill="url(#colorExpense)" />
                            </>
                        )}
                    </BarChart>
                )}
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
