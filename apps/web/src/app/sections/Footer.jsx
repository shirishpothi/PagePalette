"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="relative py-12 md:py-16 px-6 border-t border-[#1f1f1f] z-10 bg-[#1a2a2e]">
      <div className="max-w-6xl mx-auto text-center">
        <a href="/" className="inline-block mb-4 group">
          <div className="relative">
            <picture>
              <source
                type="image/webp"
                srcSet="/logo-full-256.webp 256w, /logo-full-320.webp 320w"
                sizes="(max-width: 768px) 192px, 256px"
              />
              <source
                type="image/jpeg"
                srcSet="/logo-full-256.jpg 256w, /logo-full-320.jpg 320w"
                sizes="(max-width: 768px) 192px, 256px"
              />
              <img
                src="/logo-full-256.jpg"
                alt="PagePalette"
                className="h-12 sm:h-16 md:h-20 w-auto mx-auto object-contain transition-all duration-300 group-hover:scale-105"
                width="256"
                height="64"
                loading="lazy"
                decoding="async"
              />
            </picture>
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
