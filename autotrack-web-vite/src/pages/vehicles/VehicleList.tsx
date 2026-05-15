
import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { VehicleCard } from "../../components/VehicleCard";
import { createHoverHandlers } from "../../utils/uiHandlers";
import { useTranslation } from "react-i18next";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
};

type Props = {
  onLogout: () => void;
};

export function Vehicles({ onLogout }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDelete = async (id: number) => {
    const confirmed = confirm(t("deleteVehicleConfirm"));
    if (!confirmed) return;

    try {
      await apiDelete(`vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch {
      setError(t("deleteFailed"));
    }
  };

  useEffect(() => {
    apiGet<Vehicle[]>("vehicles")
      .then(setVehicles)
      .catch(() => setError(t("loadVehiclesError")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={container}>

      {/* ✅ Title */}
      <h2 style={{ textAlign: "center" }}>
        🚗 {t("vehicles")}
      </h2>

      {/* ✅ Loading / Error */}
      {loading && <p>{t("loading")}</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && vehicles.length === 0 && (
        <p>{t("noVehicles")}</p>
      )}

      {/* ✅ Cards */}
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onDelete={handleDelete}
        />
      ))}

      {/* ✅ Actions */}
      <div style={bottomActions}>
        <button
          {...createHoverHandlers("rgba(59,130,246,0.6)")}
          style={btn}
          onClick={onLogout}
        >
          {t("logout")}
        </button>

        <button
          {...createHoverHandlers("rgba(59,130,246,0.6)")}
          style={btn}
          onClick={() => navigate("/vehicles/add")}
        >
          ➕ {t("addVehicle")}
        </button>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  maxWidth: 500,
  margin: "20px auto",
  padding: "10px"
};

const bottomActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 20,
  justifyContent: "center",
  flexWrap: "wrap"
};

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "20px",
  border: "none",
  background: "#334155",
  color: "white",
  cursor: "pointer",
  minWidth: 100,
  fontWeight: 500
};
