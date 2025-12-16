import React from "react";
import { ArrowRight, Sparkles, Users, Star, Check, Leaf, Recycle, Heart, Quote, Palette, RefreshCw, Gift } from "lucide-react";
import { Button, Card, Badge, Highlight, TextHoverEffect, LayoutTextFlip, HoverBorderGradient } from "../components/ui";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

// Testimonials data - Updated to match About Us data/style
const TESTIMONIALS = [
  { text: "PagePalette has transformed how I organize my notes. The customizable cover is genius!", name: "Sid Basu", role: "Student" },
  { text: "I love being able to express my style with different PagePals. It makes studying more fun.", name: "Prada Pek", role: "Student" },
  { text: "Finally, a notebook that adapts to student needs. The modular design is brilliant.", name: "Julian Dizon", role: "Student" },
  { text: "It's like Crocs for your studies! I change my PagePals every week.", name: "Caelyn Wong", role: "Student" },
  { text: "Such a unique way to personalize school supplies. I've collected 5 PagePals already.", name: "Nicole Xu", role: "Student" },
  { text: "Creative, sustainable, and useful. PagePalette checks all the boxes.", name: "Emily Wang", role: "Student" },
];

const GALLERY_IMAGES = [
  "/ja-process/image1.jpg", "/ja-process/image2.jpg", "/ja-process/image3.jpg",
  "/ja-process/image4.jpg", "/ja-process/image5.jpg", "/ja-process/image6.jpg",
  "/ja-process/image7.jpg", "/ja-process/image8.jpg", "/ja-process/image9.jpg",
  "/ja-process/image10.jpg", "/ja-process/image11.jpg", "/ja-process/image12.jpg"
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 15 }
  },
};

const floatVariants = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// --- Holiday Components ---

// --- Holiday Components ---

const SnowEffect = () => {
  // Skip on mobile entirely for performance
  const [isMobile, setIsMobile] = React.useState(true);
  
  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  
  // Don't render on mobile at all
  if (isMobile) return null;
  
  // Reduced snowflakes for better performance (10 instead of 12)
  // Uses CSS animations with will-change for GPU acceleration
  const snowflakes = Array.from({ length: 10 }).map((_, i) => ({
    left: `${(i * 10) % 100}%`,
    animationDuration: `${4 + (i % 3)}s`,
    animationDelay: `${(i % 4) * 0.5}s`,
    opacity: 0.25 + (i % 3) * 0.15,
    size: 2 + (i % 3) * 2,
  }));

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden" 
      aria-hidden="true"
    >
      {snowflakes.map((flake, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full snow-flake"
          style={{
            left: flake.left,
            top: -10,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration} linear infinite`,
            animationDelay: flake.animationDelay,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) translateX(0); }
          100% { transform: translateY(110vh) translateX(15px); }
        }
        .snow-flake {
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .snow-flake { animation: none !important; display: none; }
        }
      `}</style>
    </div>
  );
};

// Christmas Tree Widget with localized snow effect and PagePalette ornament
// Hidden on mobile for performance
const ChristmasTreeWidget = () => {
  const [isMobile, setIsMobile] = React.useState(true);
  
  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  
  // Skip the fancy version on mobile
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
      {/* Localized snow effect around the tree */}
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
      
      {/* Tree with star ornament */}
      <div className="relative flex flex-col items-center">
        {/* PagePalette Star Ornament at top */}
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
        
        {/* Tree emoji */}
        <span className="text-5xl md:text-7xl drop-shadow-2xl filter brightness-110 block" role="img" aria-label="Christmas tree">🎄</span>
      </div>
      
      <style jsx global>{`
        @keyframes treeFall {
          0% { transform: translateY(0) translateX(0); opacity: 0.8; }
          100% { transform: translateY(100px) translateX(5px); opacity: 0; }
        }
        .tree-snow {
          animation: treeFall 2s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tree-snow { animation: none; opacity: 0; }
          .animate-pulse-slow { animation: none; }
        }
      `}</style>
    </div>
  </div>
);
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu when hash link is clicked
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
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden font-sans selection:bg-[#4ADE80] selection:text-[#0a0a0a]">
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#4ADE80] focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
      >
        Skip to main content
      </a>
      
      <SnowEffect />
      <ChristmasTreeWidget />

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-[#36484d]/10 rounded-full blur-3xl will-change-transform"
        />
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]) }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#764134]/10 rounded-full blur-3xl will-change-transform"
        />
        {/* Noise texture removed for performance - was loading external SVG */}
      </div>

      {/* Header - Glassy with entrance animation */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="fixed top-0 left-0 right-0 h-14 md:h-16 z-50 bg-[#0a0a0a]/60 backdrop-blur-xl border-b border-[#1f1f1f]"
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 group">
              <img src="/logo-full.png" alt="PagePalette" width="160" height="40" className="h-8 md:h-10 w-auto object-contain brightness-0 invert" />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "About Us", "Features", "Pricing", "Pre-Order"].map((item, i) => {
              const href = item === "Home" ? "/" : item === "Pre-Order" ? "/order" : item === "About Us" ? "/about" : `/#${item.toLowerCase()}`;
              const isHashLink = href.startsWith('/#');
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

          {/* Mobile: Quick links + Menu button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Quick access to Features & Pricing on mobile */}
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
            <a href="/order">Pre-Order</a>
          </Button>

          {/* Mobile CTA button */}
          <Button asChild variant="primary" size="sm" className="sm:hidden" rightIcon={<ArrowRight size={12} />}>
            <a href="/order">Order</a>
          </Button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="main-content" className="relative pt-20 md:pt-32 pb-12 md:pb-24 px-4 md:px-6 z-10 min-h-[85vh] md:min-h-[90vh] flex items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex">
            <Badge variant="outline" size="lg" className="mb-8 border-[#252525] bg-[#151515]/50 text-[#888888] backdrop-blur-md">
              <Leaf size={14} className="text-[#4ADE80]" />
              <span className="font-montserrat">Sustainable. Modular. Yours.</span>
            </Badge>
          </motion.div>

          {/* Main Heading with Staggered Words */}
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

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-xl text-[#888888] mb-6 md:mb-10 max-w-2xl mx-auto font-montserrat leading-relaxed px-2"
          >
            The notebook that grows with you. Attach, swap, and collect
            custom PagePals — just like Jibbitz for your Crocs, but for your studies.
            Made from recycled materials for a greener tomorrow.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <HoverBorderGradient
                as="a"
                href="/order"
                containerClassName="rounded-xl"
                className="px-8 py-3 text-center font-bold font-montserrat bg-[#151515] text-white flex items-center gap-2"
                duration={0.8}
                intensity="strong"
              >
                Pre-Order Now <ArrowRight size={20} />
              </HoverBorderGradient>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
            </motion.div>
          </motion.div>
          {/* ... (Rest remains same) */}

          {/* Stats - with count up illusion */}
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
                <motion.p
                  whileHover={{ scale: 1.2, color: "#4ADE80" }}
                  className="text-2xl md:text-3xl font-bold text-white font-proxima-sera transition-colors"
                >
                  {stat.val}
                </motion.p>
                <p className="text-xs md:text-sm text-[#888888] font-montserrat mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Hero Product - Floating Effect */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, type: "spring" }}
        className="max-w-4xl mx-auto mb-24 px-6 relative z-10"
      >
        <div className="bg-[#0f1115]/80 backdrop-blur-md rounded-2xl border border-[#1f1f1f] overflow-hidden shadow-2xl relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#36484d]/10 to-[#764134]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="w-full bg-gradient-to-br from-[#151515] to-[#0f1115] flex items-center justify-center relative p-8 md:p-12">

            {/* Floating Orbs */}
            <motion.div variants={floatVariants} animate="animate" className="absolute top-8 left-8 w-20 h-20 bg-[#36484d]/20 rounded-full blur-xl" />
            <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: "1s" }} className="absolute bottom-12 right-12 w-32 h-32 bg-[#764134]/20 rounded-full blur-xl" />

            <div className="flex flex-col md:flex-row items-center gap-12 z-10">
              {/* Product Visual */}
              <div className="flex-1 flex justify-center order-2 md:order-1">
                <motion.div
                  variants={floatVariants}
                  animate="animate"
                  className="relative perspective-1000"
                >
                  {/* Main Notebook Representation */}
                  <motion.div
                    whileHover={{ rotateY: 10, rotateX: 5 }}
                    className="w-56 h-72 bg-gradient-to-br from-[#2a3a40] to-[#1a2a30] rounded-lg shadow-2xl relative overflow-hidden border border-[#36484d]/30 transition-transform duration-500"
                  >
                    {/* Notebook holes */}
                    <div className="absolute left-3 top-4 bottom-4 flex flex-col justify-around">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-[#0a0a0a] shadow-inner" />
                      ))}
                    </div>
                    {/* PagePal slots representation */}
                    <div className="absolute right-5 top-8 grid grid-cols-2 gap-3">
                      {["#4ADE80", "#60A5FA", "#F59E0B", "#A78BFA", "#F472B6", "#22D3EE"].map((color, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 + (i * 0.1), type: "spring" }}
                          whileHover={{ scale: 1.2, rotate: 180 }}
                          className="w-8 h-8 rounded-lg shadow-lg cursor-pointer"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {/* Logo/Branding on cover */}
                    <div className="absolute bottom-4 right-4 opacity-50">
                      <Leaf className="text-white w-8 h-8" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Product Description */}
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
      </motion.div>

      {/* Marquee Section */}
      <section className="mb-24 relative overflow-hidden">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white font-proxima-sera mb-2">See It In Action</h2>
          <p className="text-[#666666] font-montserrat">From our workshop to your desk</p>
        </div>

        <div className="relative py-8 bg-[#0f1115] border-y border-[#1f1f1f]">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0f1115] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0f1115] to-transparent z-10" />

          {/* CSS Marquee - optimized for performance */}
          <div className="animate-marquee gap-6 px-6">
            {/* Only show 6 images on mobile for faster loading */}
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
                  width="384"
                  height="256"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Staggered Reveal */}
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
              { icon: Leaf, title: "Eco-Friendly", desc: "Made from 100% recycled materials. Every PagePalette notebook helps reduce waste and promotes sustainability.", color: "from-[#4ADE80] to-[#22C55E]", shadow: "#22C55E" },
              { icon: Palette, title: "Fully Customizable", desc: "Attach your favorite PagePals like Jibbitz on Crocs. Swap them anytime to match your mood, subject, or season.", color: "from-[#764134] to-[#8d5244]", shadow: "#764134" },
              { icon: Gift, title: "Collect & Trade", desc: "Build your collection, trade with friends, and express your unique style. New designs released regularly!", color: "from-[#36484d] to-[#4a5c62]", shadow: "#36484d" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="bg-[#0f1115] rounded-2xl border border-[#1f1f1f] p-8 hover:border-[#36484d]/50 transition-colors group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[${feature.shadow}]/20`}>
                  <feature.icon size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-proxima-sera">
                  {feature.title}
                </h3>
                <p className="text-[#888888] font-montserrat leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
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
          
          {/* Social Proof - Simple avatars */}
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
            {/* Simplified pricing cards */}
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
                title: "Extra PagePals", 
                price: "3", 
                items: ["20+ designs available", "Mix and match", "Collect them all!"], 
                link: "/order", 
                highlight: false,
                cta: "Browse Designs"
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`rounded-2xl border p-5 md:p-6 text-left relative overflow-visible flex flex-col ${plan.highlight
                  ? "bg-gradient-to-br from-[#36484d] to-[#2a3a40] border-[#4ADE80]/50 md:scale-105 z-10 shadow-2xl shadow-[#4ADE80]/10"
                  : "bg-[#0f1115] border-[#1f1f1f] hover:border-[#36484d]/50"
                  }`}
              >
                <h3 className={`text-2xl font-bold mb-2 font-proxima-sera ${plan.highlight ? "text-[#E4DFDA]" : "text-white"}`}>{plan.title}</h3>
                <div className="mb-4">
                  <span className={`text-5xl font-bold font-proxima-sera ${plan.highlight ? "text-[#4ADE80]" : "text-white"}`}>${plan.price}</span>
                  <span className={`ml-2 font-montserrat ${plan.highlight ? "text-[#E4DFDA]/80" : "text-[#888888]"}`}>SGD</span>
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
          
          {/* Minimal trust indicator */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 flex items-center justify-center gap-2 text-sm text-[#666] font-montserrat"
          >
            <Leaf size={16} className="text-[#4ADE80]" />
            <span>Eco-Friendly Materials</span>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative"
        >
          <div className="bg-gradient-to-br from-[#0f1115] to-[#151515] rounded-3xl border border-[#1f1f1f] py-16 px-8 relative overflow-hidden group">
            {/* Background glow attached to mouse could be cool, but keeping it simple for now */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-gradient-to-b from-[#36484d]/20 to-transparent blur-3xl group-hover:bg-[#36484d]/30 transition-colors" />

            <div className="flex flex-col items-center justify-center gap-2 mb-6 relative z-10">
              <LayoutTextFlip
                text="Ready for Your "
                words={["PagePalette?", "Perfect Notebook?", "Creative Space?", "Study Upgrade?"]}
                duration={3000}
              />
            </div>
            <p className="text-xl text-[#888888] mb-10 font-montserrat max-w-xl mx-auto relative z-10">
              Pre-order now and be among the first to get your customizable notebook.
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
                Pre-Order Now <ArrowRight size={20} />
              </HoverBorderGradient>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 md:py-16 px-6 border-t border-[#1f1f1f] z-10 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto text-center">
          {/* TextHoverEffect for PagePalette */}
          <div className="h-16 sm:h-20 md:h-28 lg:h-32 flex items-center justify-center mb-4">
            <TextHoverEffect text="PagePalette" />
          </div>
          <p className="text-sm text-[#888888] font-montserrat mb-2">
            Sustainable. Modular. Yours.
          </p>
          <p className="text-xs text-[#666666] font-montserrat">
            A Junior Achievement Singapore Company: PagePalette • © 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
