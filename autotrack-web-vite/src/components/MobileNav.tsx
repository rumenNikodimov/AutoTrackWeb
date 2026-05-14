
import { useNavigate, useLocation } from "react-router-dom";

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const vehicleId = location.pathname.split("/")[2] || "1";

  return (
    <div style={bar}>
      <NavBtn
        active={location.pathname === "/vehicles"}
        onClick={() => navigate("/vehicles")}
      >
        🚗
      </NavBtn>

      <NavBtn
        active={location.pathname.includes("/dashboard")}
        onClick={() =>
          navigate(`/vehicles/${vehicleId}/dashboard`)
        }
      >
        📊
      </NavBtn>

      <NavBtn highlight onClick={() => navigate("/vehicles/add")}>
        ➕
      </NavBtn>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  active = false,
  highlight = false
}: any) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 50,
        height: 50,
        borderRadius: "50%",
        border: "none",
        background: highlight
          ? "#3b82f6"
          : active
          ? "#475569"
          : "#1e293b",
        color: "white",
        fontSize: 20
      }}
    >
      {children}
    </button>
  );
}

const bar = {
  position: "fixed" as const,
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "space-around",
  padding: "10px 0",
  background: "#0f172a"
};
