import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPublicPost } from "../../services/api";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

export function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const currentLang = i18n.language;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    // ✅ VALIDATION
    if (!email || !password || !confirmPassword) {
      setError(t("allFieldsRequired"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsNotMatch"));
      return;
    }

    setLoading(true);

    try {
      await apiPublicPost("auth/register", {
        email: email.trim(),
        password
      });

      navigate("/login");
    } catch (err: any) {
      setError(t("registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>

      <div style={card}>
        <h2 style={title}>{t("register")}</h2>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <Field label={t("email")}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@mail.com"
              style={input}
              autoFocus
            />
          </Field>

          {/* Password */}
          <Field label={t("password")}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={input}
            />
          </Field>

          {/* ✅ Confirm Password */}
          <Field label={t("confirmPassword")}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="••••••••"
              style={input}
            />
          </Field>

          <button disabled={loading} style={btn}>
            {loading ? t("registering") : t("register")}
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}

        <p style={footer}>
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login" style={link}>
            {t("login")}  
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ✅ reusable */

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

/* ✅ styles */

const container = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "80px 12px"
};

const card = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.6)"
};

const title = {
  textAlign: "center" as const,
  marginBottom: 20
};

const labelStyle = {
  fontSize: 14,
  marginBottom: 6,
  opacity: 0.8
};

const input = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0f172a",
  color: "white",
  fontSize: 16,
  boxSizing: "border-box" as const
};

const btn = {
  width: "100%",
  marginTop: 20,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer"
};

const errorStyle = {
  color: "#f87171",
  marginTop: 12,
  textAlign: "center" as const
};

const footer = {
  marginTop: 15,
  textAlign: "center" as const,
  fontSize: 14
};

const link = {
  color: "#3b82f6",
  textDecoration: "none"
};

