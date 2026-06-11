import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * RESEARCH & DEVELOPMENT (R&D) SERVICE
 * Summarizes technical papers and analyzes experimental data.
 */
export const RandDService = {

    /**
     * Summarizes a technical or scientific paper.
     */
    async summarizePaper(paperText: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Summarize the following scientific paper. 
            Extract the abstract, methodology, key findings, and conclusion.
            
            Paper Text: "${paperText.substring(0, 15000)}..."
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a PhD-level researcher in the relevant field.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            abstractSummary: { type: Type.STRING },
                            methodology: { type: Type.STRING },
                            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
                            conclusion: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Paper Summarization Error:", error);
            return null;
        }
    }
};
