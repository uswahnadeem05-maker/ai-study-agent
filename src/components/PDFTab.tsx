import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, UploadCloud, CheckCircle2, ChevronRight, BookOpen, Layers, Trophy, AlertTriangle } from "lucide-react";
import { PDFSummaryData, Flashcard } from "../types";
import MascotSunny from "./MascotSunny";

interface PDFTabProps {
  currentSummary: PDFSummaryData | null;
  onSummaryCreated: (summary: PDFSummaryData | null) => void;
  onAddMinutes: (minutes: number, topic: string) => void;
  onIncrementActions: () => void;
}

export default function PDFTab({ currentSummary, onSummaryCreated, onAddMinutes, onIncrementActions }: PDFTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "flashcards" | "challenge">("summary");
  const [dragActive, setDragActive] = useState(false);
  
  // Flashcard flipping state
  const [flippedCardIdx, setFlippedCardIdx] = useState<number | null>(null);

  // Sample lesson notes to summarize instantly
  const sampleNotes = {
    fileName: "cellular_respiration_notes.txt",
    mimeType: "text/plain",
    // Base64 encoded: "Cellular Respiration is the process where cells convert glucose into ATP. Stage 1: Glycolysis (occurs in cytoplasm, breaks glucose into pyruvate, gets 2 ATP). Stage 2: Krebs Cycle (occurs in mitochondria matrix, releases CO2, gets 2 ATP). Stage 3: Electron Transport Chain (occurs on mitochondria membrane, uses oxygen, gets 32 ATP)."
    base64: "Q2VsbHVsYXIgUmVzcGlyYXRpb24gaXMgdGhlIHByb2Nlc3Mgd2hlcmUgY2VsbHMgY29udmVydCBnbHVjb3NlIGludG8gQVRQLiBTdGFnZSAxOiBHbHljb2x5c2lzIChvY2N1cnMgaW4gY3l0b3BsYXNtLCBicmVha3MgZ2x1Y29zZSBpbnRvIHB5cnV2YXRlLCBnZXRzIDIgQVRQKS4gU3RhZ2UgMjogS3JlYnMgQ3ljbGUgKG9jY3VycyBpbiBtaXRvY2hvbmRyaWEgbWF0cml4LCByZWxlYXNlcyBDTzIsIGdldHMgMiBBVFApLiBTdGFnZSAzOiBFbGVjdHJvbiBUcmFuc3BvcnQgQ2hhaW4gKG9jY3VycyBvbiBtaXRvY2hvbmRpYSBtZW1icmFuZSwgdXNlcyBveHlnZW4sIGdldHMgMzIgQVRQKS4="
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleFileProcess = async (file: File) => {
    // Only accept PDF or Text based files (txt, md, log, pdf)
    const allowedTypes = ["application/pdf", "text/plain", "text/markdown", "application/json"];
    const isAllowed = allowedTypes.includes(file.type) || file.name.endsWith(".md") || file.name.endsWith(".txt");
    
    if (!isAllowed) {
      setError("Sunny can only read PDFs or Text-based files (.txt, .md) right now! Please pick one of those! 📚");
      return;
    }

    setLoading(true);
    setError(null);
    setFlippedCardIdx(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64String = (reader.result as string).split(",")[1];
        await fetchSummary(base64String, file.type, file.name);
      } catch (err: any) {
        console.error(err);
        setError("Sunny got dizzy reading that document. Please try a different text file or PDF!");
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading file. Try a different document!");
      setLoading(false);
    };
  };

  const handleUseSample = async () => {
    setLoading(true);
    setError(null);
    setFlippedCardIdx(null);
    try {
      await fetchSummary(sampleNotes.base64, sampleNotes.mimeType, sampleNotes.fileName);
    } catch (err: any) {
      setError("Error summarizing sample notes.");
      setLoading(false);
    }
  };

  const fetchSummary = async (base64Data: string, mimeType: string, fileName: string) => {
    const res = await fetch("/api/pdf-summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileData: base64Data, mimeType, fileName }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Summarization failed");
    }

    const summary: PDFSummaryData = await res.json();
    onSummaryCreated(summary);
    onAddMinutes(15, `Summarized: ${fileName}`);
    onIncrementActions();
    setLoading(false);
  };

  const handleCloseSummary = () => {
    onSummaryCreated(null);
    setActiveSubTab("summary");
  };

  return (
    <div className="space-y-6" id="pdf-summarizer-tab">
      <AnimatePresence mode="wait">
        {!currentSummary && !loading ? (
          /* File Uploader Dashboard */
          <motion.div
            key="pdf-upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-6"
          >
            <div className="flex items-start gap-4">
              <MascotSunny mood="happy" className="shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-purple-950 flex items-center gap-1.5">
                  <span>PDF & Notes Summarizer</span>
                  <FileText className="w-5 h-5 text-pink-500" />
                </h2>
                <p className="text-xs text-purple-800/80 mt-1">
                  Sunny transforms dense textbooks, PDFs, and lecture notes into bubbly key concepts, 3D interactive flashcards, and actionable study checklists!
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-3xl p-10 text-center transition-all flex flex-col items-center justify-center space-y-3 relative overflow-hidden ${
                dragActive
                  ? "border-pink-400 bg-pink-50/50 scale-[1.01]"
                  : "border-pink-200 bg-pink-50/10 hover:bg-pink-50/20"
              }`}
              id="file-dropzone"
            >
              <UploadCloud className="w-12 h-12 text-pink-400 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-purple-950">Drag and drop your study material here!</p>
                <p className="text-xs text-purple-400 font-medium">Supports PDFs, TXT, or MD documents</p>
              </div>

              <div className="relative">
                <label className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2.5 rounded-2xl shadow transition-all cursor-pointer text-xs inline-block">
                  Choose a File
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.md,.json"
                    className="hidden"
                    id="file-input-element"
                  />
                </label>
              </div>
            </div>

            {/* Fast Sample Notes Option */}
            <div className="border-t border-pink-50 pt-4 flex flex-col items-center space-y-2 text-center">
              <p className="text-xs font-bold text-purple-700/80">Don't have a textbook file handy?</p>
              <button
                onClick={handleUseSample}
                className="py-2.5 px-5 bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 text-purple-950 font-bold rounded-2xl border border-pink-200 transition-all text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                id="use-sample-notes-btn"
              >
                <span>💡 Use Sunny's Sample Biology Notes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : loading ? (
          /* Loading Summary State */
          <motion.div
            key="loading-summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-10 border border-pink-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4"
          >
            <MascotSunny mood="thinking" />
            <h3 className="text-base font-bold text-purple-950 mt-4">Sunny is analyzing your study notes...</h3>
            <p className="text-xs text-purple-800/70 max-w-sm">
              We're distilling key concepts, making revision flashcards, and preparing a cute mascot challenge! This will only take a tiny moment. 📚🔍
            </p>
            <div className="flex gap-1.5 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-bounce"></span>
            </div>
          </motion.div>
        ) : (
          /* Summarizer Result Workspace */
          currentSummary && (
            <motion.div
              key="summary-workspace"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Document Overview Header */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-6 border border-pink-100 shadow-sm flex flex-col md:flex-row gap-5 items-center">
                <MascotSunny mood="happy" className="shrink-0" />
                <div className="space-y-1.5 flex-1 text-center md:text-left">
                  <span className="bg-pink-100 text-pink-800 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-pink-200">
                    Document Distilled ✨
                  </span>
                  <h2 className="text-lg font-bold text-purple-950 mt-1">{currentSummary.documentName}</h2>
                  <p className="text-xs text-purple-900 leading-relaxed font-semibold italic">
                    "{currentSummary.summaryHeadline}"
                  </p>
                  <p className="text-xs text-purple-700/90 leading-relaxed pt-1">
                    {currentSummary.buddyIntro}
                  </p>
                </div>

                <button
                  onClick={handleCloseSummary}
                  className="py-2 px-4 bg-white hover:bg-pink-50 text-purple-950 font-bold rounded-2xl border border-pink-200 transition-all text-xs shadow-sm cursor-pointer shrink-0"
                  id="close-summary-btn"
                >
                  Clear & Upload New
                </button>
              </div>

              {/* Sub-navigation tabs */}
              <div className="flex bg-pink-100/50 p-1.5 rounded-2xl border border-pink-100/30 gap-2">
                <button
                  onClick={() => setActiveSubTab("summary")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeSubTab === "summary"
                      ? "bg-white text-purple-950 shadow-sm"
                      : "text-purple-700 hover:bg-white/40"
                  }`}
                  id="tab-sub-summary"
                >
                  <BookOpen className="w-4 h-4 text-pink-500" />
                  <span>Key Concepts</span>
                </button>
                <button
                  onClick={() => setActiveSubTab("flashcards")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeSubTab === "flashcards"
                      ? "bg-white text-purple-950 shadow-sm"
                      : "text-purple-700 hover:bg-white/40"
                  }`}
                  id="tab-sub-flashcards"
                >
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span>Revision Flashcards</span>
                </button>
                <button
                  onClick={() => setActiveSubTab("challenge")}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeSubTab === "challenge"
                      ? "bg-white text-purple-950 shadow-sm"
                      : "text-purple-700 hover:bg-white/40"
                  }`}
                  id="tab-sub-challenge"
                >
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Mascot Challenge</span>
                </button>
              </div>

              {/* Tab Content Panels */}
              <div className="min-h-[250px]">
                {activeSubTab === "summary" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-sm font-bold text-purple-950 uppercase tracking-wider px-1">Distilled Concept Guide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSummary.keyConcepts.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-pink-50 p-5 rounded-2xl shadow-sm hover:border-pink-200 transition-all space-y-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-700 shrink-0">
                              {idx + 1}
                            </span>
                            <h4 className="font-extrabold text-purple-950 text-sm">{item.concept}</h4>
                          </div>
                          <p className="text-xs text-purple-900 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeSubTab === "flashcards" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-sm font-bold text-purple-950 uppercase tracking-wider">Click to Flip Cards 🔄</h3>
                      <span className="text-[10px] text-purple-400 font-bold bg-purple-50 px-2.5 py-1 rounded-full">
                        {currentSummary.flashcards.length} Flashcards Loaded
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentSummary.flashcards.map((card, idx) => {
                        const isFlipped = flippedCardIdx === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => setFlippedCardIdx(isFlipped ? null : idx)}
                            className="h-44 [perspective:1000px] cursor-pointer"
                            id={`flashcard-${idx}`}
                          >
                            <div
                              className={`relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d] ${
                                isFlipped ? "[transform:rotateY(180deg)]" : ""
                              }`}
                            >
                              {/* Card Front */}
                              <div className="absolute w-full h-full bg-white border border-pink-100 rounded-2xl p-4 shadow-sm [backface-visibility:hidden] flex flex-col justify-between text-left">
                                <span className="text-[10px] uppercase font-bold text-pink-500 tracking-widest bg-pink-50 px-2 py-0.5 rounded-full w-max">
                                  Review
                                </span>
                                <p className="text-sm font-bold text-purple-950 text-center flex-1 flex items-center justify-center px-2">
                                  {card.front}
                                </p>
                                <span className="text-[10px] text-purple-400 text-center font-bold block hover:text-purple-600 transition-all mt-2">
                                  Click to reveal answer ✨
                                </span>
                              </div>

                              {/* Card Back */}
                              <div className="absolute w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between text-left overflow-y-auto">
                                <span className="text-[10px] uppercase font-bold text-purple-200 tracking-widest bg-white/10 px-2 py-0.5 rounded-full w-max">
                                  Explanation
                                </span>
                                <p className="text-xs leading-relaxed text-purple-50 flex-1 flex items-center justify-center pt-2 pb-1">
                                  {card.back}
                                </p>
                                <span className="text-[9px] text-purple-200/80 text-center font-bold block mt-1">
                                  Click to flip back 🔄
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeSubTab === "challenge" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50/50 rounded-2xl p-6 border border-yellow-200 max-w-2xl mx-auto space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl shadow-inner border border-yellow-200">
                        🏆
                      </div>
                      <div>
                        <h4 className="font-extrabold text-purple-950 text-sm">Sunny's Lesson Accomplishment Challenge!</h4>
                        <p className="text-[11px] text-purple-800/80">Make sure to lock in this knowledge!</p>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-yellow-100 space-y-3 shadow-sm">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-purple-950 text-xs">Self-Explanation Check</p>
                          <p className="text-xs text-purple-900 mt-1">
                            Close your eyes and try to summarize the headline concept to yourself in exactly two sentences using your own words.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 pt-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-purple-950 text-xs">The Flashcard Sprint</p>
                          <p className="text-xs text-purple-900 mt-1">
                            Flip through all the flashcards in this summaries list. Try to recall at least 3 correctly on the first try!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl text-center space-y-1.5 shadow">
                      <p className="text-xs font-bold">{currentSummary.quickTakeaway}</p>
                      <p className="text-[10px] text-purple-200 font-medium">Sunny says: I believe in you. Let's make today count! 🌟</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
