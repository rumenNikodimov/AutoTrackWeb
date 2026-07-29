import { useLocation, useNavigate } from "react-router-dom";
import { getStoredVehicleId } from "../utils/vehicleSession";

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathVehicleId = location.pathname.split("/")[2];
  const vehicleId = pathVehicleId || getStoredVehicleId() || "1";

  return (
    <div style={barWrap}>
      <div style={bar}>
      <NavBtn
        active={location.pathname === "/vehicles"}
        label="Garage"
        onClick={() => navigate("/vehicles")}
      >
        <GarageIcon />
      </NavBtn>

      <NavBtn
        active={location.pathname.includes("/entries")}
        label="History"
        onClick={() =>
          navigate(`/vehicles/${vehicleId}/entries`)
        }
      >
        <HistoryIcon />
      </NavBtn>

      <NavBtn highlight label="Add" onClick={() => navigate(`/vehicles/${vehicleId}/entries/add`)}>
        <AddIcon />
      </NavBtn>

      <NavBtn
        active={location.pathname.includes("/dashboard")}
        label="Insights"
        onClick={() =>
          navigate(`/vehicles/${vehicleId}/dashboard`)
        }
      >
        <InsightsIcon />
      </NavBtn>

      <NavBtn
        active={location.pathname.includes("/reminders")}
        label="Reminders"
        onClick={() => navigate(`/vehicles/${vehicleId}/reminders`)}
      >
        <BellIcon />
      </NavBtn>

      <NavBtn
        active={location.pathname.includes("/vehicles/edit")}
        label="Profile"
        onClick={() => navigate(`/vehicles/edit/${vehicleId}`)}
      >
        <ProfileIcon />
      </NavBtn>
      </div>
    </div>
  );
}

function NavBtn({
  children,
  label,
  onClick,
  active = false,
  highlight = false
}: any) {
  return (
    <button
      onClick={onClick}
      style={highlight ? addBtn : active ? activeBtn : navBtn}
    >
      <span style={iconWrap}>{children}</span>
      <span style={labelText}>{label}</span>
    </button>
  );
}

const barWrap: React.CSSProperties = {
  position: "fixed" as const,
  bottom: 0,
  left: 0,
  right: 0,
  padding: "0 12px calc(10px + env(safe-area-inset-bottom))",
  zIndex: 40,
};

const bar: React.CSSProperties = {
  maxWidth: 460,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 6,
  padding: "10px 8px",
  borderRadius: 26,
  background: "linear-gradient(180deg, rgba(17,24,39,0.94), rgba(10,15,28,0.96))",
  border: "1px solid rgba(148,163,184,0.18)",
  boxShadow: "0 18px 34px rgba(2,6,23,0.62)",
  backdropFilter: "blur(16px)",
};

const navBtn: React.CSSProperties = {
  flex: 1,
  minHeight: 58,
  borderRadius: 16,
  border: "none",
  background: "transparent",
  color: "#94a3b8",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  fontSize: 12,
};

const activeBtn: React.CSSProperties = {
  ...navBtn,
  background: "rgba(51,65,85,0.65)",
  color: "#f8fafc",
};

const addBtn: React.CSSProperties = {
  ...navBtn,
  minHeight: 70,
  marginTop: -18,
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  boxShadow: "0 12px 28px rgba(37,99,235,0.55)",
};

const iconWrap: React.CSSProperties = {
  width: 20,
  height: 20,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const labelText: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1,
};

function GarageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19h16" />
      <path d="M7 15v-4" />
      <path d="M12 15V8" />
      <path d="M17 15v-7" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 9a6 6 0 0 1 12 0v4l2 3H4l2-3V9" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

