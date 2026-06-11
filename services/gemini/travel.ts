import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * CORPORATE TRAVEL SERVICE
 * Assists in planning trips and automating expense reports from travel receipts.
 */
export const TravelService = {

    /**
     * Creates a business trip itinerary.
     */
    async planItinerary(destination: string, dates: string, purpose: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Create a cost-effective business travel itinerary.
            Destination: ${destination}
            Dates: ${dates}
            Purpose: ${purpose}

            Suggest flights, accommodation, and a daily schedule.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are an expert corporate travel agent.",
                    tools: [{ googleSearch: {} }] // Use search for real-time flight/hotel info
                }
            });

            // This is a text response, but we can also extract sources
            return {
                itinerary: response.text,
                sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
            };
        } catch (error) {
            console.error("Itinerary Planning Error:", error);
            return null;
        }
    },

    /**
     * Compiles an expense report from multiple receipts.
     */
    async compileExpenseReport(receipts: { base64Data: string, mimeType: string }[]) {
        try {
            const model = "gemini-3-pro-preview";
            const parts: any[] = [
                { text: "Analyze these receipts from a business trip. Compile a structured expense report, categorizing each expense (e.g., Lodging, Meals, Transport) and summing the totals." }
            ];
            receipts.forEach(doc => {
                parts.push({ inlineData: { data: doc.base64Data, mimeType: doc.mimeType } });
            });

            const response = await ai.models.generateContent({
                model,
                contents: { role: "user", parts },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are an expense auditing system.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            totalAmount: { type: Type.NUMBER },
                            expenses: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        date: { type: Type.STRING },
                                        vendor: { type: Type.STRING },
                                        amount: { type: Type.NUMBER },
                                        category: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Expense Report Compilation Error:", error);
            return null;
        }
    }
};
