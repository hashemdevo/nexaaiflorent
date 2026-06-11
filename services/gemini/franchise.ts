import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * FRANCHISE MANAGEMENT SERVICE
 * Audits franchisee performance and ensures brand compliance.
 */
export const FranchiseService = {

    /**
     * Audits a franchisee's sales report against brand standards.
     */
    async auditFranchiseReport(reportText: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Audit this franchisee's monthly report. Compare sales data against expected performance and check for any brand compliance issues mentioned (e.g., unapproved marketing, incorrect pricing).
            
            Report: "${reportText.substring(0, 10000)}..."
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a franchise operations director.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            performanceSummary: { type: Type.STRING },
                            complianceIssues: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        issue: { type: Type.STRING },
                                        recommendation: { type: Type.STRING }
                                    }
                                }
                            },
                            overallRating: { type: Type.STRING, enum: ["EXCELLENT", "GOOD", "NEEDS_IMPROVEMENT"] }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Franchise Audit Error:", error);
            return null;
        }
    }
};
