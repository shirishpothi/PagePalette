"use client";

import React from "react";

export default function ChristmasTreeWidget() {
  const [isMobile, setIsMobile] = React.useState(true);
  
  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none select-none" aria-hidden="true">
        <span className="text-4xl drop-shadow-lg" role="img" aria-label="Christmas tree">🎄</span>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none select-none" aria-hidden="true">
      <div className="relative w-32 h-40">
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full tree-snow"
              style={{
                left: `${10 + (i * 5) % 80}%`,
                top: -4,
                width: 2 + (i % 2),
                height: 2 + (i % 2),
                opacity: 0.6 + (i % 3) * 0.15,
                animationDelay: `${(i * 0.3) % 2}s`,
                animationDuration: `${1.5 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative flex flex-col items-center">
          <div className="relative z-10 -mb-3 md:-mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center animate-pulse-slow">
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-lg" fill="none">
                <path 
                  d="M12 2L14.09 8.26L20.18 8.27L15.54 12.14L17.63 18.41L12 14.77L6.37 18.41L8.46 12.14L3.82 8.27L9.91 8.26L12 2Z" 
                  fill="url(#starGradient)"
                  stroke="#fff"
                  strokeWidth="0.5"
                />
                <defs>
                  <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ADE80" />
                    <stop offset="50%" stopColor="#36484d" />
                    <stop offset="100%" stopColor="#764134" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <span className="text-5xl md:text-7xl drop-shadow-2xl filter brightness-110 block" role="img" aria-label="Christmas tree">🎄</span>
        </div>
      </div>
    </div>
  );
}
