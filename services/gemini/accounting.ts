import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";
import { AudioService } from "./audio";

/**
 * ACCOUNTING SERVICE
 * Handles Double-Entry Bookkeeping logic, Journal Entry generation, and COA mapping.
 */
export const AccountingService = {

    async suggestDoubleEntry(description: string, amount: number) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `Suggest the double-entry bookkeeping records for: "${description}" with amount ${amount}. 
            Ensure compliance with standard chart of accounts (e.g., 1010 Cash, 5000 Expense).
            Return JSON with debitAccount, creditAccount, and brief explanation.`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE,
                    responseMimeType: "application/json"
                }
            });
            return response.text; // Returning text string of JSON as requested by legacy components
        } catch (error) {
            return null;
        }
    },

    async analyzeTransaction(inputType: 'TEXT' | 'IMAGE' | 'AUDIO', content: string, mimeType?: string) {
        try {
            const model = "gemini-2.5-flash";
            let parts = [];

            if (inputType === 'TEXT') {
                parts.push({ text: content });
            } else if (inputType === 'IMAGE' || inputType === 'AUDIO') {
                parts.push({
                    inlineData: {
                        data: content,
                        mimeType: mimeType || (inputType === 'IMAGE' ? 'image/jpeg' : 'audio/mp3')
                    }
                });
                parts.push({ text: inputType === 'AUDIO' ? "Listen to this financial memo." : "Analyze this financial document." });
            }

            const prompt = `
            Act as a Senior Accountant (CPA). Create a Journal Entry.
            
            Rules:
            1. Identify Transaction Date, Total Amount, Tax.
            2. Determine Debit/Credit accounts.
            3. For each line, provide a brief 'description' explaining its purpose.
            4. For each line, if applicable, break it down into up to 4 levels of analytical sub-ledgers in the 'subsidiaryLedger' array (e.g., ['Office Supplies', 'Stationery', 'Adhesive Tapes', '3M Brand']).
            5. Separate specific tax (VAT/Sales Tax) if mentioned.
            6. Flag 'isNewAccount' if account seems non-standard.
            
            Return strictly JSON.
            `;

            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [...parts, { text: prompt }]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            date: { type: Type.STRING },
                            parties: { type: Type.ARRAY, items: { type: Type.STRING } },
                            totalAmount: { type: Type.NUMBER },
                            taxAmount: { type: Type.NUMBER },
                            lines: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        accountName: { type: Type.STRING },
                                        debit: { type: Type.NUMBER },
                                        credit: { type: Type.NUMBER },
                                        isNewAccount: { type: Type.BOOLEAN },
                                        suggestedParentAccount: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        subsidiaryLedger: { 
                                            type: Type.ARRAY, 
                                            items: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return cleanAndParseJSON(response.text);

        } catch (error) {
            console.error("Accounting Analysis Error:", error);
            throw error;
        }
    }
};