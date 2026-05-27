import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
import { useTranslation } from "react-i18next";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

type EnergyEntry = {
  id: number;
  odometerKm: number;
  amount: number;
  totalPrice: number;
};

export function Dashboard({ vehicleId }: { vehicleId: number }) {
  const [entries, setEntries] = useState<EnergyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<EnergyEntry[]>(`fuel/vehicle/${vehicleId}`)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  // ✅ сортиране (важно за графиките)
  const sorted = [...entries].sort(
    (a, b) => a.odometerKm - b.odometerKm
  );

  const { t } = useTranslation();

  // ✅ KPI
  const totalCost = entries.reduce((s, e) => s + e.totalPrice, 0);
  const totalFuel = entries.reduce((s, e) => s + e.amount, 0);

  const avgConsumption =
    sorted.length > 1 && totalFuel > 0
      ? (
          (sorted[sorted.length - 1].odometerKm -
            sorted[0].odometerKm) /
          totalFuel *
          100
        ).toFixed(2)
      : "0";

  // ✅ Consumption data (L/100km)
  const consumptionData = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    const distance = curr.odometerKm - prev.odometerKm;

    if (distance <= 0) continue;

    const consumption = (curr.amount / distance) * 100;

    consumptionData.push({
      km: curr.odometerKm,
      consumption: Number(consumption.toFixed(2))
    });
  }

  const lastConsumption = consumptionData.at(-1);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  
return (
   
  <div style={{ padding: 15 }}>
    <h2 style={{ textAlign: "center" }}>
      {t("dashboard")}
    </h2>

    {/* ✅ KPI Cards */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 12
      }}
    >
      <Card title={`💰 ${t("cost")}`} value={`${totalCost.toFixed(2)} ${t("currency")}`} />
      <Card title={`⛽ ${t("fuel")}`} value={`${totalFuel.toFixed(2)} L`} />
      <Card title={`📉 ${t("avg")}`} value={`${avgConsumption} L/100km`} />
      <Card title={`📄 ${t("entries")}`} value={entries.length.toString()} />
    </div>

    {/* ✅ ALERT */}
    {lastConsumption && lastConsumption.consumption > 10 && (
      <div
        style={{
          background: "#7f1d1d",
          padding: 10,
          borderRadius: 8,
          marginTop: 15
        }}
      >
        ⚠️ {t("highConsumption")}
      </div>
    )}

    {/* ✅ Fuel chart */}
    {sorted.length > 1 && (
      <>
        <h3 style={{ marginTop: 25 }}>
          {t("fuelUsage")}
        </h3>

        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={sorted}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="odometerKm" />
              <YAxis />

              <Tooltip
                contentStyle={{
                  fontSize: "12px",
                  padding: "5px"
                }}
              />

              <Line
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    )}

    {/* ✅ Consumption chart */}
    {consumptionData.length > 0 && (
      <>
        <h3 style={{ marginTop: 25 }}>
          {t("consumption")}
        </h3>

        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={consumptionData}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="km" />
              <YAxis />

              <Tooltip
                formatter={(value) =>
                  value !== undefined && value !== null
                    ? `${value} L/100km`
                    : ""
                }
              />

              <Line
                dataKey="consumption"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    )}
  </div>
);
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: 15,
        borderRadius: 12,
        background: "linear-gradient(135deg, #1e293b, #334155)",
        color: "white",
        textAlign: "center"
      }}
    >
      <h4>{title}</h4>
      <p style={{ fontSize: 20, fontWeight: "bold" }}>{value}</p>
    </div>
  );
}
