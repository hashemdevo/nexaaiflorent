import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * LOGISTICS & SUPPLY CHAIN SERVICE
 * Assists in managing shipping and distribution tasks.
 */
export const LogisticsService = {

    /**
     * Generates a formatted shipping manifest.
     */
    async generateShippingManifest(orderId: string, items: { sku: string, description: string, quantity: number }[], shippingAddress: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Generate a plain text shipping manifest document.
            Order ID: ${orderId}
            Shipping To: ${shippingAddress}
            Items: ${JSON.stringify(items)}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a warehouse logistics coordinator. Format output for clarity and use in shipping software.",
                }
            });
            return response.text;
        } catch (error) {
            console.error("Manifest Generation Error:", error);
            return null;
        }
    },
    
    /**
     * Classifies goods for customs declaration.
     */
    async getHarmonizedCode(productDescription: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `Provide the likely Harmonized System (HS) code for the following product for international shipping: "${productDescription}"`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are an expert in international trade and customs classification.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            product: { type: Type.STRING },
                            hsCode: { type: Type.STRING },
                            description: { type: Type.STRING },
                            confidence: { type: Type.NUMBER }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            return null;
        }
    },

    /**
     * Advanced HS Customs classification template report generator.
     */
    async getHarmonizedCustomsReportTemplate(productDescription: string, originCountry: string, destinationCountry: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `Generate a full HS Customs classification report template for:
            Product: "${productDescription}"
            Origin Country: "${originCountry}"
            Destination Country: "${destinationCountry}"
            
            Identify the primary HS Code (6-10 digits), estimated duty rates, import taxes, excise duties, required import certifications/licenses, and potential custom exemptions under trade agreements (e.g. GATT, FTA).`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a senior customs clearance auditor. Produce a highly structured, accurate customs compliance PDF/Print template report.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            hsCode: { type: Type.STRING },
                            commodityDescription: { type: Type.STRING },
                            baseDutyPercentage: { type: Type.NUMBER },
                            vatOrSalesTaxPercentage: { type: Type.NUMBER },
                            otherTaxesDescription: { type: Type.STRING },
                            requiredCertifications: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            exemptionEligibility: { type: Type.STRING },
                            customsValuationMethod: { type: Type.STRING },
                            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Customs Report Generation Error:", error);
            return null;
        }
    }
};
