import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * RETAIL & E-COMMERCE SERVICE
 * Assists with merchandising, customer behavior analysis, and sales optimization.
 */
export const RetailService = {

    /**
     * Analyzes a list of transactions to find frequently co-purchased items.
     */
    async analyzeMarketBasket(transactions: { items: string[] }[]) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Perform a market basket analysis on these transactions. Identify the top 3 pairs of items that are frequently bought together.
            
            Transactions: ${JSON.stringify(transactions.slice(0, 100))}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a retail data analyst specializing in association rule mining.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            frequentPairs: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        itemA: { type: Type.STRING },
                                        itemB: { type: Type.STRING },
                                        confidence: { type: Type.NUMBER }
                                    }
                                }
                            },
                            merchandisingSuggestion: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Market Basket Analysis Error:", error);
            return null;
        }
    }
};