import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { evaluatePayloadLocally, isTrustedDomain, extractHostname } from "../utils/heuristics.ts";

export interface VerifyRequest {
  type: "link" | "qr" | "email" | "text" | "image";
  payload: any;
  extraContext?: string;
}

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper to safely parse JSON from AI model response (handles markdown fencing)
function parseAiJson(rawText: string): any {
  const text = rawText.trim();
  try {
    return JSON.parse(text);
  } catch {
    // Attempt markdown block extraction
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    // Attempt to isolate first { to last }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    }
    throw new Error("Unable to parse structured JSON from model response");
  }
}

export async function verifyPayload(reqBody: VerifyRequest) {
  const startTime = Date.now();
  const { type, payload, extraContext } = reqBody;

  if (!type || !payload) {
    throw new Error("Missing required type or payload.");
  }

  // Fast path: Authoritative trusted domains (e.g. YouTube, Google, Wikipedia, GitHub)
  if (type === "link") {
    const rawUrl = typeof payload === "string" ? payload.trim() : "";
    const hostname = extractHostname(rawUrl);
    if (hostname) {
      const trusted = isTrustedDomain(hostname);
      if (trusted.isTrusted) {
        const localVerdict = evaluatePayloadLocally("link", payload, extraContext);
        return {
          success: true,
          source: "verified-registry",
          model: "trusted-domain-authority",
          latencyMs: Date.now() - startTime,
          ...localVerdict,
        };
      }
    }
  }

  const ai = getAiClient();

  if (ai) {
    try {
      let contentsPayload: any;

      const jsonFormatInstruction = `
Respond with valid, strict JSON ONLY (no markdown text before or after). Format:
{
  "verdict": "AVOID" | "SUSPICIOUS" | "SAFE",
  "shouldAvoid": true | false,
  "riskScore": number (0-100),
  "riskLevel": "critical" | "warning" | "safe",
  "headline": "concise 5-8 word threat assessment headline",
  "primaryReason": "crisp 1-2 sentence decisive reason why user should avoid or why safe",
  "avoidReasoning": "clear explanation of consequences or security justification",
  "threatCategory": "e.g., Credential Harvesting Phish, Smishing, BEC, Quishing, or Verified Benign",
  "impersonatedEntity": "targeted brand name or None / Unidentified",
  "extractedTarget": "destination URL or contact",
  "detailedReasons": ["specific red flag 1", "specific red flag 2", "specific red flag 3"],
  "indicators": [
    {"label": "Domain Authenticity", "status": "danger" | "warning" | "safe", "explanation": "brief note"},
    {"label": "Urgency & Coercion", "status": "danger" | "warning" | "safe", "explanation": "brief note"},
    {"label": "Payload Integrity", "status": "danger" | "warning" | "safe", "explanation": "brief note"}
  ],
  "recommendedActions": ["step 1", "step 2", "step 3"]
}`;

      if (type === "link") {
        const linkUrl = typeof payload === "string" ? payload : JSON.stringify(payload);
        contentsPayload = {
          parts: [
            {
              text: `Analyze this link/URL for cybersecurity threats, phishing, lookalike domains, credential theft, or scam traps:
URL: "${linkUrl}"
${extraContext ? `Context: "${extraContext}"` : ""}

Determine if the user should avoid opening this link, provide risk score (0-100), and key indicators.
${jsonFormatInstruction}`,
            },
          ],
        };
      } else if (type === "email") {
        if (typeof payload === "object" && payload.data) {
          const { mimeType = "image/png", data } = payload;
          contentsPayload = {
            parts: [
              {
                inlineData: { mimeType, data },
              },
              {
                text: `Perform deep cybersecurity inspection on this uploaded email (screenshot/export) for phishing, BEC, invoice fraud, or credential harvesting.
${extraContext ? `Context: "${extraContext}"` : ""}
${jsonFormatInstruction}`,
              },
            ],
          };
        } else {
          contentsPayload = {
            parts: [
              {
                text: `Analyze this email text and headers for phishing, Business Email Compromise (BEC), credential theft, and spoofing:
Email Content:
"""
${payload}
"""
${extraContext ? `Context: "${extraContext}"` : ""}
${jsonFormatInstruction}`,
              },
            ],
          };
        }
      } else if (type === "text") {
        if (typeof payload === "object" && payload.data) {
          const { mimeType = "image/png", data } = payload;
          contentsPayload = {
            parts: [
              {
                inlineData: { mimeType, data },
              },
              {
                text: `Inspect this mobile SMS/chat screenshot for smishing, lookalike links, fake verification codes, package delivery fraud, or impersonation.
${extraContext ? `Context: "${extraContext}"` : ""}
${jsonFormatInstruction}`,
              },
            ],
          };
        } else {
          contentsPayload = {
            parts: [
              {
                text: `Analyze this SMS, instant message, or communication text for social engineering, smishing, and scam traps:
Message:
"""
${payload}
"""
${extraContext ? `Context: "${extraContext}"` : ""}
${jsonFormatInstruction}`,
              },
            ],
          };
        }
      } else if (type === "qr") {
        if (typeof payload === "object" && payload.data) {
          const { mimeType = "image/png", data } = payload;
          contentsPayload = {
            parts: [
              {
                inlineData: { mimeType, data },
              },
              {
                text: `Perform Quishing (QR Phishing) threat analysis on this uploaded QR image:
${extraContext ? `Context: "${extraContext}"` : ""}
${jsonFormatInstruction}`,
              },
            ],
          };
        } else {
          contentsPayload = {
            parts: [
              {
                text: `Analyze this QR code payload data for Quishing and malicious redirection:
Payload: "${payload}"
${extraContext ? `Context: "${extraContext}"` : ""}
${jsonFormatInstruction}`,
              },
            ],
          };
        }
      } else {
        const { mimeType = "image/png", data } = payload;
        contentsPayload = {
          parts: [
            {
              inlineData: { mimeType, data },
            },
            {
              text: `Perform a comprehensive threat inspection on this uploaded screenshot for scam lures, fake alerts, or extortion.
${extraContext ? `Context: "${extraContext}"` : ""}
${jsonFormatInstruction}`,
            },
          ],
        };
      }

      // Optimize for blazing fast latency:
      // 1. Target gemini-3.1-flash-lite (fastest tier)
      // 2. Set thinkingBudget: 0 to eliminate multi-second chain-of-thought overhead
      // 3. Set maxOutputTokens: 750 to stream concise structured JSON
      // 4. Wrap with an 8.5s timeout promise so the user never experiences long hangs
      const generatePromise = ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: contentsPayload,
        config: {
          systemInstruction: `You are the ScamShield Cyber Threat Verification Engine.
You inspect links, QR codes, emails, messages, and screenshots to protect users from fraud, credential theft, malware, and social engineering.
Your analysis must be direct, authoritative, and plainspoken. Always clearly answer: "Should the user avoid this or not?" and "What is the exact reason why?".`,
          responseMimeType: "application/json",
          maxOutputTokens: 900,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MINIMAL,
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI verification engine timeout after 25000ms")), 25000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response.text?.trim() || "{}";
      const parsed = parseAiJson(responseText);

      const rawVerdict = String(parsed.verdict || "").toUpperCase();
      const isAvoid =
        parsed.shouldAvoid === true ||
        rawVerdict.includes("AVOID") ||
        rawVerdict.includes("MALICIOUS") ||
        rawVerdict.includes("PHISH") ||
        rawVerdict.includes("CRITICAL") ||
        rawVerdict.includes("DANGER");
      const normalizedVerdict = isAvoid
        ? "AVOID"
        : rawVerdict.includes("SUSPICIOUS") || rawVerdict.includes("WARN")
        ? "SUSPICIOUS"
        : "SAFE";
      const normalizedRiskLevel = isAvoid
        ? "critical"
        : normalizedVerdict === "SUSPICIOUS"
        ? "warning"
        : "safe";

      const normalizedIndicators = Array.isArray(parsed.indicators)
        ? parsed.indicators.map((ind: any) => {
            const rawStatus = String(ind.status || "").toLowerCase();
            const status =
              rawStatus.includes("danger") ||
              rawStatus.includes("malicious") ||
              rawStatus.includes("high") ||
              rawStatus.includes("critical")
                ? "danger"
                : rawStatus.includes("warn") ||
                  rawStatus.includes("suspicious") ||
                  rawStatus.includes("medium")
                ? "warning"
                : "safe";
            return {
              label: ind.label || "Security Indicator",
              status,
              explanation: ind.explanation || "",
            };
          })
        : [];

      return {
        success: true,
        source: "google-ai-studio",
        model: "gemini-3.1-flash-lite",
        latencyMs: Date.now() - startTime,
        ...parsed,
        verdict: normalizedVerdict,
        shouldAvoid: isAvoid,
        riskLevel: normalizedRiskLevel,
        indicators: normalizedIndicators,
      };
    } catch (err: any) {
      console.warn("Gemini API verification note (falling back to instant heuristic engine):", err?.message || err);
    }
  }

  // Fallback instant heuristic intelligence builder
  const fallbackResult = generateHeuristicVerification(type, payload, extraContext);
  return {
    success: true,
    source: "local-threat-engine",
    model: "heuristic-threat-engine-v3",
    latencyMs: Date.now() - startTime,
    ...fallbackResult,
  };
}

export function generateHeuristicVerification(type: string, payload: any, extraContext?: string) {
  return evaluatePayloadLocally(type, payload, extraContext);
}

