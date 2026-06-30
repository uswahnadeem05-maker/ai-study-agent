import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlusCircle, Clock, Flame, CheckSquare, Award, AlertCircle, Smile, Calendar, BookOpen } from "lucide-react";
import { ProgressStats, StudySession, Badge } from "../types";
import MascotSunny from "./MascotSunny";

interface TrackerTabProps {
  stats: ProgressStats;
  sessionLogs: StudySession[];
  onAddMinutes: (minutes: number, topic: string, mood?: string) => void;
  onClearStats: () => void;
}

export default function TrackerTab({ stats, sessionLogs, onAddMinutes, onClearStats }: TrackerTabProps) {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(15);
  const [mood, setMood] = useState("📚 Focused");
  const [showLogForm, setShowLogForm] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  // Available badges configuration
  const badgesList: Badge[] = [
    {
      id: "badge-first-step",
      title: "First Step 🚀",
      description: "Log your very first study action or session.",
      icon: "🚀",
      color: "from-blue-400 to-indigo-500",
      requirement: "Complete any study activity",
    },
    {
      id: "badge-habit-spark",
      title: "Habit Spark 🔥",
      description: "Acquire a study streak of at least 3 days.",
      icon: "🔥",
      color: "from-orange-400 to-red-500",
      requirement: "Reach a 3-day streak",
    },
    {
      id: "badge-focused-scholar",
      title: "Focused Scholar ⏰",
      description: "Achieve 60+ minutes of total study time.",
      icon: "⏰",
      color: "from-pink-400 to-purple-500",
      requirement: "Accumulate 60 minutes",
    },
    {
      id: "badge-quiz-champion",
      title: "Action Master 👑",
      description: "Complete 10 or more study actions/tasks.",
      icon: "👑",
      color: "from-yellow-400 to-amber-500",
      requirement: "Complete 10 study actions",
    },
    {
      id: "badge-marathoner",
      title: "Study Marathoner 🏃‍♂️",
      description: "Log a single study session of 45+ minutes.",
      icon: "🏃‍♂️",
      color: "from-emerald-400 to-teal-500",
      requirement: "A single session of 45+ mins",
    },
    {
      id: "badge-wisdom-wizard",
      title: "Wisdom Wizard 🧙‍♂️",
      description: "Achieve 180+ minutes of total study time.",
      icon: "🧙‍♂️",
      color: "from-violet-500 to-fuchsia-600",
      requirement: "Accumulate 180 minutes",
    },
  ];

  const handleManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTopic = topic.trim();
    if (!finalTopic) return;

    onAddMinutes(duration, finalTopic, mood);
    
    // Reset form
    setTopic("");
    setShowLogForm(false);

    // Bubbly celebratory feedback
    const quotes = [
      "Brilliant study streak booster! Sunny is cheering you on! 🎉",
      "You fed your brain cells perfectly! Splendid effort! 🧠✨",
      "Logged! Remember to reward yourself with a nice cup of juice! 🥤🌟",
      "Superb focus! You are closer to your goal than you were yesterday! 🗺️"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCelebrationMsg(randomQuote);
    
    setTimeout(() => {
      setCelebrationMsg(null);
    }, 5000);
  };

  const getRank = (minutes: number) => {
    if (minutes >= 180) return { title: "Wisdom Wizard 🧙‍♂️", color: "text-violet-600 bg-violet-50 border-violet-200" };
    if (minutes >= 90) return { title: "Curiosity Captain 👑", color: "text-amber-600 bg-amber-50 border-amber-200" };
    if (minutes >= 30) return { title: "Study Ranger 🧭", color: "text-pink-600 bg-pink-50 border-pink-200" };
    return { title: "Brain Cadet 🌱", color: "text-blue-600 bg-blue-50 border-blue-200" };
  };

  // Helper to determine if badge is unlocked based on real stats
  const isBadgeUnlocked = (badgeId: string) => {
    if (badgeId === "badge-first-step") {
      return stats.actionsCompleted > 0;
    }
    if (badgeId === "badge-habit-spark") {
      return stats.streak >= 3;
    }
    if (badgeId === "badge-focused-scholar") {
      return stats.totalMinutes >= 60;
    }
    if (badgeId === "badge-quiz-champion") {
      return stats.actionsCompleted >= 10;
    }
    if (badgeId === "badge-marathoner") {
      return sessionLogs.some((log) => log.duration >= 45);
    }
    if (badgeId === "badge-wisdom-wizard") {
      return stats.totalMinutes >= 180;
    }
    return false;
  };

  return (
    <div className="space-y-6" id="tracker-tab-root">
      {/* Header Badge Celebration Message */}
      <AnimatePresence>
        {celebrationMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 bg-gradient-to-r from-yellow-100 to-pink-100 border border-yellow-200 text-purple-950 text-xs font-bold rounded-2xl flex items-center gap-3 shadow-md"
            id="tracker-celebration-bubble"
          >
            <span className="text-2xl animate-bounce">✨</span>
            <p>{celebrationMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Time */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100/60 flex items-center justify-center shrink-0 border border-purple-100">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-purple-400">Time Spent</p>
            <p className="text-xl font-extrabold text-purple-950 mt-0.5">{stats.totalMinutes} Mins</p>
            <p className="text-[10px] text-purple-500 font-medium">Blowing knowledge bubbles</p>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100/60 flex items-center justify-center shrink-0 border border-orange-100">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-orange-400">Daily Streak</p>
            <p className="text-xl font-extrabold text-purple-950 mt-0.5">{stats.streak} Days</p>
            <p className="text-[10px] text-orange-500 font-medium">Keep the fire burning!</p>
          </div>
        </div>

        {/* Tasks completed */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckSquare className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-400">Total Actions</p>
            <p className="text-xl font-extrabold text-purple-950 mt-0.5">{stats.actionsCompleted} Tasks</p>
            <p className="text-[10px] text-emerald-500 font-medium">Activities completed</p>
          </div>
        </div>

        {/* Level Rank */}
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/60 flex items-center justify-center shrink-0 border border-amber-100">
            <Award className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase font-bold text-amber-500">Mascot Rank</p>
            <p className="text-xs font-bold text-purple-950 mt-1 truncate">{getRank(stats.totalMinutes).title}</p>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border mt-1 inline-block ${getRank(stats.totalMinutes).color}`}>
              Earned rank
            </span>
          </div>
        </div>
      </div>

      {/* Manual Logger & Past Logs Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logger form */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
              <span>Log Study Session</span>
              <PlusCircle className="w-4 h-4 text-purple-500" />
            </h3>
            
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-all bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100"
              id="toggle-log-form-btn"
            >
              {showLogForm ? "Cancel" : "Add Log"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showLogForm ? (
              <motion.form
                key="log-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleManualLog}
                className="space-y-3.5 overflow-hidden pt-1"
              >
                {/* Topic Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-900 block">What did you study? 📚</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    placeholder="e.g. World War II, Calculus Limits..."
                    className="w-full bg-purple-50/30 border border-purple-100 rounded-xl px-3 py-2 text-xs text-purple-950 outline-none focus:border-purple-300 transition-all"
                    id="log-topic-input"
                  />
                </div>

                {/* Duration select */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-900 block">Duration in Minutes ⏰</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full bg-purple-50/30 border border-purple-100 rounded-xl px-3 py-2 text-xs text-purple-950 outline-none focus:border-purple-300 transition-all"
                    id="log-duration-select"
                  >
                    <option value={5}>5 Mins (Quick check-in)</option>
                    <option value={10}>10 Mins (Power focus)</option>
                    <option value={15}>15 Mins (Healthy chunk)</option>
                    <option value={30}>30 Mins (Standard sprint)</option>
                    <option value={45}>45 Mins (Deep dive)</option>
                    <option value={60}>60 Mins (Golden marathoner)</option>
                  </select>
                </div>

                {/* Mood Select */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-purple-900 block">How did you feel? 🧠</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full bg-purple-50/30 border border-purple-100 rounded-xl px-3 py-2 text-xs text-purple-950 outline-none focus:border-purple-300 transition-all"
                    id="log-mood-select"
                  >
                    <option value="📚 Focused">📚 Focused</option>
                    <option value="😀 Energetic">😀 Energetic</option>
                    <option value="😴 Tired but Trying">😴 Tired but Trying</option>
                    <option value="🤯 Overwhelmed">🤯 Overwhelmed</option>
                    <option value="🫠 Confused">🫠 Confused</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
                  id="submit-study-log-btn"
                >
                  Confirm Study Session! ✨
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="log-promo"
                className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-center flex flex-col items-center space-y-2.5"
              >
                <Smile className="w-8 h-8 text-purple-400" />
                <p className="text-xs text-purple-900 leading-relaxed">
                  Manually track your offline textbooks reading or notebook writing sessions! Logging adds points, unlocks ranks, and earns shiny mascot badges!
                </p>
                <button
                  onClick={() => setShowLogForm(true)}
                  className="py-1.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  Log Now
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset button as developer fallback */}
          <div className="pt-2 border-t border-purple-50 flex justify-end">
            <button
              onClick={() => {
                if (confirm("Reset stats and study logs to start fully fresh? 🧹")) {
                  onClearStats();
                }
              }}
              className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-all"
              id="clear-stats-btn"
            >
              Reset History
            </button>
          </div>
        </div>

        {/* Past logs list */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm lg:col-span-2 space-y-4 flex flex-col h-[320px]">
          <h3 className="font-bold text-sm text-purple-950 flex items-center gap-1.5 shrink-0">
            <span>Study Logs History</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {sessionLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-1.5 text-purple-400 text-xs py-8">
                <BookOpen className="w-7 h-7" />
                <p>No study logs yet! Fill out the form or try a quiz to write history! 📚✨</p>
              </div>
            ) : (
              sessionLogs.slice().reverse().map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-purple-50/30 rounded-xl border border-purple-100/50 flex justify-between items-center text-xs transition-all hover:border-purple-200"
                >
                  <div className="space-y-1">
                    <p className="font-extrabold text-purple-950">{log.topic}</p>
                    <div className="flex items-center gap-2 text-[10px] text-purple-400 font-bold">
                      <span>{log.timestamp.split("T")[0]}</span>
                      <span>•</span>
                      <span>Feel: {log.mood}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-purple-200/40">
                      +{log.duration} Mins ⏰
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Badges showcase section */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-purple-50 pb-3">
          <div>
            <h3 className="font-extrabold text-purple-950 text-sm flex items-center gap-1.5">
              <span>Sunny's Achievement Badge Wall!</span>
              <Award className="w-5 h-5 text-amber-500 fill-amber-300" />
            </h3>
            <p className="text-[11px] text-purple-400 mt-0.5">Unlock colorful dynamic milestones by hitting your study targets!</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            Unlocked: {badgesList.filter((b) => isBadgeUnlocked(b.id)).length} / {badgesList.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {badgesList.map((badge) => {
            const unlocked = isBadgeUnlocked(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                  unlocked
                    ? `bg-gradient-to-br from-white to-purple-50/30 border-purple-200 shadow-sm scale-[1.01]`
                    : "bg-gray-50/60 border-gray-100 opacity-60"
                }`}
                id={badge.id}
              >
                {/* Badge Icon circle */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${
                    unlocked
                      ? `bg-gradient-to-br ${badge.color} text-white`
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <span className={unlocked ? "" : "filter grayscale opacity-50"}>{badge.icon}</span>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <p className={`text-xs font-extrabold truncate ${unlocked ? "text-purple-950" : "text-gray-500"}`}>
                    {badge.title}
                  </p>
                  <p className="text-[10px] text-purple-900/70 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                  <div className="pt-1">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                        unlocked
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {unlocked ? "Unlocked 🔓" : `Requires: ${badge.requirement}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
