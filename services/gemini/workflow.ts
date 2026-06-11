import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * INTELLIGENT WORKFLOW SERVICE
 * Automates routing and approval processes.
 */
export const WorkflowService = {

    /**
     * Suggests the appropriate approver for a request.
     */
    async suggestApprover(requestType: 'EXPENSE' | 'PURCHASE' | 'LEAVE', details: any) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Based on our company policy (high-value purchases to CFO, IT requests to CTO, leave to HR),
            suggest the correct approver for this request.
            
            Type: ${requestType}
            Details: ${JSON.stringify(details)}
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are an internal audit and workflow system.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            approverRole: { type: Type.STRING },
                            approverName: { type: Type.STRING },
                            reason: { type: Type.STRING },
                            escalationPath: { type: Type.STRING }
                        }
                    }
                }
            });

            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Approver Suggestion Error:", error);
            throw error;
        }
    }
};
