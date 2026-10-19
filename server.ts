import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { verifyPayload } from "./src/server/verifyEngine.ts";
import { processChatRequest } from "./src/server/chatEngine.ts";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable JSON body parsing with enough capacity for image uploads (base64)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Direct source zip endpoint (no UI elements attached)
app.get("/api/download-source.zip", (_req, res) => {
  const zipFile = path.join(process.cwd(), "public", "scamshield-source.zip");
  res.setHeader("Content-Disposition", 'attachment; filename="scamshield-source.zip"');
  res.setHeader("Content-Type", "application/zip");
  res.sendFile(zipFile);
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    aiEngine: hasApiKey ? "google-ai-studio-active" : "local-heuristic-fallback",
    model: "gemini-3.1-flash-lite",
  });
});

// Verification API endpoint for Links, QR codes, Emails, Text/SMS, and Pictures
app.post("/api/verify", async (req, res) => {
  try {
    const { type, payload, extraContext } = req.body;
    if (!type || !payload) {
      return res.status(400).json({ error: "Missing required type or payload." });
    }

    const result = await verifyPayload({ type, payload, extraContext });
    return res.json(result);
  } catch (err: any) {
    console.error("Verification endpoint error:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// Gemini Multi-Turn Chat API with Google Search Grounding & Persona System Instructions
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model, useSearch, rolePersona } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const result = await processChatRequest({
      messages,
      model,
      useSearch,
      rolePersona,
    });
    return res.json(result);
  } catch (err: any) {
    console.error("Chat endpoint error:", err);
    return res.status(500).json({ error: err?.message || "Failed to process chat query" });
  }
});

// Vite middleware integration for full-stack dev and production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScamShield Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
