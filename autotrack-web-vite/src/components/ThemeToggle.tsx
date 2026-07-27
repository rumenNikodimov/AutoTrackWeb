import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const THEME_KEY = "autotrack:theme";

function getPreferredTheme(): ThemeMode {
  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      style={btn}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span style={icon}>{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}

const btn: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "linear-gradient(180deg, rgba(31,41,55,0.96), rgba(17,24,39,0.96))",
  color: "#e5e7eb",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 26px rgba(2,6,23,0.45)",
  backdropFilter: "blur(12px)",
};

const icon: React.CSSProperties = {
  fontSize: 18,
  lineHeight: 1,
};
