import React from "react";
import { PulseLoader } from "react-spinners";
import { motion } from "framer-motion";

import { cn } from "@/lib/shadcn";

const Button = React.forwardRef(
  (
    {
      text = "",
      className = "",
      color = "",
      type = "button",
      onClick = () => {},
      isLoading = false,
      size = "normal",
      icon = null,
      suffixIcon = null,
      disabled = false,
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          size === "normal" &&
            "text-base font-medium px-6 py-[5px] rounded-full",
          size === "small" && "text-sm px-4 py-1 rounded-xl",
          size === "tiny" && "text-xs px-3 py-[3px] rounded-lg",
          color === "primary"
            ? "text-white bg-primary-blue"
            : color === "outline"
            ? "border border-zinc-300 dark:border-zinc-500 text-zinc-600 dark:text-zinc-400"
            : "text-primary-text",
          className
        )}
        onClick={onClick}
        disabled={disabled}
      >
        {isLoading ? (
          <PulseLoader
            size={size === "normal" ? 10 : 5}
            color={color === "primary" ? "white" : "#303030"}
          />
        ) : (
          <div className="flex flex-row items-center gap-1 min-w-max">
            {icon}
            <span>{text}</span>
            {suffixIcon}
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

export const MotionButton = motion.create(Button);
