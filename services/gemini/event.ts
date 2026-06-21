import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * CORPORATE EVENT PLANNING SERVICE
 * Assists in organizing events, creating agendas, and drafting communications.
 */
export const EventService = {

    /**
     * Generates a theme and agenda for a corporate event.
     */
    async planCorporateEvent(eventType: string, goal: string, attendees: number) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Plan a corporate event.
            Event Type: ${eventType} (e.g., Annual Sales Kick-off, Team Offsite)
            Goal: ${goal}
            Number of Attendees: ${attendees}
            
            Suggest a theme, a detailed agenda with timings, and two potential icebreaker activities.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a creative and highly organized corporate event planner.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            theme: { type: Type.STRING },
                            agenda: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.STRING },
                                        session: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    }
                                }
                            },
                            icebreakers: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Event Planning Error:", error);
            return null;
        }
    }
};