import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/PagePalette Logo.png"
                        alt="PagePalette Logo"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        PagePalette
                    </span>
                </Link>
                <div className="flex gap-6">
                    <Link href="/customizer" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        3D Customizer
                    </Link>
                    <Link href="/updates" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        Shareholder Updates
                    </Link>
                </div>
            </div>
        </nav>
    );
}
