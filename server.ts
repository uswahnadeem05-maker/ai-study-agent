import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { tutorSkill, studyPlanSkill, quizSkill, pdfSkill, determineSkillFromPrompt } from "./src/skills";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parsing with a 50MB limit to handle base64 files comfortably
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Google GenAI SDK to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please add it in Settings > Secrets!");
    }
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

// Ensure server is healthy
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API Route: AI Tutor (Conversation with chat history)
app.post("/api/tutor", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getAiClient();
    
    // Construct the contents structure including chat history
    // history should be an array of { role: "user" | "model", parts: [{ text: string }] }
    const formattedHistory = Array.isArray(history) ? history : [];
    
    // Convert any simple message format in history to correct Gemini parts
    const contents = [
      ...formattedHistory.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text || (msg.parts && msg.parts[0]?.text) || "" }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: tutorSkill.systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      text: response.text || "I was a little lost in my thoughts! Could you ask that again?",
      skillUsed: tutorSkill.id
    });
  } catch (error: any) {
    console.error("Error in /api/tutor:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// API Route: Study Plan Generator (Returns JSON study plan)
app.post("/api/study-plan", async (req, res) => {
  try {
    const { topic, days } = req.body;
    if (!topic || !days) {
      return res.status(400).json({ error: "Topic and days are required." });
    }

    const dayCount = parseInt(days, 10);
    if (isNaN(dayCount) || dayCount < 1 || dayCount > 30) {
      return res.status(400).json({ error: "Days must be a number between 1 and 30." });
    }

    const ai = getAiClient();
    const prompt = `Generate a customized study plan for the topic "${topic}" to be completed in exactly ${dayCount} days.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: studyPlanSkill.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: studyPlanSkill.responseSchema,
        temperature: 0.5,
      },
    });

    if (!response.text) {
      throw new Error("No response received from the study plan planner.");
    }

    const studyPlan = JSON.parse(response.text.trim());
    res.json(studyPlan);
  } catch (error: any) {
    console.error("Error in /api/study-plan:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// API Route: Quiz Generator (Returns JSON quiz)
app.post("/api/quiz", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const ai = getAiClient();
    const prompt = `Create a 5-question multiple-choice quiz on the topic "${topic}". Ensure there is exactly 1 correct answer for each question, with 4 choices total. Provide positive, warm explanations for each question.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: quizSkill.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: quizSkill.responseSchema,
        temperature: 0.6,
      },
    });

    if (!response.text) {
      throw new Error("No quiz data received.");
    }

    const quiz = JSON.parse(response.text.trim());
    res.json(quiz);
  } catch (error: any) {
    console.error("Error in /api/quiz:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// API Route: PDF/Document Summarizer (Accepts file base64 and returns JSON summary/flashcards)
app.post("/api/pdf-summarize", async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body;
    if (!fileData) {
      return res.status(400).json({ error: "File data in base64 format is required." });
    }

    const ai = getAiClient();
    
    const filePart = {
      inlineData: {
        data: fileData, // base64 string
        mimeType: mimeType || "application/pdf",
      },
    };

    const textPart = {
      text: `Please read and analyze this uploaded document "${fileName || "Study Material"}" and generate a beautiful study guide including key concepts, summary headlines, review flashcards, and a takeaway challenge as requested.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [filePart, textPart],
      config: {
        systemInstruction: pdfSkill.systemInstruction,
        responseMimeType: "application/json",
        responseSchema: pdfSkill.responseSchema,
        temperature: 0.4,
      },
    });

    if (!response.text) {
      throw new Error("No summary data received from the document analyzer.");
    }

    const summary = JSON.parse(response.text.trim());
    res.json(summary);
  } catch (error: any) {
    console.error("Error in /api/pdf-summarize:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// API Route: Unified Smart Agent Router
// Detects which skill to use based on what the student asks in the general chat,
// applies that skill's systemInstruction/schema, and returns both the routing result and the content.
app.post("/api/agent-route", async (req, res) => {
  try {
    const { query, history } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    const targetSkillId = determineSkillFromPrompt(query);
    const ai = getAiClient();

    console.log(`Smart Router selected skill: ${targetSkillId} for query "${query}"`);

    if (targetSkillId === "quiz-skill") {
      // Generate a mini quiz inside the chat
      const prompt = `Create a 3-question multiple choice quiz because the student asked for a quiz or trivia about: "${query}". Ensure 4 options and detailed explanations.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: quizSkill.systemInstruction,
          responseMimeType: "application/json",
          responseSchema: quizSkill.responseSchema,
          temperature: 0.6,
        }
      });
      return res.json({
        skillId: "quiz-skill",
        text: "I generated a custom mini quiz for you! Let's power up our brains! 🎉",
        data: JSON.parse(response.text?.trim() || "{}")
      });
    }

    if (targetSkillId === "study-plan-skill") {
      // Generate a mini 3-day study plan inside the chat
      const prompt = `Create a 3-day micro study plan because the student asked for a plan or schedule about: "${query}".`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: studyPlanSkill.systemInstruction,
          responseMimeType: "application/json",
          responseSchema: studyPlanSkill.responseSchema,
          temperature: 0.5,
        }
      });
      return res.json({
        skillId: "study-plan-skill",
        text: "I've mapped out a quick study plan for you to succeed! 🗺️✨",
        data: JSON.parse(response.text?.trim() || "{}")
      });
    }

    // Default: AI Tutor
    const formattedHistory = Array.isArray(history) ? history : [];
    const contents = [
      ...formattedHistory.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text || "" }]
      })),
      { role: "user", parts: [{ text: query }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: tutorSkill.systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      skillId: "tutor-skill",
      text: response.text || "Let's explore that topic! What specific questions do you have?",
      data: null
    });

  } catch (error: any) {
    console.error("Error in /api/agent-route:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// Configure Vite middleware or Static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
