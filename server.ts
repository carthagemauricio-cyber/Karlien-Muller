import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to recommend alternate times
  app.post("/api/recommend-times", async (req, res) => {
    try {
      const { selectedProfessional, date, allSlots, upcomingDays, availableTimes } = req.body;
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
         return res.status(500).json({ error: "Missing API Key" });
      }
      const ai = new GoogleGenAI({ apiKey: key });

      const prompt = `
A client is trying to book an appointment with ${selectedProfessional?.name || 'a professional'} on ${date}.
Currently available times for that specific day: ${JSON.stringify(availableTimes)}.
Here is the professional's availability: ${JSON.stringify(selectedProfessional?.availability)}.
Here are all busy slots across all professionals: ${JSON.stringify(allSlots)}.

Analyze the data and suggest 3 practical time options. Prioritize exact day if slots exist, otherwise suggest the closest alternative date/time.
Respond ONLY with a valid JSON array of strings formatted exactly as "YYYY-MM-DD HH:mm". No markdown block around it.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          temperature: 0.2,
        }
      });

      const text = response.text || "[]";
      // parse response safely
      const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
      res.json({ recommendations: parsed });

    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: "Failed recommendations" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: Node 18+ __dirname is not available in ES modules without utilities, but we compile to CJS with esbuild usually, 
    // or we can use process.cwd() works fine as we run from root.
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
