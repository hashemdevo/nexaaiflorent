
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, CreditCard, DollarSign } from 'lucide-react';
import { Nexa } from '../../services/api';

const StatCard = ({ title, value, trend, trendValue, type, icon: Icon }: any) => {
    const gradientClass = type === 'income' ? 'from-secondary/10' : type === 'expense' ? 'from-danger/10' : 'from-primary/10';
    const iconColor = type === 'income' ? 'text-secondary' : type === 'expense' ? 'text-danger' : 'text-primary';
    
    return (
      <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all hover:-translate-y-1 border border-border`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent opacity-50`}></div>
        
        <div className="relative z-10 flex justify-between items-start">
            <div>
                <h3 className="text-on-surface-muted text-xs font-bold uppercase tracking-widest mb-2">{title}</h3>
                <div className="text-3xl font-bold text-on-surface tracking-tight">{value}</div>
            </div>
            <div className={`p-3 rounded-xl bg-surface-highlight border border-border/50 shadow-sm`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
        </div>
        
        <div className="relative z-10 mt-4 flex items-center gap-3">
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg border backdrop-blur-sm ${trend === 'up' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {trendValue}
            </div>
            <span className="text-xs text-on-surface-muted font-medium">vs last period</span>
        </div>
      </div>
    );
};

export const StatCards: React.FC = () => {
  const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0 });

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const incomeStmt = await Nexa.Reports.Financials.getIncomeStatement();
            setStats({
                income: incomeStmt.revenue.total,
                expense: incomeStmt.expenses.total,
                profit: incomeStmt.netIncome
            });
        } catch (e) {
            console.error("Failed to fetch stats", e);
        }
    };

    fetchStats();
    
    const handleUpdate = () => fetchStats();
    window.addEventListener('nexa-storage-update', handleUpdate);
    return () => window.removeEventListener('nexa-storage-update', handleUpdate);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <StatCard 
            title="Total Revenue" 
            value={`$${stats.income.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
            trend="up" 
            trendValue="12%" 
            type="income" 
            icon={Wallet} 
        />
        <StatCard 
            title="Total Expenses" 
            value={`$${stats.expense.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
            trend="down" 
            trendValue="5%" 
            type="expense" 
            icon={CreditCard} 
        />
        <StatCard 
            title="Net Profit" 
            value={`$${stats.profit.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
            trend={stats.profit >= 0 ? "up" : "down"} 
            trendValue="Stable" 
            type="profit" 
            icon={DollarSign} 
        />
    </div>
  );
};
