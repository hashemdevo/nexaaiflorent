import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * INSURANCE ANALYSIS SERVICE
 * Reviews corporate insurance policies and processes claims.
 */
export const InsuranceService = {

    /**
     * Reviews an insurance policy document for key coverage details and exclusions.
     */
    async reviewPolicy(policyDocument: { base64Data: string, mimeType: string }) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = "Analyze this insurance policy. Summarize the key coverage limits, deductibles, and major exclusions in a structured format.";

            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { data: policyDocument.base64Data, mimeType: policyDocument.mimeType } }
                    ]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a senior insurance underwriter.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            policyType: { type: Type.STRING },
                            coverageLimits: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            deductibles: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            keyExclusions: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Insurance Policy Review Error:", error);
            return null;
        }
    },

    /**
     * Drafts an initial insurance claim based on an incident description.
     */
    async draftClaim(incidentDescription: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Draft a first notice of loss (FNOL) for an insurance claim based on this incident: "${incidentDescription}"`,
                config: {
                    systemInstruction: "You are a claims adjuster. Be clear, concise, and factual.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};
