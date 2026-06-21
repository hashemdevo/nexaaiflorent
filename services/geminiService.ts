import { cleanAndParseJSON } from './gemini/core';
import { FinanceAnalysisService } from './gemini/finance';

// Basic mock function to prevent UI from breaking
export const analyzeFinancialTransaction = async (text: string) => { return { status: 'mock' }; };
export const parseAssetDocument = async (file: any) => { return { status: 'mock' }; };
export const parsePaymentReceipt = async (file: any) => { return { status: 'mock' }; };
export const automateEntrySuggestion = async (data: any) => { return { status: 'mock' }; };
export const parseInvoiceDocument = async (file: any) => { return { status: 'mock' }; };
export const speakText = async (text: string) => { return; };

export const analyzeBankTransactions = FinanceAnalysisService.analyzeBankTransactions;
export const detectAnomalies = FinanceAnalysisService.detectAnomalies;
export const investigateBenfordAnomalies = FinanceAnalysisService.investigateBenfordAnomalies;
export const analyzeComplianceRisk = FinanceAnalysisService.analyzeComplianceRisk;

// If we need missing modules, let's expose generic proxies or placeholders
export const Gemini = {
  Finance: FinanceAnalysisService,
  Construction: { analyzeDailyReport: async (i: any) => ({}) },
  Health: { analyzeWellnessData: async (i: any) => ({}) },
  Retail: { analyzeMarketBasket: async (i: any) => ({}) },
  Legal: { analyzeContract: async (i: any) => ({}) },
  Education: { createLessonPlan: async (t: any, a: any, d: any) => ({}) },
  Logistics: { getHarmonizedCode: async (i: any) => ({}) },
  Hospitality: { suggestDynamicPricing: async (o: any, l: any) => ({}) },
};

export { cleanAndParseJSON };
