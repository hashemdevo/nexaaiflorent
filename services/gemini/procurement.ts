import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * PROCUREMENT & SOURCING SERVICE
 * Analyzes supplier quotes and assists in purchasing decisions.
 */
export const ProcurementService = {

    /**
     * Compares multiple supplier quotes.
     */
    async analyzeSupplierQuotes(quoteDocuments: { base64Data: string, mimeType: string }[]) {
        try {
            const model = "gemini-3-pro-preview"; // Use Pro for complex document comparison
            
            const parts: any[] = [
                { text: "Compare these supplier quotes for a new server rack. Extract vendor name, total price, key specifications, and delivery time. Identify the best value." }
            ];
            quoteDocuments.forEach(doc => {
                parts.push({ inlineData: { data: doc.base64Data, mimeType: doc.mimeType } });
            });

            const response = await ai.models.generateContent({
                model,
                contents: { role: "user", parts },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a procurement specialist focused on finding the best value.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            comparisonSummary: { type: Type.STRING },
                            bestOption: { type: Type.STRING, description: "Name of the recommended vendor" },
                            quotes: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        vendor: { type: Type.STRING },
                                        totalPrice: { type: Type.NUMBER },
                                        deliveryEstimate: { type: Type.STRING },
                                        notes: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Procurement Analysis Error:", error);
            throw error;
        }
    },

    /**
     * Drafts a Request for Quote (RFQ).
     */
    async draftRequestForQuote(requirements: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Draft a formal Request for Quote (RFQ) document. Requirements: ${requirements}`,
                config: {
                    systemInstruction: "You are a professional purchasing manager.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};
