import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  MessageSquare, 
  CalendarRange, 
  FileCheck, 
  BrainCircuit, 
  LineChart,
  Award,
  Volume2,
  VolumeX,
  RefreshCw,
  Heart
} from "lucide-react";

import { ProgressStats, StudySession, StudyPlanData, QuizData, PDFSummaryData } from "./types";
import MascotSunny from "./components/MascotSunny";
import TutorTab from "./components/TutorTab";
import PlanTab from "./components/PlanTab";
import PDFTab from "./components/PDFTab";
import QuizTab from "./components/QuizTab";
import TrackerTab from "./components/TrackerTab";

export default function App() {
  const [activeTab, setActiveTab] = useState<"tutor" | "plan" | "pdf" | "quiz" | "tracker">("tutor");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Core study progress state
  const [stats, setStats] = useState<ProgressStats>({
    totalMinutes: 0,
    streak: 0,
    lastStudyDate: null,
    actionsCompleted: 0,
    unlockedBadgeIds: [],
  });

  const [sessionLogs, setSessionLogs] = useState<StudySession[]>([]);
  const [currentPlan, setCurrentPlan] = useState<StudyPlanData | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [currentSummary, setCurrentSummary] = useState<PDFSummaryData | null>(null);

  // Badge Unlock Popup notification state
  const [unlockedBadge, setUnlockedBadge] = useState<{ title: string; icon: string; desc: string } | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedStats = localStorage.getItem("study_buddy_stats");
      const storedLogs = localStorage.getItem("study_buddy_logs");
      const storedPlan = localStorage.getItem("study_buddy_plan");
      const storedQuiz = localStorage.getItem("study_buddy_quiz");
      const storedSummary = localStorage.getItem("study_buddy_summary");

      if (storedStats) setStats(JSON.parse(storedStats));
      if (storedLogs) setSessionLogs(JSON.parse(storedLogs));
      if (storedPlan) setCurrentPlan(JSON.parse(storedPlan));
      if (storedQuiz) setCurrentQuiz(JSON.parse(storedQuiz));
      if (storedSummary) setCurrentSummary(JSON.parse(storedSummary));
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
  }, []);

  // Save to LocalStorage on updates
  const saveStatsToLocal = (newStats: ProgressStats) => {
    localStorage.setItem("study_buddy_stats", JSON.stringify(newStats));
  };

  const handleSetPlan = (plan: StudyPlanData) => {
    setCurrentPlan(plan);
    if (plan) {
      localStorage.setItem("study_buddy_plan", JSON.stringify(plan));
    } else {
      localStorage.removeItem("study_buddy_plan");
    }
  };

  const handleSetQuiz = (quiz: QuizData | null) => {
    setCurrentQuiz(quiz);
    if (quiz) {
      localStorage.setItem("study_buddy_quiz", JSON.stringify(quiz));
    } else {
      localStorage.removeItem("study_buddy_quiz");
    }
  };

  const handleSetSummary = (summary: PDFSummaryData | null) => {
    setCurrentSummary(summary);
    if (summary) {
      localStorage.setItem("study_buddy_summary", JSON.stringify(summary));
    } else {
      localStorage.removeItem("study_buddy_summary");
    }
  };

  // Streak & Minutes Logging engine
  const handleAddMinutes = (minutes: number, topic: string, mood = "📚 Focused") => {
    const todayStr = new Date().toISOString().split("T")[0];
    const prevDateStr = stats.lastStudyDate;

    let newStreak = stats.streak;

    if (!prevDateStr) {
      // First time studying
      newStreak = 1;
    } else {
      const prevDate = new Date(prevDateStr);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Broke streak
        newStreak = 1;
      }
      // If diffDays === 0 (studied twice today), streak stays the same
    }

    const updatedStats: ProgressStats = {
      ...stats,
      totalMinutes: stats.totalMinutes + minutes,
      streak: newStreak,
      lastStudyDate: todayStr,
      actionsCompleted: stats.actionsCompleted + 1,
    };

    // Log the session details
    const newSession: StudySession = {
      id: Math.random().toString(),
      topic,
      duration: minutes,
      timestamp: new Date().toISOString(),
      mood,
    };

    const updatedLogs = [...sessionLogs, newSession];
    setSessionLogs(updatedLogs);
    localStorage.setItem("study_buddy_logs", JSON.stringify(updatedLogs));

    // Check Badge Unlock criteria
    checkBadgeUnlocks(updatedStats, updatedLogs);
    setStats(updatedStats);
    saveStatsToLocal(updatedStats);
  };

  const handleIncrementActions = () => {
    const updatedStats = {
      ...stats,
      actionsCompleted: stats.actionsCompleted + 1,
    };
    checkBadgeUnlocks(updatedStats, sessionLogs);
    setStats(updatedStats);
    saveStatsToLocal(updatedStats);
  };

  const handleClearStats = () => {
    const reset: ProgressStats = {
      totalMinutes: 0,
      streak: 0,
      lastStudyDate: null,
      actionsCompleted: 0,
      unlockedBadgeIds: [],
    };
    setStats(reset);
    setSessionLogs([]);
    setCurrentPlan(null);
    setCurrentQuiz(null);
    setCurrentSummary(null);
    localStorage.clear();
  };

  // Badge list references
  const badgesList = [
    { id: "badge-first-step", title: "First Step 🚀", desc: "You completed your first study buddy task! Brilliant start!", icon: "🚀" },
    { id: "badge-habit-spark", title: "Habit Spark 🔥", desc: "You reached a study streak of 3 consecutive days! Consistent!", icon: "🔥" },
    { id: "badge-focused-scholar", title: "Focused Scholar ⏰", desc: "You logged 60+ minutes of studying. Incredible focus!", icon: "⏰" },
    { id: "badge-quiz-champion", title: "Action Master 👑", desc: "You achieved 10 completed actions. Sunny is so proud!", icon: "👑" },
    { id: "badge-marathoner", title: "Study Marathoner 🏃‍♂️", desc: "You studied for 45+ minutes in a single go! Unstoppable!", icon: "🏃‍♂️" },
    { id: "badge-wisdom-wizard", title: "Wisdom Wizard 🧙‍♂️", desc: "You attained 180+ minutes of total study time. Superb wizardry!", icon: "🧙‍♂️" },
  ];

  // Badge trigger verification
  const checkBadgeUnlocks = (currentStats: ProgressStats, logs: StudySession[]) => {
    const unlockedIds = [...currentStats.unlockedBadgeIds];

    badgesList.forEach((badge) => {
      if (unlockedIds.includes(badge.id)) return; // Already unlocked

      let trigger = false;
      if (badge.id === "badge-first-step" && currentStats.actionsCompleted >= 1) {
        trigger = true;
      } else if (badge.id === "badge-habit-spark" && currentStats.streak >= 3) {
        trigger = true;
      } else if (badge.id === "badge-focused-scholar" && currentStats.totalMinutes >= 60) {
        trigger = true;
      } else if (badge.id === "badge-quiz-champion" && currentStats.actionsCompleted >= 10) {
        trigger = true;
      } else if (badge.id === "badge-marathoner" && logs.some((l) => l.duration >= 45)) {
        trigger = true;
      } else if (badge.id === "badge-wisdom-wizard" && currentStats.totalMinutes >= 180) {
        trigger = true;
      }

      if (trigger) {
        unlockedIds.push(badge.id);
        currentStats.unlockedBadgeIds = unlockedIds;
        setUnlockedBadge({
          title: badge.title,
          icon: badge.icon,
          desc: badge.desc,
        });

        // Optional chime sounds/vibrations if supported
        if (soundEnabled && typeof window !== "undefined" && window.navigator?.vibrate) {
          window.navigator.vibrate([100, 50, 100]);
        }
      }
    });
  };

  // Chat/Mascot dynamic lines
  const getSunnyMotivation = () => {
    if (stats.streak > 0) {
      return `Awesome streak! We're on fire for ${stats.streak} day(s)! Let's keep learning! 🔥`;
    }
    if (stats.totalMinutes > 0) {
      return `We have explored for ${stats.totalMinutes} minutes together! You are doing amazing! ✨`;
    }
    return "Hi! I'm Sunny, your friendly study buddy! Click any tab to start exploring! 🌸";
  };

  return (
    <div className="min-h-screen bg-[#fdfcfd] flex flex-col font-sans select-none relative overflow-x-hidden pb-10" id="main-applet-root">
      
      {/* Background colorful elements for bubbly visual accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[35%] rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/40 blur-3xl -z-10" />
      <div className="absolute bottom-[5%] right-[-10%] w-[45%] h-[40%] rounded-full bg-gradient-to-br from-yellow-100/40 to-purple-100/30 blur-3xl -z-10" />

      {/* Top Header navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-purple-100/50 bg-white/70 backdrop-blur shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center font-display text-xl shadow-md border-2 border-white select-none">
            ☀️
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-purple-950 flex items-center gap-1">
              <span>AI Study Agent</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 font-sans font-bold">
                Study Buddy
              </span>
            </h1>
            <p className="text-[11px] text-purple-500 font-medium">Bouncy learning with Sunny!</p>
          </div>
        </div>

        {/* Global toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl hover:bg-purple-100/50 text-purple-700 transition-all shadow-sm bg-white border border-purple-50"
            title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Master Workspace container */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Interactive Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Tab Selectors Navigation card */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100/70 shadow-sm space-y-2">
            <h3 className="text-[10px] uppercase font-extrabold text-purple-400 tracking-wider px-3 mb-3">
              Explore Study Tools
            </h3>

            {/* AI Tutor Chat */}
            <button
              onClick={() => setActiveTab("tutor")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-extrabold transition-all text-left group cursor-pointer ${
                activeTab === "tutor"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200 scale-[1.02]"
                  : "text-purple-950 hover:bg-purple-50"
              }`}
              id="sidebar-tutor-tab"
            >
              <MessageSquare className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <span>AI Tutor Chat</span>
                <p className={`text-[9px] font-medium leading-tight ${activeTab === "tutor" ? "text-purple-200" : "text-purple-400"}`}>
                  Sunny's chat space
                </p>
              </div>
            </button>

            {/* Study Plan Generator */}
            <button
              onClick={() => setActiveTab("plan")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-extrabold transition-all text-left group cursor-pointer ${
                activeTab === "plan"
                  ? "bg-amber-400 text-purple-950 shadow-md shadow-amber-100 scale-[1.02]"
                  : "text-purple-950 hover:bg-yellow-50/50"
              }`}
              id="sidebar-plan-tab"
            >
              <CalendarRange className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <span>Study Plan Generator</span>
                <p className={`text-[9px] font-medium leading-tight ${activeTab === "plan" ? "text-amber-950/70" : "text-purple-400"}`}>
                  Map day-by-day steps
                </p>
              </div>
            </button>

            {/* PDF Summarizer */}
            <button
              onClick={() => setActiveTab("pdf")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-extrabold transition-all text-left group cursor-pointer ${
                activeTab === "pdf"
                  ? "bg-pink-500 text-white shadow-md shadow-pink-100 scale-[1.02]"
                  : "text-purple-950 hover:bg-pink-50/50"
              }`}
              id="sidebar-pdf-tab"
            >
              <FileCheck className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <span>PDF Summarizer</span>
                <p className={`text-[9px] font-medium leading-tight ${activeTab === "pdf" ? "text-pink-100" : "text-purple-400"}`}>
                  Digest documents easily
                </p>
              </div>
            </button>

            {/* Quiz Generator */}
            <button
              onClick={() => setActiveTab("quiz")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-extrabold transition-all text-left group cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.02]"
                  : "text-purple-950 hover:bg-indigo-50/50"
              }`}
              id="sidebar-quiz-tab"
            >
              <BrainCircuit className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <span>Quiz Generator</span>
                <p className={`text-[9px] font-medium leading-tight ${activeTab === "quiz" ? "text-indigo-200" : "text-purple-400"}`}>
                  Instant scores & ranks
                </p>
              </div>
            </button>

            {/* Progress Tracker */}
            <button
              onClick={() => setActiveTab("tracker")}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-extrabold transition-all text-left group cursor-pointer ${
                activeTab === "tracker"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 scale-[1.02]"
                  : "text-purple-950 hover:bg-emerald-50/50"
              }`}
              id="sidebar-tracker-tab"
            >
              <LineChart className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <span>Progress Tracker</span>
                <p className={`text-[9px] font-medium leading-tight ${activeTab === "tracker" ? "text-emerald-100" : "text-purple-400"}`}>
                  Stats, logs, and badges
                </p>
              </div>
            </button>
          </div>

          {/* Persistent Study Buddy encouragement widget */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            <MascotSunny mood="happy" bubbleText={getSunnyMotivation()} className="mt-1" />
            <div className="pt-2 border-t border-purple-50 w-full flex justify-between items-center text-[10px] font-bold text-purple-400 px-1">
              <span>STREAK: {stats.streak} DAYS 🔥</span>
              <span>TIME: {stats.totalMinutes} MINS ⏰</span>
            </div>
          </div>
        </div>

        {/* Main Content Workspace - 5 Features display */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "tutor" && (
                <TutorTab 
                  onAddMinutes={handleAddMinutes} 
                  onPlanCreated={handleSetPlan} 
                />
              )}
              
              {activeTab === "plan" && (
                <PlanTab 
                  currentPlan={currentPlan}
                  onPlanCreated={handleSetPlan}
                  onAddMinutes={handleAddMinutes}
                  onIncrementActions={handleIncrementActions}
                />
              )}

              {activeTab === "pdf" && (
                <PDFTab
                  currentSummary={currentSummary}
                  onSummaryCreated={handleSetSummary}
                  onAddMinutes={handleAddMinutes}
                  onIncrementActions={handleIncrementActions}
                />
              )}

              {activeTab === "quiz" && (
                <QuizTab
                  currentQuiz={currentQuiz}
                  onQuizCreated={handleSetQuiz}
                  onAddMinutes={handleAddMinutes}
                  onIncrementActions={handleIncrementActions}
                />
              )}

              {activeTab === "tracker" && (
                <TrackerTab
                  stats={stats}
                  sessionLogs={sessionLogs}
                  onAddMinutes={handleAddMinutes}
                  onClearStats={handleClearStats}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Badge Unlock Congratulations Popup Modal overlay */}
      <AnimatePresence>
        {unlockedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-purple-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            id="badge-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 border-4 border-yellow-300 max-w-sm w-full text-center space-y-4 relative shadow-2xl"
              id="badge-modal-content"
            >
              {/* Confetti particles representations */}
              <div className="absolute top-4 left-6 text-xl animate-bounce">🎈</div>
              <div className="absolute top-4 right-6 text-xl animate-bounce [animation-delay:-0.3s]">🎉</div>
              <div className="absolute bottom-6 left-8 text-xl animate-bounce [animation-delay:-0.15s]">🌟</div>
              <div className="absolute bottom-6 right-8 text-xl animate-bounce">✨</div>

              {/* Glowing Badge circle */}
              <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-amber-500 text-white text-4xl rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                {unlockedBadge.icon}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-amber-500 tracking-widest bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                  New Badge Unlocked! 🔓
                </span>
                <h3 className="text-xl font-black text-purple-950 mt-2.5">{unlockedBadge.title}</h3>
                <p className="text-xs text-purple-900 leading-relaxed pt-1.5 px-2">
                  {unlockedBadge.desc}
                </p>
              </div>

              <p className="text-[11px] text-purple-400 font-medium">Sunny says: Keep up this stunning progress study buddy!</p>

              <button
                onClick={() => setUnlockedBadge(null)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow transition-all cursor-pointer text-xs mt-2"
                id="close-badge-modal-btn"
              >
                Superb, thanks! ☀️✨
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Humble Footer */}
      <footer className="mt-auto pt-8 pb-4 text-center text-xs text-purple-300/80 flex items-center justify-center gap-1">
        <span>Made with</span>
        <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
        <span>by your AI Study Agent • Sunny the Study Buddy</span>
      </footer>
    </div>
  );
}
