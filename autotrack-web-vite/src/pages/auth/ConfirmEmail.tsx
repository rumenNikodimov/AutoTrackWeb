import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmEmail } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiErrors";

export function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (!token.trim()) {
      setError("Missing confirmation token.");
      setLoading(false);
      return;
    }

    confirmEmail(token)
      .then(() => {
        setSuccess(true);
        setError(null);
      })
      .catch((err) => {
        setSuccess(false);
        setError(getApiErrorMessage(err, "Invalid or expired confirmation link."));
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Confirm Email</h2>

        {loading && <p style={muted}>Verifying confirmation link...</p>}

        {!loading && success && (
          <>
            <p style={successText}>Email confirmed successfully.</p>
            <Link to="/login" style={btnLike}>Go to Login</Link>
          </>
        )}

        {!loading && !success && (
          <>
            <p style={errorText}>{error || "Invalid or expired confirmation link."}</p>
            <Link to="/login" style={btnSecondary}>Back to Login</Link>
          </>
        )}
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
  margin: "0 0 12px",
  textAlign: "center",
};

const muted: React.CSSProperties = {
  textAlign: "center",
  color: "#94a3b8",
};

const successText: React.CSSProperties = {
  textAlign: "center",
  color: "#86efac",
  marginBottom: 14,
};

const errorText: React.CSSProperties = {
  textAlign: "center",
  color: "#fca5a5",
  marginBottom: 14,
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

const btnSecondary: React.CSSProperties = {
  ...btnLike,
  background: "linear-gradient(180deg, rgba(51,65,85,0.72), rgba(30,41,59,0.72))",
};
