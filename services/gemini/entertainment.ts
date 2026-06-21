import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * ENTERTAINMENT & MEDIA SERVICE
 * Assists in creative development, script analysis, and content generation.
 */
export const EntertainmentService = {

    /**
     * Generates a movie or story synopsis from a high-level premise.
     */
    async generateSynopsis(premise: string, genre: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Generate a compelling movie synopsis for a ${genre} film.
            Premise: "${premise}"
            
            The synopsis should be around 150 words and include a logline.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a creative executive at a major film studio.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            titleSuggestion: { type: Type.STRING },
                            logline: { type: Type.STRING },
                            synopsis: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Synopsis Generation Error:", error);
            return null;
        }
    },

    /**
     * Analyzes a script for pacing, sentiment, and character arcs.
     */
    async analyzeScript(scriptText: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Analyze this script excerpt for pacing, emotional arc, and dialogue strength.
            Provide a brief critique and suggestions for improvement.
            
            Script: "${scriptText.substring(0, 15000)}..."
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a professional script doctor and story editor.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};