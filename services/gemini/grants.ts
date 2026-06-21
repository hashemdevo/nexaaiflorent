import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * GRANT PROPOSAL SERVICE
 * Assists in finding and writing grant applications.
 */
export const GrantService = {

    /**
     * Drafts a section of a grant proposal.
     */
    async draftGrantSection(grantName: string, section: 'ABSTRACT' | 'NEEDS_STATEMENT', projectInfo: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Draft the "${section}" section for a grant proposal to "${grantName}".
            Our project is about: "${projectInfo}"
            The tone should be persuasive, data-driven, and aligned with typical foundation requirements.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a professional grant writer with a high success rate.",
                }
            });
            return response.text;
        } catch (error) {
            console.error("Grant Drafting Error:", error);
            return null;
        }
    }
};
