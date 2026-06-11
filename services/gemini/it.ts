import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * IT OPERATIONS SERVICE
 * Assists with system administration, script generation, and log analysis.
 */
export const ItService = {

    /**
     * Generates a shell script for a specified task.
     */
    async generateScript(taskDescription: string, language: 'BASH' | 'POWERSHELL' = 'BASH') {
        try {
            const model = "gemini-3-pro-preview"; // Use Pro for coding tasks
            const prompt = `
            Generate a ${language} script to accomplish the following task:
            "${taskDescription}"
            
            Provide only the raw script code, without any markdown formatting or explanation.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: "You are a senior DevOps engineer. You write clean, efficient, and safe scripts.",
                    temperature: 0.2
                }
            });
            return response.text;
        } catch (error) {
            console.error("Script Generation Error:", error);
            return `# Error generating script: ${error}`;
        }
    },

    /**
     * Analyzes a server log file to find critical errors.
     */
    async analyzeLogFile(logContent: string) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Analyze this server log file content. Identify critical errors, group them by type, and provide a summary of the most urgent issue.
            Log Content (first 5000 chars):
            ${logContent.substring(0, 5000)}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a Site Reliability Engineer (SRE).",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            criticalErrorCount: { type: Type.NUMBER },
                            mostFrequentError: { type: Type.STRING },
                            recommendation: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Log Analysis Error:", error);
            return null;
        }
    }
};
