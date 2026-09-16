import { verifyPayload } from "../../src/server/verifyEngine";

export const handler = async (event: any) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Only POST is accepted." }),
    };
  }

  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body || {};
    const result = await verifyPayload(body);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (err: any) {
    console.error("Netlify verify function error:", err);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: err?.message || "Failed to verify payload",
      }),
    };
  }
};
