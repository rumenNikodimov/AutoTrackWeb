import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { ThemeToggle } from "../components/ThemeToggle";

export function AuthLayout() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          padding: "16px 12px 0",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 8,
        }}
      >
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
}
