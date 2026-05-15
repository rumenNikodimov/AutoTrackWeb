import { useTranslation } from "react-i18next";
import i18n from "../i18n";

export function LanguageSwitcher() {
  const { i18n: i18next } = useTranslation();
  const currentLang = i18next.language;

  return (
    <div style={container}>
      <button
        onClick={() => i18n.changeLanguage("en")}
        style={{
          ...btn,
          ...(currentLang === "en" ? activeBtn : {})
        }}
      >
        🇬🇧 EN
      </button>

      <button
        onClick={() => i18n.changeLanguage("bg")}
        style={{
          ...btn,
          ...(currentLang === "bg" ? activeBtn : {})
        }}
      >
        🇧🇬 BG
      </button>
    </div>
  );
}

/* ✅ styles */

const container: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 10,
  marginBottom: 10
};

const btn: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 20,
  border: "none",
  cursor: "pointer",
  background: "#334155",
  color: "white",
  fontSize: 13,
  transition: "all 0.2s ease"
};

const activeBtn: React.CSSProperties = {
  background: "#3b82f6",
  boxShadow: "0 0 10px rgba(59,130,246,0.8)"
};
