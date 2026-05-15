
import { useState } from "react";
import { apiPost } from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { createHoverHandlers } from "../../utils/uiHandlers";

type Props = {
  onLogin: (token: string) => void;
};

export function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const result = await apiPost<{ token: string }>("auth/login", {
        email: email.trim(),
        password,
      });

      onLogin(result.token);
      navigate("/vehicles");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Login</h2>

        <form onSubmit={handleSubmit}>
          {/* ✅ Email */}
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@mail.com"
              style={input}
              autoFocus
            />
          </Field>

          {/* ✅ Password */}
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={input}
            />
          </Field>

          {/* ✅ Button */}
          <button type="submit" disabled={loading} {...createHoverHandlers("rgba(59,130,246,0.6)")} style={btn}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}

        {/* ✅ Navigation */}
        <p style={footerText}>
          Don't have an account?{" "}
          <Link to="/register" style={link}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ✅ Field wrapper */
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

/* ✅ Styles */

const container: React.CSSProperties = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "80px 12px"
};

const card: React.CSSProperties = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.6)"
};

const title: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 20
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  marginBottom: 6,
  opacity: 0.8
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0f172a",
  color: "white",
  fontSize: 16,
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)"
};

const btn: React.CSSProperties = {
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

const errorStyle: React.CSSProperties = {
  color: "#f87171",
  marginTop: 12,
  textAlign: "center"
};

const footerText: React.CSSProperties = {
  marginTop: 15,
  textAlign: "center",
  fontSize: 14
};

const link: React.CSSProperties = {
  color: "#3b82f6",
  textDecoration: "none"
};
