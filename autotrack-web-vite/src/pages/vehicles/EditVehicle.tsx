
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../services/api";
import { FuelType } from "../../types/enums/FuelType";
import { useTranslation } from "react-i18next";

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

  
  const { t } = useTranslation();


  // ✅ normalize helper
  function normalize(input: string) {
    return input.toUpperCase().replace(/\s/g, "");
  }

  // ✅ load vehicle
  useEffect(() => {
    if (!id) return;

    apiGet<any>(`vehicles/${id}`)
      .then((v) => {
        setBrand(v.brand ?? "");
        setModel(v.model ?? "");
        setFuelType(v.fuelType ?? null);
        setLicensePlate(v.licensePlate ?? "");
        setYear(v.year ?? null);
        setEngineVolume(v.engineVolume ?? null);
        setVin(v.vin ?? "");
        console.log("response:", v);
      })
      .catch(() => setError(t("loadVehicleError")))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!brand || !model || !fuelType || !licensePlate || !year) {
      setError(t("fillFields"));
      return;
    }

    if (vin && vin.length !== 17) {
      setError(t("vinLength"));
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
        vin,
      });

      navigate("/vehicles");
    } catch (e: any) {
      setError(e.message || t("updateFailed"));
    }
  };

  if (loading) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>{t("editVehicle")}</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <Field label={t("brand")}>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              style={input}
            />
          </Field>

          <Field label={t("model")}>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={input}
            />
          </Field>

          <Field label={t("fuelType")}>
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
                {t("chooseFuel")}
              </option>
              <option value={FuelType.Gasoline}>{t("gasoline")}</option>
              <option value={FuelType.Diesel}>{t("diesel")}</option>
              <option value={FuelType.Hybrid}>{t("hybrid")}</option>
              <option value={FuelType.Electric}>{t("electric")}</option>
            </select>
          </Field>

          <Field label={t("licensePlate")}>
            <input
              value={licensePlate}
              onChange={(e) =>
                setLicensePlate(normalize(e.target.value))
              }
              style={input}
            />
          </Field>

          <Field label={t("productionYear")}>
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

          <Field label={t("engineVolume")}>
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

          <Field label={t("vinOptional")}>
            <input
              value={vin}
              onChange={(e) => setVin(normalize(e.target.value))}
              style={input}
            />
          </Field>

          {/* ✅ ACTIONS */}
          <div style={actions}>
            <button type="submit" style={btn}>
              💾 {t("saveChanges")}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              style={cancelBtn}
            >
              ❌ {t("cancel")}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

/* ✅ FIELD */

function Field({
  label,
  children,
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

/* ✅ STYLES */

const container = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "60px 12px 100px",
};

const card = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
};

const title = {
  textAlign: "center" as const,
  marginBottom: 20,
};

const labelStyle = {
  fontSize: 14,
  marginBottom: 6,
  opacity: 0.8,
};

const input = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#0f172a",
  color: "white",
  fontSize: 16,
  boxSizing: "border-box" as const,
};

const actions = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const btn = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const cancelBtn = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "#475569",
  color: "white",
  cursor: "pointer",
};

const errorStyle = {
  color: "#f87171",
  textAlign: "center" as const,
};
