import React from "react";
import { motion } from "motion/react";

interface MascotSunnyProps {
  mood?: "happy" | "thinking" | "celebrating" | "focused";
  bubbleText?: string;
  className?: string;
}

export default function MascotSunny({ mood = "happy", bubbleText, className = "" }: MascotSunnyProps) {
  // Determine avatar background and facial features based on mood
  const getMoodStyles = () => {
    switch (mood) {
      case "thinking":
        return {
          bgColor: "bg-amber-100 border-amber-300",
          eyeClass: "h-2 w-3 rounded-t-full bg-amber-800",
          mouthClass: "w-4 h-1.5 rounded-full bg-amber-800",
          cheeksColor: "bg-amber-300/40",
          accessory: "🤔",
        };
      case "celebrating":
        return {
          bgColor: "bg-pink-100 border-pink-300",
          eyeClass: "h-3 w-3 rounded-full bg-pink-800 flex items-center justify-center text-[8px] font-bold text-white",
          mouthClass: "w-6 h-4 rounded-b-full bg-pink-800",
          cheeksColor: "bg-pink-400/50",
          accessory: "🎉",
        };
      case "focused":
        return {
          bgColor: "bg-indigo-100 border-indigo-300",
          eyeClass: "h-1.5 w-3 rounded bg-indigo-900",
          mouthClass: "w-5 h-1 rounded-full bg-indigo-900",
          cheeksColor: "bg-indigo-300/40",
          accessory: "⚡",
        };
      case "happy":
      default:
        return {
          bgColor: "bg-yellow-100 border-yellow-300",
          eyeClass: "h-2 w-2 rounded-full bg-yellow-950",
          mouthClass: "w-6 h-3 rounded-b-full bg-yellow-950",
          cheeksColor: "bg-pink-300/60",
          accessory: "✨",
        };
    }
  };

  const styles = getMoodStyles();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Speech Bubble */}
      {bubbleText && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="relative mb-3 max-w-xs rounded-2xl bg-white px-4 py-3 text-sm font-medium text-purple-950 shadow-md border border-purple-100"
        >
          {bubbleText}
          {/* Bubble Pointer */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-purple-100 rotate-45"></div>
        </motion.div>
      )}

      {/* Mascot Body */}
      <motion.div
        animate={
          mood === "celebrating"
            ? { y: [0, -12, 0, -12, 0], rotate: [0, 5, -5, 5, 0] }
            : mood === "thinking"
            ? { rotate: [0, 2, -2, 2, 0], y: [0, -1, 0] }
            : { y: [0, -4, 0] }
        }
        transition={
          mood === "celebrating"
            ? { duration: 1.2, ease: "easeInOut" }
            : { repeat: Infinity, duration: 3, ease: "easeInOut" }
        }
        className={`relative flex items-center justify-center w-20 h-20 rounded-full border-4 ${styles.bgColor} shadow-lg cursor-pointer`}
      >
        {/* Sparkle Accessory */}
        <span className="absolute -top-1 -right-1 text-lg select-none filter drop-shadow animate-pulse">
          {styles.accessory}
        </span>

        {/* Dynamic Face */}
        <div className="flex flex-col items-center justify-center space-y-1.5 w-full">
          {/* Eyes & Blushing */}
          <div className="flex justify-between w-11 px-1 relative">
            <div className="flex flex-col items-center space-y-1">
              <div className={`${styles.eyeClass} transition-all duration-300`} />
              <div className={`w-2.5 h-1 rounded-full ${styles.cheeksColor}`} />
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className={`${styles.eyeClass} transition-all duration-300`} />
              <div className={`w-2.5 h-1 rounded-full ${styles.cheeksColor}`} />
            </div>
          </div>

          {/* Mouth */}
          <div className={`${styles.mouthClass} transition-all duration-300`} />
        </div>
      </motion.div>
    </div>
  );
}
