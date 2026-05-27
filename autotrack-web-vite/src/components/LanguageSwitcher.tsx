
import { useState, useEffect, useRef } from "react";
import i18n from "../i18n";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const currentLang = i18n.language;
  const ref = useRef<HTMLDivElement>(null);

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    // localStorage.setItem("lang", lang);
    setOpen(false);
  };

  // ✅ close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={wrapper}>
      {/* ✅ main button */}
      <button
        onClick={() => setOpen(!open)}
        style={mainBtn}
      >
        🌐 {currentLang.toUpperCase()} ⌄
      </button>

      {/* ✅ dropdown */}
      {open && (
        <div style={dropdown}>
          <div
            style={item(currentLang === "en")}
            onClick={() => changeLang("en")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#334155")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                currentLang === "en" ? "#3b82f6" : "transparent")
            }
          >
            🇬🇧 English
          </div>

          <div
            style={item(currentLang === "bg")}
            onClick={() => changeLang("bg")}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#334155")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                currentLang === "bg" ? "#3b82f6" : "transparent")
            }
          >
            🇧🇬 Български
          </div>
        </div>
      )}
    </div>
  );
}


const wrapper: React.CSSProperties = {
  position: "relative"
};

const mainBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 20,
  border: "none",
  background: "rgba(51,65,85,0.9)",
  backdropFilter: "blur(6px)",
  color: "white",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 500,
  transition: "all 0.2s ease",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "120%",
  right: 0,
  background: "rgba(30,41,59,0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  overflow: "hidden",
  minWidth: 150,
  zIndex: 9999,
  animation: "fadeIn 0.15s ease"
};

const item = (active: boolean): React.CSSProperties => ({
  padding: "12px",
  cursor: "pointer",
  fontSize: 14,
  background: active ? "#3b82f6" : "transparent",
  color: "white",
  transition: "all 0.15s"
});