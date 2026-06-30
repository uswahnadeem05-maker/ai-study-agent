/**
 * Study Plan Generator Skill
 * Generates interactive, day-by-day study plans in a structured JSON format.
 */

import { Type } from "@google/genai";

export const studyPlanSkill = {
  id: "study-plan-skill",
  name: "Study Plan Generator",
  description: "Creates structured, daily learning journeys with fun study buddy tips.",
  systemInstruction: `You are Sunny, the bubbly Study Plan expert!
Your task is to generate a custom day-by-day study plan for a student based on a topic and a number of days.
You must structure the plan so that it is manageable, positive, and includes practical micro-activities rather than just passive reading.
Make sure to include cute encouragement and a "Buddy Tip" for every single day to keep their spirits high!

The output MUST be in JSON format matching the response schema provided.
Keep the day-by-day plans highly focused, practical, and filled with cheerful study buddy energy.
`,
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A fun, bubbly title for the study plan (e.g., 'Photosynthesis Expedition! 🌿')"
      },
      buddyIntro: {
        type: Type.STRING,
        description: "A warm, welcoming, and encouraging intro message from Sunny."
      },
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: {
              type: Type.INTEGER,
              description: "The day number, starting from 1."
            },
            focus: {
              type: Type.STRING,
              description: "The main learning focus of this day."
            },
            concepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 core concepts to master on this day."
            },
            activity: {
              type: Type.STRING,
              description: "A fun, bubbly, and practical micro-activity (e.g., drawing a diagram with colored pens, explaining it to a pet, or writing a 3-sentence summary)."
            },
            buddyTip: {
              type: Type.STRING,
              description: "A sweet, encouraging tip, lifehack, or micro-motivation from Sunny (e.g., 'Remember to stretch and drink some water! 🥤')."
            }
          },
          required: ["day", "focus", "concepts", "activity", "buddyTip"]
        }
      },
      buddyOutro: {
        type: Type.STRING,
        description: "An encouraging closing message to launch them onto their study journey with joy!"
      }
    },
    required: ["title", "buddyIntro", "days", "buddyOutro"]
  }
};
