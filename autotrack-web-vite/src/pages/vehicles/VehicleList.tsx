
import { useEffect, useState } from "react";
import { apiDelete, apiGet } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { VehicleCard } from "../../components/VehicleCard";
import { createHoverHandlers } from "../../utils/uiHandlers";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { ThemeToggle } from "../../components/ThemeToggle";
import { getVehicleReminders } from "../../services/reminders";
import type { Reminder } from "../../types/Reminder";

type Vehicle = {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  currentMileageKm?: number;
  currentMileage?: number;
  odometerKm?: number;
  odometer?: number;
  mileageKm?: number;
  mileage?: number;
  reminders?: Reminder[];
  upcomingEvent?: string;
  upcomingNotification?: string;
  nextEventTitle?: string;
  nextDueDate?: string;
  nextDueKm?: number;
};

type EntryLike = {
  odometerKm?: number | string;
  odometer?: number | string;
  mileageKm?: number | string;
  mileage?: number | string;
  km?: number | string;
  kilometers?: number | string;
};

type Props = {
  onLogout: () => void;
};

export function Vehicles({ onLogout }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const parseMileage = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const numeric = Number(value.replace(/,/g, "").trim());
      return Number.isFinite(numeric) ? numeric : null;
    }
    return null;
  };

  const collectMileageCandidates = (source: Record<string, unknown>) => {
    return [
      parseMileage(source.currentMileageKm),
      parseMileage(source.currentMileage),
      parseMileage(source.current_mileage),
      parseMileage(source.currentMileageKM),
      parseMileage(source.odometerKm),
      parseMileage(source.odometer),
      parseMileage(source.mileageKm),
      parseMileage(source.mileage),
      parseMileage(source.kilometers),
      parseMileage(source.km),
    ].filter((n): n is number => n !== null);
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm(t("deleteVehicleConfirm"));
    if (!confirmed) return;

    try {
      await apiDelete(`vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
      if (selectedVehicleId === id) {
        setSelectedVehicleId(null);
      }
    } catch {
      setError(t("deleteFailed"));
    }
  };

  useEffect(() => {
    apiGet<Vehicle[]>("vehicles")
      .then(async (baseVehicles) => {
        const withMileage = await Promise.all(
          baseVehicles.map(async (vehicle) => {
            let entryMileageCandidates: number[] = [];
            let reminders: Reminder[] = [];

            try {
              const entries = await apiGet<EntryLike[]>(`entries/vehicle/${vehicle.id}`);
              entryMileageCandidates = entries.flatMap((entry) =>
                collectMileageCandidates(entry as unknown as Record<string, unknown>)
              );
            } catch {
              entryMileageCandidates = [];
            }

            try {
              reminders = await getVehicleReminders(vehicle.id);
            } catch {
              reminders = [];
            }

            const vehicleMileageCandidates = collectMileageCandidates(
              vehicle as unknown as Record<string, unknown>
            );

            const allCandidates = [...vehicleMileageCandidates, ...entryMileageCandidates];
            const highestMileage = allCandidates.length > 0 ? Math.max(...allCandidates) : null;

            return {
              ...vehicle,
              currentMileageKm: highestMileage ?? vehicle.currentMileageKm,
              reminders,
            };
          })
        );

        setVehicles(withMileage);
      })
      .catch((err) => {
          console.error("Vehicles error:", err);
           
          setError(
            `${err?.response?.status ?? ""} ${
            err?.response?.data ?? err?.message ?? t("loadVehicleError")
            }`
          );
        })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={screen}>
      <header style={headerCard}>
        <div>
          <p style={eyebrow}>AUTOTRACK IOS</p>
          <h1 style={title}>{t("vehicles")}</h1>
        </div>

        <div style={headerActions}>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <section style={listWrap}>

      {loading && <p style={stateCard}>{t("loading")}</p>}

      {error && <p style={errorCard}>{error}</p>}

      {!loading && !error && vehicles.length === 0 && (
        <p style={stateCard}>{t("noVehicles")}</p>
      )}

      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          onDelete={handleDelete}
          isSelected={selectedVehicleId === vehicle.id}
          onSelect={() => {
            setSelectedVehicleId((prev) => (prev === vehicle.id ? null : vehicle.id));
          }}
        />
      ))}
      </section>

      <div style={bottomActions}>
        <button
          {...createHoverHandlers("rgba(59,130,246,0.6)")}
          style={btn}
          onClick={onLogout}
        >
          {t("logout")}
        </button>

        <button
          {...createHoverHandlers("rgba(59,130,246,0.6)")}
          style={primaryBtn}
          onClick={() => navigate("/vehicles/add")}
        >
          {t("addVehicle")}
        </button>
      </div>
    </div>
  );
}

const screen: React.CSSProperties = {
  width: "100%",
  maxWidth: 440,
  margin: "0 auto",
  padding: "10px 8px 110px"
};

const headerCard: React.CSSProperties = {
  position: "relative",
  zIndex: 30,
  marginBottom: 14,
  padding: 14,
  borderRadius: 20,
  border: "1px solid var(--ui-card-border)",
  background: "var(--ui-card-bg)",
  boxShadow: "var(--ui-shadow)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  backdropFilter: "blur(12px)"
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  letterSpacing: 1.2,
  fontWeight: 700,
  color: "var(--ui-text-muted)"
};

const title: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 30,
  lineHeight: 1.05,
  fontWeight: 800,
  color: "var(--ui-text-main)",
};

const headerActions: React.CSSProperties = {
  position: "relative",
  zIndex: 31,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const listWrap: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const stateCard: React.CSSProperties = {
  margin: "6px 0 10px",
  padding: "14px 12px",
  borderRadius: 14,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-card-bg)",
  color: "var(--ui-text-main)",
  fontSize: 14,
  textAlign: "center",
};

const errorCard: React.CSSProperties = {
  ...stateCard,
  color: "#f87171",
  border: "1px solid rgba(248,113,113,0.4)",
};

const bottomActions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 12,
  justifyContent: "center",
  flexWrap: "wrap",
};

const btn: React.CSSProperties = {
  flex: 1,
  minHeight: 46,
  padding: "10px 14px",
  borderRadius: 14,
  border: "1px solid var(--ui-btn-border)",
  background: "var(--ui-btn-bg)",
  color: "var(--ui-btn-text)",
  cursor: "pointer",
  fontWeight: 500
};

const primaryBtn: React.CSSProperties = {
  ...btn,
  border: "none",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  boxShadow: "0 10px 22px rgba(37,99,235,0.42)",
};

