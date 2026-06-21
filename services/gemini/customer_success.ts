import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * CUSTOMER SUCCESS SERVICE
 * Proactively identifies at-risk customers and suggests retention strategies.
 */
export const CustomerSuccessService = {

    /**
     * Identifies customers at risk of churning based on usage data.
     */
    async identifyChurnRisk(customerData: { customer_id: string, last_login: string, features_used: number, support_tickets_opened: number }[]) {
        try {
            const model = "gemini-3-pro-preview";
            const prompt = `
            Analyze this customer usage data. Identify customers who are at risk of churning.
            Look for patterns like decreased login frequency, low feature adoption, or a recent spike in support tickets.
            
            Data: ${JSON.stringify(customerData)}
            
            Return a list of at-risk customers and a specific, actionable retention strategy for each.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a data-driven Customer Success Manager.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            atRiskCustomers: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        customer_id: { type: Type.STRING },
                                        risk_reason: { type: Type.STRING },
                                        retention_strategy: { type: Type.STRING, description: "e.g., 'Schedule a training session', 'Offer a discount'" }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Churn Risk Analysis Error:", error);
            return null;
        }
    }
};
