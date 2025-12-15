"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/utils/cn";

export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      <span className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg font-proxima-sera text-white">
        {text}
      </span>

      <span className="relative inline-flex items-center rounded-lg border border-[#252525] bg-[#151515] px-4 py-3 font-proxima-sera text-4xl md:text-5xl font-bold tracking-tight shadow-lg shadow-black/20 ring-1 ring-white/5 min-h-[1.4em]">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn("inline-block whitespace-nowrap bg-gradient-to-r from-[#4ADE80] to-[#764134] bg-clip-text text-transparent leading-normal")}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
};
