
export const KPI_DEFINITIONS: any = {
  ratios: [
    { id: 'current_ratio', name: 'Current Ratio', value: 1.8, prev: 1.5, unit: 'x', formula: 'Current Assets / Current Liabilities', desc: 'Measures ability to pay short-term obligations.' },
    { id: 'quick_ratio', name: 'Quick Ratio', value: 1.4, prev: 1.2, unit: 'x', formula: '(Curr. Assets - Inventory) / Curr. Liabilities', desc: 'Measures liquidity excluding inventory.' },
    { id: 'debt_equity', name: 'Debt-to-Equity', value: 0.45, prev: 0.50, unit: 'ratio', formula: 'Total Liabilities / Shareholder Equity', desc: 'Indicates financial leverage. Lower is generally better.' },
    { id: 'net_margin', name: 'Net Profit Margin', value: 18.5, prev: 15.2, unit: '%', formula: 'Net Income / Revenue * 100', desc: 'Percentage of revenue that becomes profit.' },
  ],
  efficiency: [
    { id: 'asset_turnover', name: 'Asset Turnover', value: 2.1, prev: 1.9, unit: 'x', formula: 'Net Sales / Average Total Assets', desc: 'How efficiently assets generate sales.' },
    { id: 'receivables_turnover', name: 'Receivables Turnover', value: 8.4, prev: 7.8, unit: 'x', formula: 'Net Credit Sales / Avg Accounts Receivable', desc: 'Effectiveness in collecting debts.' },
    { id: 'dso', name: 'Days Sales Outstanding', value: 43, prev: 46, unit: 'days', formula: '365 / Receivables Turnover', desc: 'Avg days to collect payment after sale. Lower is better.' },
  ],
  profitability: [
    { id: 'gross_margin', name: 'Gross Profit Margin', value: 65.2, prev: 62.1, unit: '%', formula: '(Revenue - COGS) / Revenue * 100', desc: 'Profit after direct costs.' },
    { id: 'operating_margin', name: 'Operating Margin', value: 28.4, prev: 26.0, unit: '%', formula: 'Operating Income / Revenue * 100', desc: 'Profit from core operations.' },
    { id: 'roi', name: 'Return on Investment', value: 12.4, prev: 10.1, unit: '%', formula: 'Net Profit / Total Investment * 100', desc: 'Efficiency of an investment.' },
  ],
  risk: [
    { id: 'burn_rate', name: 'Burn Rate', value: 15000, prev: 18000, unit: '$', formula: 'Monthly Operating Expenses - Monthly Revenue', desc: 'Rate at which cash is decreasing.' },
    { id: 'runway', name: 'Cash Runway', value: 14, prev: 10, unit: 'mo', formula: 'Cash Balance / Monthly Burn Rate', desc: 'Months until cash runs out.' },
    { id: 'coverage', name: 'Interest Coverage', value: 5.2, prev: 4.8, unit: 'x', formula: 'EBIT / Interest Expense', desc: 'Ability to pay interest on outstanding debt.' },
  ],
  investment: [
    { id: 'roe', name: 'Return on Equity', value: 15.8, prev: 14.2, unit: '%', formula: 'Net Income / Shareholders Equity * 100', desc: 'Profitability relative to stockholder equity.' },
    { id: 'eva', name: 'Economic Value Added', value: 54000, prev: 48000, unit: '$', formula: 'NOPAT - (Invested Capital * WACC)', desc: 'True economic profit after capital costs.' },
    { id: 'eps', name: 'Earnings Per Share', value: 4.25, prev: 3.80, unit: '$', formula: '(Net Income - Pref. Div) / Shares Outstanding', desc: 'Profit allocated to each share.' },
  ],
  cost_variance: [
    { id: 'cpi', name: 'Cost Performance Index', value: 1.05, prev: 0.98, unit: 'x', formula: 'Earned Value / Actual Cost', desc: 'Efficiency of funds spent. >1 is good.' },
    { id: 'cv', name: 'Cost Variance', value: 4500, prev: -1200, unit: '$', formula: 'Earned Value - Actual Cost', desc: 'Difference between budget and actual spend.' },
    { id: 'overhead_rate', name: 'Overhead Rate', value: 22.5, prev: 24.0, unit: '%', formula: 'Indirect Costs / Direct Costs * 100', desc: 'Percentage of indirect costs.' },
  ],
  logistics_ops: [
    { id: 'otd', name: 'On-Time Delivery', value: 96.5, prev: 94.2, unit: '%', formula: 'On-Time Orders / Total Orders * 100', desc: 'Percentage of orders delivered on time.' },
    { id: 'cycle_time', name: 'Order Cycle Time', value: 2.5, prev: 3.1, unit: 'days', formula: 'Avg time from Order to Delivery', desc: 'Speed of fulfillment process.' },
    { id: 'freight_cost', name: 'Freight Cost / Unit', value: 4.20, prev: 4.55, unit: '$', formula: 'Total Freight / Units Shipped', desc: 'Shipping efficiency per unit.' },
  ]
};

export const generateTrendData = () => [
  { month: 'Jan', revenue: 45000, revenuePrev: 38000, expenses: 32000, expensesPrev: 30000, netProfit: 13000, netProfitPrev: 8000 },
  { month: 'Feb', revenue: 52000, revenuePrev: 41000, expenses: 34000, expensesPrev: 31000, netProfit: 18000, netProfitPrev: 10000 },
  { month: 'Mar', revenue: 48000, revenuePrev: 43000, expenses: 31000, expensesPrev: 32000, netProfit: 17000, netProfitPrev: 11000 },
  { month: 'Apr', revenue: 61000, revenuePrev: 48000, expenses: 38000, expensesPrev: 35000, netProfit: 23000, netProfitPrev: 13000 },
  { month: 'May', revenue: 55000, revenuePrev: 51000, expenses: 36000, expensesPrev: 38000, netProfit: 19000, netProfitPrev: 13000 },
  { month: 'Jun', revenue: 67000, revenuePrev: 56000, expenses: 41000, expensesPrev: 40000, netProfit: 26000, netProfitPrev: 16000 },
];

export const generateKpiHistory = (baseValue: number, prevBaseValue: number) => {
  return Array.from({ length: 6 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
    value: baseValue * (1 + (Math.random() * 0.2 - 0.1)),
    prevValue: prevBaseValue * (1 + (Math.random() * 0.2 - 0.1))
  }));
};
