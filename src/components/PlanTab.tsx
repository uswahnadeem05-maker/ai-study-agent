import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, CheckCircle2, Circle, ArrowRight, Sparkles, Map, RefreshCw } from "lucide-react";
import { StudyPlanData, StudyPlanDay } from "../types";
import MascotSunny from "./MascotSunny";

interface PlanTabProps {
  currentPlan: StudyPlanData | null;
  onPlanCreated: (plan: StudyPlanData) => void;
  onAddMinutes: (minutes: number, topic: string) => void;
  onIncrementActions: () => void;
}

export default function PlanTab({ currentPlan, onPlanCreated, onAddMinutes, onIncrementActions }: PlanTabProps) {
  const [topic, setTopic] = useState("");
  const [days, setDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggested Topics
  const suggestions = [
    "Intro to French 🇫🇷",
    "Photosynthesis 🍃",
    "HTML/CSS Basics 💻",
    "Ancient Rome 🏛️",
  ];

  const handleGeneratePlan = async (selectedTopic = topic) => {
    const finalTopic = selectedTopic.trim();
    if (!finalTopic) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: finalTopic, days }),
      });

      if (!res.ok) {
        throw new Error("Sunny got a bit lost compiling that path. Try simplifying the topic!");
      }

      const planData: StudyPlanData = await res.json();
      onPlanCreated(planData);
      onIncrementActions();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong! Give it another spin.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDayComplete = (dayNum: number) => {
    if (!currentPlan) return;

    const updatedDays = currentPlan.days.map((day) => {
      if (day.day === dayNum) {
        const nextState = !day.completed;
        if (nextState) {
          // If checking off a day, reward 20 mins to their study progress!
          onAddMinutes(20, `${currentPlan.title} (Day ${dayNum})`);
          onIncrementActions();
        }
        return { ...day, completed: nextState };
      }
      return day;
    });

    onPlanCreated({
      ...currentPlan,
      days: updatedDays,
    });
  };

  const calculateProgressPercent = () => {
    if (!currentPlan || currentPlan.days.length === 0) return 0;
    const completed = currentPlan.days.filter((d) => d.completed).length;
    return Math.round((completed / currentPlan.days.length) * 100);
  };

  return (
    <div className="space-y-6" id="plan-tab-root">
      {/* Setup Form (when no current plan, or when user wants to regenerate) */}
      <AnimatePresence mode="wait">
        {!currentPlan && !loading ? (
          <motion.div
            key="setup-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 border border-yellow-100 shadow-sm space-y-6"
          >
            <div className="flex items-start gap-4">
              <MascotSunny mood="happy" className="shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-purple-950 flex items-center gap-1.5">
                  <span>Custom Study Plan Generator</span>
                  <Map className="w-5 h-5 text-amber-500" />
                </h2>
                <p className="text-xs text-purple-800/80 mt-1">
                  Sunny builds structured day-by-day plans filled with custom activities to get you ready! Enter a topic below and tell Sunny how long we have!
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-900 block">What topic are we conquering? 🧠</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. World Geography, Algebra, Spanish Vocab..."
                  className="w-full bg-yellow-50/30 hover:bg-yellow-50 focus:bg-white border border-yellow-100 focus:border-amber-300 focus:ring-2 focus:ring-yellow-100 rounded-2xl px-4 py-3.5 text-sm text-purple-950 placeholder-purple-300 outline-none transition-all"
                  id="study-topic-input"
                />
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-purple-600/80">Fun topics:</span>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTopic(s);
                      handleGeneratePlan(s);
                    }}
                    className="text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-950 px-3 py-1.5 rounded-full border border-yellow-100/60 transition-all font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Slider for Days */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-purple-900">
                  <span>How many days shall we study? 📅</span>
                  <span className="text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">{days} Days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-yellow-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  id="study-days-slider"
                />
                <div className="flex justify-between text-[10px] text-purple-400 font-bold px-1">
                  <span>3 Days</span>
                  <span>7 Days</span>
                  <span>14 Days</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleGeneratePlan()}
                disabled={!topic.trim()}
                className="w-full mt-4 py-3.5 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-purple-950 font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                id="generate-plan-btn"
              >
                <Sparkles className="w-4 h-4 fill-purple-950" />
                <span>Map My Journey! 🗺️✨</span>
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          <motion.div
            key="loading-plan"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-10 border border-yellow-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4"
          >
            <MascotSunny mood="thinking" />
            <h3 className="text-base font-bold text-purple-950 mt-4">Sunny is weaving your learning pathway...</h3>
            <p className="text-xs text-purple-800/70 max-w-sm">
              We're designing a fun, step-by-step roadmap filled with micro-activities and tips just for you. Sit tight! 🎨✨
            </p>
            <div className="flex gap-1.5 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce"></span>
            </div>
          </motion.div>
        ) : (
          /* Main Plan View */
          currentPlan && (
            <motion.div
              key="plan-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Plan Intro Card */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-3xl p-6 border border-yellow-100 shadow-sm flex flex-col md:flex-row gap-5 items-center">
                <MascotSunny mood="happy" className="shrink-0" />
                <div className="space-y-2 flex-1 text-center md:text-left">
                  <span className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-amber-200">
                    Active Study Map 🗺️
                  </span>
                  <h2 className="text-xl font-bold text-purple-950 mt-1">{currentPlan.title}</h2>
                  <p className="text-xs text-purple-900 leading-relaxed italic">
                    "{currentPlan.buddyIntro}"
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="pt-3">
                    <div className="flex justify-between items-center text-xs font-bold text-purple-900 mb-1.5">
                      <span>Path Completion Progress</span>
                      <span>{calculateProgressPercent()}%</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="bg-purple-600 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProgressPercent()}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Regenerate Button */}
                <button
                  onClick={() => onPlanCreated(null as any)}
                  className="py-2.5 px-4 bg-white hover:bg-purple-50 text-purple-950 font-bold rounded-2xl border border-purple-100 transition-all flex items-center gap-1.5 text-xs shadow-sm cursor-pointer shrink-0"
                  id="start-new-plan-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New Path</span>
                </button>
              </div>

              {/* Day-by-Day Timeline List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-purple-950 uppercase tracking-wider px-1">Daily Chapters</h3>
                
                {currentPlan.days.map((day) => {
                  return (
                    <motion.div
                      key={day.day}
                      whileHover={{ scale: 1.005 }}
                      className={`rounded-2xl p-5 border transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                        day.completed
                          ? "bg-purple-50/40 border-purple-100/50 opacity-80"
                          : "bg-white border-yellow-50 shadow-sm hover:border-yellow-200"
                      }`}
                    >
                      {/* Interactive checkbox */}
                      <button
                        onClick={() => handleToggleDayComplete(day.day)}
                        className="shrink-0 p-1 text-purple-600 hover:scale-110 transition-all"
                        title={day.completed ? "Mark day incomplete" : "Mark day complete"}
                        id={`day-${day.day}-checkbox`}
                      >
                        {day.completed ? (
                          <CheckCircle2 className="w-7 h-7 text-purple-600 fill-purple-100" />
                        ) : (
                          <Circle className="w-7 h-7 text-purple-300 hover:text-purple-500" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-purple-950">
                            Day {day.day}
                          </span>
                          <span className="text-purple-300">•</span>
                          <span className={`text-sm font-bold ${day.completed ? "line-through text-purple-400" : "text-purple-900"}`}>
                            {day.focus}
                          </span>
                        </div>

                        {/* Concepts tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {day.concepts.map((concept, cIdx) => (
                            <span
                              key={cIdx}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                day.completed
                                  ? "bg-purple-100/50 text-purple-500 border-purple-100/30"
                                  : "bg-yellow-50 text-yellow-800 border-yellow-100"
                              }`}
                            >
                              {concept}
                            </span>
                          ))}
                        </div>

                        {/* Activity details */}
                        <p className={`text-xs leading-relaxed ${day.completed ? "text-purple-400/80 line-through" : "text-purple-900"}`}>
                          <span className="font-bold">Playful Task:</span> {day.activity}
                        </p>

                        {/* Sunny's sweet Tip */}
                        <div className="bg-yellow-50/40 p-2.5 rounded-xl border border-yellow-100/40 text-[11px] text-yellow-950 flex items-start gap-1.5 mt-2">
                          <span className="text-xs">☀️</span>
                          <p className="italic">{day.buddyTip}</p>
                        </div>
                      </div>

                      {/* Right feedback icon */}
                      {day.completed && (
                        <div className="hidden sm:flex text-purple-500 items-center gap-1 text-xs font-bold bg-purple-100/60 px-3 py-1.5 rounded-full animate-bounce shrink-0">
                          <span>+20 Mins!</span>
                          <span>🌟</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Plan Outro Card */}
              <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 text-center">
                <p className="text-xs font-bold text-purple-950 leading-relaxed">{currentPlan.buddyOutro}</p>
                <div className="text-[10px] text-purple-500 mt-2 font-semibold">Sunny says: Every step forward is a victory! Keep blooming! 🌱✨</div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
