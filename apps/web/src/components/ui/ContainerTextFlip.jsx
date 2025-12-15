"use client";

import React, { useState, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/utils/cn";

export function ContainerTextFlip({
  words = ["better", "modern", "beautiful", "awesome"],
  descriptions = [],
  interval = 3000,
  className,
  textClassName,
  animationDuration = 700,
  onClick,
}) {
  const id = useId();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState(100);
  const [showDescription, setShowDescription] = useState(false);
  const textRef = React.useRef(null);

  const updateWidthForWord = () => {
    if (textRef.current) {
      // Add some padding to the text width (30px on each side)
      const textWidth = textRef.current.scrollWidth + 30;
      setWidth(textWidth);
    }
  };

  useEffect(() => {
    // Update width whenever the word changes
    updateWidthForWord();
  }, [currentWordIndex]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [words, interval]);

  const handleClick = () => {
    if (onClick) {
      onClick(currentWordIndex);
    }
    if (descriptions.length > 0) {
      setShowDescription(true);
    }
  };

  const currentDescription = descriptions[currentWordIndex] || null;

  return (
    <div className="relative inline-block">
      <motion.p
        layout
        layoutId={`words-here-${id}`}
        animate={{ width }}
        transition={{ duration: animationDuration / 2000 }}
        onClick={handleClick}
        className={cn(
          "relative inline-block rounded-lg pt-2 pb-3 text-center text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold cursor-pointer",
          // Dark theme styling matching PagePalette
          "[background:linear-gradient(to_bottom,#1a2a30,#151515)]",
          "shadow-[inset_0_-1px_#0a0a0a,inset_0_0_0_1px_rgba(74,222,128,0.3),_0_4px_12px_rgba(0,0,0,0.5)]",
          "hover:shadow-[inset_0_-1px_#0a0a0a,inset_0_0_0_1px_rgba(74,222,128,0.5),_0_6px_20px_rgba(74,222,128,0.15)]",
          "transition-shadow duration-300",
          className,
        )}
        key={words[currentWordIndex]}
      >
        <motion.div
          transition={{
            duration: animationDuration / 1000,
            ease: "easeInOut",
          }}
          className={cn("inline-block", textClassName)}
          ref={textRef}
          layoutId={`word-div-${words[currentWordIndex]}-${id}`}
        >
          <motion.div className="inline-block bg-gradient-to-r from-[#4ADE80] via-[#36484d] to-[#764134] bg-clip-text text-transparent">
            {words[currentWordIndex].split("").map((letter, index) => (
              <motion.span
                key={index}
                initial={{
                  opacity: 0,
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  delay: index * 0.02,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </motion.p>

      {/* Description Popup */}
      <AnimatePresence>
        {showDescription && currentDescription && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDescription(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
            >
              <div className="bg-gradient-to-br from-[#0f1115] to-[#151515] rounded-2xl border border-[#252525] p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-3 font-proxima-sera">
                  {currentDescription.title || words[currentWordIndex]}
                </h3>
                <p className="text-[#888888] font-montserrat mb-4 leading-relaxed">
                  {currentDescription.text}
                </p>
                <button
                  onClick={() => setShowDescription(false)}
                  className="w-full py-2 px-4 bg-[#4ADE80] hover:bg-[#22C55E] text-[#0a0a0a] font-bold rounded-lg transition-colors font-montserrat"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
