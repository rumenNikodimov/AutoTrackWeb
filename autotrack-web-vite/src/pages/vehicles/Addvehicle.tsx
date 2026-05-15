
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../../services/api";
import { FuelType } from "../../types/enums/FuelType";
import { createHoverHandlers } from "../../utils/uiHandlers";

export function AddVehicle() {
  const navigate = useNavigate();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [fuelType, setFuelType] = useState<number | null>(null);
  const [licensePlate, setLicensePlate] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [engineVolume, setEngineVolume] = useState<number | null>(null);
  const [vin, setVin] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ нормализиране
  function normalize(input: string) {
    return input
      .toUpperCase()
      .replace(/\s/g, "");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    // ✅ validation
    if (!brand || !model || !fuelType || !licensePlate || !year) {
      setError("Please fill all required fields");
      return;
    }

    if (vin && vin.length !== 17) {
      setError("VIN must be exactly 17 characters");
      return;
    }

    setLoading(true);

    try {
      await apiPost("vehicles", {
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
      setError(e.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: "60px 12px 100px"
      }}
    >
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Add Vehicle
        </h2>

        <form onSubmit={handleSubmit}>
          <Field label="Brand">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Opel"
              style={input}
            />
          </Field>

          <Field label="Model">
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Zafira"
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

          {/* ✅ LICENSE PLATE */}
          <Field label="License Plate">
            <input
              value={licensePlate}
              onChange={(e) =>
                setLicensePlate(normalize(e.target.value))
              }
              placeholder="CB1234AB"
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

          {/* ✅ VIN */}
          <Field label="VIN (optional)">
            <input
              value={vin}
              onChange={(e) => setVin(normalize(e.target.value))}
              placeholder="WBA12345678901234"
              style={input}
            />
          </Field>

          <button 
            type="submit" 
            {...createHoverHandlers("rgba(59,130,246,0.6)")} 
            style={btn} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}
      </div>
    </div>
  );
}

/* ✅ Field wrapper */
function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

/* ✅ Styles */

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
  fontSize: 16,
  boxSizing: "border-box"
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
