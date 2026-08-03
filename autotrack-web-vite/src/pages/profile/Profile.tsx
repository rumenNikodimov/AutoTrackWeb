import { useEffect, useState } from "react";
import { changePassword, getMe, type UserProfile } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/apiErrors";

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    getMe()
      .then((me) => {
        setProfile(me);
        setError(null);
      })
      .catch((err) => setError(getApiErrorMessage(err, "Failed to load profile.")))
      .finally(() => setLoading(false));
  }, []);

  const submitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setChanging(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to change password."));
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 80 }}>Loading...</p>;
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Profile</h2>

        {error && <p style={errorText}>{error}</p>}
        {passwordMessage && <p style={successText}>{passwordMessage}</p>}

        {profile && (
          <div style={infoWrap}>
            <InfoRow label="Email" value={profile.email} />
            <InfoRow
              label="Email confirmed"
              value={profile.isEmailConfirmed ? "Yes" : "No"}
            />
            <InfoRow
              label="Created"
              value={new Date(profile.createdAt).toLocaleDateString()}
            />
          </div>
        )}

        <h3 style={subTitle}>Change Password</h3>
        <form onSubmit={submitChangePassword}>
          <Field label="Current password">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={input}
            />
          </Field>

          <Field label="New password">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={input}
            />
          </Field>

          <Field label="Confirm new password">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={input}
            />
          </Field>

          <button type="submit" style={btn} disabled={changing}>
            {changing ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoRow}>
      <span style={infoLabel}>{label}</span>
      <span style={infoValue}>{value}</span>
    </div>
  );
}

const container: React.CSSProperties = {
  maxWidth: 460,
  margin: "0 auto",
  padding: "20px 12px 110px",
};

const card: React.CSSProperties = {
  background: "#1e293b",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
};

const title: React.CSSProperties = {
  textAlign: "center",
  margin: "0 0 14px",
};

const subTitle: React.CSSProperties = {
  marginTop: 18,
  marginBottom: 10,
};

const infoWrap: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.35)",
  padding: 10,
  background: "rgba(15,23,42,0.45)",
};

const infoRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  padding: "6px 0",
};

const infoLabel: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 13,
};

const infoValue: React.CSSProperties = {
  color: "#f8fafc",
  fontSize: 14,
  fontWeight: 600,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  marginBottom: 6,
  opacity: 0.8,
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
  marginTop: 8,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const errorText: React.CSSProperties = {
  color: "#fca5a5",
  textAlign: "center",
  marginBottom: 10,
};

const successText: React.CSSProperties = {
  color: "#86efac",
  textAlign: "center",
  marginBottom: 10,
};
