import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const data = [
  { name: 'Salaries', value: 45000 },
  { name: 'Marketing', value: 12000 },
  { name: 'Rent', value: 15000 },
  { name: 'Software', value: 8000 },
  { name: 'Other', value: 5000 },
];

const COLORS = ['rgb(var(--primary))', 'rgb(var(--secondary))', '#FFBB28', '#FF8042', 'rgb(var(--on-surface-muted))'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface/80 backdrop-blur-md border border-border p-3 rounded-xl shadow-lg">
        <p className="font-bold text-on-surface">{`${payload[0].name}: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

export const ExpenseBreakdown: React.FC = () => {
  return (
    <div className="glass-panel p-0 rounded-2xl border border-border overflow-hidden flex flex-col h-[300px] animate-fade-in">
        <div className="p-4 border-b border-border bg-surface/50">
            <h3 className="font-bold text-on-surface text-sm flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                Expense Breakdown
            </h3>
        </div>
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              stroke="none"
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
                iconType="circle" 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '12px', color: 'rgb(var(--on-surface-muted))' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
