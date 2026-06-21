
import { Type } from "@google/genai";
import { ai, cleanAndParseJSON } from "./core";

/**
 * DATA CLEANING SERVICE (ETL)
 * Intelligent data transformation and correction.
 */
export const DataService = {

    /**
     * Normalizes messy address or name data.
     */
    async normalizeData(rawData: any[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            You are a Data Engineer. Clean and normalize this dataset.
            1. Fix capitalization.
            2. Standardize phone numbers to E.164.
            3. Correct obvious typos in cities/countries.
            
            Input Data: ${JSON.stringify(rawData)}
            
            Return cleaned JSON array.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });
            return cleanAndParseJSON(response.text, rawData);
        } catch (error) {
            return rawData;
        }
    },

    /**
     * Maps CSV headers to System Schema automatically.
     */
    async autoMapSchema(csvHeaders: string[], systemSchema: string[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Map these CSV headers to the best matching System Schema fields.
            CSV Headers: ${JSON.stringify(csvHeaders)}
            System Fields: ${JSON.stringify(systemSchema)}
            
            Return JSON: { "csvHeader": "systemField", ... }
            If no match, map to null.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            return {};
        }
    }
};
