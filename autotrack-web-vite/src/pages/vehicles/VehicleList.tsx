
import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "../../services/api";
import { useNavigate } from "react-router-dom";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  fuelType: number;
  engineVolume: number;
  vin: string | null;
};

type Props = {
  onLogout: () => void;
};

export function Vehicles({ onLogout }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  
  
const handleDelete = async (id: number) => {
  const confirmed = confirm(
    "Delete this vehicle? This will hide it but keep all fuel history."
  );

  if (!confirmed) return;
debugger
  try {
    await apiDelete(`vehicles/${id}`);

    setVehicles(prev => prev.filter(v => v.id !== id));
  } catch {
    alert("Failed to delete vehicle");
  }
};


  useEffect(() => {
    apiGet<Vehicle[]>("vehicles")
      .then(setVehicles)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Unexpected error")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "20px auto",
        padding: "10px"
      }}
    >
      <h2 style={{ textAlign: "center" }}>🚗 My Vehicles</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && vehicles.length === 0 && (
        <p>No vehicles found.</p>
      )}

      {/* ✅ Vehicle cards */}
      {vehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          style={{
            background: "#1e293b",
            padding: 15,
            borderRadius: 12,
            marginBottom: 15
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <strong>
              {vehicle.brand} {vehicle.model}
            </strong>
            <div style={{ fontSize: 14, opacity: 0.7 }}>
              {vehicle.year} • {vehicle.licensePlate}
            </div>
          </div>

          {/* ✅ Buttons */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap"
            }}
          >
            <button
              style={btn}
              onClick={() =>
                navigate(`/vehicles/${vehicle.id}/dashboard`)
              }
            >
              📊 Dashboard
            </button>
              
            <button onClick={() => navigate(`/vehicles/edit/${vehicle.id}`)}>
              ✏️ Edit
            </button>
              
            <button onClick={() => handleDelete(vehicle.id)}>
              🗑 Delete
            </button>

            <button
              style={btn}
              onClick={() =>
                navigate(`/vehicles/${vehicle.id}/fuel`)
              }
            >
              ⛽ Fuel log
            </button>

            <button
              style={btn}
              onClick={() =>
                navigate(`/vehicles/${vehicle.id}/fuel/add`)
              }
            >
              ➕ Add fuel
            </button>
          </div>
        </div>
      ))}

      {/* ✅ Bottom actions */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
          justifyContent: "center",
          flexWrap: "wrap"
        }}
      >
        <button style={btn} onClick={onLogout}>
          Logout
        </button>

        <button style={btn} onClick={() => navigate("/vehicles/add")}>
          ➕ Add Vehicle
        </button>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "20px",
  border: "none",
  background: "#334155",
  color: "white",
  cursor: "pointer",
  minWidth: 80
};
