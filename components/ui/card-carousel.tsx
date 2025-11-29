"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const CardCarousel = ({ items }: { items: React.ReactNode[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto h-[400px] flex items-center justify-center perspective-1000">
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => {
                    // Calculate relative position
                    const offset = (index - currentIndex + items.length) % items.length;

                    // Only show 3 cards: current, next, and previous (which is last in loop)
                    if (offset !== 0 && offset !== 1 && offset !== items.length - 1) return null;

                    let x = 0;
                    let scale = 1;
                    let zIndex = 10;
                    let opacity = 1;
                    let rotateY = 0;

                    if (offset === 0) {
                        // Center
                        x = 0;
                        scale = 1;
                        zIndex = 20;
                        opacity = 1;
                        rotateY = 0;
                    } else if (offset === 1) {
                        // Right
                        x = 200;
                        scale = 0.8;
                        zIndex = 10;
                        opacity = 0.6;
                        rotateY = -15;
                    } else {
                        // Left (offset === items.length - 1)
                        x = -200;
                        scale = 0.8;
                        zIndex = 10;
                        opacity = 0.6;
                        rotateY = 15;
                    }

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                x,
                                scale,
                                zIndex,
                                opacity,
                                rotateY,
                            }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="absolute w-[300px] md:w-[400px] h-[300px] md:h-[350px]"
                        >
                            {item}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            <button
                onClick={prev}
                className="absolute left-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
            >
                <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
                onClick={next}
                className="absolute right-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
            >
                <ChevronRight className="w-6 h-6 text-white" />
            </button>
        </div>
    );
};
