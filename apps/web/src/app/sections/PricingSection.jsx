"use client";

import React from "react";
import { Check, Leaf } from "lucide-react";
import { HoverBorderGradient } from "../../components/ui";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0.7, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 20, duration: 0.3 }
  },
};

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 px-6 z-10 scroll-mt-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="max-w-5xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-proxima-sera">
          Choose Your Bundle
        </h2>
        <p className="text-lg text-[#888888] mb-3 font-montserrat">
          Select standard or customization package
        </p>
        
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4ADE80] to-[#36484d] border-2 border-[#0a0a0a] flex items-center justify-center text-xs">🎒</div>
              ))}
            </div>
            <div className="text-sm text-[#9aa6a0] font-montserrat">50 sold so far</div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { 
              title: "Starter", 
              price: "16", 
              items: ["Palette notebook", "Detachable cover board", "1 FREE Tree PagePal 🌲"], 
              link: "/order?bundle=starter", 
              highlight: false,
              cta: "Get Started"
            },
            { 
              title: "Complete Bundle", 
              price: "21", 
              items: ["Palette notebook", "Detachable cover board", "1 FREE Tree PagePal 🌲", "3 additional PagePals of your choice", "✨ Save $9 vs buying separately!"], 
              link: "/order?bundle=complete", 
              highlight: true,
              cta: "Get Complete Bundle"
            },
            { 
              title: "View PagePals", 
              price: "3", 
              priceLabel: "each",
              items: ["20+ designs available", "Mix and match", "Collect them all!"], 
              link: "/order?browse=true", 
              highlight: false,
              cta: "Browse Collection"
            }
          ].map((plan, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className={`rounded-2xl border p-5 md:p-6 text-left relative overflow-visible flex flex-col transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${plan.highlight
                ? "bg-gradient-to-br from-[#36484d] to-[#2a3a40] border-[#4ADE80]/50 md:scale-105 z-10 shadow-2xl shadow-[#4ADE80]/10"
                : "bg-[#0f1115] border-[#1f1f1f] hover:border-[#36484d]/50"
                }`}
            >
              <h3 className={`text-2xl font-bold mb-2 font-proxima-sera ${plan.highlight ? "text-[#E4DFDA]" : "text-white"}`}>{plan.title}</h3>
              <div className="mb-4">
                <span className={`text-5xl font-bold font-proxima-sera ${plan.highlight ? "text-[#4ADE80]" : "text-white"}`}>${plan.price}</span>
                <span className={`ml-2 font-montserrat ${plan.highlight ? "text-[#E4DFDA]/80" : "text-[#888888]"}`}>{plan.priceLabel || "SGD"}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {plan.items.map((item, idx) => (
                  <li key={idx} className={`flex items-start gap-3 font-montserrat text-sm ${plan.highlight ? "text-[#E4DFDA]" : "text-[#AAAAAA]"} ${item.includes('Save') ? 'font-bold text-[#4ADE80]' : ''}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlight ? "bg-[#4ADE80]/20" : "bg-[#4ADE80]/20"}`}>
                      <Check size={12} className="text-[#4ADE80]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <HoverBorderGradient
                as="a"
                href={plan.link}
                containerClassName="w-full rounded-xl"
                className="w-full py-3 text-center font-bold font-montserrat bg-[#151515] text-white"
                duration={plan.highlight ? 0.6 : 1}
                intensity={plan.highlight ? "strong" : "normal"}
              >
                {plan.cta}
              </HoverBorderGradient>
            </motion.div>
          ))}
        </div>

        <motion.div 
          variants={itemVariants}
          className="mt-12 flex items-center justify-center gap-2 text-sm text-[#666] font-montserrat"
        >
          <Leaf size={16} className="text-[#4ADE80]" />
          <span>Eco-Friendly Materials</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
