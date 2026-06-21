import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * GOVERNMENT & PUBLIC SECTOR SERVICE
 * Assists in policy analysis, legislative summaries, and public record auditing.
 */
export const GovernmentService = {

    /**
     * Summarizes a lengthy piece of legislation into key points.
     */
    async summarizeLegislation(billText: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Summarize this legislative bill into a concise brief for a policymaker.
            Identify its purpose, key provisions, and potential impacts.
            
            Bill Text: "${billText.substring(0, 20000)}..."
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a non-partisan legislative analyst.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            billTitle: { type: Type.STRING },
                            purpose: { type: Type.STRING },
                            keyProvisions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            potentialImpacts: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Legislation Summary Error:", error);
            return null;
        }
    },

    /**
     * Analyzes public records for anomalies or signs of fraud.
     */
    async auditPublicRecords(records: any[]) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Audit these public procurement records for signs of potential fraud or irregularities.
            Look for patterns like single-bidder contracts, unusual payment amounts, or conflicts of interest.
            
            Records: ${JSON.stringify(records.slice(0, 50))}
            `;
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a government accountability auditor.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};