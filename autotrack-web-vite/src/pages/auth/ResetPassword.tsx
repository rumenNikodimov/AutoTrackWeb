import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiErrors";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Missing reset token.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to reset password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Reset Password</h2>

        {success ? (
          <>
            <p style={successText}>Password reset successfully.</p>
            <Link to="/login" style={btnLike}>Go to Login</Link>
          </>
        ) : (
          <form onSubmit={submit}>
            <Field label="New password">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={input}
                placeholder="••••••••"
              />
            </Field>

            <Field label="Confirm new password">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={input}
                placeholder="••••••••"
              />
            </Field>

            <button type="submit" style={btn} disabled={loading}>
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </form>
        )}

        {error && <p style={errorText}>{error}</p>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={labelStyle}>{label}</div>
      {children}
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
  textAlign: "center",
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  opacity: 0.8,
  fontSize: 14,
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

const btnLike: React.CSSProperties = {
  display: "block",
  textAlign: "center",
  width: "100%",
  padding: "13px",
  borderRadius: 12,
  textDecoration: "none",
  color: "white",
  fontWeight: 700,
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
};

const successText: React.CSSProperties = {
  textAlign: "center",
  color: "#86efac",
  marginBottom: 12,
};

const errorText: React.CSSProperties = {
  textAlign: "center",
  color: "#fca5a5",
  marginTop: 12,
};
