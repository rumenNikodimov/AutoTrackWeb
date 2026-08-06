import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Vehicles } from "./pages/vehicles/VehicleList";
import { AddVehicle } from "./pages/vehicles/Addvehicle";
import { EntryList } from "./pages/vehicleEntry/EntryList";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Register } from "./pages/auth/Register";
import { AddEntry } from "./pages/vehicleEntry/AddEntry";
import { EditEntry } from "./pages/vehicleEntry/EditEntry";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { useIsMobile } from "./hooks/useIsMobile";
import { MobileNav } from "./components/MobileNav";
import { EditVehicle } from "./pages/vehicles/EditVehicle";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useEffect } from "react";
import { apiGet } from "./services/api";
import { ReminderList } from "./pages/reminders/ReminderList";
import { ConfirmEmail } from "./pages/auth/ConfirmEmail";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { Profile } from "./pages/profile/Profile";
import { AuthLayout } from "./layouts/AuthLayout";


function EntryWrapper() {
  const { vehicleId } = useParams();
  return <EntryList vehicleId={Number(vehicleId)} />;
}

function App() {
  const isMobile = useIsMobile();
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("autotrack:theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      return;
    }

    document.documentElement.classList.add("dark");
    localStorage.setItem("autotrack:theme", "dark");
  }, []);

  const onLogin = () => {
    setIsAuth(true);
  };

  const onLogout = () => {
    setIsAuth(false);
  };

  useEffect(() => {
    apiGet("vehicles")
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));
  }, []);

  function DashboardWrapper() {
    const { vehicleId } = useParams();
    return <Dashboard vehicleId={Number(vehicleId)} />;
  }

  if (isAuth === null) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>

      <Routes>

        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              !isAuth ? <Login onLogin={onLogin} /> : <Navigate to="/vehicles" />
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
       
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <Vehicles onLogout={onLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/add"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <AddVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:vehicleId/entries"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <EntryWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:vehicleId/entries/add"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <AddEntry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entries/edit/:id"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <EditEntry />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:vehicleId/dashboard"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <DashboardWrapper />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/edit/:id"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <EditVehicle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:vehicleId/reminders"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <ReminderList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute isAuth={isAuth === true}>
              <Profile />
            </ProtectedRoute>
          }
        />


        <Route 
          path="*" 
          element={isAuth ? <Navigate to="/vehicles" /> : <Navigate to="/login" />} />

      </Routes>

      {isMobile && <MobileNav />}
    </BrowserRouter>
  );
}

export default App;
