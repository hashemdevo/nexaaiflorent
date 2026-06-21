import { ai, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * EXECUTIVE REPORTING SERVICE
 * Converts raw financial data into narrative summaries.
 */
export const ReportingService = {

    /**
     * Generates a narrative summary from a financial statement.
     */
    async generateExecutiveSummary(reportData: any) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Write a concise executive summary for a board meeting based on this financial data.
            Highlight key performance indicators, significant changes, and potential risks.
            
            Data: ${JSON.stringify(reportData)}
            
            Format as a professional, easy-to-read narrative in Markdown.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a Chief Financial Officer (CFO).",
                    temperature: 0.5
                }
            });

            return response.text;
        } catch (error) {
            console.error("Executive Summary Error:", error);
            return "Could not generate summary.";
        }
    }
};
