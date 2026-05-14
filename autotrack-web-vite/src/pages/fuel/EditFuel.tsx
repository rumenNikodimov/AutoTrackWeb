
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../services/api";
import { EnergyType } from "../../types/enums/EnergyType";

export function EditFuel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [odometerKm, setOdometerKm] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [energyType, setEnergyType] = useState<EnergyType>(EnergyType.Fuel);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // ✅ Compute price per unit
  const pricePerUnit =
    amount !== null && amount > 0 && totalPrice !== null
      ? totalPrice / amount
      : null;
 
      // ✅ validation helper
    const isInvalid = (value: any) =>
      value === null || value === "" || value <= 0;
    // ✅ Load data
    useEffect(() => {
    if (!id) return;

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
  
    apiGet<any>(`fuel/${id}`)
      .then((data) => {
        setOdometerKm(data.odometerKm);
        setAmount(data.amount);
        setTotalPrice(data.totalPrice);
        setEnergyType(data.energyType);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    setSubmitted(true);
    e.preventDefault();

    setError(null);

    if (!odometerKm || !amount || !energyType || !totalPrice) {
      setError("Please fill all required fields");
      return;
    }

    try {
      await apiPut(`fuel/${id}`, {
        odometerKm,
        amount,
        totalPrice,
        pricePerUnit,
        energyType
      });

      navigate(-1);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Edit Entry</h2>

        {/* {error && <p style={errorStyle}>{error}</p>} */}

        <form onSubmit={handleSubmit}>
          {/* ✅ Energy Type FIRST */}
          <Field label="Energy Type">
            <select
              value={energyType}
              onChange={(e) =>
                setEnergyType(Number(e.target.value))
              }
              
              style={{...input,
                border:
                  submitted && (EnergyType === null)
                    ? "2px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.1)"
              }}

            >
              <option value={EnergyType.Fuel}>Fuel</option>
              <option value={EnergyType.Electric}>Electric</option>
            </select>
          </Field>

          {/* ✅ Odometer */}
          <Field label="Odometer (km)">
            <input
              type="number"
              value={odometerKm ?? ""}
              onChange={(e) =>
                setOdometerKm(
                  e.target.value === ""
                    ? null
                    : Number(e.target.value)
                )
              }
              style={{...input,
                border:
                  submitted && (odometerKm === null || odometerKm <= 0)
                    ? "2px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.1)"
              }}
            />
          </Field>

          {/* ✅ Amount */}
          <Field
            label={
              energyType === EnergyType.Electric
                ? "Energy (kWh)"
                : "Fuel (liters)"
            }
          >
            <input
              type="number"
              value={amount ?? ""}
              onChange={(e) =>
                setAmount(
                  e.target.value === ""
                    ? null
                    : Number(e.target.value)
                )
              }
               style={{...input,
                border:
                  submitted && (amount === null || amount <= 0)
                    ? "2px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.1)"
              }}
            />
          </Field>

          {/* ✅ Total price */}
          <Field
            label={
              energyType === EnergyType.Electric
                ? "Electricity price"
                : "Fuel price"
            }
          >
            <input
              type="number"
              step="0.01"
              value={totalPrice ?? ""}
              onChange={(e) =>
                setTotalPrice(
                  e.target.value === ""
                    ? null
                    : Number(e.target.value)
                )
              }
              style={{...input,
                border:
                  submitted && (totalPrice === null || totalPrice <= 0)
                    ? "2px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.1)"
              }}
            />
          </Field>

          {/* ✅ Computed price */}
          {pricePerUnit !== null && (
            <p style={{ textAlign: "center", marginTop: 15 }}>
              {energyType === EnergyType.Electric
                ? `Price/kWh: ${pricePerUnit.toFixed(2)}`
                : `Price/L: ${pricePerUnit.toFixed(2)}`}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="submit" style={btn}>
              💾 Save
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
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

/* ✅ reusable */

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

const title = {
  textAlign: "center" as const,
  marginBottom: 20
};

const labelStyle = {
  fontSize: 14,
  marginBottom: 6,
  opacity: 0.8
};


const input: React.CSSProperties = {
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

const errorStyle = {
  color: "#f87171",
  textAlign: "center" as const
};
