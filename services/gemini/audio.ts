
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * AUDIO SERVICE
 * Handles Voice-to-Text, Sentiment Analysis, and Voice Commands.
 */
export const AudioService = {
    
    async transcribe(base64Audio: string, mimeType: string = 'audio/mp3') {
        try {
            const model = "gemini-2.5-flash";
            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { inlineData: { data: base64Audio, mimeType } },
                        { text: "Transcribe this audio precisely. Do not summarize. Return only the text." }
                    ]
                }
            });
            return response.text;
        } catch (error) {
            console.error("Audio Transcription Error:", error);
            return null;
        }
    },

    async analyzeFinancialCommand(base64Audio: string, mimeType: string = 'audio/mp3') {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Listen to this financial memo. Extract the transaction details for accounting entry.
            Identify: Transaction Date, Total Amount, Parties involved, and suggest the business purpose.
            Return strictly JSON.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { inlineData: { data: base64Audio, mimeType } },
                        { text: prompt }
                    ]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE,
                    responseMimeType: "application/json"
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Audio Analysis Error:", error);
            throw error;
        }
    },

    async speakText(text: string) {
        try {
            const model = "gemini-3.1-flash-tts-preview";
            const response = await ai.models.generateContent({
                model,
                contents: `تحويل النص التالي إلى صوت منطوق واضح بلغة مفهومة وسياق محاسبي مالي: "${text}"`,
            });
            const part = response?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData?.data) {
                return {
                    audioData: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'audio/wav'
                };
            }
            return null;
        } catch (error) {
            console.error("Text To Speech Error:", error);
            return null;
        }
    }
};
