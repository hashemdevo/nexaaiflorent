import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * SUSTAINABILITY (ESG) SERVICE
 * Assists in generating Environmental, Social, and Governance reports.
 */
export const SustainabilityService = {

    /**
     * Generates an ESG report summary from activity data.
     */
    async generateEsgReport(activityData: { energy_consumption_kwh: number, water_usage_m3: number, employee_turnover_rate: number }) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Based on the following data, generate a brief ESG (Environmental, Social, and Governance) summary.
            Data: ${JSON.stringify(activityData)}
            Highlight key metrics and suggest one area for improvement.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a sustainability officer.",
                }
            });
            return response.text;
        } catch (error) {
            console.error("ESG Report Generation Error:", error);
            return null;
        }
    }
};
