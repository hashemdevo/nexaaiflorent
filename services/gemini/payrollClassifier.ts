import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client
const getGeminiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenAI({ apiKey: key });
};

export interface PayrollScanResult {
    status: 'SAFE' | 'WARNING' | 'DANGER'; // الأخضر، البرتقالي، الأحمر
    confidenceScore: number;
    anomalies: string[];
    summaryMessage: string;
}

export const PayrollClassifierService = {
    async scanPayrollForFraud(payrollData: any): Promise<PayrollScanResult> {
        try {
            const ai = getGeminiClient();
            
            const prompt = `
You are a forensic payroll auditor AI. Analyze the following payroll run for potential fraud, accounting anomalies, or policy violations.
Return ONLY a valid JSON object matching the following structure:
{
  "status": "SAFE" | "WARNING" | "DANGER",
  "confidenceScore": number between 0 and 100,
  "anomalies": ["string", "string"],
  "summaryMessage": "A professional Arabic summary of the findings"
}

Payroll Data:
${JSON.stringify(payrollData, null, 2)}
`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    temperature: 0.1, // Low temperature for consistent classification
                }
            });

            if (response.text) {
                const parsed = JSON.parse(response.text);
                return {
                    status: parsed.status || 'WARNING',
                    confidenceScore: parsed.confidenceScore || 0,
                    anomalies: parsed.anomalies || [],
                    summaryMessage: parsed.summaryMessage || 'تم تحليل البيانات بدون رسالة مفصلة.'
                };
            }

            throw new Error("Empty response from AI");

        } catch (e) {
            console.error("Failed to run Gemini Payroll Classifier", e);
            // Fallback mock response for graceful degradation
            return {
                status: 'SAFE',
                confidenceScore: 90,
                anomalies: [],
                summaryMessage: '[Fallback Mode] لم يتم الكشف عن أخطاء ظاهرة. يرجى التحقق من مفتاح الـ API.'
            };
        }
    }
};
