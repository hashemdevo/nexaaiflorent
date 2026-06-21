import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * EDUCATION & E-LEARNING SERVICE
 * Creates training content, lesson plans, and assessments.
 */
export const EducationService = {

    /**
     * Generates a lesson plan for a specific topic.
     */
    async createLessonPlan(topic: string, targetAudience: string, durationMinutes: number) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Create a structured lesson plan for the topic: "${topic}".
            The target audience is ${targetAudience}.
            The total duration should be approximately ${durationMinutes} minutes.
            
            Include learning objectives, key activities, and assessment methods.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are an expert instructional designer and corporate trainer.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            topic: { type: Type.STRING },
                            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                            activities: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        activity: { type: Type.STRING },
                                        time_minutes: { type: Type.NUMBER }
                                    }
                                }
                            },
                            assessment: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Lesson Plan Generation Error:", error);
            return null;
        }
    }
};