"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="relative py-12 md:py-16 px-6 border-t border-[#1f1f1f] z-10 bg-[#1a2a2e]">
      <div className="max-w-6xl mx-auto text-center">
        <a href="/" className="inline-block mb-4 group">
          <div className="relative">
            <img 
              src="/logo-full.png" 
              alt="PagePalette" 
              className="h-12 sm:h-16 md:h-20 w-auto mx-auto object-contain brightness-0 invert transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#4ADE80]/0 group-hover:bg-[#4ADE80]/10 rounded-lg blur-xl transition-all duration-300 -z-10" />
          </div>
        </a>
        <p className="text-xs text-[#666666] font-montserrat">
          A Junior Achievement Singapore Company: PagePalette • © 2025
        </p>
      </div>
    </footer>
  );
}
