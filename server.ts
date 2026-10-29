import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import app from "./src/server/app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SmartLearn AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

// In Google AI Studio or standalone Node environment, start the HTTP server.
// In Vercel serverless environments, Vercel executes /api/index.ts directly.
if (!process.env.VERCEL) {
  startServer();
}

export default app;
