import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * CONSTRUCTION & ENGINEERING SERVICE
 * Analyzes project plans, safety reports, and daily logs.
 */
export const ConstructionService = {

    /**
     * Reviews a daily construction report for safety violations or delays.
     */
    async analyzeDailyReport(reportText: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Analyze this daily construction site report. Identify any safety incidents, reported project delays, or equipment issues.
            
            Report: "${reportText.substring(0, 8000)}..."
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a construction project manager with a strong focus on safety and timelines.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            safetyIncidents: { type: Type.ARRAY, items: { type: Type.STRING } },
                            projectDelays: { type: Type.ARRAY, items: { type: Type.STRING } },
                            equipmentIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
                            summary: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Construction Report Analysis Error:", error);
            return null;
        }
    }
};