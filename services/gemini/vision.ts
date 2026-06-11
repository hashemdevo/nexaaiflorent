
import { Type } from "@google/genai";
import { ai, cleanAndParseJSON } from "./core";

/**
 * VISION & OCR SERVICE
 * Specialized in extracting data from images, PDFs, and scans.
 */
export const VisionService = {
    
    async parseInvoice(base64Data: string, mimeType: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: "Analyze this financial document. Extract vendor, dates, amounts, and line items." }
                    ]
                },
                config: {
                    systemInstruction: "You are an expert OCR AI. Extract data precisely. Format dates as YYYY-MM-DD.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            vendorName: { type: Type.STRING },
                            invoiceDate: { type: Type.STRING },
                            invoiceNumber: { type: Type.STRING },
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        quantity: { type: Type.NUMBER },
                                        unitPrice: { type: Type.NUMBER },
                                        total: { type: Type.NUMBER }
                                    }
                                }
                            },
                            subtotal: { type: Type.NUMBER },
                            tax: { type: Type.NUMBER },
                            totalAmount: { type: Type.NUMBER }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Vision Service Error (Invoice):", error);
            throw error;
        }
    },

    async parseAssetDocument(base64Data: string, mimeType: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: "Analyze this document for Fixed Asset capitalization based on GAAP thresholds." }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            invoiceDate: { type: Type.STRING },
                            vendor: { type: Type.STRING },
                            invoiceNumber: { type: Type.STRING },
                            tax: { type: Type.NUMBER },
                            totalAmount: { type: Type.NUMBER },
                            assets: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        cost: { type: Type.NUMBER },
                                        quantity: { type: Type.NUMBER },
                                        suggestedLife: { type: Type.NUMBER },
                                        suggestedSalvage: { type: Type.NUMBER }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Vision Service Error (Asset):", error);
            throw error;
        }
    },

    async parseReceipt(base64Data: string, mimeType: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { inlineData: { data: base64Data, mimeType: mimeType } },
                        { text: "Extract payment proof details." }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            amount: { type: Type.NUMBER },
                            date: { type: Type.STRING },
                            method: { type: Type.STRING },
                            reference: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Vision Service Error (Receipt):", error);
            throw error;
        }
    }
};
