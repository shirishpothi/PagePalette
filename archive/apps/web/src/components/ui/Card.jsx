import { forwardRef, useRef, useEffect } from "react";

const variants = {
    default: "bg-white dark:bg-[#1A1A1A] border border-[#E6E6E6] dark:border-[#333333]",
    glass: "glass",
    gradient: "border-gradient bg-white dark:bg-[#1A1A1A]",
    elevated: "bg-white dark:bg-[#1A1A1A] shadow-lg",
    ghost: "bg-transparent hover:bg-[#F8F8F8] dark:hover:bg-[#2A2A2A]",
};

const Card = forwardRef(
    (
        {
            children,
            variant = "default",
            spotlight = false,
            hover = true,
            className = "",
            padding = true,
            ...props
        },
        ref
    ) => {
        const cardRef = useRef(null);

        // Spotlight effect - track mouse position
        useEffect(() => {
            if (!spotlight || !cardRef.current) return;

            const card = cardRef.current;
            const handleMouseMove = (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty("--mouse-x", `${x}%`);
                card.style.setProperty("--mouse-y", `${y}%`);
            };

            card.addEventListener("mousemove", handleMouseMove);
            return () => card.removeEventListener("mousemove", handleMouseMove);
        }, [spotlight]);

        return (
            <div
                ref={(node) => {
                    cardRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                className={`
          rounded-2xl
          transition-all duration-300
          ${variants[variant]}
          ${spotlight ? "card-spotlight" : ""}
          ${hover ? "card-float" : ""}
          ${padding ? "p-6" : ""}
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

// Card Header component
export const CardHeader = ({ children, className = "", ...props }) => (
    <div className={`mb-4 ${className}`} {...props}>
        {children}
    </div>
);

// Card Title component
export const CardTitle = ({ children, className = "", ...props }) => (
    <h3
        className={`text-xl font-bold text-black dark:text-white font-proxima-sera ${className}`}
        {...props}
    >
        {children}
    </h3>
);

// Card Description component
export const CardDescription = ({ children, className = "", ...props }) => (
    <p
        className={`text-sm text-[#6F6F6F] dark:text-[#AAAAAA] font-montserrat mt-1 ${className}`}
        {...props}
    >
        {children}
    </p>
);

// Card Content component
export const CardContent = ({ children, className = "", ...props }) => (
    <div className={className} {...props}>
        {children}
    </div>
);

// Card Footer component
export const CardFooter = ({ children, className = "", ...props }) => (
    <div className={`mt-4 pt-4 border-t border-[#E6E6E6] dark:border-[#333333] ${className}`} {...props}>
        {children}
    </div>
);

export default Card;
