"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomCursorProps {
  isLoggedIn: boolean;
  userEmail?: string;
}

export function CustomCursor({ isLoggedIn, userEmail }: CustomCursorProps) {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Extract and format username from email
  const formatUsername = (email: string | undefined): string => {
    if (!email) return "";
    const name = email.split("@")[0];
    if (name.length > 8) {
      return name.substring(0, 8) + "...";
    }
    return name;
  };

  const username = formatUsername(userEmail);

  useEffect(() => {
    // Check for touch device
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    checkTouchDevice();

    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Check for hoverable elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverableElement =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.classList.contains("cursor-pointer");
      setIsHovering(!!isHoverableElement);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleElementHover);

    // Hide default cursor globally
    const style = document.createElement("style");
    style.id = "custom-cursor-style";
    style.textContent = "* { cursor: none !important; }";
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleElementHover);
      const existingStyle = document.getElementById("custom-cursor-style");
      if (existingStyle) existingStyle.remove();
    };
  }, [isTouchDevice]);

  // Don't render on touch devices
  if (isTouchDevice) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9999]"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: mousePosition.x - 12,
            y: mousePosition.y - 12,
          }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 28,
            mass: 0.5,
          }}
        >
          {/* Main cursor dot */}
          <motion.div
            className="relative"
            animate={{
              scale: isHovering ? 1.5 : 1,
            }}
            transition={{ duration: 0.15 }}
          >
            {/* Outer ring */}
            <div
              className={`w-6 h-6 rounded-full border-2 backdrop-blur-sm ${
                isLoggedIn
                  ? "border-brand-yellow bg-brand-yellow/30 shadow-[0_0_15px_rgba(255,255,0,0.5)]"
                  : "border-brand-black bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.2)]"
              } transition-all duration-200`}
            />

            {/* Inner dot */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                isLoggedIn ? "bg-brand-yellow" : "bg-brand-black"
              } transition-colors duration-200`}
            />
          </motion.div>

          {/* Username badge (only when logged in) */}
          {isLoggedIn && username && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <div className="bg-brand-black text-brand-yellow text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                {username}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
