
import { ai, cleanAndParseJSON } from "./core";

/**
 * MARKET INTELLIGENCE SERVICE
 * Uses Google Search Grounding to fetch real-time data.
 */
export const MarketService = {

    /**
     * Searches for latest tax regulations or compliance news.
     */
    async getRegulatoryUpdates(jurisdiction: string, topic: string) {
        try {
            // Uses Search Grounding - responseMimeType must NOT be set
            const model = "gemini-2.5-flash"; 
            const response = await ai.models.generateContent({
                model,
                contents: `What are the latest ${topic} regulations or changes in ${jurisdiction} for 2024-2025? Provide sources.`,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });
            
            return {
                summary: response.text,
                sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
            };
        } catch (error) {
            console.error("Market Research Error:", error);
            return { summary: "Could not fetch updates.", sources: [] };
        }
    },

    /**
     * Checks for negative news or risks associated with a vendor.
     */
    async vendorDueDiligence(vendorName: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Search for any recent lawsuits, bankruptcies, or fraud allegations regarding "${vendorName}". Summarize findings.`,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });
            return response.text;
        } catch (error) {
            return "Due diligence check failed.";
        }
    }
};
