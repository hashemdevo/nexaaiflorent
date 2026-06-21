import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * CORPORATE HEALTH & WELLNESS SERVICE
 * Analyzes anonymized health data to suggest wellness programs.
 */
export const HealthService = {

    /**
     * Analyzes anonymized health data to identify trends and suggest programs.
     */
    async analyzeWellnessData(data: { department: string, sick_days_taken: number, reported_stress_level: number }[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Analyze this anonymized employee wellness data. Identify trends in sick days and stress levels by department.
            Suggest two corporate wellness initiatives to address the findings.
            
            Data: ${JSON.stringify(data)}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a corporate wellness consultant with a background in public health.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
                            recommendations: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        initiative: { type: Type.STRING },
                                        rationale: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Wellness Data Analysis Error:", error);
            return null;
        }
    }
};
