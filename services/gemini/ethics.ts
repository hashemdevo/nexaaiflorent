import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * ETHICS & BRAND SAFETY SERVICE
 * Reviews content for bias, ethical concerns, and brand alignment.
 */
export const EthicsService = {

    /**
     * Reviews a piece of text for potential ethical or brand safety issues.
     */
    async reviewContent(text: string) {
        try {
            const model = "gemini-3-pro-preview"; // Use Pro for nuanced ethical reasoning
            const prompt = `
            Review the following text for potential ethical issues, unintended bias, or brand safety risks.
            Text: "${text}"
            
            Analyze from the perspective of a publicly-traded company's brand values (inclusivity, professionalism, customer-centricity).
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a Chief Ethics and Compliance Officer.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            overallRisk: { type: Type.STRING, enum: ["NONE", "LOW", "MEDIUM", "HIGH"] },
                            findings: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        issue: { type: Type.STRING, description: "e.g., Potential Bias, Ambiguous Language" },
                                        explanation: { type: Type.STRING },
                                        suggestion: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Ethics Review Error:", error);
            return null;
        }
    }
};