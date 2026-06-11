import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * CUSTOMER RELATIONSHIP MANAGEMENT (CRM) SERVICE
 * Analyzes customer interactions and sentiments.
 */
export const CrmService = {

    /**
     * Analyzes customer feedback for sentiment and priority.
     */
    async analyzeCustomerFeedback(feedbackText: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Analyze this customer feedback for sentiment, key issues, and urgency.
            Feedback: "${feedbackText}"
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a customer support manager.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            sentiment: { type: Type.STRING, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE"] },
                            priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
                            keyIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
                            suggestedNextStep: { type: Type.STRING }
                        }
                    }
                }
            });

            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("CRM Analysis Error:", error);
            throw error;
        }
    },

    /**
     * Generates a context-aware reply to a support query.
     */
    async generateSupportReply(query: string, context?: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Draft an empathetic and helpful reply to this customer query.
                Query: "${query}"
                ${context ? `Context: ${context}` : ''}`,
                config: {
                    systemInstruction: "You are a friendly and knowledgeable support agent.",
                }
            });
            return response.text;
        } catch (error) {
            return "We are looking into your issue and will get back to you shortly.";
        }
    }
};
