import React from "react";
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

  return (
    <div
      style={card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={title}>
          {vehicle.brand} {vehicle.model}
        </div>

        <div style={meta}>Plate: {vehicle.licensePlate}</div>

        <div style={metaSecondary}>Year: {vehicle.year}</div>

        <div style={meta}>Current mileage: {mileageText}</div>

        <div style={metaSecondary}>Upcoming event: {upcomingEvent}</div>
      </div>

      {/* ✅ separator */}
      <div style={divider} />

      {/* ✅ Primary actions */}
      <div style={row}>
        <button
           {...createHoverHandlers("rgba(107,114,128,0.6)")}
          style={secondaryBtn}
          onClick={(e) => {
            e.stopPropagation();
            goTo(`/vehicles/${vehicle.id}/dashboard`)
          }}
        >
          {t("dashboard")}
        </button>

        <button
           {...createHoverHandlers("rgba(107,114,128,0.6)")}
          style={secondaryBtn}
          onClick={(e) => {
            e.stopPropagation();
            goTo(`/vehicles/${vehicle.id}/entries/add`)
          }}
        >
          {t("addEntry")}
        </button>
      </div>

      {/* ✅ Secondary actions */}
      <div style={row}>
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
          {...createHoverHandlers("rgba(107,114,128,0.6)")}
          style={secondaryBtn}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            goTo(`/vehicles/edit/${vehicle.id}`);
          }}
        >
          {t("edit")}
        </button>


        <button
          {...createHoverHandlers("rgba(239,68,68,0.6)")}
          style={dangerBtn}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(vehicle.id);
          }}
        >
          {t("delete")}
        </button>
      </div>
    </div>
  );
}


/* ✅ styles */


const card: React.CSSProperties = {
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

const title: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--ui-text-main)",
  marginBottom: 4
};

const meta: React.CSSProperties = {
  fontSize: 14,
  color: "var(--ui-text-muted)"
};

const metaSecondary: React.CSSProperties = {
  fontSize: 13,
  color: "var(--ui-text-muted)"
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

const dangerBtn: React.CSSProperties = {
  ...baseBtn,
  background: "#dc2626",
  color: "white"
};


