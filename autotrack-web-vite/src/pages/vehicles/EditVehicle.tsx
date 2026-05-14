
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../services/api";
import { FuelType } from "../../types/enums/FuelType";

export function EditVehicle() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [fuelType, setFuelType] = useState<number | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [engineVolume, setEngineVolume] = useState<number | null>(null);
  const [vin, setVin] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ normalize функция
  function normalize(input: string) {
    return input.toUpperCase().replace(/\s/g, "");
  }

  // ✅ Load existing vehicle
  useEffect(() => {
    if (!id) return;

    apiGet<any>(`vehicles/${id}`)
      .then(v => {
        setBrand(v.brand);
        setModel(v.model);
        setFuelType(v.fuelType);
        setLicensePlate(v.licensePlate);
        setYear(v.year);
        setEngineVolume(v.engineVolume);
        setVin(v.vin ?? "");
      })
      .catch(() => setError("Failed to load vehicle"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!brand || !model || !fuelType || !licensePlate || !year) {
      setError("Please fill all required fields");
      return;
    }

    if (vin && vin.length !== 17) {
      setError("VIN must be exactly 17 characters");
      return;
    }

    try {
      await apiPut(`vehicles/${id}`, {
        brand,
        model,
        fuelType,
        licensePlate,
        year,
        engineVolume,
        vin
      });

      navigate("/vehicles");
    } catch (e: any) {
      setError(e.message || "Failed to update");
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Edit Vehicle
        </h2>

        <form onSubmit={handleSubmit}>
          <Field label="Brand">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              style={input}
            />
          </Field>

          <Field label="Model">
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={input}
            />
          </Field>

          <Field label="Fuel Type">
            <select
              value={fuelType ?? ""}
              onChange={(e) =>
                setFuelType(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              style={input}
            >
              <option value="" disabled>
                Choose fuel
              </option>
              <option value={FuelType.Gasoline}>Gasoline</option>
              <option value={FuelType.Diesel}>Diesel</option>
              <option value={FuelType.Hybrid}>Hybrid</option>
              <option value={FuelType.Electric}>Electric</option>
            </select>
          </Field>

          <Field label="License Plate">
            <input
              value={licensePlate}
              onChange={(e) =>
                setLicensePlate(normalize(e.target.value))
              }
              style={input}
            />
          </Field>

          <Field label="Production Year">
            <input
              type="number"
              value={year ?? ""}
              onChange={(e) =>
                setYear(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              style={input}
            />
          </Field>

          <Field label="Engine Volume (L)">
            <input
              type="number"
              value={engineVolume ?? ""}
              onChange={(e) =>
                setEngineVolume(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              style={input}
            />
          </Field>

          <Field label="VIN (optional)">
            <input
              value={vin}
              onChange={(e) => setVin(normalize(e.target.value))}
              style={input}
            />
          </Field>

          <button type="submit" style={btn}>
            Save Changes
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}
      </div>
    </div>
  );
}

/* ✅ same Field + styles */

function Field({ label, children }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

const container = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "60px 12px 100px"
};

const card = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.6)"
};

const labelStyle = {
  fontSize: 14,
  marginBottom: 6,
  opacity: 0.8
};

const input = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0f172a",
  color: "white",
  fontSize: 16
};

const btn = {
  width: "100%",
  marginTop: 20,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer"
};

const errorStyle = {
  color: "#f87171",
  marginTop: 12,
  textAlign: "center"
};

