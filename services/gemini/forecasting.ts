import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * FINANCIAL FORECASTING SERVICE
 * Predicts future financial metrics based on historical data.
 */
export const ForecastingService = {

    /**
     * Forecasts cash flow for the next 90 days.
     */
    async predictCashFlow(historicalData: any[]) {
        try {
            const model = "gemini-3-pro-preview"; // Pro model for complex time-series analysis
            const prompt = `
            Analyze this historical cash flow data. Project the cash flow for the next 90 days.
            Consider seasonality and recent trends.
            Data: ${JSON.stringify(historicalData.slice(-12))}
            Return a JSON object with a "forecast" array, each object having "date", "inflow", "outflow", and "balance".
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a quantitative financial analyst.",
                    responseMimeType: "application/json"
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Cash Flow Forecast Error:", error);
            throw error;
        }
    },

    /**
     * Predicts demand for specific products.
     */
    async predictSalesDemand(productSalesHistory: any[]) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Based on this sales data, predict the demand for the next month and suggest an optimal inventory level.
                Data: ${JSON.stringify(productSalesHistory)}`,
                config: {
                    systemInstruction: "You are a supply chain analyst.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            productId: { type: Type.STRING },
                            predictedDemand: { type: Type.NUMBER },
                            confidence: { type: Type.STRING },
                            suggestedStockLevel: { type: Type.NUMBER }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            return null;
        }
    }
};
