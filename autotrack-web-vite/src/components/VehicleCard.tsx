
import React from "react";
import { useNavigate } from "react-router-dom";
import { createHoverHandlers } from "../utils/uiHandlers";

type Props = {
  vehicle: any;
  onDelete: (id: number) => void;
};

export function VehicleCard({ vehicle, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div style={card}>
      {/* ✅ Info */}
      <div style={{ marginBottom: 12 }}>
        <div style={title}>
          {vehicle.brand} {vehicle.model}
        </div>

        <div style={meta}>Plate: {vehicle.licensePlate}</div>

        <div style={metaSecondary}>Year: {vehicle.year}</div>
      </div>

      {/* ✅ separator */}
      <div style={divider} />

      {/* ✅ Primary actions */}
      <div style={row}>
        <button
          {...createHoverHandlers("rgba(59,130,246,0.6)")}
          style={primaryBtn}
          onClick={() =>
            navigate(`/vehicles/${vehicle.id}/dashboard`)
          }
        >
          📊 Dashboard
        </button>

        <button
          {...createHoverHandlers("rgba(16,185,129,0.6)")}
          style={primaryBtn}
          onClick={() =>
            navigate(`/vehicles/${vehicle.id}/fuel/add`)
          }
        >
          ➕ Add fuel
        </button>
      </div>

      {/* ✅ Secondary actions */}
      <div style={row}>
        <button
          {...createHoverHandlers("rgba(107,114,128,0.6)")}
          style={secondaryBtn}
          onClick={() =>
            navigate(`/vehicles/${vehicle.id}/fuel`)
          }
        >
          ⛽ Fuel log
        </button>

        <button
          {...createHoverHandlers("rgba(107,114,128,0.6)")}
          style={secondaryBtn}
          onClick={() =>
            navigate(`/vehicles/edit/${vehicle.id}`)
          }
        >
          ✏️ Edit
        </button>

        <button
          {...createHoverHandlers("rgba(239,68,68,0.6)")}
          style={dangerBtn}
          onClick={() => onDelete(vehicle.id)}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}


/* ✅ styles */


const card: React.CSSProperties = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 16,
  marginBottom: 16,
  boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
  transition: "all 0.2s",
  cursor: "pointer"
};

const title: React.CSSProperties = {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 4
};

const meta: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.8
};

const metaSecondary: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.6
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

const primaryBtn: React.CSSProperties = {
  ...baseBtn,
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white"
};

const secondaryBtn: React.CSSProperties = {
  ...baseBtn,
  background: "#334155",
  color: "white"
};

const dangerBtn: React.CSSProperties = {
  ...baseBtn,
  background: "#ef4444",
  color: "white"
};

