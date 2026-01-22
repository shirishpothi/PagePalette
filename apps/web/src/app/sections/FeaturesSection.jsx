"use client";

import React from "react";
import { Leaf, Palette, Gift, Check } from "lucide-react";
import { Badge } from "../../components/ui";
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

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 px-6 scroll-mt-24">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
          <Badge variant="primary" size="lg" className="mb-4 bg-[#36484d]/20 text-[#E4DFDA] border-[#36484d]/30">
            Why PagePalette
          </Badge>
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-white mb-4 font-proxima-sera">
            Why Students Love Us
          </motion.h2>
          <motion.p variants={itemVariants} className="text-lg text-[#888888] font-montserrat max-w-xl mx-auto">
            Designed by Nexus students, for students everywhere
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Leaf, title: "Eco-Friendly", desc: "Made from 100% recycled materials. Every PagePalette notebook helps reduce waste and promotes sustainability.", color: "from-[#4ADE80] to-[#22C55E]", shadow: "#22C55E", image: "/ja-process/image7.jpg" },
            { icon: Palette, title: "Fully Customizable", desc: "Attach your favorite PagePals like Jibbitz on Crocs. Swap them anytime to match your mood, subject, or season.", color: "from-[#764134] to-[#8d5244]", shadow: "#764134", image: "/ja-process/image10.jpg" },
            { icon: Gift, title: "Collect & Trade", desc: "Build your collection, trade with friends, and express your unique style. New designs released regularly!", color: "from-[#36484d] to-[#4a5c62]", shadow: "#36484d", image: "/ja-process/image11.jpg" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-[#0f1115] rounded-2xl border border-[#1f1f1f] overflow-hidden hover:border-[#36484d]/50 transition-all duration-300 group hover:-translate-y-2"
            >
              <div className="w-full h-40 overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 -mt-12 relative z-10 shadow-lg shadow-[${feature.shadow}]/20 border-4 border-[#0f1115]`}>
                  <feature.icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-proxima-sera">
                  {feature.title}
                </h3>
                <p className="text-[#888888] font-montserrat leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
