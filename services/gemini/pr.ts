import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * PUBLIC RELATIONS (PR) SERVICE
 * Manages public communications and brand reputation.
 */
export const PrService = {

    /**
     * Drafts a press release for a company announcement.
     */
    async draftPressRelease(announcement: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Draft a professional press release for the following announcement:
            "${announcement}"
            Include a boilerplate about the company "Nexa Ledger AI".
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a senior PR manager. Follow standard press release format.",
                }
            });
            return response.text;
        } catch (error) {
            console.error("Press Release Drafting Error:", error);
            return null;
        }
    }
};
