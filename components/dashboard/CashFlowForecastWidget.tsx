
import React, { useEffect, useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Nexa } from '../../services/api';
import { CashFlowForecast } from '../../services/forecasting/types';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-border p-3 rounded-xl shadow-lg">
        <p className="font-bold text-on-surface mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-on-surface-muted">{entry.name}:</span>
              <span className="font-mono font-bold text-on-surface">
                ${Math.abs(entry.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const CashFlowForecastWidget: React.FC = () => {
  const [data, setData] = useState<CashFlowForecast[]>([]);
  const [netChange, setNetChange] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch 3 months projection
      const forecast = await Nexa.Forecasting.CashFlow.predict(3);
      
      // Calculate Net Movement for the period
      const totalIn = forecast.reduce((acc, curr) => acc + curr.predictedInflow, 0);
      const totalOut = forecast.reduce((acc, curr) => acc + curr.predictedOutflow, 0);
      setNetChange(totalIn - totalOut);

      // Format for Chart
      setData(forecast.map(f => ({
        ...f,
        // Format date for axis
        date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        // Create a "Net Flow" for the bar chart (Inflow - Outflow)
        netFlow: f.predictedInflow - f.predictedOutflow
      })));
    };

    fetchData();
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-on-surface text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Cash Flow Forecast
          </h3>
          <p className="text-xs text-on-surface-muted mt-1">90-Day Projection based on receivables & payables.</p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${netChange >= 0 ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-danger/10 border-danger/20 text-danger'}`}>
          {netChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          Net: ${Math.abs(netChange).toLocaleString()}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
            <XAxis dataKey="date" stroke="rgb(var(--on-surface-muted))" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
            <YAxis stroke="rgb(var(--on-surface-muted))" tick={{fontSize: 10}} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            
            {/* Net Flow Bar (Green/Red based on value) */}
            <Bar dataKey="netFlow" name="Daily Net Flow" barSize={12} radius={[2, 2, 2, 2]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.netFlow >= 0 ? 'rgb(var(--secondary))' : 'rgb(var(--danger))'} fillOpacity={0.8} />
              ))}
            </Bar>

            {/* Projected Balance Line */}
            <Line type="monotone" dataKey="predictedBalance" name="Projected Balance" stroke="rgb(var(--primary))" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
