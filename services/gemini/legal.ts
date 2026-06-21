
import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * LEGAL INTELLIGENCE SERVICE
 * Specialized in analyzing contracts, agreements, and compliance documents.
 */
export const LegalService = {

    /**
     * Extracts key dates, values, and obligations from a contract text.
     */
    async analyzeContract(contractText: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Analyze the following legal contract text. 
            Extract key metadata including parties involved, effective dates, value, and key obligations/penalties.
            
            Contract Text: "${contractText.substring(0, 10000)}..." (truncated if too long)
            `;

            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [{ text: prompt }]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a Corporate Lawyer specializing in Contract Law.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            contractType: { type: Type.STRING },
                            parties: { type: Type.ARRAY, items: { type: Type.STRING } },
                            startDate: { type: Type.STRING },
                            endDate: { type: Type.STRING },
                            totalValue: { type: Type.NUMBER },
                            currency: { type: Type.STRING },
                            renewalTerms: { type: Type.STRING },
                            penalties: { type: Type.ARRAY, items: { type: Type.STRING } },
                            riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
                        }
                    }
                }
            });

            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Legal Analysis Error:", error);
            throw error;
        }
    },

    /**
     * Drafts a specific legal clause based on requirements.
     */
    async draftClause(type: 'NDA' | 'NON_COMPETE' | 'PAYMENT_TERMS', context: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Draft a legally sound ${type} clause. Context: ${context}`,
                config: {
                    systemInstruction: "You are a Senior Legal Counsel. Output only the clause text.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};
