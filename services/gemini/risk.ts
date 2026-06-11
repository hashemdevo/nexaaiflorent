import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * BUSINESS RISK ANALYSIS SERVICE
 * Identifies operational, market, and strategic risks.
 */
export const RiskService = {

    /**
     * Identifies potential risks for a new project or venture.
     */
    async identifyProjectRisks(projectDescription: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Identify the top 5 potential business risks (operational, market, financial, strategic) for the following project. 
            For each risk, suggest a mitigation strategy.
            Project: "${projectDescription}"
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a Chief Risk Officer (CRO).",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            risks: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        risk: { type: Type.STRING },
                                        category: { type: Type.STRING },
                                        impact: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
                                        mitigation: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Risk Identification Error:", error);
            return null;
        }
    }
};
