import { forwardRef } from "react";

const variants = {
    default: "bg-[#F3F3F3] dark:bg-[#262626] text-[#4B4B4B] dark:text-[#B0B0B0]",
    primary: "bg-[#36484d] text-[#E4DFDA]",
    accent: "bg-[#764134] text-[#E4DFDA]",
    success: "bg-[#22C55E] dark:bg-[#40D677] text-white",
    warning: "bg-[#F59E0B] text-white",
    error: "bg-[#EF4444] text-white",
    gradient: "bg-gradient-to-r from-[#36484d] to-[#764134] text-white",
    outline: "bg-transparent border border-[#36484d] dark:border-[#764134] text-[#36484d] dark:text-[#E4DFDA]",
};

const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
};

const Badge = forwardRef(
    (
        {
            children,
            variant = "default",
            size = "md",
            pulse = false,
            dot = false,
            className = "",
            ...props
        },
        ref
    ) => {
        return (
            <span
                ref={ref}
                className={`
          inline-flex items-center gap-1.5
          rounded-full font-medium
          transition-all duration-200
          ${variants[variant]}
          ${sizes[size]}
          ${pulse ? "badge-pulse" : ""}
          ${className}
        `}
                {...props}
            >
                {dot && (
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${variant === "default"
                                ? "bg-[#36484d]"
                                : "bg-current opacity-80"
                            }`}
                    />
                )}
                {children}
            </span>
        );
    }
);

Badge.displayName = "Badge";

export default Badge;
