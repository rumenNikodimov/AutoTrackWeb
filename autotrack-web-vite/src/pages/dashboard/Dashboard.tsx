import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
import { useTranslation } from "react-i18next";
import type { Reminder } from "../../types/Reminder";
import { getVehicleReminders } from "../../services/reminders";
import { getReminderGroup } from "../../utils/reminders";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

type Entry = {
  id: number;
  vehicleId: number;
  odometerKm: number;
  amount: number;
  totalPrice: number;
  occurredAt: string;
  type: number;
};

export function Dashboard({ vehicleId }: { vehicleId: number }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      apiGet<Entry[]>(`entries/vehicle/${vehicleId}`).catch((err) => {
        console.error("Entries error:", err);
        return [] as Entry[];
      }),
      getVehicleReminders(vehicleId).catch((err) => {
        console.error("Reminders error:", err);
        return [] as Reminder[];
      }),
    ])
      .then(([entryData, reminderData]) => {
        setEntries(entryData);
        setReminders(reminderData);
      })
      .finally(() => setLoading(false));
  }, [vehicleId]);

  // ✅ филтрираме само fuel entries (type = 1)
  const fuelEntries = entries.filter((e) => e.type === 1);

  // ✅ сортиране
  const sorted = [...fuelEntries].sort(
    (a, b) => a.odometerKm - b.odometerKm
  );

  // ✅ KPI
  const totalCost = fuelEntries.reduce((s, e) => s + e.totalPrice, 0);
  const totalFuel = fuelEntries.reduce((s, e) => s + e.amount, 0);

  const distance =
    sorted.length > 1
      ? sorted[sorted.length - 1].odometerKm - sorted[0].odometerKm
      : 0;

  // ✅ правилна формула: fuel / distance * 100
  const avgConsumption =
    distance > 0
      ? ((totalFuel / distance) * 100).toFixed(2)
      : "0";

  // ✅ Consumption data (L/100km)
  const consumptionData = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    const dist = curr.odometerKm - prev.odometerKm;

    if (dist <= 0) continue;

    const consumption = (curr.amount / dist) * 100;

    consumptionData.push({
      km: curr.odometerKm,
      consumption: Number(consumption.toFixed(2))
    });
  }

  const lastConsumption = consumptionData.at(-1);

  const currentMileage =
    sorted.length > 0 ? sorted[sorted.length - 1].odometerKm : 0;

  const overdueReminders = reminders.filter(
    (r) => getReminderGroup(r, currentMileage) === "overdue"
  );
  const upcomingReminders = reminders.filter(
    (r) => getReminderGroup(r, currentMileage) === "upcoming"
  );

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div style={{ padding: 15 }}>
      <h2 style={{ textAlign: "center" }}>{t("dashboard")}</h2>

      {/* ✅ KPI */}
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
        <Card title={`📄 ${t("entries")}`} value={fuelEntries.length.toString()} />
        <Card title={`🔔 ${t("reminders")}`} value={`${reminders.length}`} />
        <Card title={`⚠️ ${t("overdue")}`} value={`${overdueReminders.length}`} />
      </div>

      {(overdueReminders.length > 0 || upcomingReminders.length > 0) && (
        <div style={{ marginTop: 14 }}>
          {overdueReminders.length > 0 && (
            <div style={warningCard}>
              <strong>{t("overdue")}</strong>
              {overdueReminders.map((r) => (
                <div key={r.id} style={smallLine}>• {r.title}</div>
              ))}
            </div>
          )}

          {upcomingReminders.length > 0 && (
            <div style={upcomingCard}>
              <strong>{t("upcoming")}</strong>
              {upcomingReminders.map((r) => (
                <div key={r.id} style={smallLine}>• {r.title}</div>
              ))}
            </div>
          )}
        </div>
      )}

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
          <h3 style={{ marginTop: 25 }}>{t("fuelUsage")}</h3>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={sorted}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="odometerKm" />
                <YAxis />
                <Tooltip />

                <Line
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ✅ Consumption chart */}
      {consumptionData.length > 0 && (
        <>
          <h3 style={{ marginTop: 25 }}>{t("consumption")}</h3>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={consumptionData}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="km" />
                <YAxis />
                <Tooltip formatter={(v) => `${v} L/100km`} />

                <Line
                  dataKey="consumption"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

const warningCard: React.CSSProperties = {
  marginTop: 8,
  background: "rgba(127,29,29,0.35)",
  border: "1px solid rgba(248,113,113,0.45)",
  borderRadius: 10,
  padding: 10,
};

const upcomingCard: React.CSSProperties = {
  marginTop: 8,
  background: "rgba(30,64,175,0.28)",
  border: "1px solid rgba(96,165,250,0.4)",
  borderRadius: 10,
  padding: 10,
};

const smallLine: React.CSSProperties = {
  fontSize: 13,
  marginTop: 4,
};

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
