import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHoverHandlers } from "../utils/uiHandlers";
import { useTranslation } from "react-i18next";
import { storeVehicleId } from "../utils/vehicleSession";
  
type Props = {
  vehicle: any;
  onDelete: (id: number) => void;
};

export function VehicleCard({ vehicle, onDelete }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentMileage =
    vehicle.currentMileageKm ??
    vehicle.currentMileage ??
    vehicle.odometerKm ??
    vehicle.odometer ??
    vehicle.mileageKm ??
    vehicle.mileage;

  const mileageText =
    typeof currentMileage === "number" && Number.isFinite(currentMileage)
      ? `${new Intl.NumberFormat("en-US").format(currentMileage)} km`
      : "N/A";

  const upcomingEvent =
    vehicle.upcomingEvent ??
    vehicle.upcomingNotification ??
    vehicle.nextEventTitle ??
    (vehicle.nextDueDate ? `Due on ${new Date(vehicle.nextDueDate).toLocaleDateString()}` : null) ??
    (vehicle.nextDueKm ? `Due at ${vehicle.nextDueKm} km` : null) ??
    "No upcoming event";

  const goTo = (path: string) => {
    storeVehicleId(vehicle.id);
    navigate(path);
  };

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div
      style={selected ? selectedCard : card}
      onClick={() => {
        setSelected((prev) => !prev);
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

          <div ref={menuRef} style={menuWrap} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              style={menuBtn}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(true);
                setMenuOpen((prev) => !prev);
              }}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open actions"
            >
              <span style={dot} />
              <span style={dot} />
              <span style={dot} />
            </button>

            {menuOpen && (
              <div style={menuDropdown} role="menu">
                <button
                  type="button"
                  style={menuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setMenuOpen(false);
                    goTo(`/vehicles/edit/${vehicle.id}`);
                  }}
                >
                  {t("edit")}
                </button>

                <button
                  type="button"
                  style={menuDangerItem}
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
          </div>
        </div>

        <div style={infoGrid}>
          <InfoItem label="Plate" value={vehicle.licensePlate || "N/A"} />
          <InfoItem label="Year" value={String(vehicle.year || "N/A")} />
          <InfoItem label="Current mileage" value={mileageText} />
          <InfoItem label="Upcoming event" value={upcomingEvent} />
        </div>

        {!selected && (
          <p style={hintText}>Tap card to show actions</p>
        )}
      </div>

      {/* ✅ separator */}
      {selected && <div style={divider} />}

      {/* ✅ Primary actions */}
      {selected && (
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
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoItem}>
      <span style={infoLabel}>{label}</span>
      <span style={infoValue} title={value}>{value}</span>
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
  marginTop: 10
};

const baseBtn: React.CSSProperties = {
  flex: 1,
  padding: "10px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  minHeight: 42,
  transition: "all 0.2s"
};

// const primaryBtn: React.CSSProperties = {
//   ...baseBtn,
//   background: "linear-gradient(135deg, #3b82f6, #2563eb)",
//   color: "white"
// };

const secondaryBtn: React.CSSProperties = {
  ...baseBtn,
  background: "var(--ui-btn-bg)",
  color: "var(--ui-btn-text)",
  border: "1px solid var(--ui-btn-border)",
};

const menuWrap: React.CSSProperties = {
  position: "relative",
  zIndex: 80,
  flexShrink: 0,
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

const dot: React.CSSProperties = {
  width: 4,
  height: 4,
  borderRadius: "50%",
  background: "var(--ui-btn-text)",
};

const menuDropdown: React.CSSProperties = {
  position: "absolute",
  bottom: "calc(100% + 6px)",
  right: 0,
  minWidth: 130,
  borderRadius: 12,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-card-bg)",
  boxShadow: "var(--ui-shadow)",
  overflow: "hidden",
  zIndex: 120,
};

const menuItem: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  border: "none",
  borderBottom: "1px solid var(--ui-btn-border)",
  background: "transparent",
  color: "var(--ui-text-main)",
  cursor: "pointer",
  fontSize: 14,
};

const menuDangerItem: React.CSSProperties = {
  ...menuItem,
  borderBottom: "none",
  color: "#ef4444",
};


