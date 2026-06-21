import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * EMPLOYEE TRAINING & DEVELOPMENT SERVICE
 * Creates learning materials, quizzes, and role-playing scenarios.
 */
export const TrainingService = {

    /**
     * Generates a multiple-choice quiz based on a training document.
     */
    async createQuizFromDocument(documentText: string, numberOfQuestions: number = 5) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `
            Based on the following training material, create a multiple-choice quiz with ${numberOfQuestions} questions to test comprehension.
            For each question, provide 4 options and indicate the correct answer.
            
            Material: "${documentText.substring(0, 8000)}..."
            `;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are an instructional designer.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            quizTitle: { type: Type.STRING },
                            questions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        question: { type: Type.STRING },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        correctAnswerIndex: { type: Type.NUMBER }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("Quiz Generation Error:", error);
            return null;
        }
    }
};