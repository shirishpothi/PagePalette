"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const BackgroundClipGrid = () => {
    const [columns, setColumns] = useState(12);

    useEffect(() => {
        // Adjust columns based on window width if needed
        const handleResize = () => {
            if (window.innerWidth < 768) setColumns(6);
            else setColumns(12);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="absolute inset-0 z-0 flex pointer-events-none">
            {Array.from({ length: columns }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ clipPath: "inset(0 0 100% 0)" }}
                    animate={{ clipPath: "inset(0 0 0% 0)" }}
                    transition={{
                        duration: 1,
                        delay: i * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex-1 h-full bg-neutral-950/50 border-r border-white/5 last:border-r-0"
                />
            ))}
        </div>
    );
};
