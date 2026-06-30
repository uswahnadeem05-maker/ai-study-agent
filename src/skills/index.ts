import { tutorSkill } from "./tutor-skill";
import { studyPlanSkill } from "./study-plan-skill";
import { quizSkill } from "./quiz-skill";
import { pdfSkill } from "./pdf-skill";

export { tutorSkill, studyPlanSkill, quizSkill, pdfSkill };

export const skillsList = [tutorSkill, studyPlanSkill, quizSkill, pdfSkill];

/**
 * Determines which skill fits a given user input prompt.
 * This is used by the router model or rule-based heuristic on the server.
 */
export function determineSkillFromPrompt(prompt: string): string {
  const lowercase = prompt.toLowerCase();
  
  if (
    lowercase.includes("quiz") || 
    lowercase.includes("test me") || 
    lowercase.includes("trivia") || 
    lowercase.includes("question")
  ) {
    return "quiz-skill";
  }
  
  if (
    lowercase.includes("plan") || 
    lowercase.includes("schedule") || 
    lowercase.includes("study path") || 
    lowercase.includes("curriculum") ||
    lowercase.includes("days")
  ) {
    return "study-plan-skill";
  }
  
  if (
    lowercase.includes("summarize") || 
    lowercase.includes("summary") || 
    lowercase.includes("digest") || 
    lowercase.includes("pdf") ||
    lowercase.includes("extract")
  ) {
    return "pdf-skill";
  }
  
  return "tutor-skill";
}
