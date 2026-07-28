import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Stethoscope, UserPlus, ClipboardPlus, LogOut } from "lucide-react";

function Receptionist_dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    waitingPatients: 0,
    completed: 0,
    cancelled: 0,
    newRegistrations: 0,
    patients: 0,
    doctors: 0,
    appointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";

    if (!token) {
      navigate("/");
      return;
    }

    if (role.toLowerCase() !== "receptionist") {
      navigate("/dashboard");
      return;
    }

    const loadStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          fetch("http://127.0.0.1:8001/patients/", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8001/doctors", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8001/appointments/", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const patientsData = await patientsRes.json().catch(() => []);
        const doctorsData = await doctorsRes.json().catch(() => []);
        const appointmentsData = await appointmentsRes.json().catch(() => []);

        const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
        const today = new Date().toLocaleDateString("en-CA");

        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setAppointments(appointments);

        setStats({
          todaysAppointments: appointments.filter((item) => String(item.appointment_date || "").slice(0, 10) === today).length,
          waitingPatients: appointments.filter((item) => String(item.status || "").toLowerCase() === "scheduled").length,
          completed: appointments.filter((item) => String(item.status || "").toLowerCase() === "completed").length,
          cancelled: appointments.filter((item) => String(item.status || "").toLowerCase() === "cancelled").length,
          newRegistrations: Array.isArray(patientsData) ? patientsData.length : 0,
          patients: Array.isArray(patientsData) ? patientsData.length : 0,
          doctors: Array.isArray(doctorsData) ? doctorsData.length : 0,
          appointments: appointments.length,
        });
      } catch (err) {
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [navigate]);

  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8001/appointments/${appointmentId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Unable to cancel appointment");
      }

      const updatedAppointment = await response.json();
      setAppointments((prev) => {
        const nextAppointments = prev.map((appt) => appt.appointment_id === updatedAppointment.appointment_id ? updatedAppointment : appt);
        const today = new Date().toLocaleDateString("en-CA");
        setStats((prevStats) => ({
          ...prevStats,
          todaysAppointments: nextAppointments.filter((item) => String(item.appointment_date || "").slice(0, 10) === today).length,
          waitingPatients: nextAppointments.filter((item) => String(item.status || "").toLowerCase() === "scheduled").length,
          completed: nextAppointments.filter((item) => String(item.status || "").toLowerCase() === "completed").length,
          cancelled: nextAppointments.filter((item) => String(item.status || "").toLowerCase() === "cancelled").length,
          appointments: nextAppointments.length,
        }));
        return nextAppointments;
      });
      setActionMessage("Appointment cancelled successfully.");
    } catch (err) {
      setActionMessage(err.message || "Failed to cancel appointment.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.1 }}>Reception Desk</p>
            <h1 style={{ margin: "6px 0 0" }}>Receptionist Dashboard</h1>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>Manage appointments, patients, and daily operations.</p>
          </div>
          <button onClick={handleLogout} style={{ border: "none", background: "#0f172a", color: "#fff", padding: "10px 14px", borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <LogOut size={16} /> Logout
          </button>
        </header>

        {error && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</p>}
        {actionMessage && <p style={{ color: actionMessage.includes("success") ? "#16a34a" : "#b91c1c", marginBottom: 12 }}>{actionMessage}</p>}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
          <StatCard title="Today's Appointments" value={loading ? "--" : stats.todaysAppointments} icon={<CalendarDays size={20} />} color="#2563eb" />
          <StatCard title="Waiting Patients" value={loading ? "--" : stats.waitingPatients} icon={<Users size={20} />} color="#0f766e" />
          <StatCard title="Completed" value={loading ? "--" : stats.completed} icon={<ClipboardPlus size={20} />} color="#16a34a" />
          <StatCard title="Cancelled" value={loading ? "--" : stats.cancelled} icon={<CalendarDays size={20} />} color="#dc2626" />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          <StatCard title="New Registrations Today" value={loading ? "--" : stats.newRegistrations} icon={<UserPlus size={20} />} color="#7c3aed" />
          <StatCard title="Patients" value={loading ? "--" : stats.patients} icon={<Users size={20} />} color="#f59e0b" />
          <StatCard title="Doctors" value={loading ? "--" : stats.doctors} icon={<Stethoscope size={20} />} color="#334155" />
        </section>

        <section style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
          <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <ActionButton label="Book Appointment" onClick={() => navigate("/add-appointment")} />
            <ActionButton label="Add Patient" onClick={() => navigate("/add-patient")} />
          </div>
        </section>
        
        <section style={{ marginTop: 20, background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Appointments</h3>
            <div>
              <input
                type="text"
                placeholder="Search appointments by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 260 }}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading appointments...</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {appointments
                .filter((appt) => {
                  if (!searchTerm) return true;
                  return (appt.patient?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((appt) => {
                  const appointmentDate = String(appt.appointment_date || "").slice(0, 10);
                  const status = appt.status || "Scheduled";
                  return (
                    <div key={appt.appointment_id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700 }}>{appt.patient?.full_name || "Unknown patient"}</p>
                        <p style={{ margin: "6px 0 0", color: "#64748b" }}>{appointmentDate} • {appt.appointment_time || "--"}</p>
                        <p style={{ margin: "6px 0 0", color: "#64748b" }}>Doctor: {appt.doctor?.name || `ID ${appt.doctor_id}`}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ padding: "6px 10px", borderRadius: 999, background: status === "Cancelled" ? "#fee2e2" : "#eff6ff", color: status === "Cancelled" ? "#b91c1c" : "#2563eb", fontSize: 13, fontWeight: 600 }}>
                          {status}
                        </span>
                        {status.toLowerCase() === "scheduled" && (
                          <>
                            <button
                              onClick={() => navigate(`/edit-appointment/${appt.appointment_id}`)}
                              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #2563eb", background: "#eff6ff", color: "#2563eb", cursor: "pointer" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appt.appointment_id)}
                              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ef4444", background: "#fee2e2", color: "#b91c1c", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color, color: "#fff", display: "grid", placeItems: "center" }}>{icon}</div>
      <div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{title}</p>
        <h2 style={{ margin: "4px 0 0" }}>{value}</h2>
      </div>
    </div>
  );
}

function ActionButton({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "14px 16px", border: "none", borderRadius: 12, background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
      {label}
    </button>
  );
}

export default Receptionist_dashboard;
