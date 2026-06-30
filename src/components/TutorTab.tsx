import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, RefreshCw, Trash2 } from "lucide-react";
import { ChatMessage, QuizData, StudyPlanData } from "../types";
import MascotSunny from "./MascotSunny";

interface TutorTabProps {
  onAddMinutes: (minutes: number, topic: string) => void;
  onPlanCreated: (plan: StudyPlanData) => void;
}

export default function TutorTab({ onAddMinutes, onPlanCreated }: TutorTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: "Hi there! 🌸 I'm Sunny, your friendly AI study buddy! I love making learning super fun. Ask me any question, type a topic like 'Chemistry' to generate a quiz, or ask for a '5-day plan for Algebra'! What are we exploring today? ✨",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mascotMood, setMascotMood] = useState<"happy" | "thinking" | "celebrating" | "focused">("happy");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = [
    "Explain quantum computing like I'm 10 🚀",
    "Give me a biology quiz on cells 🦠",
    "3-day study plan for calculus 📐",
    "What is photosynthesis? 🌱"
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setMascotMood("thinking");

    try {
      // Map history to the simplified API format
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/agent-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend, history }),
      });

      if (!res.ok) {
        throw new Error("Oops! My brain cells got a bit tangled. Mind asking again? 🧠💫");
      }

      const responseData = await res.json();
      
      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: responseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        skillUsed: responseData.skillId,
      };

      // If a quiz or plan is returned, inject into the inlineData field of the message
      if (responseData.skillId === "quiz-skill" && responseData.data) {
        modelMsg.inlineData = {
          skillId: "quiz-skill",
          quiz: responseData.data as QuizData
        };
        setMascotMood("celebrating");
      } else if (responseData.skillId === "study-plan-skill" && responseData.data) {
        modelMsg.inlineData = {
          skillId: "study-plan-skill",
          studyPlan: responseData.data as StudyPlanData
        };
        // Propagate the new plan to parent state so it's loaded in the Plan tab too!
        onPlanCreated(responseData.data);
        setMascotMood("celebrating");
      } else {
        setMascotMood("happy");
      }

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setMascotMood("happy");
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "model",
          text: err.message || "I had trouble connecting with the cloud! Try again in a second! ✨",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear our chats and start fresh? 🧹✨")) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          text: "Fresh start! 🎉 Let's learn something amazing today! Ask me anything, or try some of the options on the suggestions bar!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setMascotMood("happy");
    }
  };

  // Inline Quiz Component
  const InlineQuiz = ({ quiz }: { quiz: QuizData }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    const question = quiz.questions[currentIdx];

    const handleOptionClick = (idx: number) => {
      if (selectedIdx !== null) return;
      setSelectedIdx(idx);
      if (idx === question.correctAnswerIndex) {
        setScore(prev => prev + 1);
      }
    };

    const handleNext = () => {
      setSelectedIdx(null);
      if (currentIdx < quiz.questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setQuizFinished(true);
        // Reward study tracker
        onAddMinutes(10, quiz.quizTitle);
      }
    };

    if (quizFinished) {
      return (
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 mt-2 text-purple-950">
          <div className="text-center font-bold text-lg mb-1">🎉 Quiz Finished! 🎉</div>
          <div className="text-center text-sm mb-3">
            You scored <span className="font-bold text-purple-700">{score}/{quiz.questions.length}</span>! Excellent effort!
          </div>
          <p className="text-xs bg-white p-2 rounded border border-purple-100 text-purple-900 leading-relaxed text-center mb-3">
            "We just added <span className="font-bold">10 study minutes</span> to your progress tracker! Keep up the brilliant momentum!"
          </p>
          <div className="text-center text-xs text-purple-500 italic">Sunny says: You did fantastic! ☀️</div>
        </div>
      );
    }

    return (
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 mt-2 text-purple-950 text-left">
        <div className="font-bold text-sm text-purple-700 mb-1">📝 Mini-Quiz: {quiz.quizTitle}</div>
        <div className="text-xs text-purple-500 mb-3">Question {currentIdx + 1} of {quiz.questions.length}</div>
        <p className="font-semibold text-sm mb-3">{question.question}</p>

        <div className="space-y-2">
          {question.options.map((opt, idx) => {
            let btnClass = "bg-white hover:bg-purple-100/50 border-purple-100 text-purple-900";
            if (selectedIdx !== null) {
              if (idx === question.correctAnswerIndex) {
                btnClass = "bg-green-100 border-green-300 text-green-950 font-semibold";
              } else if (idx === selectedIdx) {
                btnClass = "bg-red-100 border-red-300 text-red-950";
              } else {
                btnClass = "bg-white opacity-50 border-purple-100 text-purple-900";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={selectedIdx !== null}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-start gap-2 ${btnClass}`}
              >
                <span className="font-bold opacity-60">{String.fromCharCode(65 + idx)})</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-white p-3 rounded-lg border border-purple-100 text-xs"
          >
            <div className="font-bold mb-1 flex items-center gap-1">
              {selectedIdx === question.correctAnswerIndex ? (
                <span className="text-green-600">🌟 Perfect Spot On!</span>
              ) : (
                <span className="text-purple-600">💡 Learning Moment!</span>
              )}
            </div>
            <p className="text-purple-900 leading-relaxed">{question.explanation}</p>

            <button
              onClick={handleNext}
              className="mt-2 w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-bold text-xs shadow-sm transition-all"
            >
              {currentIdx < quiz.questions.length - 1 ? "Next Question! 🚀" : "Finish Quiz! 🎉"}
            </button>
          </motion.div>
        )}
      </div>
    );
  };

  // Inline Study Plan Timeline
  const InlineStudyPlan = ({ plan }: { plan: StudyPlanData }) => {
    return (
      <div className="bg-yellow-50/70 rounded-xl p-4 border border-yellow-200 mt-2 text-yellow-950 text-left">
        <div className="font-bold text-sm text-amber-700 mb-1 flex items-center gap-1">
          <span>🗺️ Study Path:</span>
          <span>{plan.title}</span>
        </div>
        <p className="text-xs text-yellow-900 mb-3 leading-relaxed">{plan.buddyIntro}</p>

        <div className="space-y-3 relative border-l-2 border-yellow-200 pl-4 ml-2">
          {plan.days.map((d, i) => (
            <div key={i} className="relative">
              {/* Dot icon */}
              <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-amber-400 border border-white"></div>
              <div className="font-bold text-xs text-amber-800">Day {d.day}: {d.focus}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {d.concepts.map((c, ci) => (
                  <span key={ci} className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-yellow-950 mt-1 italic">
                <span className="font-bold not-italic">Buddy tip: ☀️</span> {d.buddyTip}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs font-bold text-amber-700 mt-3 border-t border-yellow-100 pt-2">{plan.buddyOutro}</p>
        <div className="mt-2 text-center text-[10px] bg-white text-amber-800 p-1 rounded border border-yellow-100">
          ✨ Check the <span className="font-bold">Study Plan tab</span> for the interactive checklist!
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden" id="ai-tutor-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 p-4 border-b border-purple-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MascotSunny mood={mascotMood} className="w-10 h-10" />
          <div>
            <h2 className="text-base font-bold text-purple-950 flex items-center gap-1.5">
              <span>AI Tutor Chat</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" />
            </h2>
            <p className="text-xs text-purple-800/80">Studying with Sunny the study buddy!</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 text-purple-700 hover:bg-purple-100/50 rounded-xl transition-all"
          title="Clear chat log"
          id="clear-chat-btn"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-purple-50/20">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2.5`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center text-sm shadow-sm shrink-0 select-none">
                    ☀️
                  </div>
                )}
                
                <div className="max-w-[80%] flex flex-col">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                      isUser
                        ? "bg-purple-600 text-white rounded-tr-none"
                        : "bg-white text-purple-950 border border-purple-50 rounded-tl-none"
                    }`}
                  >
                    {msg.text}

                    {/* Check if there is inline data to render (Interactive Plan/Quiz) */}
                    {msg.inlineData?.skillId === "quiz-skill" && msg.inlineData.quiz && (
                      <InlineQuiz quiz={msg.inlineData.quiz} />
                    )}

                    {msg.inlineData?.skillId === "study-plan-skill" && msg.inlineData.studyPlan && (
                      <InlineStudyPlan plan={msg.inlineData.studyPlan} />
                    )}
                  </div>
                  <span className={`text-[10px] text-purple-400 mt-1 px-1 ${isUser ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-start items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-full bg-yellow-100 border border-yellow-200 flex items-center justify-center text-sm shadow-sm shrink-0 animate-bounce">
                🤔
              </div>
              <div className="bg-white border border-purple-50 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                <span className="text-xs text-purple-600 font-medium">Sunny is sparkling ideas...</span>
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"></span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Bar */}
      {messages.length < 3 && !loading && (
        <div className="px-4 py-2 border-t border-purple-50 bg-white flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-purple-700/80">Try asking:</span>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-xs bg-purple-50 hover:bg-purple-100/80 text-purple-950 px-3 py-1.5 rounded-full border border-purple-100 transition-all font-medium text-left"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 border-t border-purple-50 bg-white flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question, request a plan, or ask for a quiz!..."
          className="flex-1 bg-purple-50/50 hover:bg-purple-50 focus:bg-white border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-200 rounded-2xl px-4 py-3 text-sm text-purple-950 placeholder-purple-400 outline-none transition-all"
          disabled={loading}
          id="chat-input-field"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-2xl transition-all shadow-md flex items-center justify-center shrink-0"
          id="chat-submit-btn"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
