import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * HOSPITALITY MANAGEMENT SERVICE
 * Analyzes guest feedback, suggests pricing, and optimizes hotel operations.
 */
export const HospitalityService = {

    /**
     * Analyzes a batch of guest reviews for common themes.
     */
    async analyzeGuestFeedback(reviews: string[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Analyze these hotel guest reviews. Identify recurring positive and negative themes regarding cleanliness, staff, amenities, and location.
            
            Reviews: ${JSON.stringify(reviews.slice(0, 20))}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a hotel general manager focused on improving guest satisfaction.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            positiveThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                            negativeThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                            actionableSuggestion: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Guest Feedback Analysis Error:", error);
            return null;
        }
    },

    /**
     * Suggests dynamic room pricing based on occupancy and local events.
     */
    async suggestDynamicPricing(occupancyRate: number, localEvents: string[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Current hotel occupancy is at ${occupancyRate}%.
            Upcoming local events: ${localEvents.join(', ')}.
            
            Suggest a percentage adjustment for our standard room rates for the next 7 days.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a revenue manager for a hotel chain.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};