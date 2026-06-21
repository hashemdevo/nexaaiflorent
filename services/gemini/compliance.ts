import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * COMPLIANCE & GOVERNANCE SERVICE
 * Generates checklists and analyzes policies against regulations.
 */
export const ComplianceService = {

    /**
     * Generates a high-level compliance checklist for a specific regulation.
     */
    async generateComplianceChecklist(regulation: 'GDPR' | 'SOX' | 'HIPAA') {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Generate a high-level compliance checklist for ${regulation}. 
            Focus on the top 10 most critical areas for a mid-sized tech company.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a compliance officer and auditor.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            regulation: { type: Type.STRING },
                            checklist: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        area: { type: Type.STRING },
                                        requirement: { type: Type.STRING },
                                        isCompliant: { type: Type.BOOLEAN, description: "Default to false" }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Checklist Generation Error:", error);
            return null;
        }
    },

    /**
     * Audits an internal policy against a specific standard.
     */
    async auditInternalPolicy(policyText: string, standard: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Review this internal company policy and identify any gaps or conflicts with the ${standard} standard.
            
            Policy Text: "${policyText.substring(0, 5000)}..."
            
            Provide a summary of findings and specific recommendations for improvement.
            `;
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a certified internal auditor (CIA). Be thorough and precise."
                }
            });
            return response.text;
        } catch (error) {
            return "Could not perform audit.";
        }
    }
};
