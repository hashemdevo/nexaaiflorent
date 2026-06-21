import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * ENERGY SECTOR SERVICE
 * Analyzes grid data, forecasts energy load, and optimizes resource allocation.
 */
export const EnergyService = {

    /**
     * Forecasts electricity demand based on weather and historical usage.
     */
    async forecastEnergyLoad(historicalUsage: any[], weatherForecast: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Analyze the historical electricity usage and the upcoming weather forecast to predict the energy load for the next 24 hours.
            Historical Usage: ${JSON.stringify(historicalUsage.slice(-100))}
            Weather Forecast: "${weatherForecast}"
            
            Provide an hourly forecast in megawatts (MW).
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a power grid operations analyst.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            peakLoad: { type: Type.NUMBER },
                            peakTime: { type: Type.STRING },
                            hourlyForecast: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        hour: { type: Type.NUMBER },
                                        load_mw: { type: Type.NUMBER }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Energy Load Forecast Error:", error);
            return null;
        }
    },

    /**
     * Analyzes an aerial image to assess suitability for solar panel installation.
     */
    async analyzeSiteForSolar(siteImage: { base64Data: string, mimeType: string }) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = "Analyze this aerial image of a property. Assess its suitability for solar panel installation. Consider roof space, orientation, and potential obstructions like trees.";

            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { data: siteImage.base64Data, mimeType: siteImage.mimeType } }
                    ]
                },
                config: {
                    systemInstruction: "You are a renewable energy consultant.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};