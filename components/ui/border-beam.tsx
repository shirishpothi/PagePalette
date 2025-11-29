"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const BorderBeam = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute inset-0 rounded-full border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]",
                className
            )}
        >
            <div className="absolute aspect-square w-full bg-gradient-to-l from-indigo-500 via-purple-500 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-border-beam" />
        </div>
    );
};
