import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiErrors";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      const msg = getApiErrorMessage(err, "Failed to send reset email.");
      console.warn("forgotPassword response:", msg);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Forgot Password</h2>

        {!sent ? (
          <form onSubmit={submit}>
            <div style={{ marginBottom: 14 }}>
              <div style={label}>Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={input}
                placeholder="you@example.com"
              />
            </div>

            <button type="submit" style={btn} disabled={loading}>
              {loading ? "Sending..." : "Send reset email"}
            </button>
          </form>
        ) : (
          <p style={successText}>If an account exists, a password reset email has been sent.</p>
        )}

        {error && <p style={errorText}>{error}</p>}

        <p style={footer}>
          <Link to="/login" style={link}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "80px 12px",
};

const card: React.CSSProperties = {
  background: "#1e293b",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
};

const title: React.CSSProperties = {
  margin: "0 0 16px",
  textAlign: "center",
};

const label: React.CSSProperties = {
  fontSize: 14,
  marginBottom: 6,
  opacity: 0.85,
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
};

const btn: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const successText: React.CSSProperties = {
  textAlign: "center",
  color: "#86efac",
  marginBottom: 10,
};

const errorText: React.CSSProperties = {
  textAlign: "center",
  color: "#fca5a5",
  marginTop: 10,
};

const footer: React.CSSProperties = {
  marginTop: 14,
  textAlign: "center",
};

const link: React.CSSProperties = {
  color: "#60a5fa",
  textDecoration: "none",
};
