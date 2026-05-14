
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/auth/Login";
import { Vehicles } from "./pages/vehicles/VehicleList";
import { AddVehicle } from "./pages/vehicles/Addvehicle";
import { FuelList } from "./pages/fuel/FuelList";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Register } from "./pages/auth/Register";
import { AddFuel } from "./pages/fuel/AddFuel";
import { EditFuel } from "./pages/fuel/EditFuel";
import { Dashboard } from "./pages/Dashboard";
import { useIsMobile } from "./hooks/useIsMobile";
import { MobileNav } from "./components/MobileNav";


function FuelWrapper() {
  const { vehicleId } = useParams();
  return <FuelList vehicleId={Number(vehicleId)} />;
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
          path="/vehicles/:vehicleId/fuel"
          element={token ? <FuelWrapper /> : <Navigate to="/login" />}/>

        <Route 
          path="/vehicles/:vehicleId/fuel/add" 
          element={<AddFuel />} />

        <Route 
          path="/fuel/edit/:id" 
          element={<EditFuel />} />

        
        <Route
          path="/vehicles/:vehicleId/dashboard"
          element={<DashboardWrapper />}
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
