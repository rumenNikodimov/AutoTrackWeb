
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Vehicles } from "./pages/vehicles/VehicleList";
import { AddVehicle } from "./pages/vehicles/AddVehicle";
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
import { LanguageSwitcher } from "./components/LanguageSwitcher";


function EntryWrapper() {
  const { vehicleId } = useParams();
  return <EntryList vehicleId={Number(vehicleId)} />;
}

function App() {
  const isMobile = useIsMobile();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const onLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  
function DashboardWrapper() {
  const { vehicleId } = useParams();

  return <Dashboard vehicleId={Number(vehicleId)} />;
}


  return (
    <BrowserRouter>

      {/* ✅ GLOBAL LANGUAGE SWITCH */}
      <div style={topBar}>
        <LanguageSwitcher />
      </div>

      <Routes>
        <Route
          path="/login"
          element={!token ? <Login onLogin={onLogin} /> : <Navigate to="/vehicles" />}/>
        <Route 
          path="/register" 
          element={<Register />} />

        <Route
          path="/vehicles"
          element={token ? <Vehicles onLogout={onLogout} /> : <Navigate to="/login" />} />

        <Route
          path="/vehicles/add"
          element={token ? <AddVehicle /> : <Navigate to="/login" />}/>

        <Route
          path="/vehicles/:vehicleId/entries"
          element={token ? <EntryWrapper /> : <Navigate to="/login" />}/>

        <Route 
          path="/vehicles/:vehicleId/entries/add" 
          element={<AddEntry />} />

        <Route 
          path="/entries/edit/:id" 
          element={<EditEntry />} />

        
        <Route
          path="/vehicles/:vehicleId/dashboard"
          element={<DashboardWrapper />}
        />
 
        <Route 
          path="/vehicles/edit/:id" 
          element={<EditVehicle />} 
        />

        <Route 
          path="*" 
          element={<Navigate to="/vehicles" />} />

      </Routes>

      {isMobile && <MobileNav />}
    </BrowserRouter>
  );
}

export default App;

//Styles
const topBar: React.CSSProperties = {
  position: "fixed",
  top: 10,
  right: 10,
  zIndex: 9999
};
