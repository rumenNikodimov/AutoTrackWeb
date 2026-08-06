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
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = isSelected
          ? "0 20px 40px rgba(37,99,235,0.28)"
          : "0 12px 28px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = isSelected
          ? "0 16px 30px rgba(37,99,235,0.2)"
          : "var(--ui-shadow)";
      }}
    >
      {/* ── Title row ── */}
      <div style={titleRow}>
        <span style={vehicleName}>{vehicle.brand} {vehicle.model}</span>
        {vehicle.year && <span style={yearBadge}>{vehicle.year}</span>}
      </div>

      {/* ── Stats row: plate + mileage ── */}
      <div style={statsRow}>
        <div style={statChip}>
          <span style={statIcon}>🪪</span>
          <span style={statValue}>{vehicle.licensePlate || t("notAvailable")}</span>
        </div>
        <div style={statChip}>
          <span style={statIcon}>🛣</span>
          <span style={statValue}>{mileageText}</span>
        </div>
      </div>

      {/* ── Reminders row ── */}
      <div style={remindersRow}>
        <span style={remLabel}>{t("reminders")}</span>
        <div style={badgesGroup}>
          <span style={overdueCount > 0 ? badgeRed : badgeNeutral}>🔴 {overdueCount}</span>
          <span style={upcomingCount > 0 ? badgeYellow : badgeNeutral}>🟡 {upcomingCount}</span>
          <span style={completedCount > 0 ? badgeGreen : badgeNeutral}>✅ {completedCount}</span>
        </div>
      </div>

      {/* ── Next reminder ── */}
      <div style={nextReminderRow}>
        <span style={nextRemTitle} title={nextReminderTitle}>
          {nextReminderTitle}
        </span>
        {nextReminderSubline !== t("none") && (
          <span style={nextReminderSub}>{nextReminderSubline}</span>
        )}
      </div>

      {!isSelected && (
        <p style={hintText}>{t("tapCardToShowActions")}</p>
      )}

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

/* ✅ styles */

const card: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  background: "var(--ui-card-bg)",
  padding: "16px 18px",
  borderRadius: 20,
  border: "1px solid var(--ui-card-border)",
  marginBottom: 14,
  boxShadow: "var(--ui-shadow)",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  cursor: "default",
  backdropFilter: "blur(12px)",
};

const selectedCard: React.CSSProperties = {
  ...card,
  border: "1px solid rgba(59,130,246,0.5)",
  boxShadow: "0 16px 30px rgba(37,99,235,0.2)",
};

/* Title row */
const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const vehicleName: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 800,
  color: "var(--ui-text-main)",
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
};

const yearBadge: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--ui-text-muted)",
  background: "rgba(148,163,184,0.12)",
  border: "1px solid rgba(148,163,184,0.2)",
  borderRadius: 8,
  padding: "3px 10px",
  flexShrink: 0,
};

/* Stats row */
const statsRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 10,
};

const statChip: React.CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "rgba(15,23,42,0.25)",
  border: "1px solid var(--ui-btn-border)",
  borderRadius: 12,
  padding: "8px 12px",
};

const statIcon: React.CSSProperties = {
  fontSize: 14,
  flexShrink: 0,
};

const statValue: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--ui-text-main)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/* Reminders */
const remindersRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 6,
  padding: "6px 10px",
  borderRadius: 10,
  background: "rgba(15,23,42,0.2)",
  border: "1px solid var(--ui-btn-border)",
};

const remLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--ui-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const badgesGroup: React.CSSProperties = {
  display: "flex",
  gap: 6,
};

const baseBadge: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: 20,
};

const badgeNeutral: React.CSSProperties = {
  ...baseBadge,
  color: "var(--ui-text-muted)",
  background: "rgba(148,163,184,0.1)",
};

const badgeRed: React.CSSProperties = {
  ...baseBadge,
  color: "#fca5a5",
  background: "rgba(239,68,68,0.15)",
};

const badgeYellow: React.CSSProperties = {
  ...baseBadge,
  color: "#fde68a",
  background: "rgba(245,158,11,0.15)",
};

const badgeGreen: React.CSSProperties = {
  ...baseBadge,
  color: "#86efac",
  background: "rgba(34,197,94,0.15)",
};

/* Next reminder */
const nextReminderRow: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: 6,
  marginBottom: 4,
  paddingLeft: 2,
};

const nextRemTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--ui-text-main)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "60%",
};

const nextReminderSub: React.CSSProperties = {
  fontSize: 11,
  color: "var(--ui-text-muted)",
  whiteSpace: "nowrap",
};

const hintText: React.CSSProperties = {
  marginTop: 8,
  fontSize: 11,
  color: "var(--ui-text-muted)",
  textAlign: "center",
  letterSpacing: "0.02em",
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
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  lineHeight: 1.1,
  transition: "all 0.18s",
};

const secondaryBtn: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(180deg, rgba(51,65,85,0.72), rgba(30,41,59,0.72))",
  color: "var(--ui-btn-text)",
  border: "1px solid rgba(148,163,184,0.3)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
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
  width: 44,
  minWidth: 44,
  height: 44,
  flex: "0 0 auto",
  border: "1px solid rgba(148,163,184,0.35)",
  background: "linear-gradient(180deg, rgba(59,130,246,0.18), rgba(30,64,175,0.16))",
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
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: 12,
  textAlign: "center",
};

const inlineEditBtn: React.CSSProperties = {
  ...inlineActionBtn,
};

const inlineDeleteBtn: React.CSSProperties = {
  ...inlineActionBtn,
  color: "#fecaca",
  border: "1px solid rgba(239,68,68,0.5)",
  background: "linear-gradient(180deg, rgba(239,68,68,0.18), rgba(185,28,28,0.12))",
};


