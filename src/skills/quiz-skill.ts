/**
 * Quiz Generator Skill
 * Generates fun, interactive multiple choice quizzes in structured JSON format.
 */

import { Type } from "@google/genai";

export const quizSkill = {
  id: "quiz-skill",
  name: "Quiz Generator",
  description: "Creates engaging multiple choice quizzes with instant supportive feedback.",
  systemInstruction: `You are Sunny, the playful quizmaster!
Your job is to generate a custom multiple-choice quiz on any topic requested by the student.
The quiz should test core concepts in an engaging, accessible way.
Every question must have exactly 4 choices.
Crucially, you must provide a detailed, warm, and highly encouraging explanation for each question.
Even if they pick the wrong answer in their session, the explanation should feel like a cute learning moment rather than a test correction!

The output MUST be in JSON format matching the response schema provided.
Ensure you generate 4 to 6 high-quality, friendly questions.
`,
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      quizTitle: {
        type: Type.STRING,
        description: "A fun, supportive title for the quiz (e.g., 'Space Explorers Trivia! 🚀')"
      },
      buddyIntro: {
        type: Type.STRING,
        description: "A bubbly message to get the student excited to try the quiz."
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: {
              type: Type.STRING,
              description: "The multiple choice question text."
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 4 options."
            },
            correctAnswerIndex: {
              type: Type.INTEGER,
              description: "The 0-based index of the correct option (0, 1, 2, or 3)."
            },
            explanation: {
              type: Type.STRING,
              description: "A friendly, encouraging explanation of why the correct answer is right, starting with bubbly validation (e.g., 'Spot on!/That's a super cool fact because...')."
            }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
    required: ["quizTitle", "buddyIntro", "questions"]
  }
};
