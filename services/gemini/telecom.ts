import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * TELECOMMUNICATIONS SERVICE
 * Analyzes network performance, predicts customer churn, and assists in network planning.
 */
export const TelecomService = {

    /**
     * Analyzes network performance logs to identify the root cause of an issue.
     */
    async analyzeNetworkLogs(logData: string) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Analyze these telecommunications network logs to find the root cause of a reported service degradation.
            Look for patterns in signal strength, packet loss, and latency across different nodes.
            
            Logs: "${logData.substring(0, 15000)}..."
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a senior network operations center (NOC) engineer.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            rootCause: { type: Type.STRING },
                            impactedNodes: { type: Type.ARRAY, items: { type: Type.STRING } },
                            recommendation: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Network Log Analysis Error:", error);
            return null;
        }
    },

    /**
     * Predicts customer churn based on usage patterns and support interactions.
     */
    async predictChurn(customerData: any[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Analyze this data for telecom customers. Identify which customers are at the highest risk of churning in the next 30 days.
            Consider factors like call drops, low data usage, contract end date, and recent support calls.
            
            Data: ${JSON.stringify(customerData)}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a data analyst specializing in customer retention for telecom companies.",
                }
            });
            return response.text;
        } catch (error) {
            return null;
        }
    }
};