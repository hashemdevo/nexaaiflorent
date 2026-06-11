import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * AGRICULTURE TECHNOLOGY (AGRITECH) SERVICE
 * Analyzes crop health, predicts yields, and assists with farm management.
 */
export const AgricultureService = {

    /**
     * Analyzes an image of a plant for signs of disease or nutrient deficiency.
     */
    async analyzeCropHealth(cropImage: { base64Data: string, mimeType: string }) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = "Analyze this image of a plant leaf. Identify any visible signs of disease, pests, or nutrient deficiencies. Provide a diagnosis and suggested treatment.";

            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { data: cropImage.base64Data, mimeType: cropImage.mimeType } }
                    ]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are an expert agronomist and plant pathologist.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            healthStatus: { type: Type.STRING, enum: ["HEALTHY", "DISEASED", "DEFICIENT"] },
                            diagnosis: { type: Type.STRING },
                            confidence: { type: Type.NUMBER },
                            recommendedAction: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Crop Health Analysis Error:", error);
            return null;
        }
    },

    /**
     * Predicts crop yield based on historical data and weather forecasts.
     */
    async predictYield(cropType: string, historicalYields: any[], weatherForecast: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Predict the yield for ${cropType} for the upcoming season.
            Historical Yield Data: ${JSON.stringify(historicalYields)}
            Weather Forecast: "${weatherForecast}"
            
            Provide a predicted yield in tons per hectare and explain the key factors influencing your prediction.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a data scientist specializing in agricultural forecasting.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};