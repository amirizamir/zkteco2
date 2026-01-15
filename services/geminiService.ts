import { GoogleGenAI, Type } from "@google/genai";
import { AccessLog } from "../types";

const extractJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
};

export const analyzeSecurityLogs = async (logs: AccessLog[], auditMode: boolean = false) => {
  if (!process.env.API_KEY || !navigator.onLine) {
    console.warn("Sentinel: Operating in Local Mode (No AI Key or Offline)");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const logSummary = logs.map(l => ({
      time: l.timestamp.toISOString(),
      user: l.userName,
      status: l.status,
      method: l.method,
      dept: l.department
    }));

    const systemInstruction = auditMode 
      ? "You are a PCI-DSS QSA. Analyze logs for Requirement 10 compliance. Return ONLY JSON."
      : "You are a security operations center analyst. Return ONLY JSON.";

    const prompt = `Analyze these access logs: ${JSON.stringify(logSummary)}. 
    Provide a security assessment in JSON format. Include:
    1. "threatLevel": (low, medium, high)
    2. "pciCompliance": (Compliant, At Risk, Non-Compliant)
    3. "observations": Specific audit findings.
    4. "recommendations": Actions for the audit team.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threatLevel: { type: Type.STRING },
            pciCompliance: { type: Type.STRING },
            observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["threatLevel", "pciCompliance", "observations", "recommendations"]
        }
      }
    });

    return response.text ? extractJson(response.text) : null;
  } catch (error) {
    console.error("Gemini Analysis Unavailable:", error);
    return null;
  }
};