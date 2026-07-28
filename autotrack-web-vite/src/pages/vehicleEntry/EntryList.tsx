import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../../services/api";
import { createHoverHandlers } from "../../utils/uiHandlers";
import { useTranslation } from "react-i18next";
import { EntryType } from "../../types/enums/EntryType";

type Entry = {
  id: number;
  vehicleId: number;
  odometerKm: number;
  amount: number;
  totalPrice: number;
  occurredAt: string;
  type: number;
};

type Props = {
  vehicleId: number;
};

// ✅ consumption logic (същото)
function calculateConsumptions(entries: Entry[]) {
  const result: any[] = [];

  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];

    const distance = curr.odometerKm - prev.odometerKm;

    if (distance <= 0) continue;

    const consumption = (curr.amount / distance) * 100;

    result.push({
      id: curr.id,
      odometerFrom: prev.odometerKm,
      odometerTo: curr.odometerKm,
      distance,
      consumption: Number(consumption.toFixed(2)),
    });
  }

  return result;
}

export function EntryList({ vehicleId }: Props) {
  const navigate = useNavigate();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuEntryId, setOpenMenuEntryId] = useState<number | null>(null);

  const { t } = useTranslation();
  useEffect(() => {
    apiGet<Entry[]>(`entries/vehicle/${vehicleId}`)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteEntry"))) return;

    await apiDelete(`entries/${id}`);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const sorted = [...entries].sort(
    (a, b) => a.odometerKm - b.odometerKm
  );

  const consumptions = calculateConsumptions(sorted);

  
  const getEntryTypeKey = (value: number) =>
    Object.keys(EntryType).find(
      (k) => EntryType[k as keyof typeof EntryType] === value
  );

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 10 }}>
      <h2 style={{ textAlign: "center" }}>{t("entries")}</h2>

      {/* ✅ LIST */}
      {sorted.map((e, i) => (
        <div
          key={e.id}
          style={{
            background: "#1e293b",
            padding: "10px 12px",
            borderRadius: 12,
            marginBottom: 8,
            animation: "fadeIn 0.3s ease",
            animationDelay: `${i * 0.05}s`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", flexShrink: 0 }}>
                  {t(getEntryTypeKey(e.type) || "")}
                </span>

                {e.type !== EntryType.InsuranceType && e.type !== EntryType.VignetteType ? (
                  <span style={{ opacity: 0.9, fontWeight: 600, flexShrink: 0 }}>
                    {e.odometerKm} km
                  </span>
                ) : null}

                <span style={{ opacity: 0.7, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {new Date(e.occurredAt).toLocaleDateString()}
                </span>
              </div>

              <div
                style={{
                  marginTop: 3,
                  fontSize: 13,
                  opacity: 0.9,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {e.type === EntryType.ElectricType ? "⚡" : "⛽"} {e.amount} {e.type === EntryType.ElectricType ? "kWh" : "L"} • 💰 {e.totalPrice.toFixed(2)} {t("currency")}
              </div>
            </div>

            <button
              type="button"
              aria-label={t("openActions")}
              aria-haspopup="menu"
              aria-expanded={openMenuEntryId === e.id}
              {...createHoverHandlers("rgba(59,130,246,0.6)")}
              onClick={() => {
                setOpenMenuEntryId((prev) => (prev === e.id ? null : e.id));
              }}
              style={{
                width: 32,
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                borderRadius: 9,
                border: "1px solid rgba(148,163,184,0.38)",
                background: "#334155",
                color: "white",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#e2e8f0" }} />
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#e2e8f0" }} />
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#e2e8f0" }} />
            </button>
          </div>

          {openMenuEntryId === e.id && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }} role="menu">
              <MenuActionBtn onClick={() => navigate(`/entries/edit/${e.id}`)}>
                {t("edit")}
              </MenuActionBtn>

              <MenuActionBtn danger onClick={() => handleDelete(e.id)}>
                {t("delete")}
              </MenuActionBtn>
            </div>
          )}
        </div>
      ))}

      {/* ✅ FLOATING BUTTON */}
      <button
        onClick={() =>
          navigate(`/vehicles/${vehicleId}/entries/add`)
        }
        {...createHoverHandlers("rgba(59,130,246,0.6)")}
        style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#3b82f6",
          color: "white",
          fontSize: 28,
          border: "none",
          boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
          animation: "float 2s ease-in-out infinite"
        }}
      >
        +
      </button>

      {/* ✅ CONSUMPTION */}
      {consumptions.length > 0 && (
        <>
          <h3 style={{ marginTop: 20 }}>{t("consumption")}</h3>

          {consumptions.map(c => (
            <div
              key={c.id}
              style={{
                padding: 10,
                borderBottom: "1px solid #333",
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>
                {c.odometerFrom} → {c.odometerTo}
              </span>

              <strong
                style={{
                  color: c.consumption > 10 ? "red" : "#22c55e"
                }}
              >
                {c.consumption} L/100km
              </strong>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function MenuActionBtn({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...createHoverHandlers("rgba(59,130,246,0.6)")}
      style={{
        flex: 1,
        minHeight: 40,
        padding: "8px 12px",
        borderRadius: 10,
        border: danger ? "1px solid rgba(239,68,68,0.55)" : "1px solid rgba(148,163,184,0.38)",
        background: danger ? "rgba(239,68,68,0.2)" : "#334155",
        color: danger ? "#fecaca" : "white",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
