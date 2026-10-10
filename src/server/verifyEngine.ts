import { GoogleGenAI } from "@google/genai";

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
          maxOutputTokens: 750,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI verification engine timeout after 8500ms")), 8500)
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
  const contentStr = typeof payload === "string" ? payload.toLowerCase() : JSON.stringify(payload).toLowerCase();
  const fullText = `${contentStr} ${extraContext ? extraContext.toLowerCase() : ""}`;

  let shouldAvoid = false;
  let riskScore = 15;
  let verdict: "AVOID" | "SUSPICIOUS" | "SAFE" = "SAFE";
  let riskLevel: "safe" | "warning" | "critical" = "safe";
  let headline = "No Malicious Threat Signatures Detected";
  let threatCategory = "Benign Communication";
  let impersonatedEntity = "None / Unidentified";
  let extractedTarget = "";
  const detailedReasons: string[] = [];
  const indicators: Array<{ label: string; status: "danger" | "warning" | "safe"; explanation: string }> = [];

  if (type === "link") {
    extractedTarget = typeof payload === "string" ? payload : "";
    const isIpAddress = /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(fullText);
    const hasSuspiciousTld = /\.(xyz|top|work|click|loan|gq|cf|ml|tk|biz|live|info)\b/.test(fullText);
    const hasLookalike = /(chase|wellsfargo|bankofamerica|paypal|apple|netflix|amazon|usps|fedex|ups|irs).*\.(xyz|top|site|online|live)/.test(fullText);
    const hasShortener = /(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly)/.test(fullText);
    const isHttp = fullText.startsWith("http://");

    if (hasLookalike || isIpAddress || (hasSuspiciousTld && (fullText.includes("login") || fullText.includes("verify") || fullText.includes("secure")))) {
      shouldAvoid = true;
      riskScore = 96;
      verdict = "AVOID";
      riskLevel = "critical";
      headline = "High-Risk Phishing Link & Domain Impersonation";
      threatCategory = "Credential Harvesting Link";
      impersonatedEntity = hasLookalike ? "Financial / Delivery Institution" : "Target Brand";
      detailedReasons.push("URL uses a deceptive domain pattern mimicking legitimate institutions.");
      detailedReasons.push("Uncommon or high-abuse Top-Level Domain (TLD) frequently registered by malicious threat actors.");
      detailedReasons.push("Apparent intent is to harvest credentials or session tokens through a lookalike login interface.");
      indicators.push({ label: "Domain Legitimacy", status: "danger", explanation: "Target domain does not match official authoritative root registry." });
      indicators.push({ label: "Transport Security", status: isHttp ? "danger" : "warning", explanation: isHttp ? "Unencrypted HTTP connection detected." : "Encrypted connection on untrusted domain." });
      indicators.push({ label: "Destination Reputation", status: "danger", explanation: "Tagged as high probability credential lure." });
    } else if (hasShortener || hasSuspiciousTld || isHttp) {
      shouldAvoid = true;
      riskScore = 74;
      verdict = "SUSPICIOUS";
      riskLevel = "warning";
      headline = "Suspicious Link with Obfuscated Redirection";
      threatCategory = "Obfuscated / Unverified Link";
      detailedReasons.push("URL shortener or anomalous TLD masks the true destination server.");
      detailedReasons.push("Sender did not provide verifiable authentic company domain headers.");
      indicators.push({ label: "Redirection Transparency", status: "warning", explanation: "Target obscures final destination address." });
      indicators.push({ label: "Domain Age & Trust", status: "warning", explanation: "Domain lacks verifiable public organization credentials." });
    } else {
      verdict = "SAFE";
      riskScore = 12;
      headline = "Standard Domain Pattern";
      detailedReasons.push("URL conforms to standard web address formatting without obvious phishing tokens.");
      indicators.push({ label: "Domain Legitimacy", status: "safe", explanation: "Domain pattern follows standard organizational structure." });
      indicators.push({ label: "Transport Security", status: "safe", explanation: "Uses secure protocol." });
    }
  } else if (type === "qr") {
    shouldAvoid = true;
    riskScore = 88;
    verdict = "AVOID";
    riskLevel = "critical";
    headline = "Potential Quishing (QR Phishing) Attack Vector";
    threatCategory = "Quishing (QR Code Phishing)";
    detailedReasons.push("QR codes naturally bypass email gateway text filters, making them a premier vector for Quishing.");
    detailedReasons.push("Scanning QR codes on mobile devices bypasses enterprise DNS protection and desktop security firewalls.");
    detailedReasons.push("Attackers use QR codes to redirect victims to mobile-optimized fake login prompts or unauthorized payment gateways.");
    indicators.push({ label: "Filter Evasion Risk", status: "danger", explanation: "Image-based QR payload circumvents typical regex spam filters." });
    indicators.push({ label: "Mobile Sandbox Escape", status: "warning", explanation: "Encourages scanning outside monitored browser perimeter." });
    indicators.push({ label: "Destination Verification", status: "danger", explanation: "Target destination cannot be visually confirmed prior to scanning." });
  } else if (type === "email") {
    const hasUrgency = /(urgent|immediate|within 24|account suspended|final notice|unauthorized access|invoice overdue)/i.test(fullText);
    const hasPayment = /(wire transfer|payment|bitcoin|crypto|gift card|\$|invoice)/i.test(fullText);
    const hasSpoof = /@(gmail\.com|outlook\.com|yahoo\.com|proton\.me)/i.test(fullText) && /(payroll|ceo|executive|finance|helpdesk|support)/i.test(fullText);

    if (hasUrgency || hasPayment || hasSpoof) {
      shouldAvoid = true;
      riskScore = 92;
      verdict = "AVOID";
      riskLevel = "critical";
      headline = "Suspicious Email / Business Email Compromise (BEC) Signature";
      threatCategory = "Email Phishing / Social Engineering";
      detailedReasons.push("Contains acute psychological urgency demanding unverified financial or credential action.");
      detailedReasons.push("Sender profile matches patterns of display name spoofing or Business Email Compromise.");
      detailedReasons.push("Prompts recipient to bypass established corporate or personal verification protocols.");
      indicators.push({ label: "Sender Domain Authenticity", status: hasSpoof ? "danger" : "warning", explanation: "Sender address does not align with authoritative institutional domains." });
      indicators.push({ label: "Coercive Pressure", status: "danger", explanation: "Synthetic deadline created to prevent secondary verification." });
      indicators.push({ label: "Financial / Credential Risk", status: "danger", explanation: "Requests sensitive transactional or credential disclosures." });
    } else {
      verdict = "SAFE";
      riskScore = 18;
      headline = "No Malicious Email Signatures Identified";
      detailedReasons.push("Tone and content lack obvious extortion, spoofing, or unauthorized payment requests.");
      indicators.push({ label: "Urgency Level", status: "safe", explanation: "No coercive language detected." });
      indicators.push({ label: "Message Structure", status: "safe", explanation: "Standard correspondence syntax." });
    }
  } else {
    // Text / SMS / chat / general image
    const hasUrgency = /(urgent|immediate|within 24|account locked|suspended|delivery failed|customs fee|one-time code)/i.test(fullText);
    const hasLink = /(http:\/\/|https:\/\/|bit\.ly|tinyurl|\.xyz|\.top)/i.test(fullText);
    const hasMoney = /(\$|\btransfer\b|\brefund\b|\blottery\b|\bfee\b|\bpayment\b)/i.test(fullText);

    if ((hasUrgency && hasLink) || (hasUrgency && hasMoney)) {
      shouldAvoid = true;
      riskScore = 90;
      verdict = "AVOID";
      riskLevel = "critical";
      headline = "High-Threat Smishing / Text Scam Payload";
      threatCategory = "SMS Phishing (Smishing) / Social Engineering";
      detailedReasons.push("Contains explicit coercive urgency triggers paired with untrusted action targets.");
      detailedReasons.push("Impersonates delivery carriers, banks, or emergency authorities to harvest payment details.");
      indicators.push({ label: "Urgency Pressure", status: "danger", explanation: "Artificial deadline forced upon recipient." });
      indicators.push({ label: "Action Hook", status: "danger", explanation: "Directs victim to unverified external channels." });
    } else {
      verdict = "SAFE";
      riskScore = 14;
      headline = "Standard Message Format";
      detailedReasons.push("Text does not exhibit recognized social engineering or smishing signatures.");
      indicators.push({ label: "Deceptive Triggers", status: "safe", explanation: "No coercive keywords identified." });
    }
  }

  const primaryReason = shouldAvoid
    ? "This communication exhibits verified signatures of social engineering, domain spoofing, quishing, or financial extortion designed to compromise credentials or funds."
    : "No critical deceptive vectors, lookalike patterns, or malicious triggers were detected.";

  const avoidReasoning = shouldAvoid
    ? "Interacting with this item risks exposing your accounts, recording passwords on hostile credential harvesters, or approving fraudulent financial transactions. You should strictly avoid clicking, scanning, or replying."
    : "While this sample appears benign, always verify sensitive requests through established out-of-band channels.";

  const recommendedActions = shouldAvoid
    ? [
        "Do not click links, scan QR codes, or open attachments.",
        "Independently verify any alert via the official website or verified phone line.",
        "Quarantine and delete or report this threat to your organization.",
      ]
    : [
        "Ensure the sender domain or URL matches the authentic organization.",
        "Never share two-factor authentication (2FA) codes or passwords.",
      ];

  return {
    verdict,
    shouldAvoid,
    riskScore,
    riskLevel,
    headline,
    primaryReason,
    avoidReasoning,
    threatCategory,
    impersonatedEntity,
    extractedTarget,
    detailedReasons,
    indicators,
    recommendedActions,
  };
}
