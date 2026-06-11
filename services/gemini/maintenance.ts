import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * PREDICTIVE MAINTENANCE SERVICE
 * Analyzes asset data to forecast maintenance needs.
 */
export const MaintenanceService = {

    /**
     * Predicts potential failures and suggests a maintenance schedule.
     */
    async schedulePredictiveMaintenance(assetType: string, usageData: any[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Analyze the usage data for a "${assetType}".
            Based on common failure patterns for this type of equipment, predict the next likely maintenance requirement and suggest a scheduled date.
            
            Usage Data: ${JSON.stringify(usageData)}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are an industrial engineer specializing in reliability and maintenance.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            predictedFailureMode: { type: Type.STRING },
                            recommendedAction: { type: Type.STRING },
                            suggestedDate: { type: Type.STRING, description: "YYYY-MM-DD" },
                            confidence: { type: Type.NUMBER }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Maintenance Prediction Error:", error);
            return null;
        }
    }
};