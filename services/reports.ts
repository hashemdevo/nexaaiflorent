
export const FinancialReportingService = {
  getIncomeStatement: async () => ({
    revenue: { total: 0, items: [] },
    expenses: { total: 0, items: [] },
    netIncome: 0
  })
};
