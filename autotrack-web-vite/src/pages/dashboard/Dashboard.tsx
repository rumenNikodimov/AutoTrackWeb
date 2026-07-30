import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
import { useTranslation } from "react-i18next";
import type { Reminder, ReminderDashboardResponse } from "../../types/Reminder";
import { getReminderDashboard } from "../../services/reminders";

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
  const [dashboardReminders, setDashboardReminders] = useState<{
    overdue: Reminder[];
    upcoming: Reminder[];
    overdueCount: number;
    upcomingCount: number;
  }>({ overdue: [], upcoming: [], overdueCount: 0, upcomingCount: 0 });
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      apiGet<Entry[]>(`entries/vehicle/${vehicleId}`).catch((err) => {
        console.error("Entries error:", err);
        return [] as Entry[];
      }),
      getReminderDashboard().catch((err): ReminderDashboardResponse => {
        console.error("Reminders error:", err);
        return {
          overdue: [],
          upcoming: [],
          overdueCount: 0,
          upcomingCount: 0,
        };
      }),
    ])
      .then(([entryData, reminderData]) => {
        setEntries(entryData);

        const overdue = reminderData.overdueReminders ?? reminderData.overdue ?? [];
        const upcoming = reminderData.upcomingReminders ?? reminderData.upcoming ?? [];
        setDashboardReminders({
          overdue,
          upcoming,
          overdueCount: reminderData.overdueCount ?? overdue.length,
          upcomingCount: reminderData.upcomingCount ?? upcoming.length,
        });
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

  const overdueReminders = dashboardReminders.overdue
    .slice(0, 5);
  const completedReminders = (
    dashboardReminders.overdue.concat(dashboardReminders.upcoming)
  ).filter((r) => r.isCompleted).slice(0, 5);
  const upcomingReminders = dashboardReminders.upcoming
    .filter((r) => !r.isCompleted)
    .sort((left, right) => {
      const leftDate = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const rightDate = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      if (leftDate !== rightDate) return leftDate - rightDate;

      const leftKmRemaining =
        typeof left.dueKm === "number" ? Math.max(left.dueKm - currentMileage, 0) : Number.MAX_SAFE_INTEGER;
      const rightKmRemaining =
        typeof right.dueKm === "number" ? Math.max(right.dueKm - currentMileage, 0) : Number.MAX_SAFE_INTEGER;

      return leftKmRemaining - rightKmRemaining;
    })
    .slice(0, 5);

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
        <Card title={`🔔 ${t("reminders")}`} value={`${dashboardReminders.overdueCount + dashboardReminders.upcomingCount}`} />
        <Card title={`⚠️ ${t("overdue")}`} value={`${dashboardReminders.overdueCount}`} />
      </div>

      {(overdueReminders.length > 0 || upcomingReminders.length > 0) && (
        <div style={summaryWidget}>
          <div style={summaryHeader}>{t("reminderSummary")}</div>
          <div style={summaryCounters}>
            <span style={summaryChip}>🔔 {dashboardReminders.overdueCount + dashboardReminders.upcomingCount} {t("reminders")}</span>
            <span style={summaryChip}>⚠️ {dashboardReminders.overdueCount} {t("overdue")}</span>
            <span style={summaryChip}>🟡 {dashboardReminders.upcomingCount} {t("upcoming")}</span>
            <span style={summaryChip}>✅ {completedReminders.length} {t("completed")}</span>
          </div>

          {overdueReminders.length > 0 && (
            <div style={warningCard}>
              <strong>{t("overdue")}</strong>
              {overdueReminders.slice(0, 5).map((r) => {
                const overdueDays = r.dueDate
                  ? Math.max(Math.ceil((Date.now() - new Date(r.dueDate).getTime()) / 86400000), 0)
                  : null;
                const overdueKm = typeof r.dueKm === "number" ? Math.max(currentMileage - r.dueKm, 0) : null;

                return (
                  <div key={r.id} style={reminderRow}>
                    <div style={smallLine}>• {r.title}</div>
                    {overdueDays !== null && overdueDays > 0 && (
                      <div style={metaLine}>{t("overdueBy")} {overdueDays} {t("days")}</div>
                    )}
                    {overdueKm !== null && overdueKm > 0 && (
                      <div style={metaLine}>{t("overdueBy")} {overdueKm} km</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {upcomingReminders.length > 0 && (
            <div style={upcomingCard}>
              <strong>{t("upcomingReminders")}</strong>
              {upcomingReminders.map((r) => {
                const dueDate = r.dueDate ? new Date(r.dueDate) : null;
                const daysRemaining = dueDate
                  ? Math.max(Math.ceil((dueDate.getTime() - Date.now()) / 86400000), 0)
                  : null;

                const kmRemaining =
                  typeof r.dueKm === "number" ? Math.max(r.dueKm - currentMileage, 0) : null;

                return (
                  <div key={r.id} style={reminderRow}>
                    <div style={smallLine}>• {r.title}</div>
                    {daysRemaining !== null && (
                      <div style={metaLine}>{daysRemaining} {t("days")} {t("remaining")}</div>
                    )}
                    {kmRemaining !== null && (
                      <div style={metaLine}>{kmRemaining} km {t("remaining")}</div>
                    )}
                  </div>
                );
              })}
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

const summaryWidget: React.CSSProperties = {
  marginTop: 14,
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(15,23,42,0.5)",
};

const summaryHeader: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#e2e8f0",
  marginBottom: 8,
};

const summaryCounters: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 4,
};

const summaryChip: React.CSSProperties = {
  fontSize: 12,
  padding: "3px 8px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.35)",
  background: "rgba(30,41,59,0.7)",
  color: "#e2e8f0",
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

const reminderRow: React.CSSProperties = {
  marginTop: 6,
};

const metaLine: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(226,232,240,0.88)",
  marginTop: 2,
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
