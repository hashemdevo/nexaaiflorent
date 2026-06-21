import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * TRANSLATION SERVICE
 * Translates text while preserving business context.
 */
export const TranslationService = {

    /**
     * Translates a block of text to a target language.
     */
    async translateText(text: string, targetLanguage: string, context?: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Translate the following text into ${targetLanguage}.
            ${context ? `The context is a ${context}. Preserve the professional tone.` : ''}

            Text: "${text}"
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a professional translator for business communications.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            sourceLanguage: { type: Type.STRING },
                            targetLanguage: { type: Type.STRING },
                            translatedText: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Translation Error:", error);
            return null;
        }
    }
};