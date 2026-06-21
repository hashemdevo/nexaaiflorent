
import { GoogleGenAI } from "@google/genai";

export const apiKey = process.env.API_KEY || '';
export const ai = new GoogleGenAI({ apiKey });

export const SYSTEM_INSTRUCTION_CORE = `You are Nexa Ledger AI, a world-class financial authority possessing PhD-level expertise in Accounting (CPA, CMA), GAAP/IFRS compliance, Risk Management, and Corporate Law. 
Your analysis must be rigorous, legally sound, data-driven, and adhering to strict financial regulations.`;

/**
 * PHD-LEVEL JSON SANITIZER & PARSER
 * Robustly handles AI hallucinations, Markdown artifacts, trailing commas,
 * comments, and control characters using Regex extraction and purification.
 */
export const cleanAndParseJSON = (text: string | undefined | null, defaultValue: any = null) => {
  if (!text || typeof text !== 'string') return defaultValue;

  const tryParse = (str: string) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  try {
    // 1. Initial Cleanup: Control characters and non-breaking spaces
    let cleaned = text.replace(/[\u0000-\u0009\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, ''); 
    cleaned = cleaned.replace(/\u00A0/g, ' ');

    // 2. Strip Markdown Code Blocks (```json ... ```)
    cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();

    // 3. Robust Extraction: Find the outermost valid JSON structure ({...} or [...])
    // This regex looks for the first { or [ and the last } or ]
    const jsonStructureRegex = /(\{|\[)[\s\S]*(\}|\])/;
    const match = cleaned.match(jsonStructureRegex);
    
    if (match) {
        cleaned = match[0];
    } else {
        // If no JSON structure found, try parsing raw text if it's a simple primitive, otherwise fail
        const simpleAttempt = tryParse(cleaned);
        return simpleAttempt !== null ? simpleAttempt : defaultValue;
    }

    // 4. Remove Comments (Single line // and Multi line /* */)
    // Note: This regex is complex to avoid matching urls (http://) or inside strings
    cleaned = cleaned.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g1) => g1 ? "" : m);

    // 5. Fix Trailing Commas (Common AI Error)
    // Replaces ,} with } and ,] with ]
    cleaned = cleaned.replace(/,(\s*[\]\}])/g, '$1');

    // 6. Attempt Primary Parse
    const parsed = tryParse(cleaned);
    if (parsed !== null) return parsed;

    // 7. Fallback: Aggressive Quote Repair (Fixes 'key': 'value' -> "key": "value")
    // Only applied if standard parse fails to avoid breaking valid strings containing quotes
    let repaired = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":'); // Unquoted keys
    repaired = repaired.replace(/'/g, '"'); // Single quotes to double
    
    const finalAttempt = tryParse(repaired);
    if (finalAttempt !== null) return finalAttempt;

    console.warn("JSON Sanitization failed after deep cleaning. Returning default value.");
    return defaultValue;

  } catch (error) {
    console.error("Deep JSON Sanitization Critical Failure:", error);
    return defaultValue;
  }
};
