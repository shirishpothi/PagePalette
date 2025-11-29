import React from "react";
import { Spotlight } from "@/components/ui/spotlight";
import Link from "next/link";
import { BorderBeam } from "@/components/ui/border-beam";
import { BackgroundClipGrid } from "@/components/ui/background-clip-grid";

export function Hero() {
    return (
        <div className="h-screen w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
            <BackgroundClipGrid />
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            />
            <div className="p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
                <h1 className="text-4xl md:text-7xl font-bold text-center pb-4 leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        PagePalette
                    </span>
                    <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                        is the new way to notebook.
                    </span>
                </h1>

                <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
                    Customizable, modular, and designed for your creativity.
                    PagePalette empowers you to build the perfect notebook for your needs.
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    <Link href="/customizer" className="group relative px-8 py-2 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 text-white focus:ring-2 focus:ring-indigo-400 hover:shadow-xl transition duration-200 overflow-hidden">
                        <span className="relative z-10">Customize Now</span>
                        <BorderBeam />
                    </Link>
                    <Link href="/updates" className="group relative px-8 py-2 rounded-full border border-neutral-600 text-neutral-300 hover:bg-neutral-800 transition duration-200 overflow-hidden">
                        <span className="relative z-10">Shareholder Updates</span>
                        <BorderBeam className="opacity-0 group-hover:opacity-100" />
                    </Link>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
                        <p className="text-neutral-400 text-sm">To revolutionize the stationery industry through modular design and sustainable practices.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
                        <p className="text-neutral-400 text-sm">A world where every tool you use is perfectly adapted to your creative workflow.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-white mb-2">Junior Achievement</h3>
                        <p className="text-neutral-400 text-sm">Proudly participating in the Junior Achievement Company Program, fostering young entrepreneurship.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
