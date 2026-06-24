"use client";

import { useState, useEffect } from "react";

export function useVisualViewport() {
  const [style, setStyle] = useState<{ bottom: string; height: string }>({
    bottom: "0px",
    height: "100vh",
  });
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;

      const keyboardHeight = window.innerHeight - vv.height;
      const isOpen = keyboardHeight > 80; // Virtual keyboard is usually taller than 80px

      setIsKeyboardOpen(isOpen);
      setStyle({
        bottom: `${Math.max(0, keyboardHeight)}px`,
        height: `${vv.height}px`,
      });
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
    
    // Initial check
    handleResize();

    // Set a timeout to catch any delayed resizing
    const timer = setTimeout(handleResize, 100);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return { style, isKeyboardOpen };
}
