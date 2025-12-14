import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/utils/cn";

const variants = {
  primary:
    "btn-premium text-[#E4DFDA] hover:shadow-lg",
  secondary:
    "bg-white dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#404040] text-[#4B4B4B] dark:text-[#B0B0B0] hover:bg-[#F8F8F8] dark:hover:bg-[#2A2A2A] hover-lift",
  outline:
    "bg-transparent border-2 border-[#36484d] dark:border-[#764134] text-[#36484d] dark:text-[#E4DFDA] hover:bg-[#36484d]/10 dark:hover:bg-[#764134]/10",
  ghost:
    "bg-transparent text-[#36484d] dark:text-[#E4DFDA] hover:bg-[#36484d]/10 dark:hover:bg-[#764134]/10",
  gradient:
    "bg-gradient-to-r from-[#36484d] to-[#764134] text-white hover:opacity-90 hover-glow",
};

const sizes = {
  sm: "h-8 px-4 text-sm",
  md: "h-10 px-6 text-sm",
  lg: "h-12 px-8 text-base",
  xl: "h-14 px-10 text-lg",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className,
      isLoading = false,
      leftIcon,
      rightIcon,
      asChild = false,
      type,
      ...props
    },
    ref
  ) => {
    const buttonClassName = cn(
      "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200",
      "active:scale-95",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0A0A0A]",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
      variants[variant],
      sizes[size],
      className
    );

    if (asChild) {
      const onlyChild = Children.only(children);
      if (!isValidElement(onlyChild)) return null;

      const isDisabled = isLoading || props.disabled;

      const childContent = (
        <>
          {isLoading && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {onlyChild.props.children}
          {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      );

      return cloneElement(onlyChild, {
        ...props,
        className: cn(buttonClassName, onlyChild.props?.className),
        "aria-disabled": isDisabled || undefined,
        tabIndex: isDisabled ? -1 : onlyChild.props.tabIndex,
        onClick: (e) => {
          if (isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (typeof onlyChild.props.onClick === "function") onlyChild.props.onClick(e);
          if (typeof props.onClick === "function") props.onClick(e);
        },
        children: childContent,
      });
    }

    return (
      <button
        ref={ref}
        className={buttonClassName}
        disabled={isLoading || props.disabled}
        type={type ?? "button"}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
