export const handler = async (event: any) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      status: "ok",
      platform: "netlify",
      aiEngine: hasApiKey ? "google-ai-studio-active" : "local-heuristic-fallback",
      model: "gemini-3.1-flash-lite",
    }),
  };
};
