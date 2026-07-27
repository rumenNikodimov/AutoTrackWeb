import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { MobileNav } from "../components/MobileNav";
import { ThemeToggle } from "../components/ThemeToggle";

const routeMeta = [
  {
    matcher: (pathname: string) => pathname === "/vehicles",
    titleKey: "vehicles",
    subtitle: "Garage overview and due reminders"
  },
  {
    matcher: (pathname: string) => pathname.includes("/dashboard"),
    titleKey: "dashboard",
    subtitle: "Running costs, mileage, and trends"
  },
  {
    matcher: (pathname: string) => pathname.includes("/entries"),
    titleKey: "entries",
    subtitle: "Timeline of services, fuel, and inspections"
  },
  {
    matcher: (pathname: string) => pathname.includes("/add"),
    titleKey: "addEntry",
    subtitle: "Quick capture for maintenance tasks"
  }
];

export function AppShell() {
  const location = useLocation();
  const { t } = useTranslation();

  const matchedRoute = routeMeta.find((item) => item.matcher(location.pathname));
  const title = matchedRoute ? t(matchedRoute.titleKey) : "AutoTrack";
  const subtitle = matchedRoute?.subtitle ?? "Vehicle service history for iPhone-sized screens";

  return (
    <div className="relative min-h-screen overflow-hidden text-[color:var(--app-text)]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-16 top-12 h-44 w-44 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute right-0 top-28 h-52 w-52 rounded-full bg-blue-400/20 blur-3xl dark:bg-cyan-400/10" />
        <div className="absolute bottom-24 left-10 h-36 w-36 rounded-full bg-white/45 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-30 pt-4 sm:px-5">
        <header className="glass-card sticky top-3 z-20 flex items-start justify-between gap-3 px-4 py-4">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--app-muted)]">
              AutoTrack iOS
            </p>
            <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.04em] text-[color:var(--app-text)]">
              {title}
            </h1>
            <p className="mt-1 text-sm text-[color:var(--app-muted)]">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="relative z-10 flex-1 pt-4">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}