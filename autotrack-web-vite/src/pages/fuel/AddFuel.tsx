
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiPost } from "../../services/api";
import { EnergyType } from "../../types/enums/EnergyType";
import { createHoverHandlers } from "../../utils/uiHandlers";

export function AddFuel() {
  const navigate = useNavigate();
  const { vehicleId } = useParams();

  const [amount, setAmount] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [odometerKm, setOdometerKm] = useState<number | null>(null);
  const [energyType, setEnergyType] = useState<number | null>(0);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); 

  if (!vehicleId) {
    return <p style={{ padding: 20 }}>Invalid vehicle</p>;
  }

  // ✅ validation helper
  const isInvalid = (value: any) =>
    value === null || value === "" || value <= 0;

  // ✅ dynamic style
  const getInputStyle = (invalid: boolean) => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    background: "#0f172a",
    color: "white",
    fontSize: 16,
    boxSizing: "border-box",
    border: invalid
      ? "2px solid #ef4444"
      : "1px solid rgba(255,255,255,0.1)"
  });

  // ✅ calculation
  const unitPrice =
    amount !== null && amount > 0 && totalPrice !== null
      ? totalPrice / amount
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitted(true); 
    setError(null);

    if (!odometerKm || !amount || !energyType || !totalPrice) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      await apiPost("fuel", {
        vehicleId,
        odometerKm,
        amount,
        totalPrice,
        unitPrice,
        energyType
      });

      navigate(-1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Add Energy
        </h2>

        <form onSubmit={handleSubmit}>
          
          {/* ✅ Energy Type */}
          <label style={label}>Energy Type</label>
          <select
            value={energyType === 0 ? "" : energyType}
            onChange={(e) =>
              setEnergyType(
                e.target.value === "" ? 0 : Number(e.target.value)
              )
            }
            style={getInputStyle(submitted && energyType === 0)} 
          >
            <option value="" disabled>
              Choose an option
            </option>
            <option value={EnergyType.Fuel}>Fuel</option>
            <option value={EnergyType.Electric}>Electric</option>
          </select>

          {/* ✅ KM */}
          <label style={label}>Odometer (km)</label>
          <input
            type="number"
            value={odometerKm ?? ""}
            onChange={(e) =>
              setOdometerKm(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            style={getInputStyle(submitted && isInvalid(odometerKm))} 
          />

          {/* ✅ Amount */}
          <label style={label}>
            {energyType === EnergyType.Electric
              ? "Energy (kWh)"
              : "Fuel (liters)"}
          </label>

          <input
            type="number"
            value={amount ?? ""}
            onChange={(e) =>
              setAmount(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            style={getInputStyle(submitted && isInvalid(amount))} 
          />

          {/* ✅ Total */}
          <label style={label}>
            {energyType === EnergyType.Electric
              ? "Electricity price"
              : "Fuel price"}
          </label>

          <input
            type="number"
            step="0.01"
            value={totalPrice ?? ""}
            onChange={(e) =>
              setTotalPrice(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            style={getInputStyle(submitted && isInvalid(totalPrice))} 
          />

          {/* ✅ Calculated */}
          {unitPrice !== null && (
            <p style={{ marginTop: 15, textAlign: "center" }}>
              {energyType === EnergyType.Electric
                ? `Price/kWh: ${unitPrice.toFixed(2)}`
                : `Price/L: ${unitPrice.toFixed(2)}`}
            </p>
          )}
         <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button 
              type="submit" 
              {...createHoverHandlers("rgba(59,130,246,0.6)")} 
              style={btn}>
              💾 Save
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              style={cancelBtn}
            >
              ❌ Cancel
            </button>
          </div>
            
        </form>

        {error && (
          <p style={{ color: "red", marginTop: 10 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* ✅ styles */

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

const label = {
  display: "block",
  marginTop: 16,
  marginBottom: 6,
  fontSize: 14,
  opacity: 0.8
};

const btn = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "#3b82f6",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
};

const cancelBtn = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "#475569",
  color: "white",
  cursor: "pointer"
};