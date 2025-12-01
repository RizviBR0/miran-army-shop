"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const HeroHighlight = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-[40rem] w-full items-center justify-center bg-bg-main",
        containerClassName
      )}
    >
      <div className="absolute inset-0 bg-dot-thick-neutral-300 dark:bg-dot-thick-neutral-800 pointer-events-none" />
      <div className={cn("relative z-20", className)}>{children}</div>
    </div>
  );
};

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.span
      initial={{
        backgroundSize: "0% 100%",
      }}
      animate={{
        backgroundSize: "100% 100%",
      }}
      transition={{
        duration: 2,
        ease: "linear",
        delay: 0.5,
      }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline",
      }}
      className={cn(
        `relative inline-block pb-1 px-1 rounded-lg bg-gradient-to-r from-brand-yellow/50 to-accent-soft-pink`,
        className
      )}
    >
      {children}
    </motion.span>
  );
};

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const wordsArray = words.split(" ");

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-text-main text-2xl leading-snug tracking-wide">
          {wordsArray.map((word, idx) => (
            <motion.span
              key={word + idx}
              className="opacity-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.25,
                delay: idx * 0.1,
              }}
            >
              {word}{" "}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
};
