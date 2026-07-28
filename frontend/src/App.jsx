import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard';
import Add_doctor from './pages/Add_doctor';
import Add_patient from './pages/Add_patient';
import Add_appointment from './pages/Add_appointment';
import Edit_appointment from './pages/Edit_appointment';
import Admin_dashboard from './pages/Admin_dashboard';
import Receptionist_dashboard from './pages/Receptionist_dashboard';
import PatientDetails from './pages/PatientDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<Admin_dashboard />} />
        <Route path="/receptionist-dashboard" element={<Receptionist_dashboard />} />
        <Route path="/add-doctor" element={<Add_doctor />} />
        <Route path="/add-patient" element={<Add_patient />} />
        <Route path="/add-appointment" element={<Add_appointment />} />
        <Route path="/edit-appointment/:id" element={<Edit_appointment />} />
        <Route path="/patients/:id" element={<PatientDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
