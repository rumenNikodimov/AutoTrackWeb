
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const resolved = i18n.resolvedLanguage || i18n.language;
  const currentLang = resolved?.startsWith("bg") ? "bg" : "en";
  const nextLang = currentLang === "en" ? "bg" : "en";

  const toggleLang = () => {
    i18n.changeLanguage(nextLang);
  };

  return (
    <div style={wrapper}>
      <button
        type="button"
        onClick={toggleLang}
        style={mainBtn}
        aria-label={`Switch language to ${nextLang.toUpperCase()}`}
        title={`Switch to ${nextLang.toUpperCase()}`}
      >
        <span style={globe}>🌐</span> {currentLang.toUpperCase()}
      </button>
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

const globe: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1,
};
