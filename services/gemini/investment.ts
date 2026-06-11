import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * INVESTMENT ANALYSIS SERVICE
 * Assesses market opportunities and potential investments.
 */
export const InvestmentService = {

    /**
     * Provides a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for a business idea.
     */
    async performSwotAnalysis(businessIdea: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `Perform a detailed SWOT analysis for the following business idea: "${businessIdea}"`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a venture capital analyst.",
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
