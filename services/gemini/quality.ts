import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * QUALITY CONTROL (QC) SERVICE
 * Assists in visual inspection and defect detection.
 */
export const QualityService = {

    /**
     * Inspects an image of a product for manufacturing defects.
     */
    async inspectProductImage(productImage: { base64Data: string, mimeType: string }, referenceStandard: string) {
        try {
            const model = "gemini-3-pro-preview"; // Use Pro for detailed visual inspection
            const prompt = `
            Act as a quality control inspector. Compare this product image against the reference standard.
            Identify any visual defects such as scratches, dents, discoloration, or incorrect assembly.
            
            Reference Standard: "${referenceStandard}"
            `;

            const response = await ai.models.generateContent({
                model,
                contents: {
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { data: productImage.base64Data, mimeType: productImage.mimeType } }
                    ]
                },
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE + " You are a highly precise manufacturing quality assurance system.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            inspectionResult: { type: Type.STRING, enum: ["PASS", "FAIL", "NEEDS_REVIEW"] },
                            defectsFound: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        defectType: { type: Type.STRING },
                                        location: { type: Type.STRING, description: "e.g., top-left corner" },
                                        severity: { type: Type.STRING, enum: ["MINOR", "MAJOR", "CRITICAL"] }
                                    }
                                }
                            },
                            summary: { type: Type.STRING }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text);
        } catch (error) {
            console.error("QC Inspection Error:", error);
            return null;
        }
    }
};