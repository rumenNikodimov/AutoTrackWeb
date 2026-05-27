
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiGet, apiDelete } from "../../services/api";
import { createHoverHandlers } from "../../utils/uiHandlers";
import { useTranslation } from "react-i18next";

type FuelEntry = {
  id: number;
  vehicleId: number;
  odometerKm: number;
  fuelAmount: number;
  totalPrice: number;
  filledAt: string;
};

type Props = {
  vehicleId: number;
};

// ✅ consumption logic (същото)
function calculateConsumptions(entries: FuelEntry[]) {
  const result: any[] = [];

  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];

    const distance = curr.odometerKm - prev.odometerKm;

    if (distance <= 0) continue;

    const consumption = (curr.fuelAmount / distance) * 100;

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

  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();
  useEffect(() => {
    apiGet<FuelEntry[]>(`entries/vehicle/${vehicleId}`)
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

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: 10 }}>
      <h2 style={{ textAlign: "center" }}>{t("fuelEntries")}</h2>

      {/* ✅ LIST */}
      {sorted.map((e, i) => (
        <div
          key={e.id}
          style={{
            background: "#1e293b",
            padding: 15,
            borderRadius: 12,
            marginBottom: 12,
            animation: "fadeIn 0.3s ease",
            animationDelay: `${i * 0.05}s`
          }}
        >
          <div>
            <strong>{e.odometerKm} km</strong>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {new Date(e.filledAt).toLocaleDateString()}
            </div>
          </div>

          <div style={{ marginTop: 5 }}>
            ⛽ {e.fuelAmount} L • 💰 {e.totalPrice.toFixed(2)} {t("currency")}
          </div>

          {/* ✅ ACTIONS */}
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <AnimatedBtn onClick={() => navigate(`/entries/edit/${e.id}`)}>
              ✏️
            </AnimatedBtn>

            <AnimatedBtn danger onClick={() => handleDelete(e.id)}>
              🗑
            </AnimatedBtn>
          </div>
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

/* ✅ Animated Button */
function AnimatedBtn({
  children,
  onClick,
  danger
}: any) {
  return (
    <button
      onClick={onClick}
      {...createHoverHandlers("rgba(59,130,246,0.6)")}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        border: "none",
        background: danger ? "#dc2626" : "#334155",
        color: "white",
        fontSize: 16,
        transition: "transform 0.1s"
      }}
      onTouchStart={e => (e.currentTarget.style.transform = "scale(0.9)")}
      onTouchEnd={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}
