import { Type } from "@google/genai";
import { ai, cleanAndParseJSON, SYSTEM_INSTRUCTION_CORE } from "./core";

/**
 * FINANCE ANALYSIS SERVICE
 * Forensic accounting, Risk assessment, and Anomaly detection.
 */
export const FinanceAnalysisService = {

    async analyzeBankTransactions(transactions: any[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `Analyze the following bank transactions. Identify spending trends, unusual recurring payments, and potential liquidity issues.
            Transactions: ${JSON.stringify(transactions)}
            Return a summary analysis in markdown format.`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE,
                    temperature: 0.3,
                }
            });
            return response.text;
        } catch (error) {
            console.error("Bank Analysis Error:", error);
            return "Analysis unavailable.";
        }
    },

    async detectAnomalies(transactions: any[]) {
        try {
            // --- Programmatic Heuristic Core ---
            const programmaticAnomalies: any[] = [];
            
            // 1. Double Payment Detection
            const seen = new Map<string, any>();
            transactions.forEach(t => {
                const key = `${t.amount}_${t.date}_${t.category}`;
                if (seen.has(key)) {
                    programmaticAnomalies.push({
                        id: t.id,
                        reason: `Programmatic Match: Potential duplicate transaction of same amount ($${t.amount}) found on same day.`,
                        severity: "medium"
                    });
                } else {
                    seen.set(key, t);
                }
            });

            // 2. Statistical Outlier Heuristic (> 3x average amount for the category)
            const categorySums: Record<string, number> = {};
            const categoryCounts: Record<string, number> = {};
            transactions.forEach(t => {
                const cat = t.category || 'default';
                categorySums[cat] = (categorySums[cat] || 0) + Number(t.amount);
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
            
            transactions.forEach(t => {
                const cat = t.category || 'default';
                const avg = categorySums[cat] / categoryCounts[cat];
                if (Number(t.amount) > avg * 3.5) {
                    programmaticAnomalies.push({
                        id: t.id,
                        reason: `Programmatic Match: High outlier anomaly. Value of $${t.amount} is significantly above the category average ($${avg.toFixed(2)}).`,
                        severity: "high"
                    });
                }
            });

            // --- LLM Inference Core ---
            const model = "gemini-2.5-flash"; // Standard fast and powerful model
            const prompt = `Perform a forensic audit. Detect anomalies.
            We have pre-calculated the following algorithmic heuristics:
            ${JSON.stringify(programmaticAnomalies)}
            
            In addition to these, analyze the full dataset for:
            - Duplicate/split payments
            - Statistical outlier violations (Benford's Law distribution anomalies)
            - Suspicious timing (weekends/holidays)
            - Structuring/smurfing indicators
            - Mismatched categories and ledger descriptions
            
            Transactions Data: ${JSON.stringify(transactions)}
            
            Combine the pre-calculated programmatic issues with your deep linguistic findings and return a unified list of anomalies in English.`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            anomalies: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        reason: { type: Type.STRING },
                                        severity: { type: Type.STRING, enum: ["low", "medium", "high"] }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            
            const aiResult = cleanAndParseJSON(response.text, { anomalies: [] });
            
            // Merge programmatic findings if AI missed any or failed, ensuring highest accuracy
            const mergedMap = new Map<string, any>();
            [...programmaticAnomalies, ...(aiResult.anomalies || [])].forEach(a => {
                mergedMap.set(`${a.id}_${a.severity}`, a);
            });
            
            return { anomalies: Array.from(mergedMap.values()) };
        } catch (error) {
            console.error("Anomaly Detection Error:", error);
            return { anomalies: [] };
        }
    },

    async analyzeComplianceRisk(transactions: any[]) {
        try {
            const model = "gemini-2.5-flash"; // Standardized for zero-error model availability
            const prompt = `Conduct a regulatory compliance risk assessment (GAAP/IFRS, Tax Law).
            Transactions: ${JSON.stringify(transactions)}
            Return JSON with "risks" array.`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            risks: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        category: { type: Type.STRING, enum: ["Regulatory", "Tax", "Operational", "Fraud"] },
                                        riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
                                        finding: { type: Type.STRING },
                                        implication: { type: Type.STRING },
                                        recommendation: { type: Type.STRING },
                                        regulationReference: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            return cleanAndParseJSON(response.text, { risks: [] });
        } catch (error) {
            console.error("Compliance Risk Error:", error);
            return { risks: [] };
        }
    },

    async investigateBenfordAnomalies(statsSummary: any, flaggedTransactions: any[]) {
        try {
            const model = "gemini-2.5-flash";
            const prompt = `Conduct a rigorous PhD-level forensic accounting investigation based on standard Benford's Law statistical anomaly analysis.
            
            STATISTICAL FINDINGS SUMMARY:
            - Chi-Square Goodness-of-Fit: ${statsSummary.chiSquare.toFixed(4)}
            - P-Value: ${statsSummary.pValue.toFixed(6)}
            - Rejects Null Hypothesis (Is Materially Anomalous): ${statsSummary.isAnomalous ? "YES" : "NO"}
            
            PINPOINT DIGIT DEVIATIONS:
            ${JSON.stringify(statsSummary.deviations)}
            
            SAMPLE TRANSACTIONS IN FLAGGED RANGES:
            ${JSON.stringify(flaggedTransactions.slice(0, 15))}
            
            Perform a professional audit analysis explaining:
            1. What these statistical deviations mean financially (e.g. possible transaction splitting, authorization threshold bypass, tax avoidance, or data entry errors).
            2. Interpret the Chi-Square and specific digit deviations (focus especially on digits with high positive Z-Scores representing overrepresented transaction sizes).
            3. Risk Classification rating (Critical, High, Medium, Low) for internal controllers.
            4. Detail which transaction patterns or specific merchants look highly suspicious.
            5. Provide 3-4 concrete internal control or tax compliance recommendations for mitigation.
            
            Format your response in beautifully formatted Markdown with distinct headings. Maintain a highly professional, clinical, objective forensic tone.`;

            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION_CORE,
                    temperature: 0.1,
                }
            });
            return response.text || "Forensic narrative generation failed.";
        } catch (error) {
            console.error("Benford Forensic Investigation Error:", error);
            return "Forensic investigation unavailable due to an API error.";
        }
    }
};
