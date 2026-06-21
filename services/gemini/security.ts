import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * AI SECURITY ANALYST SERVICE
 * Detects suspicious patterns in system logs.
 */
export const SecurityAIService = {

    /**
     * Scans a series of audit logs for anomalous patterns.
     */
    async analyzeAuditTrail(logs: any[]) {
        try {
            const model = "gemini-3-pro-preview"; // Use Pro for complex pattern recognition
            const prompt = `
            Act as a Security Operations Center (SOC) analyst. Analyze these audit logs for suspicious patterns.
            Look for:
            - Impossible travel (logins from different geos in short time).
            - Off-hours activity, especially data export or permission changes.
            - Brute-force attempts (multiple failed logins).
            - Privilege escalation attempts.

            Logs: ${JSON.stringify(logs.slice(0, 100))} (analyzing recent 100)
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " Your specialty is cybersecurity threat intelligence.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            threatLevel: { type: Type.STRING, enum: ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                            findings: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        patternDetected: { type: Type.STRING },
                                        implication: { type: Type.STRING },
                                        involvedUsers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        recommendation: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Security Analysis Error:", error);
            throw error;
        }
    }
};
