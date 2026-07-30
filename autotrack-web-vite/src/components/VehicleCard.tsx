import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHoverHandlers } from "../utils/uiHandlers";
import { useTranslation } from "react-i18next";
import { storeVehicleId } from "../utils/vehicleSession";
import { CreateReminderModal } from "./CreateReminderModal";
import type { Reminder, ReminderPreview, VehicleReminderSummary } from "../types/Reminder";
import { getReminderGroup } from "../utils/reminders";
  
type Props = {
  vehicle: {
    id: number;
    brand?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    currentMileageKm?: number;
    currentMileage?: number;
    current_mileage?: number;
    currentMileageKM?: number;
    odometerKm?: number;
    odometer?: number;
    mileageKm?: number;
    mileage?: number;
    kilometers?: number;
    km?: number;
    entries?: Array<Record<string, unknown>>;
    vehicleEntries?: Array<Record<string, unknown>>;
    history?: Array<Record<string, unknown>>;
    reminderSummary?: VehicleReminderSummary;
    nextReminder?: ReminderPreview | null;
    reminders?: Reminder[];
  };
  onDelete: (id: number) => void;
  isSelected: boolean;
  onSelect: () => void;
};

export function VehicleCard({ vehicle, onDelete, isSelected, onSelect }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createReminderOpen, setCreateReminderOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const toMileageNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const normalized = value.replace(/,/g, "").trim();
      const numeric = Number(normalized);
      return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
  };

  const topLevelMileageCandidates = [
    vehicle.currentMileageKm,
    vehicle.currentMileage,
    vehicle.current_mileage,
    vehicle.currentMileageKM,
    vehicle.odometerKm,
    vehicle.odometer,
    vehicle.mileageKm,
    vehicle.mileage,
    vehicle.kilometers,
    vehicle.km,
  ];

  const entryCollections = [vehicle.entries, vehicle.vehicleEntries, vehicle.history]
    .filter(Array.isArray)
    .flat() as Array<Record<string, unknown>>;

  const entryMileageCandidates = entryCollections.flatMap((entry) => [
    entry.odometerKm,
    entry.odometer,
    entry.mileageKm,
    entry.mileage,
    entry.kilometers,
    entry.km,
  ]);

  const allMileageValues = [...topLevelMileageCandidates, ...entryMileageCandidates]
    .map(toMileageNumber)
    .filter((value): value is number => value !== null);

  const highestMileage =
    allMileageValues.length > 0 ? Math.max(...allMileageValues) : null;

  const mileageText =
    typeof highestMileage === "number"
      ? `${new Intl.NumberFormat("en-US").format(highestMileage)} km`
      : t("notAvailable");

  const summary = vehicle.reminderSummary;
  const fallbackReminders = (vehicle.reminders ?? []).filter((r) => !r.isCompleted);
  const fallbackOverdueCount = fallbackReminders.filter(
    (r) => getReminderGroup(r, highestMileage ?? 0) === "overdue"
  ).length;
  const fallbackUpcomingCount = fallbackReminders.filter(
    (r) => getReminderGroup(r, highestMileage ?? 0) === "upcoming"
  ).length;
  const fallbackCompletedCount = (vehicle.reminders ?? []).filter((r) => r.isCompleted).length;

  const overdueCount = summary?.overdueCount ?? fallbackOverdueCount;
  const upcomingCount = summary?.upcomingCount ?? fallbackUpcomingCount;
  const completedCount = summary?.completedCount ?? fallbackCompletedCount;
  const nextReminder = vehicle.nextReminder ?? summary?.nextReminder ?? fallbackReminders[0] ?? null;

  const nextReminderTitle = nextReminder?.title || t("noRemindersCreated");
  const nextReminderRemainingKm =
    nextReminder && "remainingKm" in nextReminder && typeof nextReminder.remainingKm === "number"
      ? nextReminder.remainingKm
      : null;
  const nextReminderRemainingDays =
    nextReminder && "remainingDays" in nextReminder && typeof nextReminder.remainingDays === "number"
      ? nextReminder.remainingDays
      : null;

  const nextReminderSubline = nextReminder
    ? typeof nextReminderRemainingKm === "number"
      ? `${new Intl.NumberFormat("en-US").format(Math.max(nextReminderRemainingKm, 0))} km ${t("remaining")}`
      : typeof nextReminder.dueKm === "number" && typeof highestMileage === "number"
      ? `${new Intl.NumberFormat("en-US").format(Math.max(nextReminder.dueKm - highestMileage, 0))} km ${t("remaining")}`
      : typeof nextReminderRemainingDays === "number"
      ? `${Math.max(nextReminderRemainingDays, 0)} ${t("days")} ${t("remaining")}`
      : nextReminder.dueDate
      ? new Date(nextReminder.dueDate).toLocaleDateString()
      : t("notAvailable")
    : t("none");

  const goTo = (path: string) => {
    storeVehicleId(vehicle.id);
    navigate(path);
  };

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!isSelected) {
      setMenuOpen(false);
    }
  }, [isSelected]);

  return (
    <div
      ref={cardRef}
      style={isSelected ? selectedCard : card}
      onClick={() => {
        onSelect();
        setMenuOpen(false);
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ marginBottom: 12, flex: 1 }}>
        <div style={topRow}>
          <div style={title}>
            {vehicle.brand} {vehicle.model}
          </div>
        </div>

        <div style={infoGrid}>
          <InfoItem label={t("licensePlate")} value={vehicle.licensePlate || t("notAvailable")} />
          <InfoItem label={t("year")} value={String(vehicle.year || t("notAvailable"))} />
          <InfoItem label={`${t("currentMileage")} |`} value={mileageText} />
          <InfoItem
            label={t("reminders")}
            value={
              <div style={reminderList}>
                <span style={reminderSummaryLine}>🔴 {overdueCount}</span>
                <span style={reminderSummaryLine}>🟡 {upcomingCount}</span>
                <span style={reminderSummaryLine}>✅ {completedCount} {t("completed")}</span>
                <span style={reminderLine} title={nextReminderTitle}>{nextReminderTitle}</span>
                <span style={reminderSubLine}>{nextReminderSubline}</span>
              </div>
            }
          />
        </div>

        {!isSelected && (
          <p style={hintText}>{t("tapCardToShowActions")}</p>
        )}
      </div>

      {/* ✅ separator */}
      {isSelected && <div style={divider} />}

      {/* ✅ Primary actions */}
      {isSelected && (
        <>
          <div style={row}>
            <button
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              style={secondaryBtn}
              onClick={(e) => {
                e.stopPropagation();
                goTo(`/vehicles/${vehicle.id}/dashboard`);
              }}
            >
              {t("dashboard")}
            </button>

            <button
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              style={secondaryBtn}
              onClick={(e) => {
                e.stopPropagation();
                goTo(`/vehicles/${vehicle.id}/entries/add`);
              }}
            >
              {t("addEntry")}
            </button>

            <button
              type="button"
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              style={secondaryBtn}
              onClick={(e) => {
                e.stopPropagation();
                goTo(`/vehicles/${vehicle.id}/entries`);
              }}
            >
              {t("entryLog")}
            </button>

            <button
              type="button"
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              style={secondaryBtn}
              onClick={(e) => {
                e.stopPropagation();
                goTo(`/vehicles/${vehicle.id}/reminders`);
              }}
            >
              {t("reminders")}
            </button>

            <button
              type="button"
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              style={secondaryBtn}
              onClick={(e) => {
                e.stopPropagation();
                setCreateReminderOpen(true);
              }}
            >
              {t("createReminder")}
            </button>

            <button
              type="button"
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              style={menuBtnInRow}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label={t("openActions")}
            >
              <span style={dot} />
              <span style={dot} />
              <span style={dot} />
            </button>
          </div>

          {menuOpen && (
            <div style={inlineMenuRow} role="menu" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                style={inlineEditBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  goTo(`/vehicles/edit/${vehicle.id}`);
                }}
              >
                {t("edit")}
              </button>

              <button
                type="button"
                style={inlineDeleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(vehicle.id);
                }}
              >
                {t("delete")}
              </button>
            </div>
          )}
        </>
      )}

      <CreateReminderModal
        open={createReminderOpen}
        vehicleId={vehicle.id}
        onClose={() => setCreateReminderOpen(false)}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={infoItem}>
      <span style={infoLabel}>{label}</span>
      {typeof value === "string" ? (
        <span style={infoValue} title={value}>{value}</span>
      ) : (
        <div style={infoNodeValue}>{value}</div>
      )}
    </div>
  );
}


/* ✅ styles */


const card: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  background: "var(--ui-card-bg)",
  padding: 18,
  borderRadius: 20,
  border: "1px solid var(--ui-card-border)",
  marginBottom: 16,
  boxShadow: "var(--ui-shadow)",
  transition: "all 0.2s",
  cursor: "default",
  backdropFilter: "blur(10px)",
};

const selectedCard: React.CSSProperties = {
  ...card,
  border: "1px solid rgba(59,130,246,0.45)",
  boxShadow: "0 16px 30px rgba(37,99,235,0.2)",
};

const title: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--ui-text-main)",
  marginBottom: 0,
  textAlign: "left",
  lineHeight: 1.2,
  flex: 1,
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 10,
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  marginTop: 10,
};

const infoItem: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid var(--ui-btn-border)",
  background: "rgba(15,23,42,0.18)",
  minHeight: 48,
};

const infoLabel: React.CSSProperties = {
  fontSize: 11,
  color: "var(--ui-text-muted)",
  marginBottom: 2,
  textAlign: "center",
};

const infoValue: React.CSSProperties = {
  fontSize: 13,
  color: "var(--ui-text-main)",
  fontWeight: 600,
  textAlign: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "100%",
};

const infoNodeValue: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
};

const reminderList: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  alignItems: "center",
};

const reminderLine: React.CSSProperties = {
  maxWidth: "100%",
  fontSize: 12,
  color: "var(--ui-text-main)",
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const reminderSummaryLine: React.CSSProperties = {
  ...reminderLine,
  fontSize: 11,
  fontWeight: 700,
};

const reminderSubLine: React.CSSProperties = {
  ...reminderLine,
  fontSize: 11,
  color: "var(--ui-text-muted)",
  fontWeight: 500,
};

const hintText: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: "var(--ui-text-muted)",
};

const divider: React.CSSProperties = {
  height: 1,
  background: "rgba(255,255,255,0.08)",
  margin: "14px 0"
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 10,
  flexWrap: "wrap",
};

const baseBtn: React.CSSProperties = {
  flex: "1 1 120px",
  minHeight: 46,
  padding: "11px 12px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontSize: 15,
  fontWeight: 600,
  lineHeight: 1.1,
  transition: "all 0.2s",
};

// const primaryBtn: React.CSSProperties = {
//   ...baseBtn,
//   background: "linear-gradient(135deg, #3b82f6, #2563eb)",
//   color: "white"
// };

const secondaryBtn: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(180deg, rgba(51,65,85,0.72), rgba(30,41,59,0.72))",
  color: "var(--ui-btn-text)",
  border: "1px solid rgba(148,163,184,0.38)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
};

const menuBtn: React.CSSProperties = {
  width: 44,
  height: 38,
  borderRadius: 12,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-btn-bg)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
};

const menuBtnInRow: React.CSSProperties = {
  ...menuBtn,
  width: 46,
  minWidth: 46,
  height: 46,
  borderRadius: 14,
  flex: "0 0 auto",
  border: "1px solid rgba(148,163,184,0.45)",
  background: "linear-gradient(180deg, rgba(59,130,246,0.22), rgba(30,64,175,0.2))",
};

const dot: React.CSSProperties = {
  width: 4,
  height: 4,
  borderRadius: "50%",
  background: "var(--ui-btn-text)",
};

const inlineMenuRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "stretch",
  gap: 8,
  marginTop: 8,
  marginBottom: 2,
  width: "100%",
};

const inlineActionBtn: React.CSSProperties = {
  ...secondaryBtn,
  flex: "1 1 120px",
  minWidth: 0,
  minHeight: 46,
  padding: "11px 12px",
  borderRadius: 12,
  textAlign: "center",
};

const inlineEditBtn: React.CSSProperties = {
  ...inlineActionBtn,
};

const inlineDeleteBtn: React.CSSProperties = {
  ...inlineActionBtn,
  color: "#fecaca",
  border: "1px solid rgba(239,68,68,0.55)",
  background: "linear-gradient(180deg, rgba(239,68,68,0.22), rgba(185,28,28,0.16))",
};


