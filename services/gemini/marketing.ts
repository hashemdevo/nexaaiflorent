import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * MARKETING & ADVERTISING SERVICE
 * Generates creative content for marketing campaigns.
 */
export const MarketingService = {

    /**
     * Generates compelling ad copy for a product.
     */
    async generateAdCopy(productName: string, description: string, targetAudience: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Generate 3 variations of ad copy for a Google Ads campaign.
            Product: ${productName}
            Description: ${description}
            Target Audience: ${targetAudience}
            
            Focus on benefits and include a strong call to action.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a senior copywriter at a top advertising agency.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            variations: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        headline: { type: Type.STRING },
                                        body: { type: Type.STRING },
                                        cta: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Ad Copy Generation Error:", error);
            return null;
        }
    },

    /**
     * Creates a social media post for a specified platform.
     */
    async createSocialMediaPost(topic: string, platform: 'TWITTER' | 'LINKEDIN') {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Draft a social media post for ${platform}.
            Topic: "${topic}"
            Include relevant hashtags and an engaging tone suitable for the platform.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a social media manager for a B2B tech company.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};
