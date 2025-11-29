"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
    children: React.ReactNode;
    className?: string;
    animation?: "fade" | "slide" | "blur";
    delay?: number;
    duration?: number;
};

export const ScrollReveal = ({
    children,
    className,
    animation = "fade",
    delay = 0,
    duration = 0.5,
}: ScrollRevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.2 });

    const variants = {
        hidden: {
            opacity: 0,
            y: animation === "slide" ? 50 : 0,
            filter: animation === "blur" ? "blur(10px)" : "blur(0px)",
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: duration,
                delay: delay,
                ease: "easeOut",
            } as any,
        },
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={cn(className)}
        >
            {children}
        </motion.div>
    );
};
