"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextReveal = ({
    text,
    className,
    delay = 0,
}: {
    text: string;
    className?: string;
    delay?: number;
}) => {
    const letters = text.split("");

    const container = {
        hidden: { opacity: 1 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: delay },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            } as any,
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            } as any,
        },
    };

    return (
        <motion.h1
            variants={container}
            initial="hidden"
            animate="visible"
            className={cn(className)}
        >
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index} className="inline-block">
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.h1>
    );
};
