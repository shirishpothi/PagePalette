"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  gradientColor = "#4ADE80",
  intensity = "normal", // "normal" | "strong"
  ...props
}) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState("TOP");

  const rotateDirection = (currentDirection) => {
    const directions = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  // Convert hex to rgba for gradient
  const hexToRgba = (hex, alpha = 0) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Dynamic gradient maps based on color and intensity
  const gradientSize = intensity === "strong" ? { w: "30%", h: "60%" } : { w: "20.7%", h: "50%" };
  
  const movingMap = useMemo(() => ({
    TOP: `radial-gradient(${gradientSize.w} ${gradientSize.h} at 50% 0%, ${gradientColor} 0%, ${hexToRgba(gradientColor, 0)} 100%)`,
    LEFT: `radial-gradient(${gradientSize.h} ${gradientSize.w} at 0% 50%, ${gradientColor} 0%, ${hexToRgba(gradientColor, 0)} 100%)`,
    BOTTOM: `radial-gradient(${gradientSize.w} ${gradientSize.h} at 50% 100%, ${gradientColor} 0%, ${hexToRgba(gradientColor, 0)} 100%)`,
    RIGHT: `radial-gradient(${gradientSize.h} ${gradientSize.w} at 100% 50%, ${gradientColor} 0%, ${hexToRgba(gradientColor, 0)} 100%)`,
  }), [gradientColor, intensity]);

  // Highlight on hover - stronger for "strong" intensity
  const highlightSize = intensity === "strong" ? "100% 250%" : "75% 181.16%";
  const highlight = `radial-gradient(${highlightSize} at 50% 50%, ${gradientColor} 0%, ${hexToRgba(gradientColor, 0)} 100%)`;

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full border border-transparent content-center bg-[#1a1a1a]/50 hover:bg-[#1a1a1a]/80 transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto text-white z-10 bg-[#0f1115] px-4 py-2 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: intensity === "strong" ? "blur(3px)" : "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-[#0f1115] absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}
