
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage || i18n.language;
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
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={mainBtn}
      >
        <span style={globe}>🌐</span> {currentLang.toUpperCase()}
      </button>

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
  position: "relative",
  zIndex: 60,
};

const mainBtn: React.CSSProperties = {
  minWidth: 78,
  height: 42,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "linear-gradient(180deg, rgba(31,41,55,0.96), rgba(17,24,39,0.96))",
  backdropFilter: "blur(12px)",
  color: "#e5e7eb",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  boxShadow: "0 10px 26px rgba(2,6,23,0.45)",
  transition: "all 0.2s ease"
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "120%",
  right: 0,
  background: "rgba(17,24,39,0.98)",
  backdropFilter: "blur(10px)",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 16px 40px rgba(2,6,23,0.6)",
  overflow: "hidden",
  minWidth: 150,
  zIndex: 9999,
  animation: "fadeIn 0.15s ease"
};

const item = (active: boolean): React.CSSProperties => ({
  padding: "12px",
  cursor: "pointer",
  fontSize: 14,
  background: active ? "#2563eb" : "transparent",
  color: "#f8fafc",
  transition: "all 0.15s"
});

const globe: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1,
};
