
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../../services/api";
import type { VehicleEntry } from "../../types/VehicleEntry";
import { EntryType } from "../../types/enums/EntryType";
import { ExpenseCategory } from "../../types/enums/ExpenseCategory";
import { ServiceType } from "../../types/enums/ServiceType";
import { InsuranceType } from "../../types/enums/InsuranceType";
import { createHoverHandlers } from "../../utils/uiHandlers";
import { useTranslation } from "react-i18next";

export function EditEntry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);

  const [type, setType] = useState<number>(0);
  const [amount, setAmount] = useState<number | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [odometerKm, setOdometerKm] = useState<number | null>(null);

  const [category, setCategory] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState<number | null>(null);
  const [insuranceType, setInsuranceType] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [nextDueKm, setNextDueKm] = useState<number | null>(null);
  const [nextDueDate, setNextDueDate] = useState("");

  const [error, setError] = useState<string | null>(null);

  const isFuel = type === EntryType.Fuel;
  const isElectric = type === EntryType.Electric;
  const isExpense = type === EntryType.Expense;
  const isService = type === EntryType.Service;
  const isInsurance = type === EntryType.Insurance;
  const isVignette = type === EntryType.Vignette;

  useEffect(() => {
    loadEntry();
  }, []);

  const loadEntry = async () => {
    try {
      const data = await apiGet<VehicleEntry>(`entries/${id}`);

      setType(data.type);
      setAmount(data.amount ?? null);
      setTotalPrice(data.totalPrice);
      setOdometerKm(data.odometerKm ?? null);

      setCategory(data.expenseCategory ?? null);
      setServiceType(data.serviceType ?? null);
      setInsuranceType(data.insuranceType ?? null);

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");

      setStartDate(data.startDate?.split("T")[0] ?? "");
      setEndDate(data.endDate?.split("T")[0] ?? "");

      setNextDueKm(data.nextDueKm ?? null);
      setNextDueDate(data.nextDueDate?.split("T")[0] ?? "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (invalid?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    background: "#0f172a",
    color: "white",
    border: invalid ? "2px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
    boxSizing: "border-box"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiPut(`entries/${id}`, {
        entryType: type,
        amount,
        totalPrice,
        odometerKm,
        expenseCategory: category,
        serviceType,
        insuranceType,
        title,
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        nextDueKm,
        nextDueDate: nextDueDate || null
      });

      navigate(-1);
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <p>Loading...</p>;

return (
    <div style={container}>
      <div style={card}>
        <h2 style={titleStyle}>{t("editEntry")}</h2>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          
          {/* <Field label={t("type")}>
            <select
              value={type || ""}
              onChange={(e) => setType(Number(e.target.value))}
              style={getInputStyle(type === 0)}
            >
              <option value="">{t("choose")}</option>
              <option value={EntryType.Fuel}> {t("fuelDropdown")}</option>
              <option value={EntryType.Electric}> {t("electricDropdown")}</option>
              <option value={EntryType.Expense}> {t("expenseDropdown")}</option>
              <option value={EntryType.Service}> {t("serviceDropdown")}</option>
              <option value={EntryType.Insurance}> {t("insuranceDropdown")}</option>
              <option value={EntryType.Vignette}> {t("vignetteDropdown")}</option>
            </select>
          </Field> */}

            <Field label={t("type")}>
              <select
                value={category ?? ""}
                onChange={(e) => setType(Number(e.target.value))}
                style={getInputStyle(type === 0)}
              >
                <option value="">{t("choose")}</option>
                {Object.entries(EntryType).map(([k, v]) => (
                  <option key={k} value={v}>{t(k)}</option>
                ))}
              </select>
            </Field>
          
          {(isFuel || isElectric || isService) && (
            <Field label={t("odometer")}>
              <input
                type="number"
                value={odometerKm ?? ""}
                onChange={(e) => setOdometerKm(Number(e.target.value))}
                style={getInputStyle()}
              />
            </Field>
          )}

          {(isFuel || isElectric) && (
            <Field label={t("amount")}>
              <input
                type="number"
                value={amount ?? ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={getInputStyle()}
              />
            </Field>
          )}
         
          {(isFuel || isElectric || isExpense || isService || isInsurance || isVignette) && (
            <Field label={t("totalPrice")}>
              <input
                type="number"
                value={totalPrice ?? ""}
                onChange={(e) =>
                  setTotalPrice(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                style={getInputStyle()}
              />
            </Field>
          )}

          {(isExpense) && (
            <Field label={t("expenseCategory")}>
              <select
                value={category ?? ""}
                onChange={(e) => setCategory(Number(e.target.value))}
                style={getInputStyle()}
              >
                <option value="">{t("choose")}</option>
                {Object.entries(ExpenseCategory).map(([k, v]) => (
                  <option key={k} value={v}>{t(k)}</option>
                ))}
              </select>
            </Field>
          )}

          {isService && (
            <Field label={t("serviceType")}>
              <select
                value={serviceType ?? ""}
                onChange={(e) => setServiceType(Number(e.target.value))}
                style={getInputStyle()}
              >
                <option value="">{t("choose")}</option>
                {Object.entries(ServiceType).map(([k, v]) => (
                  <option key={k} value={v}>{t(k)}</option>
                ))}
              </select>
            </Field>
          )}

          {isInsurance && (
            <Field label={t("insuranceType")}>
              <select
                value={insuranceType ?? ""}
                onChange={(e) => setInsuranceType(Number(e.target.value))}
                style={getInputStyle()}
              >
                <option value="">{t("choose")}</option>
                {Object.entries(InsuranceType).map(([k, v]) => (
                  <option key={k} value={v}>{t(k)}</option>
                ))}
              </select>
            </Field>
          )}

           {(isInsurance || isExpense || isVignette || isService) && (
            <Field label={t("title")}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={getInputStyle()}
              />
            </Field>
           )}

            {(isInsurance || isExpense || isVignette || isService) && (
            <Field label={t("description")}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...getInputStyle(), minHeight: 80 }}
              />
            </Field>
            )}
            {(isInsurance || isVignette) && (
              <Field label={t("startDate")}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={getInputStyle()}
                />
              </Field>
            )}

            {(isInsurance || isVignette) && (
            <Field label={t("endDate")}>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={getInputStyle()}
              />
            </Field>
            )}

            {(isService) && (
            <Field label={t("nextDueKm")}>
              <input
                type="number"
                value={nextDueKm ?? ""}
                onChange={(e) => setNextDueKm(Number(e.target.value))}
                style={getInputStyle()}
              />
            </Field>
            )}

            {(isService || isInsurance) && (
            <Field label={t("nextDueDate")}>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                style={getInputStyle()}
              />
            </Field>
            )}
            
          <div style={buttons}>
            <button
              type="submit"
              {...createHoverHandlers("rgba(59,130,246,0.6)")}
              style={btn}
            >
              {t("save")}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              {...createHoverHandlers("rgba(107,114,128,0.6)")}
              style={cancelBtn}
            >
              {t("cancel")}
            </button>
          </div>
        </form>

        {error && <p style={errorText}>{error}</p>}
      </div>
    </div>
  );
}

/* FIELD */
function Field({ label, children }: any) {
  return (
    <div style={{ width: "100%", marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* STYLES (same as Add) */

const container: React.CSSProperties = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "60px 12px 100px"
};

const card: React.CSSProperties = {
  width: "100%",
  background: "#1e293b",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const titleStyle: React.CSSProperties = {
  textAlign: "center",
  width: "100%",
  marginBottom: 20
};

const labelStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
  opacity: 0.8
};

const buttons: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 20
};

const btn: React.CSSProperties = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  background: "#3b82f6",
  color: "white",
  border: "none"
};

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  background: "#475569",
  color: "white",
  border: "none"
};

const errorText: React.CSSProperties = {
  color: "#ef4444",
  marginTop: 10
};
