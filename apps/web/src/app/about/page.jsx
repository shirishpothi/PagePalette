import { ArrowRight, Leaf, Users, Star, Quote, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button, Badge } from "../../components/ui";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1, 
        transition: { staggerChildren: 0.12, delayChildren: 0.1 } 
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { type: "spring", stiffness: 80, damping: 12 } 
    }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
};

const STUDENT_NAMES = [
    "Sid Basu", "Prada Pek", "Julian Dizon", "Caelyn Wong", "Nicole Xu",
    "Emily Wang", "Sakurako Fukui", "Mohan Parameshwar", "Shirish Pothi",
    "Benjamin Faber", "Lakshy Lavany"
];

const TEACHER_NAMES = [
    "Duncan Shiel", "Stephanie Hughes", "Heather Millington", "Karianne Di Salvo"
];

const TESTIMONIALS = [
    { text: "PagePalette has transformed how I organize my notes. The customizable cover is genius!", name: "Sid Basu", role: "Student" },
    { text: "I love being able to express my style with different PagePals. It makes studying more fun.", name: "Prada Pek", role: "Student" },
    { text: "A fantastic initiative by our students. Practical, creative, and eco-friendly.", name: "Duncan Shiel", role: "Teacher" },
    { text: "Finally, a notebook that adapts to student needs. The modular design is brilliant.", name: "Julian Dizon", role: "Student" },
    { text: "The environmental focus aligns perfectly with our school's values. Highly recommended!", name: "Stephanie Hughes", role: "Teacher" },
    { text: "It's like Crocs for your studies! I change my PagePals every week.", name: "Caelyn Wong", role: "Student" },
    { text: "Such a unique way to personalize school supplies. I've collected 5 PagePals already.", name: "Nicole Xu", role: "Student" },
    { text: "The quality is amazing and it feels great to support a student-run business.", name: "Heather Millington", role: "Teacher" },
    { text: "Creative, sustainable, and useful. PagePalette checks all the boxes.", name: "Emily Wang", role: "Student" },
    { text: "I bought one for organization and stayed for the customization. Love it!", name: "Sakurako Fukui", role: "Student" },
    { text: "Supporting young entrepreneurs who care about the planet is a no-brainer.", name: "Karianne Di Salvo", role: "Teacher" },
    { text: "The best notebook I've ever owned. Simple, effective, and stylish.", name: "Mohan Parameshwar", role: "Student" },
    { text: "Proud to be part of the team bringing this vision to life.", name: "Shirish Pothi", role: "Team Member" },
    { text: "Revolutionizing how we think about everyday school items.", name: "Benjamin Faber", role: "Student" },
    { text: "A perfect blend of functionality and personal expression.", name: "Lakshy Lavany", role: "Student" },
];

const GALLERY_IMAGES = [
    "/ja-process/image1.jpg", "/ja-process/image2.jpg", "/ja-process/image3.jpg",
    "/ja-process/image4.jpg", "/ja-process/image5.jpg", "/ja-process/image6.jpg",
    "/ja-process/image7.jpg", "/ja-process/image8.jpg", "/ja-process/image9.jpg",
    "/ja-process/image10.jpg", "/ja-process/image11.jpg", "/ja-process/image12.jpg"
];

export default function AboutPage() {
    const navigate = useNavigate();

    const handleNavClick = (e, item) => {
        if (item === "Features" || item === "Pricing") {
            e.preventDefault();
            navigate("/");
            setTimeout(() => {
                const element = document.getElementById(item.toLowerCase());
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#36484d]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#764134]/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#0a0a0a]/60 backdrop-blur-xl border-b border-[#1f1f1f]">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <a href="/" className="flex items-center gap-3">
                            <img src="/logo-full.png" alt="PagePalette" className="h-10 w-auto object-contain brightness-0 invert" />
                        </a>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {["Home", "About Us", "Features", "Pricing", "Pre-Order"].map((item) => (
                            <a
                                key={item}
                                href={item === "Home" ? "/" : item === "Pre-Order" ? "/order" : item === "About Us" ? "/about" : `/#${item.toLowerCase()}`}
                                onClick={(e) => handleNavClick(e, item)}
                                className="text-sm text-[#888888] hover:text-white transition-colors font-montserrat relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4ADE80] transition-all duration-300 group-hover:w-full" />
                            </a>
                        ))}
                    </nav>

                    <Button asChild variant="primary" size="md" rightIcon={<ArrowRight size={16} />}>
                        <a href="/order">Pre-Order Now</a>
                    </Button>
                </div>
            </header>

            <main className="pt-32 pb-24">
                {/* Intro Section with animations */}
                <motion.section 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="px-6 mb-24 relative z-10"
                >
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div variants={itemVariants}>
                            <Badge variant="outline" size="lg" className="mb-6 border-[#252525] bg-[#151515]/50 text-[#888888]">
                                <Users size={14} className="text-[#4ADE80]" />
                                <span className="font-montserrat">Our Story</span>
                            </Badge>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-white mb-8 font-proxima-sera leading-tight">
                            Reimagining the<br />
                            <span className="bg-gradient-to-r from-[#4ADE80] via-[#36484d] to-[#764134] bg-clip-text text-transparent leading-relaxed py-2 block">
                                Student Experience
                            </span>
                        </motion.h1>

                        <motion.div 
                            variants={itemVariants}
                            className="prose prose-invert prose-lg mx-auto bg-[#0f1115]/80 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-[#1f1f1f] shadow-2xl"
                        >
                            <p className="text-[#AAAAAA] font-montserrat leading-relaxed mb-6">
                                Our product, <span className="text-white font-semibold">PagePalette</span>, takes inspiration from what makes Crocs unique.
                                Crocs let people express themselves through customizable jibbitz. We’ve brought that idea into something
                                students use every day but rarely get to personalize: <span className="text-white font-semibold">notebooks</span>.
                            </p>
                            <p className="text-[#AAAAAA] font-montserrat leading-relaxed mb-6">
                                Our notebooks feature a detachable, jibbitz-style front cover that students can customize and even use
                                while studying. It encourages creativity, expression, and engagement in learning.
                            </p>
                            <p className="text-[#AAAAAA] font-montserrat leading-relaxed mb-6">
                                PagePalette is a set of reusable, customizable page tabs designed to help students stay organized,
                                study more efficiently, and reduce paper waste. Because it promotes better learning habits and is
                                environmentally friendly, we feel it aligns well with SHINE's focus on supporting young people.
                            </p>
                            
                            {/* SHINE Charity Info */}
                            <div className="mt-6 p-4 rounded-xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 not-prose">
                                <div className="flex items-center gap-2 mb-2">
                                    <Heart size={16} className="text-[#4ADE80]" />
                                    <span className="text-white font-semibold text-sm">Giving Back</span>
                                </div>
                                <p className="text-[#AAAAAA] font-montserrat text-sm leading-relaxed m-0">
                                    A portion of our profits is donated to <span className="text-[#4ADE80] font-semibold">SHINE</span>, supporting young people in need.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Image Marquee */}
                <section className="mb-24 relative overflow-hidden">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-white font-proxima-sera mb-2">Behind the Scenes</h2>
                        <p className="text-[#666666] font-montserrat">Our journey from concept to creation</p>
                    </div>

                    <div className="relative py-8 bg-[#0f1115] border-y border-[#1f1f1f]">
                        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0f1115] to-transparent z-10" />
                        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0f1115] to-transparent z-10" />

                        <div className="animate-marquee gap-6 px-6">
                            {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((src, i) => (
                                <div key={i} className="flex-shrink-0 w-72 h-48 md:w-96 md:h-64 rounded-xl overflow-hidden border border-[#252525] group relative">
                                    <img
                                        src={src}
                                        alt={`JA Process ${i}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Stream with animation */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="px-6 mb-24 relative"
                >
                    <div className="max-w-6xl mx-auto text-center mb-16">
                        <Badge variant="accent" size="lg" className="mb-4 bg-gradient-to-r from-[#36484d] to-[#764134] text-white border-0">
                            <Star size={14} />
                            Community Voices
                        </Badge>
                        <h2 className="text-4xl font-bold text-white mb-4 font-proxima-sera">What Our School Says</h2>
                    </div>

                    <div className="relative pb-12 overflow-hidden">
                        {/* Left-to-Right Stream */}
                        <div className="animate-marquee gap-6 px-6" style={{ animationDuration: '60s' }}>
                            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 w-80 md:w-96 bg-[#0f1115] p-6 rounded-2xl border border-[#1f1f1f] hover:border-[#36484d]/50 transition-colors relative group"
                                >
                                    <Quote className="absolute top-4 right-4 text-[#252525] group-hover:text-[#36484d] transition-colors" size={40} />
                                    <p className="text-[#E4DFDA] font-montserrat italic mb-6 leading-relaxed relative z-10">"{t.text}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#36484d] to-[#764134] flex items-center justify-center text-white font-bold text-sm">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white font-proxima-sera">{t.name}</p>
                                            <p className={`text-xs font-montserrat ${t.role === 'Teacher' ? 'text-[#4ADE80]' : 'text-[#888888]'}`}>
                                                {t.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* FooterCTA with animation */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="px-6 text-center"
                >
                    <div className="max-w-3xl mx-auto bg-gradient-to-br from-[#151515] to-[#0a0a0a] rounded-3xl border border-[#1f1f1f] p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#4ADE80]/10 blur-3xl rounded-full pointer-events-none" />

                        <h2 className="text-3xl font-bold text-white mb-6 font-proxima-sera relative z-10">
                            Join the Movement
                        </h2>
                        <p className="text-[#888888] mb-8 font-montserrat relative z-10">
                            Be part of the PagePalette community today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                            <Button asChild variant="primary" size="xl">
                                <a href="/order">Pre-Order Now</a>
                            </Button>
                        </div>
                    </div>
                </motion.section>
            </main>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-[#1f1f1f] mt-24">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <a href="/" className="inline-block">
                            <img src="/logo-full.png" alt="PagePalette" className="h-8 w-auto object-contain brightness-0 invert" />
                        </a>
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
