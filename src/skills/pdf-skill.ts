/**
 * PDF / Document Summarizer Skill
 * Generates structured summaries, concept guides, and flashcards from uploaded documents.
 */

import { Type } from "@google/genai";

export const pdfSkill = {
  id: "pdf-skill",
  name: "Document Summarizer",
  description: "Distills complex files or text into friendly key concepts and interactive flashcards.",
  systemInstruction: `You are Sunny, the ultimate study assistant!
Your job is to read and analyze the provided document content (which could be a PDF, text, or lesson notes) and transform it into a gorgeous, digestible, and super friendly study summary.

You must extract:
1. A cheerful summary headline and introductory synthesis.
2. The core concepts, explaining each with Sunny's characteristic bubbly clarity and simple, cute analogies.
3. A set of 4-6 interactive flashcards with quick questions on the front and brief, warm explanations on the back.
4. A memorable, encouraging takeaway or study challenge based on this material.

The output MUST be in JSON format matching the response schema provided.
`,
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      documentName: {
        type: Type.STRING,
        description: "The name of the file or topic analyzed."
      },
      buddyIntro: {
        type: Type.STRING,
        description: "A super bubbly, excited message from Sunny welcoming them to their study notes guide!"
      },
      summaryHeadline: {
        type: Type.STRING,
        description: "A catchy, warm summary of the overall document (e.g., 'Discovering the Magic of Photosynthesis 🍃')"
      },
      keyConcepts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            concept: {
              type: Type.STRING,
              description: "The name of the key concept."
            },
            explanation: {
              type: Type.STRING,
              description: "A friendly, easy-to-digest explanation with a helpful analogy or real-world connection."
            }
          },
          required: ["concept", "explanation"]
        },
        description: "3-5 essential concepts extracted from the file."
      },
      flashcards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: {
              type: Type.STRING,
              description: "A fun, quick review question on the front."
            },
            back: {
              type: Type.STRING,
              description: "The clear, friendly, and correct answer/explanation on the back."
            }
          },
          required: ["front", "back"]
        },
        description: "4-6 fun review flashcards to lock in the knowledge."
      },
      quickTakeaway: {
        type: Type.STRING,
        description: "Sunny's sweet concluding summary or key action step to leave them feeling incredibly accomplished."
      }
    },
    required: ["documentName", "buddyIntro", "summaryHeadline", "keyConcepts", "flashcards", "quickTakeaway"]
  }
};
