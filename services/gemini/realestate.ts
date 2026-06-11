import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * CORPORATE REAL ESTATE SERVICE
 * Manages property leases and facility management tasks.
 */
export const RealEstateService = {

    /**
     * Extracts key terms from a commercial lease agreement.
     */
    async analyzeLease(leaseDocument: { base64Data: string, mimeType: string }) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = "Analyze this commercial lease agreement. Extract the landlord, tenant, lease term, rent, renewal options, and any maintenance responsibilities.";

            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { data: leaseDocument.base64Data, mimeType: leaseDocument.mimeType } }
                    ]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a commercial real estate lawyer.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            leaseStartDate: { type: Type.STRING },
                            leaseEndDate: { type: Type.STRING },
                            monthlyRent: { type: Type.NUMBER },
                            renewalNoticeDate: { type: Type.STRING },
                            tenantResponsibilities: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Lease Analysis Error:", error);
            return null;
        }
    },

    /**
     * Drafts a maintenance request for a facility issue.
     */
    async draftMaintenanceRequest(issue: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Draft a formal maintenance request to a building manager for the following issue: "${issue}"`,
                config: {
                    systemInstruction: "You are a facilities manager.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};
