"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";

export const TextHoverEffect = ({
  text,
  duration,
}) => {
  const svgRef = useRef(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (isMobile) return; // Skip cursor tracking on mobile
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor, isMobile]);

  // Simplified mobile version - just styled text
  if (isMobile) {
    return (
      <div className="select-none text-center">
        <span className="font-proxima-sera text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#4ADE80] via-[#555555] to-[#4ADE80] bg-clip-text text-transparent">
          {text}
        </span>
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 500 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none cursor-pointer"
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="25%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#4ADE80" />
              <stop offset="75%" stopColor="#36484d" />
              <stop offset="100%" stopColor="#4ADE80" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="40%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#revealMask)"
          />
        </mask>
      </defs>
      {/* Base visible text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.5"
        className="fill-transparent stroke-[#555555] font-proxima-sera text-7xl font-bold"
      >
        {text}
      </text>
      {/* Hover glow */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.8"
        className="fill-transparent stroke-[#4ADE80] font-proxima-sera text-7xl font-bold"
        style={{ opacity: hovered ? 0.3 : 0, transition: 'opacity 0.3s ease' }}
      >
        {text}
      </text>
      {/* Gradient reveal on hover */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="0.6"
        mask="url(#textMask)"
        className="fill-transparent font-proxima-sera text-7xl font-bold"
      >
        {text}
      </text>
    </svg>
  );
};
