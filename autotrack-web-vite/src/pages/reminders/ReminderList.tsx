import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createHoverHandlers } from "../../utils/uiHandlers";
import { apiGet } from "../../services/api";
import {
  completeReminder,
  deleteReminder,
  getVehicleReminders,
} from "../../services/reminders";
import type { Reminder } from "../../types/Reminder";
import { CreateReminderModal } from "../../components/CreateReminderModal";
import { getReminderTypeKey } from "../../types/enums/ReminderType";
import { getReminderGroup } from "../../utils/reminders";

type GroupedReminders = {
  overdue: Reminder[];
  upcoming: Reminder[];
  completed: Reminder[];
};

type VehicleInfo = {
  id: number;
  brand?: string;
  model?: string;
  licensePlate?: string;
};

type Entry = {
  odometerKm?: number;
  odometer?: number;
  mileageKm?: number;
  mileage?: number;
  kilometers?: number;
  km?: number;
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
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [currentMileage, setCurrentMileage] = useState(0);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);

  const loadReminders = async () => {
    if (!Number.isFinite(vId)) return;

    setLoading(true);
    setError(null);

    try {
      const [data, entries] = await Promise.all([
        getVehicleReminders(vId),
        apiGet<Entry[]>(`entries/vehicle/${vId}`).catch(() => [] as Entry[]),
      ]);

      const vehicle = await apiGet<VehicleInfo>(`vehicles/${vId}`).catch(() => null);

      setReminders(data);
      setVehicleInfo(vehicle);

      const maxMileage = entries
        .flatMap((entry) => [
          entry.odometerKm,
          entry.odometer,
          entry.mileageKm,
          entry.mileage,
          entry.kilometers,
          entry.km,
        ])
        .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

      setCurrentMileage(maxMileage.length ? Math.max(...maxMileage) : 0);
    } catch (err: any) {
      setError(err?.response?.data || err?.message || t("loadReminderError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [vId]);

  const grouped = useMemo<GroupedReminders>(() => {
    const now = new Date();

    const overdue: Reminder[] = [];
    const upcoming: Reminder[] = [];
    const completed: Reminder[] = [];

    for (const r of reminders) {
      const group = getReminderGroup(r, currentMileage, now);
      if (group === "completed") {
        completed.push(r);
        continue;
      }

      if (group === "overdue") {
        overdue.push(r);
      } else {
        upcoming.push(r);
      }
    }

    const sortByDueDateAndKm = (left: Reminder, right: Reminder) => {
      const leftDate = left.dueDate
        ? new Date(left.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const rightDate = right.dueDate
        ? new Date(right.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;

      if (leftDate !== rightDate) return leftDate - rightDate;

      const leftKm =
        typeof left.dueKm === "number"
          ? Math.max(left.dueKm - currentMileage, 0)
          : Number.MAX_SAFE_INTEGER;
      const rightKm =
        typeof right.dueKm === "number"
          ? Math.max(right.dueKm - currentMileage, 0)
          : Number.MAX_SAFE_INTEGER;
      return leftKm - rightKm;
    };

    overdue.sort(sortByDueDateAndKm);
    upcoming.sort(sortByDueDateAndKm);
    completed.sort(sortByDueDateAndKm);

    return { overdue, upcoming, completed };
  }, [currentMileage, reminders]);

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

      {!error && reminders.length === 0 && (
        <div style={emptyStateCard}>
          <p style={{ margin: "0 0 8px" }}>{t("noRemindersCreated")}</p>
          <button type="button" style={newBtn} onClick={() => setOpenCreate(true)}>
            {t("createReminder")}
          </button>
        </div>
      )}

      <ReminderGroup
        title={t("overdue")}
        reminders={grouped.overdue}
        tone="danger"
        currentMileage={currentMileage}
        vehicleInfo={vehicleInfo}
        onComplete={onComplete}
        onDelete={onDelete}
        onEdit={(reminder) => setEditingReminder(reminder)}
      />
      <ReminderGroup
        title={t("upcoming")}
        reminders={grouped.upcoming}
        tone="info"
        currentMileage={currentMileage}
        vehicleInfo={vehicleInfo}
        onComplete={onComplete}
        onDelete={onDelete}
        onEdit={(reminder) => setEditingReminder(reminder)}
      />
      <ReminderGroup
        title={t("completed")}
        reminders={grouped.completed}
        tone="neutral"
        currentMileage={currentMileage}
        vehicleInfo={vehicleInfo}
        onDelete={onDelete}
        onEdit={(reminder) => setEditingReminder(reminder)}
      />

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

      <CreateReminderModal
        open={!!editingReminder}
        vehicleId={vId}
        initialReminder={editingReminder}
        onClose={() => setEditingReminder(null)}
        onUpdated={(updated) =>
          setReminders((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
        }
      />
    </div>
  );
}

function ReminderGroup({
  title,
  reminders,
  tone,
  currentMileage,
  vehicleInfo,
  onComplete,
  onDelete,
  onEdit,
}: {
  title: string;
  reminders: Reminder[];
  tone: "danger" | "info" | "neutral";
  currentMileage: number;
  vehicleInfo: VehicleInfo | null;
  onComplete?: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit?: (reminder: Reminder) => void;
}) {
  const { t } = useTranslation();
  const now = Date.now();

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
            <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>{getReminderIcon(getReminderTypeKey(r.reminderType))}</span>
              <span>{r.title}</span>
            </strong>
            <span style={{ ...chip, ...(tone === "danger" ? overdueBadge : tone === "info" ? upcomingBadge : completedBadge) }}>
              {tone === "danger" ? t("overdue") : tone === "info" ? t("upcoming") : t("completed")}
            </span>
          </div>

          {vehicleInfo && (
            <div style={vehicleLine}>
              🚗 {(vehicleInfo.brand || "").trim()} {(vehicleInfo.model || "").trim()} • {vehicleInfo.licensePlate || t("notAvailable")}
            </div>
          )}

          {r.description && <p style={desc}>{r.description}</p>}

          <div style={metaRow}>
            <span>{t("dueDate")}: {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : t("notAvailable")}</span>
            <span>{t("dueKm")}: {r.dueKm ?? t("notAvailable")}</span>
          </div>

          <div style={metaRow}>
            <span>{t("notifyBeforeDays")}: {r.notifyBeforeDays ?? 0}</span>
            <span>{t("notifyBeforeKm")}: {r.notifyBeforeKm ?? 0}</span>
          </div>

          {!r.isCompleted && (
            <div style={statusWrap}>
              {(() => {
                const dueDateMs = r.dueDate ? new Date(r.dueDate).getTime() : null;
                if (dueDateMs == null) return null;

                const dayDelta = Math.ceil((dueDateMs - now) / 86400000);
                return dayDelta >= 0 ? (
                  <span style={statusGood}>{dayDelta} {t("days")} {t("remaining")}</span>
                ) : (
                  <span style={statusOverdue}>{t("overdueBy")} {Math.abs(dayDelta)} {t("days")}</span>
                );
              })()}

              {(() => {
                if (typeof r.dueKm !== "number") return null;
                const kmDelta = r.dueKm - currentMileage;

                return kmDelta >= 0 ? (
                  <span style={statusGood}>{new Intl.NumberFormat("en-US").format(kmDelta)} km {t("remaining")}</span>
                ) : (
                  <span style={statusOverdue}>{t("overdueBy")} {new Intl.NumberFormat("en-US").format(Math.abs(kmDelta))} km</span>
                );
              })()}
            </div>
          )}

          <div style={actions}>
            {!r.isCompleted && onComplete && (
              <button type="button" style={actionBtn} onClick={() => onComplete(r.id)}>
                {t("complete")}
              </button>
            )}

            {!r.isCompleted && onEdit && (
              <button
                type="button"
                style={actionBtn}
                onClick={() => onEdit(r)}
              >
                {t("edit")}
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

function getReminderIcon(typeKey: string) {
  if (typeKey.includes("Oil")) return "🛢";
  if (typeKey.includes("Tire")) return "🛞";
  if (typeKey.includes("Brake")) return "🛑";
  if (typeKey.includes("Insurance") || typeKey.includes("Registration")) return "📄";
  if (typeKey.includes("Vignette") || typeKey.includes("RoadTax")) return "🪪";
  if (typeKey.includes("Service") || typeKey.includes("Filter") || typeKey.includes("Coolant") || typeKey.includes("Transmission")) return "🔧";
  if (typeKey.includes("Battery")) return "🔋";
  return "🔔 Other";
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

const overdueBadge: React.CSSProperties = {
  background: "rgba(239,68,68,0.25)",
  border: "1px solid rgba(239,68,68,0.5)",
  color: "#fecaca",
};

const upcomingBadge: React.CSSProperties = {
  background: "rgba(250,204,21,0.22)",
  border: "1px solid rgba(234,179,8,0.45)",
  color: "#fde68a",
};

const completedBadge: React.CSSProperties = {
  background: "rgba(34,197,94,0.22)",
  border: "1px solid rgba(34,197,94,0.45)",
  color: "#bbf7d0",
};

const desc: React.CSSProperties = {
  margin: "6px 0",
  color: "var(--ui-text-muted)",
  fontSize: 13,
};

const vehicleLine: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  color: "var(--ui-text-muted)",
  fontWeight: 600,
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

const statusWrap: React.CSSProperties = {
  marginTop: 6,
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const statusGood: React.CSSProperties = {
  fontSize: 12,
  padding: "2px 7px",
  borderRadius: 999,
  border: "1px solid rgba(34,197,94,0.45)",
  background: "rgba(34,197,94,0.18)",
  color: "#bbf7d0",
};

const statusOverdue: React.CSSProperties = {
  ...statusGood,
  border: "1px solid rgba(239,68,68,0.45)",
  background: "rgba(239,68,68,0.2)",
  color: "#fecaca",
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

const emptyStateCard: React.CSSProperties = {
  marginBottom: 10,
  padding: "12px",
  borderRadius: 12,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-card-bg)",
  textAlign: "center",
};
