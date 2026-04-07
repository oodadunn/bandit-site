"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ size = 16 }: { size?: number }) {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("bandit-theme");
    if (saved === "light") {
      setIsLight(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("bandit-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("bandit-theme", "dark");
    }
  };

  // Prevent hydration mismatch — render nothing until mounted
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="p-2 rounded-md transition-colors"
        style={{ width: 36, height: 36 }}
      />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="p-2 rounded-md transition-all duration-200 hover:bg-[var(--green-bg)]"
    >
      {isLight ? (
        <Moon size={size} className="text-[var(--text-secondary)] hover:text-[var(--green-accent)]" />
      ) : (
        <Sun size={size} className="text-gray-400 hover:text-[#39FF14]" />
      )}
    </button>
  );
}
