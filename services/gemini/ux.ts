import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * USER EXPERIENCE (UX) ANALYSIS SERVICE
 * Analyzes user feedback to identify pain points and suggest improvements.
 */
export const UxService = {

    /**
     * Summarizes a batch of user feedback into actionable insights.
     */
    async analyzeUserFeedback(feedbackItems: { source: string, text: string }[]) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Analyze the following collection of user feedback from support tickets, app reviews, and surveys.
            Group the feedback into common themes, identify the top 3 user pain points, and suggest concrete UX improvements.
            
            Feedback Data: ${JSON.stringify(feedbackItems.slice(0, 50))}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a Principal UX Researcher.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            overallSentiment: { type: Type.STRING, enum: ["POSITIVE", "MIXED", "NEGATIVE"] },
                            topPainPoints: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        theme: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        impact: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
                                    }
                                }
                            },
                            suggestedImprovements: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        area: { type: Type.STRING, description: "e.g., Dashboard, Mobile App" },
                                        suggestion: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("UX Feedback Analysis Error:", error);
            return null;
        }
    }
};
