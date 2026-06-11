import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const arData = [
  { name: 'Current', value: 120500 },
  { name: '1-30 Days', value: 45200 },
  { name: '31-60 Days', value: 15800 },
  { name: '60+ Days', value: 8900 },
];

const apData = [
  { name: 'Current', value: 65000 },
  { name: '1-30 Days', value: 18000 },
  { name: '31-60 Days', value: 4200 },
  { name: '60+ Days', value: 1500 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/80 backdrop-blur-md border border-border p-3 rounded-xl shadow-lg">
        <p className="font-bold text-on-surface">{`${label}: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export const AgingSummary: React.FC = () => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-border animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Accounts Receivable */}
        <div>
          <h3 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            Receivables Aging
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={arData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128,128,128,0.1)" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="rgb(var(--on-surface-muted))" tick={{fontSize: 12}} width={80} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(128,128,128,0.1)'}} />
                <Bar dataKey="value" fill="rgb(var(--secondary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accounts Payable */}
        <div>
          <h3 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-danger" />
            Payables Aging
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128,128,128,0.1)" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="rgb(var(--on-surface-muted))" tick={{fontSize: 12}} width={80} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(128,128,128,0.1)'}} />
                <Bar dataKey="value" fill="rgb(var(--danger))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
