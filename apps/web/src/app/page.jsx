"use client";

import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Leaf, Recycle, Heart } from "lucide-react";
import { Button, Badge, Highlight, HoverBorderGradient } from "../components/ui";
import { motion } from "motion/react";

const GallerySection = lazy(() => import("./sections/GallerySection"));
const FeaturesSection = lazy(() => import("./sections/FeaturesSection"));
const PricingSection = lazy(() => import("./sections/PricingSection"));
const CTASection = lazy(() => import("./sections/CTASection"));
const Footer = lazy(() => import("./sections/Footer"));
const ChristmasTreeWidget = lazy(() => import("./sections/ChristmasTreeWidget"));

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

function DeferredSection({ children, rootMargin = "200px" }) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (isVisible) return;
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={sectionRef} style={{ minHeight: isVisible ? undefined : "100px" }}>
      {isVisible ? children : null}
    </div>
  );
}



export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (e, href) => {
    const isHashLink = href.startsWith('/#');
    if (isHashLink) {
      e.preventDefault();
      const targetId = href.replace('/#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#2d3f44] overflow-hidden font-sans selection:bg-[#4ADE80] selection:text-[#0a0a0a]">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#4ADE80] focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>
      
      <Suspense fallback={null}>
        <ChristmasTreeWidget />
      </Suspense>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#36484d]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#764134]/10 rounded-full blur-3xl" />
      </div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 right-0 h-14 md:h-16 z-50 bg-[#1a2a2e]/80 backdrop-blur-xl border-b border-[#1f1f1f]"
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 group">
              <picture>
                <source type="image/png" srcSet="/logo-full-256.png 256w, /logo-full-320.png 320w" sizes="160px" />
                <img
                  src="/logo-full-256.png"
                  alt="PagePalette"
                  width="160"
                  height="40"
                  fetchPriority="high"
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </picture>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Home", "About Us", "Features", "Pricing", "Order"].map((item, i) => {
              const href = item === "Home" ? "/" : item === "Order" ? "/order" : item === "About Us" ? "/about" : `/#${item.toLowerCase()}`;
              return (
                <a
                  key={item}
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className="text-sm text-[#888888] hover:text-white transition-colors font-montserrat relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4ADE80] transition-all duration-300 group-hover:w-full" />
                </a>
              );
            })}
          </nav>

          <div className="flex md:hidden items-center gap-2">
            <a
              href="/#features"
              onClick={(e) => handleNavClick(e, '/#features')}
              className="text-xs text-[#888888] hover:text-white px-2 py-1 transition-colors"
            >
              Features
            </a>
            <a
              href="/#pricing"
              onClick={(e) => handleNavClick(e, '/#pricing')}
              className="text-xs text-[#888888] hover:text-white px-2 py-1 transition-colors"
            >
              Pricing
            </a>
          </div>

          <Button asChild variant="primary" size="sm" className="hidden sm:flex" rightIcon={<ArrowRight size={14} />}>
            <a href="/order">Order Now</a>
          </Button>

          <Button asChild variant="primary" size="sm" className="sm:hidden" rightIcon={<ArrowRight size={12} />}>
            <a href="/order">Order</a>
          </Button>
        </div>
      </motion.header>

      <section id="main-content" className="relative pt-20 md:pt-32 pb-12 md:pb-24 px-4 md:px-6 z-10 min-h-[85vh] md:min-h-[90vh] flex items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex">
            <Badge variant="outline" size="lg" className="mb-8 border-[#252525] bg-[#151515]/50 text-[#888888] backdrop-blur-md">
              <Leaf size={14} className="text-[#4ADE80]" />
              <span className="font-montserrat">Sustainable. Modular. Yours.</span>
            </Badge>
          </motion.div>

          <div className="mb-4 md:mb-6 overflow-visible py-2">
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white font-proxima-sera leading-tight"
            >
              Express Yourself
            </motion.h1>
            <motion.span
              variants={itemVariants}
              className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white font-proxima-sera leading-tight py-2 md:py-4"
            >
              <Highlight className="text-white">
                One PagePal at a Time
              </Highlight>
            </motion.span>
          </div>

          <motion.p
            variants={itemVariants}
            className="text-base md:text-xl text-[#888888] mb-6 md:mb-10 max-w-2xl mx-auto font-montserrat leading-relaxed px-2"
          >
            The notebook that grows with you. Attach, swap, and collect
            custom PagePals — just like Jibbitz for your Crocs, but for your studies.
            Made from recycled materials for a greener tomorrow.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
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
            </div>

            <div className="transition-transform duration-200 hover:scale-105 active:scale-95">
              <HoverBorderGradient
                as="a"
                href="/#features"
                containerClassName="rounded-xl"
                className="px-8 py-3 text-center font-bold font-montserrat bg-[#151515] text-white"
                duration={1.2}
                gradientColor="#36484d"
              >
                See Features
              </HoverBorderGradient>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-8 md:mt-16"
          >
            {[
              { val: "20+", label: "PagePal Designs" },
              { val: "100%", label: "Recycled Materials" },
              { val: "∞", label: "Combinations" }
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <p className="text-2xl md:text-3xl font-bold text-white font-proxima-sera transition-all duration-200 group-hover:scale-110 group-hover:text-[#4ADE80]">
                  {stat.val}
                </p>
                <p className="text-xs md:text-sm text-[#888888] font-montserrat mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto mb-24 px-6 relative z-10">
        <div className="bg-[#0f1115]/80 backdrop-blur-md rounded-2xl border border-[#1f1f1f] overflow-hidden shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#36484d]/10 to-[#764134]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="w-full bg-gradient-to-br from-[#151515] to-[#0f1115] flex items-center justify-center relative p-8 md:p-12">
            <div className="absolute top-8 left-8 w-20 h-20 bg-[#36484d]/20 rounded-full blur-xl" />
            <div className="absolute bottom-12 right-12 w-32 h-32 bg-[#764134]/20 rounded-full blur-xl" />

            <div className="flex flex-col md:flex-row items-center gap-12 z-10">
              <div className="flex-1 flex justify-center order-2 md:order-1">
                <div className="relative">
                  <picture>
                    <source
                      type="image/webp"
                      srcSet="/marketing-image-384.webp 384w, /marketing-image-768.webp 768w"
                      sizes="(max-width: 768px) 320px, 384px"
                    />
                    <source
                      type="image/jpeg"
                      srcSet="/marketing-image-384.jpg 384w, /marketing-image-768.jpg 768w"
                      sizes="(max-width: 768px) 320px, 384px"
                    />
                    <img
                      src="/marketing-image-384.jpg"
                      alt="PagePalette Notebooks"
                      className="w-80 md:w-96 h-auto rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300"
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      width="384"
                      height="512"
                    />
                  </picture>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left order-1 md:order-2">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 font-proxima-sera leading-tight">
                  Your Notebook,<br />Your Rules
                </h2>
                <p className="text-[#888888] font-montserrat mb-8 text-lg">
                  Each PagePalette notebook features a revolutionary customizable cover.
                  Swap "PagePals" instantly to match your mood, subject, or style.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge variant="primary" size="lg" className="bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30 animate-pulse-slow">
                    <Recycle size={14} /> Eco-Friendly
                  </Badge>
                  <Badge variant="accent" size="lg" className="bg-[#764134]/20 text-[#E4DFDA] border-[#764134]/30">
                    <Sparkles size={14} /> Customizable
                  </Badge>
                  <Badge variant="outline" size="lg" className="border-[#252525] text-[#888888]">
                    <Heart size={14} /> Student Made
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeferredSection>
        <Suspense fallback={null}>
          <GallerySection />
        </Suspense>
      </DeferredSection>

      <DeferredSection>
        <Suspense fallback={null}>
          <FeaturesSection />
        </Suspense>
      </DeferredSection>

      <DeferredSection>
        <Suspense fallback={null}>
          <PricingSection />
        </Suspense>
      </DeferredSection>

      <DeferredSection>
        <Suspense fallback={null}>
          <CTASection />
        </Suspense>
      </DeferredSection>

      <DeferredSection>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </DeferredSection>
    </div>
  );
}
