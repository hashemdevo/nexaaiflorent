import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * HUMAN RESOURCES MANAGEMENT (HRM) SERVICE
 * Assists with recruitment and employee management tasks.
 */
export const HrmService = {

    /**
     * Parses a resume/CV to extract key information.
     */
    async analyzeResume(document: { base64Data: string, mimeType: string }) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { inlineData: { data: document.base64Data, mimeType: document.mimeType } },
                        { text: "Extract candidate information from this resume." }
                    ]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are an expert HR recruiter.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            email: { type: Type.STRING },
                            phone: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            experienceYears: { type: Type.NUMBER }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Resume Analysis Error:", error);
            throw error;
        }
    },
    
    /**
     * Drafts a job description based on a role title and key responsibilities.
     */
    async draftJobDescription(roleTitle: string, responsibilities: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Draft a professional job description for the role of "${roleTitle}". Key responsibilities include: ${responsibilities}`,
                config: {
                    systemInstruction: "You are a senior HR manager.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};
