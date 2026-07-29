import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createHoverHandlers } from "../../utils/uiHandlers";
import {
  completeReminder,
  deleteReminder,
  getVehicleReminders,
} from "../../services/reminders";
import type { Reminder } from "../../types/Reminder";
import { CreateReminderModal } from "../../components/CreateReminderModal";
import { getReminderTypeKey } from "../../types/enums/ReminderType";

type GroupedReminders = {
  overdue: Reminder[];
  upcoming: Reminder[];
  completed: Reminder[];
};

export function ReminderList() {
  const { vehicleId } = useParams();
  const vId = Number(vehicleId);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(vId)) return;

    getVehicleReminders(vId)
      .then(setReminders)
      .catch((err) => {
        setError(err?.response?.data || err?.message || t("loadReminderError"));
      })
      .finally(() => setLoading(false));
  }, [vId]);

  const grouped = useMemo<GroupedReminders>(() => {
    const now = new Date();

    const overdue: Reminder[] = [];
    const upcoming: Reminder[] = [];
    const completed: Reminder[] = [];

    for (const r of reminders) {
      if (r.isCompleted) {
        completed.push(r);
        continue;
      }

      const dueDate = r.dueDate ? new Date(r.dueDate) : null;
      if (dueDate && dueDate < now) {
        overdue.push(r);
      } else {
        upcoming.push(r);
      }
    }

    return { overdue, upcoming, completed };
  }, [reminders]);

  const onComplete = async (id: number) => {
    try {
      const updated = await completeReminder(id);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      setError(t("reminderCompleteFailed"));
    }
  };

  const onDelete = async (id: number) => {
    const confirmed = confirm(t("deleteReminderConfirm"));
    if (!confirmed) return;

    try {
      await deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError(t("deleteReminderFailed"));
    }
  };

  if (loading) return <p style={{ padding: 20 }}>{t("loading")}</p>;

  return (
    <div style={screen}>
      <header style={header}>
        <h2 style={{ margin: 0 }}>{t("reminders")}</h2>
        <button
          type="button"
          style={newBtn}
          onClick={() => setOpenCreate(true)}
          {...createHoverHandlers("rgba(59,130,246,0.6)")}
        >
          {t("createReminder")}
        </button>
      </header>

      {error && <p style={errorCard}>{error}</p>}

      <ReminderGroup title={t("overdue")} reminders={grouped.overdue} tone="danger" onComplete={onComplete} onDelete={onDelete} />
      <ReminderGroup title={t("upcoming")} reminders={grouped.upcoming} tone="info" onComplete={onComplete} onDelete={onDelete} />
      <ReminderGroup title={t("completed")} reminders={grouped.completed} tone="neutral" onDelete={onDelete} />

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          type="button"
          style={secondaryBtn}
          onClick={() => navigate(`/vehicles/${vId}/dashboard`)}
        >
          {t("dashboard")}
        </button>
        <button
          type="button"
          style={secondaryBtn}
          onClick={() => navigate("/vehicles")}
        >
          {t("vehicles")}
        </button>
      </div>

      <CreateReminderModal
        open={openCreate}
        vehicleId={vId}
        onClose={() => setOpenCreate(false)}
        onCreated={(created) => setReminders((prev) => [created, ...prev])}
      />
    </div>
  );
}

function ReminderGroup({
  title,
  reminders,
  tone,
  onComplete,
  onDelete,
}: {
  title: string;
  reminders: Reminder[];
  tone: "danger" | "info" | "neutral";
  onComplete?: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const { t } = useTranslation();

  const toneBorder =
    tone === "danger"
      ? "rgba(239,68,68,0.45)"
      : tone === "info"
      ? "rgba(59,130,246,0.45)"
      : "rgba(148,163,184,0.35)";

  return (
    <section style={{ marginBottom: 14 }}>
      <h3 style={{ margin: "8px 0" }}>{title}</h3>

      {reminders.length === 0 && <p style={emptyText}>{t("none")}</p>}

      {reminders.map((r) => (
        <div key={r.id} style={{ ...card, border: `1px solid ${toneBorder}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <strong>{r.title}</strong>
            <span style={chip}>{t(getReminderTypeKey(r.reminderType))}</span>
          </div>

          {r.description && <p style={desc}>{r.description}</p>}

          <div style={metaRow}>
            <span>{t("dueDate")}: {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : t("notAvailable")}</span>
            <span>{t("dueKm")}: {r.dueKm ?? t("notAvailable")}</span>
          </div>

          <div style={metaRow}>
            <span>{t("notifyBeforeDays")}: {r.notifyBeforeDays ?? 0}</span>
            <span>{t("notifyBeforeKm")}: {r.notifyBeforeKm ?? 0}</span>
          </div>

          <div style={actions}>
            {!r.isCompleted && onComplete && (
              <button type="button" style={actionBtn} onClick={() => onComplete(r.id)}>
                {t("complete")}
              </button>
            )}

            <button type="button" style={dangerBtn} onClick={() => onDelete(r.id)}>
              {t("delete")}
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

const screen: React.CSSProperties = {
  width: "100%",
  maxWidth: 460,
  margin: "0 auto",
  padding: "10px 10px 110px",
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 10,
};

const newBtn: React.CSSProperties = {
  minHeight: 42,
  padding: "8px 12px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  flex: 1,
  minHeight: 42,
  borderRadius: 12,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-btn-bg)",
  color: "var(--ui-btn-text)",
  cursor: "pointer",
};

const card: React.CSSProperties = {
  background: "var(--ui-card-bg)",
  borderRadius: 14,
  padding: 10,
  marginBottom: 8,
};

const chip: React.CSSProperties = {
  fontSize: 12,
  borderRadius: 999,
  padding: "3px 8px",
  background: "rgba(59,130,246,0.2)",
  border: "1px solid rgba(59,130,246,0.35)",
};

const desc: React.CSSProperties = {
  margin: "6px 0",
  color: "var(--ui-text-muted)",
  fontSize: 13,
};

const metaRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  fontSize: 12,
  color: "var(--ui-text-muted)",
  marginTop: 3,
};

const actions: React.CSSProperties = {
  marginTop: 8,
  display: "flex",
  gap: 8,
};

const actionBtn: React.CSSProperties = {
  flex: 1,
  minHeight: 38,
  borderRadius: 10,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-btn-bg)",
  color: "var(--ui-btn-text)",
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  ...actionBtn,
  border: "1px solid rgba(239,68,68,0.5)",
  color: "#fecaca",
  background: "rgba(239,68,68,0.16)",
};

const emptyText: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "var(--ui-text-muted)",
};

const errorCard: React.CSSProperties = {
  margin: "0 0 10px",
  padding: "10px",
  borderRadius: 12,
  border: "1px solid rgba(248,113,113,0.45)",
  background: "rgba(127,29,29,0.25)",
  color: "#fecaca",
};
