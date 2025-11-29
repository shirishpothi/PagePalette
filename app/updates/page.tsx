import React from "react";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, TrendingUp, Users, Factory, Lightbulb } from "lucide-react";
import { FlashlightCard } from "@/components/ui/flashlight-card";

const updates = [
    {
        phase: "Phase 1: Formation & Ideation",
        date: "Late Sept – Early Oct",
        icon: Lightbulb,
        items: [
            "Team Assembly: Leadership team established; VP of Business Relations appointed for sourcing.",
            "Strategic Pivot: Decided against pre-made goods from China to manufacture independently and sustainably.",
            "Product Definition: Finalized concept as an independent, customizable notebook."
        ]
    },
    {
        phase: "Phase 2: Market Validation & Branding",
        date: "Mid-Oct",
        icon: Users,
        items: [
            "Market Research: Surveys deployed to students (Years 6-11) and teachers.",
            "Brand Identity: Name 'PagePalette' confirmed. Logo #6 selected. Slogan: 'Swap it. Snap it. Make it you.'",
            "IP Protection: Adopted unique terminology to avoid trademark infringement."
        ]
    },
    {
        phase: "Phase 3: Operations & Approvals",
        date: "Late Oct – Nov",
        icon: Factory,
        items: [
            "Product Approval: Design received approval to proceed.",
            "Supply Chain Secured: Sourced recycled plastic (Tridi Oasis) and paper.",
            "Equipment: Acquired binding machine for in-house assembly.",
            "Prototyping: Began 3D modeling attachment designs."
        ]
    },
    {
        phase: "Phase 4: Financial Structure & Capitalization",
        date: "Nov",
        icon: TrendingUp,
        items: [
            "Financial Planning: Completed cash flow analysis and unit economics modeling.",
            "Shareholder Acquisition: Actively sold shares, targeting teachers as key investors.",
            "Full Funding: All shares sold as of November 21, fully capitalizing the venture."
        ]
    },
    {
        phase: "Phase 5: Production Execution",
        date: "Late Nov – Present",
        icon: CheckCircle2,
        items: [
            "Material Procurement: Funds deployed for A5 paper (Muji) and binders.",
            "Production Strategy: Confirmed cover colors (e.g., red). Prioritizing 3D model adjustments to minimize waste.",
            "Current Status: Moving into production phase for upcoming sales events."
        ]
    }
];

export default function UpdatesPage() {
    return (
        <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-6">
                        Shareholder Updates
                    </h1>
                    <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                        Track our journey from ideation to production. We are committed to transparency and sustainable growth.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <FlashlightCard className="bg-neutral-900/50 border-neutral-800">
                        <div className="p-8 h-full">
                            <h3 className="text-xl font-bold text-indigo-400 mb-4">Our Mission</h3>
                            <p className="text-neutral-300 leading-relaxed">
                                To create a customizable notebook that adapts to your needs, helping you stay organized, inspired, and creative every day.
                            </p>
                        </div>
                    </FlashlightCard>
                    <FlashlightCard className="bg-neutral-900/50 border-neutral-800">
                        <div className="p-8 h-full">
                            <h3 className="text-xl font-bold text-cyan-400 mb-4">Our Vision</h3>
                            <p className="text-neutral-300 leading-relaxed">
                                A world where every notebook is as unique as the person using it.
                            </p>
                        </div>
                    </FlashlightCard>
                </div>

                <div className="relative border-l border-neutral-800 ml-4 md:ml-8 space-y-12">
                    {updates.map((update, index) => (
                        <div key={index} className="relative pl-8 md:pl-12">
                            <div className="absolute -left-3 top-0 bg-neutral-950 p-1">
                                <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-neutral-900" />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                                <h2 className="text-xl font-bold text-white">{update.phase}</h2>
                                <span className="px-3 py-1 rounded-full bg-neutral-800 text-xs text-neutral-400 font-mono">
                                    {update.date}
                                </span>
                            </div>

                            <FlashlightCard className="bg-neutral-900/30 border-neutral-800">
                                <div className="p-6">
                                    <ul className="space-y-3">
                                        {update.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-neutral-300 text-sm leading-relaxed">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500/50 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </FlashlightCard>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
