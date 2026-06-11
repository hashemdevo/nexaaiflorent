import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * BUSINESS STRATEGY SERVICE
 * Assists with high-level strategic planning like SWOT and PESTLE analysis.
 */
export const StrategyService = {

    /**
     * Performs a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis.
     */
    async performSwotAnalysis(companyProfile: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Perform a comprehensive SWOT analysis for a company with the following profile:
            "${companyProfile}"
            
            Use your knowledge of business and market trends to identify opportunities and threats.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a senior business strategist from a top consulting firm.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                            threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("SWOT Analysis Error:", error);
            return null;
        }
    }
};