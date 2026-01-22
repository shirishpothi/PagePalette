"use client";

import React from "react";

const GALLERY_IMAGES = [
  "/ja-process/image1.jpg", "/ja-process/image2.jpg", "/ja-process/image3.jpg",
  "/ja-process/image4.jpg", "/ja-process/image5.jpg", "/ja-process/image6.jpg",
  "/ja-process/image7.jpg", "/ja-process/image8.jpg", "/ja-process/image9.jpg",
  "/ja-process/image10.jpg", "/ja-process/image11.jpg", "/ja-process/image12.jpg"
];

export default function GallerySection() {
  return (
    <section className="mb-24 relative overflow-hidden">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white font-proxima-sera mb-2">See It In Action</h2>
        <p className="text-[#666666] font-montserrat">From our workshop to your desk</p>
      </div>

      <div className="relative py-8 bg-[#0f1115] border-y border-[#1f1f1f]">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0f1115] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0f1115] to-transparent z-10" />

        <div className="animate-marquee gap-6 px-6">
          {[...GALLERY_IMAGES.slice(0, 6), ...GALLERY_IMAGES.slice(0, 6)].map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 h-48 md:w-96 md:h-64 rounded-xl overflow-hidden border border-[#252525] relative"
            >
              <img
                src={src}
                alt={`JA Process ${(i % 6) + 1}`}
                loading="lazy"
                decoding="async"
                fetchPriority={i < 3 ? "high" : "low"}
                width="384"
                height="256"
                className="w-full h-full object-cover"
                style={{ contentVisibility: 'auto' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
