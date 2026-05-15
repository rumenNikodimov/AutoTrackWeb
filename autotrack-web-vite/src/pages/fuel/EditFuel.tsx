
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../services/api";
import { EnergyType } from "../../types/enums/EnergyType";
import { createHoverHandlers } from "../../utils/uiHandlers";
import { useTranslation } from "react-i18next";

export function EditFuel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [odometerKm, setOdometerKm] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [energyType, setEnergyType] = useState<EnergyType>(EnergyType.Fuel);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const pricePerUnit =
    amount && totalPrice ? totalPrice / amount : null;

  useEffect(() => {
    if (!id) return;

    apiGet<any>(`fuel/${id}`)
      .then((data) => {
        setOdometerKm(data.odometerKm);
        setAmount(data.amount);
        setTotalPrice(data.totalPrice);
        setEnergyType(data.energyType);
      })
      .catch(() => setError(t("loadFuelError")))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    setSubmitted(true);
    e.preventDefault();

    if (!odometerKm || !amount || !totalPrice) {
      setError(t("fillFields"));
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
      setError(e.message || t("updateFailed"));
    }
  };

  if (loading) return <p style={{ padding: 20 }}>{t("loading")}</p>;

  return (
    <div style={container}>
      <LanguageSwitcher />

      <div style={card}>
        <h2 style={title}>{t("editEntry")}</h2>

        <form onSubmit={handleSubmit}>
          {/* ✅ Energy Type */}
          <Field label={t("energyType")}>
            <select
              value={energyType}
              onChange={(e) =>
                setEnergyType(Number(e.target.value))
              }
              style={{
                ...input,
                border:
                  submitted && energyType === null
                    ? "2px solid #ef4444"
                    : "1px solid rgba(255,255,255,0.1)"
              }}
            >
              <option value={EnergyType.Fuel}>
                {t("fuel")}
              </option>
              <option value={EnergyType.Electric}>
                {t("electric")}
              </option>
            </select>
          </Field>

          {/* ✅ Odometer */}
          <Field label={t("odometer")}>
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
              style={{
                ...input,
                border:
                  submitted && (!odometerKm || odometerKm <= 0)
                    ? "2px solid #ef4444"
                    : input.border
              }}
            />
          </Field>

          {/* ✅ Amount */}
          <Field label={energyType === EnergyType.Electric ? t("energy") : t("fuelAmount")}>
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
              style={{
                ...input,
                border:
                  submitted && (!amount || amount <= 0)
                    ? "2px solid #ef4444"
                    : input.border
              }}
            />
          </Field>

          {/* ✅ Price */}
          <Field label={energyType === EnergyType.Electric ? t("electricPrice") : t("fuelPrice")}>
            <input
              type="number"
              value={totalPrice ?? ""}
              onChange={(e) =>
                setTotalPrice(
                  e.target.value === ""
                    ? null
                    : Number(e.target.value)
                )
              }
              style={{
                ...input,
                border:
                  submitted && (!totalPrice || totalPrice <= 0)
                    ? "2px solid #ef4444"
                    : input.border
              }}
            />
          </Field>

          {/* ✅ Calculated */}
          {pricePerUnit && (
            <p style={{ textAlign: "center" }}>
              {t("pricePerUnit")}: {pricePerUnit.toFixed(2)} {t("currency")}/{energyType === EnergyType.Electric ? t("kWh") : t("liter")}
            </p>
          )}

          {/* ✅ Buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              {...createHoverHandlers("rgba(59,130,246,0.6)")}
              type="submit"
              style={btn}
            >
              💾 {t("saveChanges")}
            </button>

            <button
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              type="button"
              onClick={() => navigate(-1)}
              style={cancelBtn}
            >
              ❌ {t("cancel")}
            </button>
          </div>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: 10 }}>{error}</p>
        )}
      </div>
    </div>
  );
}

/* ✅ Field */

function Field({ label, children }: any) {
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
