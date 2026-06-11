
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AccountingStandard } from '../../../services/accounting/standards';

interface IncomeStatementProps {
    standard: AccountingStandard;
    readOnly?: boolean;
}

const MOCK_DATA_PNL = [
  { month: 'Jan', revenue: 40000, expenses: 24000 },
  { month: 'Feb', revenue: 30000, expenses: 13980 },
  { month: 'Mar', revenue: 20000, expenses: 9800 },
  { month: 'Apr', revenue: 27800, expenses: 3908 },
  { month: 'May', revenue: 18900, expenses: 4800 },
  { month: 'Jun', revenue: 23900, expenses: 3800 },
];

export const IncomeStatement: React.FC<IncomeStatementProps> = ({ standard, readOnly }) => {
    // IFRS Presentation often groups by nature or function differently than GAAP
    const labelExpenses = standard === 'IFRS' ? 'Operating Costs' : 'Expenses';
    const labelProfit = standard === 'IFRS' ? 'Profit for the Year' : 'Net Income';

    return (
        <div className="glass-panel p-6 rounded-2xl border border-border lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-on-surface">Revenue vs {labelExpenses}</h3>
                    <p className="text-xs text-on-surface-muted">
                        Standard: <span className="text-primary font-bold">{standard}</span>
                    </p>
                </div>
            </div>
            
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_DATA_PNL} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
                        <XAxis dataKey="month" stroke="rgb(var(--on-surface-muted))" tick={{fill: 'rgb(var(--on-surface-muted))', fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="rgb(var(--on-surface-muted))" tick={{fill: 'rgb(var(--on-surface-muted))', fontSize: 12}} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: 'rgba(128,128,128,0.1)'}}
                            contentStyle={{ backgroundColor: 'rgb(var(--surface))', borderRadius: '12px', border: '1px solid rgba(128,128,128,0.1)', color: 'rgb(var(--on-surface))' }}
                            itemStyle={{ color: 'rgb(var(--on-surface))' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="revenue" fill="rgb(var(--primary))" radius={[6, 6, 0, 0]} name="Revenue" maxBarSize={50} />
                        <Bar dataKey="expenses" fill="rgb(var(--surface-highlight))" radius={[6, 6, 0, 0]} name={labelExpenses} maxBarSize={50} stroke="rgb(var(--border))" strokeWidth={1} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
