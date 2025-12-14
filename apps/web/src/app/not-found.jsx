import { Button } from "@/components/ui";
import { ArrowRight, MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Noise & Blur */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#36484d]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#764134]/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="max-w-lg w-full relative z-10 text-center">
                {/* Notebook Animation Representation */}
                <div className="mb-12 relative mx-auto w-64 h-80 perspective-1000 group">
                    {/* Back Cover */}
                    <div className="absolute inset-0 bg-[#1a1a1a] rounded-r-2xl rounded-l-md border border-[#333] shadow-2xl transform translate-x-1 translate-y-1"></div>

                    {/* Front Cover - Open slightly */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2a3a40] to-[#1a2a30] rounded-r-2xl rounded-l-md border border-[#36484d]/30 shadow-2xl origin-left transform group-hover:-rotate-y-12 transition-transform duration-500 flex items-center justify-center flex-col">
                        <div className="w-full h-full p-6 flex flex-col items-center justify-center relative">
                            {/* 404 Text on cover */}
                            <h1 className="text-8xl font-bold font-proxima-sera text-white/90 drop-shadow-md">404</h1>
                            <p className="text-[#888] font-montserrat mt-2 text-sm uppercase tracking-widest">Page Not Found</p>

                            {/* Binder Rings - Ring around holes */}
                            <div className="absolute left-1 top-4 bottom-4 flex flex-col justify-around">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="relative w-6 h-6 flex items-center justify-center mb-2">
                                        {/* Outer ring */}
                                        <div className="absolute w-6 h-6 rounded-full border-2 border-[#555] bg-gradient-to-b from-[#3a3a3a] to-[#222]" />
                                        {/* Inner hole */}
                                        <div className="w-3 h-3 rounded-full bg-[#111] shadow-inner z-10" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-4 font-proxima-sera">
                    Oops! You ran out of pages.
                </h2>
                <p className="text-[#888] font-montserrat mb-8 max-w-xs mx-auto">
                    The page you are looking for might have been removed or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild variant="outline" size="lg" className="border-[#333] text-[#ccc] hover:bg-[#1a1a1a] font-montserrat">
                        <Link to="/">
                            <MoveLeft size={16} className="mr-2" />
                            Back Home
                        </Link>
                    </Button>
                    <Button asChild variant="primary" size="lg" className="bg-[#4ADE80] text-black hover:bg-[#22C55E] font-bold font-proxima-sera">
                        <Link to="/order">
                            Pre-Order Now
                            <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
