"use client";

import { useEffect } from "react";

/**
 * Prevents next-themes (inside NeonAuthUIProvider) from applying dark mode.
 * NeonAuthUIProvider hardcodes enableSystem: true, so it follows system dark mode.
 * This component removes the "dark" class from <html> whenever it's added.
 */
export default function ForceLightMode() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");
    html.style.colorScheme = "light";

    const observer = new MutationObserver(() => {
      if (html.classList.contains("dark")) {
        html.classList.remove("dark");
        html.style.colorScheme = "light";
      }
    });

    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return null;
}
