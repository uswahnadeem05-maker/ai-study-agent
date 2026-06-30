import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Star, CheckCircle, XCircle, Award, Sparkles, RefreshCw } from "lucide-react";
import { QuizData, QuizQuestion } from "../types";
import MascotSunny from "./MascotSunny";

interface QuizTabProps {
  currentQuiz: QuizData | null;
  onQuizCreated: (quiz: QuizData | null) => void;
  onAddMinutes: (minutes: number, topic: string) => void;
  onIncrementActions: () => void;
}

export default function QuizTab({ currentQuiz, onQuizCreated, onAddMinutes, onIncrementActions }: QuizTabProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz execution states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [studyLogged, setStudyLogged] = useState(false);

  // Suggested Topics
  const suggestions = [
    "Periodic Table 🧪",
    "Solar System 🪐",
    "Ancient Egypt 🇪🇬",
    "Basic JavaScript 💻",
  ];

  const handleCreateQuiz = async (selectedTopic = topic) => {
    const finalTopic = selectedTopic.trim();
    if (!finalTopic) return;

    setLoading(true);
    setError(null);
    setCurrentIdx(0);
    setSelectedIdx(null);
    setCorrectCount(0);
    setQuizFinished(false);
    setStudyLogged(false);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: finalTopic }),
      });

      if (!res.ok) {
        throw new Error("Sunny couldn't compile a quiz for that topic. Please try a different one!");
      }

      const quizData: QuizData = await res.json();
      onQuizCreated(quizData);
      onIncrementActions();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred starting the quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedIdx !== null || !currentQuiz) return;
    setSelectedIdx(idx);

    const question = currentQuiz.questions[currentIdx];
    if (idx === question.correctAnswerIndex) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!currentQuiz) return;
    
    setSelectedIdx(null);
    if (currentIdx < currentQuiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleLogStudyTime = () => {
    if (!currentQuiz || studyLogged) return;
    
    // Log 15 study minutes
    onAddMinutes(15, `Completed Quiz: ${currentQuiz.quizTitle}`);
    onIncrementActions();
    setStudyLogged(true);
  };

  const getRank = (score: number, total: number) => {
    const percent = score / total;
    if (percent === 1) return { title: "Curiosity Captain! 👑✨", desc: "Perfect score! Your brain cells are shining brighter than a supernova!" };
    if (percent >= 0.7) return { title: "Wisdom Wizard! 🧙‍♂️🔮", desc: "Fantastic job! You've got an amazing grasp of this material." };
    if (percent >= 0.4) return { title: "Brain Explorer! 🚀🪐", desc: "Great effort! You've navigated through some tricky questions!" };
    return { title: "Learning Cadet! 🌱🛡️", desc: "Every mistake is a tiny step toward wisdom! Try again and watch yourself grow!" };
  };

  return (
    <div className="space-y-6" id="quiz-tab-root">
      <AnimatePresence mode="wait">
        {!currentQuiz && !loading ? (
          /* Form to Generate Quiz */
          <motion.div
            key="quiz-setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-6"
          >
            <div className="flex items-start gap-4">
              <MascotSunny mood="happy" className="shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-purple-950 flex items-center gap-1.5">
                  <span>Smart Quiz Power-Up</span>
                  <Brain className="w-5 h-5 text-purple-500" />
                </h2>
                <p className="text-xs text-purple-800/80 mt-1">
                  Sunny designs personalized interactive multiple-choice quizzes on any topic you want. Test your skills and unlock bubbly master ranks!
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-purple-900 block">What shall we test you on? 🧬</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Solar System, Spanish Vocab, Photosynthesis..."
                  className="w-full bg-purple-50/30 hover:bg-purple-50 focus:bg-white border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-200 rounded-2xl px-4 py-3.5 text-sm text-purple-950 placeholder-purple-300 outline-none transition-all"
                  id="quiz-topic-input"
                />
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-purple-600/80">Try these:</span>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTopic(s);
                      handleCreateQuiz(s);
                    }}
                    className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-950 px-3 py-1.5 rounded-full border border-purple-100/60 transition-all font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCreateQuiz()}
                disabled={!topic.trim()}
                className="w-full mt-4 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                id="start-quiz-btn"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Start Brain Power-Up! 🧠⚡</span>
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          /* Loading Quiz State */
          <motion.div
            key="quiz-loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-10 border border-purple-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4"
          >
            <MascotSunny mood="thinking" />
            <h3 className="text-base font-bold text-purple-950 mt-4">Sunny is blowing quiz bubbles...</h3>
            <p className="text-xs text-purple-800/70 max-w-sm">
              We're drafting custom multiple-choice questions and coding encouraging explanations just for you. Get ready! ⚡🎈
            </p>
            <div className="flex gap-1.5 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-bounce"></span>
            </div>
          </motion.div>
        ) : quizFinished ? (
          /* Quiz Results Page */
          currentQuiz && (
            <motion.div
              key="quiz-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm text-center space-y-6"
            >
              <MascotSunny mood="celebrating" />
              
              <div className="space-y-1">
                <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-yellow-200">
                  Quiz Completed! 🎉
                </span>
                <h2 className="text-xl font-bold text-purple-950 mt-2">{currentQuiz.quizTitle}</h2>
              </div>

              {/* Score Display */}
              <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 inline-block">
                <p className="text-xs font-bold text-purple-500 uppercase">Your Final Score</p>
                <p className="text-3xl font-extrabold text-purple-950 mt-1">
                  {correctCount} <span className="text-purple-400 font-medium">/</span> {currentQuiz.questions.length}
                </p>
                <div className="flex gap-1 justify-center mt-2">
                  {Array.from({ length: currentQuiz.questions.length }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < correctCount ? "text-amber-400 fill-amber-300" : "text-purple-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Rank Badge */}
              <div className="max-w-md mx-auto bg-yellow-50/50 p-4 rounded-2xl border border-yellow-200 space-y-1">
                <p className="text-xs text-amber-800 font-extrabold flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Rank: {getRank(correctCount, currentQuiz.questions.length).title}</span>
                </p>
                <p className="text-xs text-purple-950 leading-relaxed pt-1">
                  {getRank(correctCount, currentQuiz.questions.length).desc}
                </p>
              </div>

              {/* Actions */}
              <div className="max-w-md mx-auto space-y-3 pt-2">
                <button
                  onClick={handleLogStudyTime}
                  disabled={studyLogged}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 ${
                    studyLogged
                      ? "bg-green-100 border border-green-200 text-green-700 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                  }`}
                  id="log-quiz-study-time-btn"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{studyLogged ? "Logged 15 Mins Successfully! 🎉" : "Log 15 Mins Study Time! ⏰"}</span>
                </button>

                <button
                  onClick={() => onQuizCreated(null)}
                  className="w-full py-3 bg-white hover:bg-purple-50 text-purple-950 font-bold rounded-2xl border border-purple-100 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  id="quiz-try-another-btn"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Another Quiz</span>
                </button>
              </div>
            </motion.div>
          )
        ) : (
          /* Active Quiz Playing */
          currentQuiz && (
            <motion.div
              key="active-quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Question Card */}
              <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-5">
                {/* Header indicators */}
                <div className="flex justify-between items-center text-xs font-bold text-purple-500 border-b border-purple-50 pb-3">
                  <span>📋 Topic: {currentQuiz.quizTitle}</span>
                  <span>
                    Question {currentIdx + 1} of {currentQuiz.questions.length}
                  </span>
                </div>

                {/* Progress bar dots */}
                <div className="flex justify-center gap-2">
                  {currentQuiz.questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        i === currentIdx
                          ? "w-8 bg-purple-600"
                          : i < currentIdx
                          ? "w-3.5 bg-green-400"
                          : "w-2.5 bg-purple-100"
                      }`}
                    />
                  ))}
                </div>

                {/* Question Text */}
                <h3 className="text-base font-extrabold text-purple-950 text-center py-2 px-1">
                  {currentQuiz.questions[currentIdx].question}
                </h3>

                {/* Choices Buttons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuiz.questions[currentIdx].options.map((option, idx) => {
                    const isSelected = selectedIdx === idx;
                    const isCorrect = idx === currentQuiz.questions[currentIdx].correctAnswerIndex;
                    
                    let cardClass = "bg-purple-50/50 hover:bg-purple-100/50 border-purple-100 text-purple-950";
                    let prefixIcon = null;

                    if (selectedIdx !== null) {
                      if (isCorrect) {
                        cardClass = "bg-green-100 border-green-300 text-green-950 font-semibold shadow-md scale-[1.01]";
                        prefixIcon = <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />;
                      } else if (isSelected) {
                        cardClass = "bg-red-100 border-red-300 text-red-950 shadow";
                        prefixIcon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
                      } else {
                        cardClass = "bg-white opacity-40 border-purple-50 text-purple-950 cursor-not-allowed";
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={selectedIdx !== null}
                        whileHover={selectedIdx === null ? { scale: 1.01 } : {}}
                        className={`w-full text-left p-4 rounded-2xl border text-xs transition-all flex items-center gap-3 ${cardClass}`}
                        id={`quiz-option-${idx}`}
                      >
                        {prefixIcon ? (
                          prefixIcon
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-white border border-purple-200/60 flex items-center justify-center text-xs font-bold text-purple-600 shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                        )}
                        <span className="flex-1 leading-relaxed">{option}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation Drawer */}
                <AnimatePresence>
                  {selectedIdx !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-200 space-y-3 mt-4"
                    >
                      <div className="flex items-center gap-2">
                        <MascotSunny mood={selectedIdx === currentQuiz.questions[currentIdx].correctAnswerIndex ? "happy" : "thinking"} className="w-8 h-8 shrink-0" />
                        <h4 className="font-extrabold text-xs text-amber-800">
                          {selectedIdx === currentQuiz.questions[currentIdx].correctAnswerIndex
                            ? "Sunny says: Spot on! Superb! 🎉✨"
                            : "Sunny says: That is an excellent attempt! Let's learn! 💡"}
                        </h4>
                      </div>
                      <p className="text-xs text-purple-950 leading-relaxed pl-1.5">
                        {currentQuiz.questions[currentIdx].explanation}
                      </p>

                      <button
                        onClick={handleNext}
                        className="w-full mt-3 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow transition-all cursor-pointer text-xs"
                        id="quiz-next-question-btn"
                      >
                        {currentIdx < currentQuiz.questions.length - 1 ? "Next Challenge! 🚀" : "See Final Score! 🎉"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
