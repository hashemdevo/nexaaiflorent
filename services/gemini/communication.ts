
import { ai, cleanAndParseJSON } from "./core";

/**
 * COMMUNICATION SERVICE
 * Generates professional emails, letters, and reports.
 */
export const CommunicationService = {

    async generateEmail(
        type: 'INVOICE_REMINDER' | 'WELCOME' | 'DUNNING' | 'QUOTE_FOLLOWUP',
        recipientName: string,
        details: any
    ) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Draft a professional email.
            Type: ${type}
            Recipient: ${recipientName}
            Details: ${JSON.stringify(details)}
            
            Tone: Professional, Polite, but firm if Dunning.
            Return JSON with 'subject' and 'body' (HTML allowed).
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            return { subject: "Error", body: "Could not generate email." };
        }
    },

    async summarizeMeeting(transcript: string) {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: `Summarize this meeting transcript into Key Decisions and Action Items:\n${transcript}`
            });
            return response.text;
        } catch (error) {
            return "Summary failed.";
        }
    }
};
