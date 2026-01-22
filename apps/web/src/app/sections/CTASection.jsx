"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { LayoutTextFlip, HoverBorderGradient } from "../../components/ui";
import { motion } from "motion/react";

export default function CTASection() {
  return (
    <section className="relative py-24 px-6 z-10">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-4xl mx-auto text-center relative"
      >
        <div className="bg-gradient-to-br from-[#0f1115] to-[#151515] rounded-3xl border border-[#1f1f1f] py-16 px-8 relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-[#36484d]/20 to-transparent blur-3xl group-hover:bg-[#36484d]/30 transition-colors" />

          <div className="flex flex-col items-center justify-center gap-2 mb-6 relative z-10">
            <LayoutTextFlip
              text="Ready for Your "
              words={["PagePalette?", "Perfect Notebook?", "Creative Space?", "Study Upgrade?"]}
              duration={3000}
            />
          </div>
          <p className="text-xl text-[#888888] mb-10 font-montserrat max-w-xl mx-auto relative z-10">
            Order now and get your customizable notebook.
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
          >
            <HoverBorderGradient
              as="a"
              href="/order"
              containerClassName="rounded-xl"
              className="px-8 py-3 text-center font-bold font-montserrat bg-[#151515] text-white flex items-center gap-2"
              duration={0.8}
              intensity="strong"
            >
              Order Now <ArrowRight size={20} />
            </HoverBorderGradient>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
