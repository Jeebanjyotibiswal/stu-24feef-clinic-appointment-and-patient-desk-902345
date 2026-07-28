import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, Users, Stethoscope, LogOut } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [viewMode, setViewMode] = useState("today");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = (localStorage.getItem("role") || "").toLowerCase();
    setRole(storedRole);

    if (!token) {
      navigate("/");
      return;
    }

    if (storedRole && storedRole !== "doctor") {
      navigate(storedRole === "admin" ? "/admin-dashboard" : storedRole === "receptionist" ? "/receptionist-dashboard" : "/dashboard");
      return;
    }

    const loadData = async () => {
      try {
        // If the logged-in user is a doctor, fetch only that doctor's appointments
        let doctorList = [];
        let appointmentList = [];

        if (storedRole === "doctor") {
          const doctorsRes = await fetch("http://localhost:8001/doctors", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const doctorsData = await doctorsRes.json().catch(() => []);
          doctorList = Array.isArray(doctorsData) ? doctorsData : [];

          const username = (localStorage.getItem("username") || "").toLowerCase();
          const matched = doctorList.find((d) => (d.name || "").toLowerCase().includes(username));
          const fallbackDoctor = doctorList.length === 1 ? doctorList[0] : null;
          const doctorIdToFetch = matched ? matched.doctor_id : localStorage.getItem("doctorId") || fallbackDoctor?.doctor_id;

          if (doctorIdToFetch) {
            const apptRes = await fetch(`http://localhost:8001/appointments/doctor/${doctorIdToFetch}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            appointmentList = await apptRes.json().catch(() => []);
            setSelectedDoctorId(String(doctorIdToFetch));
            localStorage.setItem("doctorId", String(doctorIdToFetch));
          }
        } else {
          const [doctorsRes, appointmentsRes] = await Promise.all([
            fetch("http://localhost:8001/doctors", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:8001/appointments/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const doctorsData = await doctorsRes.json().catch(() => []);
          const appointmentsData = await appointmentsRes.json().catch(() => []);

          doctorList = Array.isArray(doctorsData) ? doctorsData : [];
          appointmentList = Array.isArray(appointmentsData) ? appointmentsData : [];
        }

        setDoctors(doctorList);
        setAppointments(appointmentList);

        // For non-doctor roles initial selection logic remains usable
        if (storedRole !== "doctor") {
          const storedDoctorId = localStorage.getItem("doctorId");
          const username = (localStorage.getItem("username") || "").toLowerCase();

          let initialDoctor = doctorList.find((doctor) => String(doctor.doctor_id) === storedDoctorId);
          if (!initialDoctor) {
            initialDoctor = doctorList.find((doctor) =>
              doctor.name?.toLowerCase().includes(username)
            );
          }
          if (!initialDoctor && doctorList.length > 0) {
            initialDoctor = doctorList[0];
          }

          if (initialDoctor) {
            setSelectedDoctorId(String(initialDoctor.doctor_id));
            localStorage.setItem("doctorId", String(initialDoctor.doctor_id));
          }
        }
      } catch (err) {
        setError("Unable to load your dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => String(doctor.doctor_id) === String(selectedDoctorId)) || null,
    [doctors, selectedDoctorId]
  );

  const doctorAppointments = useMemo(() => {
    if (!selectedDoctor) return [];
    return appointments.filter((appointment) => {
      const doctorId = appointment.doctor?.doctor_id ?? appointment.doctor_id;
      return String(doctorId) === String(selectedDoctor.doctor_id);
    });
  }, [appointments, selectedDoctor]);

  const normalizeDate = (value) => {
    if (value instanceof Date) {
      return value.toLocaleDateString("en-CA");
    }
    return String(value || "").slice(0, 10);
  };

  const today = new Date().toLocaleDateString("en-CA");

  const todaysAppointments = doctorAppointments.filter(
    (appointment) => normalizeDate(appointment.appointment_date) === today
  ).length;

  const completedToday = doctorAppointments.filter(
    (appointment) =>
      normalizeDate(appointment.appointment_date) === today &&
      String(appointment.status || "").toLowerCase() === "completed"
  ).length;

  const upcomingPatients = doctorAppointments.filter(
    (appointment) =>
      normalizeDate(appointment.appointment_date) > today &&
      String(appointment.status || "").toLowerCase() !== "cancelled"
  ).length;

  const patientList = [...doctorAppointments]
    .sort((a, b) => {
      const dateA = normalizeDate(a.appointment_date);
      const dateB = normalizeDate(b.appointment_date);
      if (dateA === dateB) {
        return (a.appointment_time || "").localeCompare(b.appointment_time || "");
      }
      return dateA.localeCompare(dateB);
    })
    .map((appointment) => ({
      id: appointment.appointment_id,
      patientId: appointment.patient?.patient_id || null,
      name: appointment.patient?.full_name || "Unknown patient",
      time: appointment.appointment_time || "--",
      date: normalizeDate(appointment.appointment_date) || "--",
      status: appointment.status || "Scheduled",
    }));

  const todayAppointments = patientList.filter((patient) => {
    const appointmentDate = normalizeDate(patient.date);
    const status = String(patient.status || "").toLowerCase();
    return appointmentDate === today && status === "scheduled";
  });

  const appointmentHistory = patientList.filter((patient) => {
    const appointmentDate = normalizeDate(patient.date);
    const status = String(patient.status || "").toLowerCase();
    return (
      appointmentDate < today ||
      status === "completed" ||
      status === "cancelled"
    );
  });

  const visibleAppointments = viewMode === "history" ? appointmentHistory : todayAppointments;

  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8001/appointments/${appointmentId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Unable to cancel appointment");
      }

      const updatedAppointment = await response.json();
      setAppointments((prev) => prev.map((appt) => appt.appointment_id === updatedAppointment.appointment_id ? updatedAppointment : appt));
      setActionMessage("Appointment cancelled successfully.");
    } catch (err) {
      setActionMessage(err.message || "Failed to cancel appointment.");
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8001/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Completed" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Unable to complete appointment");
      }

      const updatedAppointment = await response.json();
      setAppointments((prev) => prev.map((appt) => appt.appointment_id === updatedAppointment.appointment_id ? updatedAppointment : appt));
      setActionMessage("Appointment marked complete.");
    } catch (err) {
      setActionMessage(err.message || "Failed to complete appointment.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("doctorId");
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.1 }}>Doctor Portal</p>
            <h1 style={{ margin: "6px 0 0" }}>Doctor Dashboard</h1>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>Your daily appointments and patient schedule.</p>
          </div>
          <button onClick={handleLogout} style={{ border: "none", background: "#0f172a", color: "#fff", padding: "10px 14px", borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <LogOut size={16} /> Logout
          </button>
        </header>

        {error && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</p>}
        {actionMessage && <p style={{ color: actionMessage.includes("success") ? "#16a34a" : "#b91c1c", marginBottom: 12 }}>{actionMessage}</p>}

        <section style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: 0 }}>{role === "doctor" ? "My Schedule" : "Select Doctor"}</h3>
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>{role === "doctor" ? "Your schedule and patients." : "View the dashboard for any doctor profile."}</p>
            </div>
            {role !== "doctor" && (
              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  const nextId = e.target.value;
                  setSelectedDoctorId(nextId);
                  localStorage.setItem("doctorId", nextId);
                }}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #cbd5e1", minWidth: 220 }}
              >
                {doctors.length === 0 ? (
                  <option value="">No doctors available</option>
                ) : (
                  doctors.map((doctor) => (
                    <option key={doctor.doctor_id} value={doctor.doctor_id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          <StatCard title="My Appointments Today" value={loading ? "--" : todaysAppointments} icon={<CalendarDays size={20} />} color="#2563eb" />
          <StatCard title="Completed Today" value={loading ? "--" : completedToday} icon={<CheckCircle2 size={20} />} color="#16a34a" />
          <StatCard title="Upcoming Patients" value={loading ? "--" : upcomingPatients} icon={<Users size={20} />} color="#7c3aed" />
        </section>

        <section style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setViewMode("today")}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: viewMode === "today" ? "none" : "1px solid #cbd5e1",
              background: viewMode === "today" ? "#2563eb" : "#fff",
              color: viewMode === "today" ? "#fff" : "#0f172a",
              cursor: "pointer",
            }}
          >
            Today's Schedule
          </button>
          <button
            onClick={() => setViewMode("history")}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: viewMode === "history" ? "none" : "1px solid #cbd5e1",
              background: viewMode === "history" ? "#2563eb" : "#fff",
              color: viewMode === "history" ? "#fff" : "#0f172a",
              cursor: "pointer",
            }}
          >
            Appointment History
          </button>
        </section>

        <section style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0 }}>{viewMode === "history" ? "Appointment History" : "Today's Schedule"}</h3>
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>
                {viewMode === "history"
                  ? "Review past appointments and patient statuses."
                  : "See patients scheduled for today with quick access to their details."
                }
              </p>
            </div>
            <div style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
              <Stethoscope size={16} />
              {selectedDoctor ? selectedDoctor.name : "No doctor selected"}
            </div>
          </div>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading appointments...</p>
          ) : visibleAppointments.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              {viewMode === "history"
                ? "No appointment history found for this doctor."
                : "No appointments scheduled for today."
              }
            </p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {visibleAppointments.map((patient) => (
                <div key={patient.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{patient.name}</p>
                    <p style={{ margin: "4px 0 0", color: "#64748b" }}>{patient.date} • {patient.time}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ padding: "6px 10px", borderRadius: 999, background: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 600 }}>
                      {patient.status}
                    </span>
                    {patient.patientId && (
                      <>
                        <button
                          onClick={() => navigate(`/patients/${patient.patientId}`)}
                          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", color: "#2563eb", cursor: "pointer" }}
                        >
                          View Patient
                        </button>
                        {patient.status.toLowerCase() === "scheduled" && (
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleCompleteAppointment(patient.id)}
                              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #2563eb", background: "#eff6ff", color: "#2563eb", cursor: "pointer" }}
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(patient.id)}
                              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ef4444", background: "#fee2e2", color: "#b91c1c", cursor: "pointer" }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Patient List</h3>
          </div>
          <div style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
            <Stethoscope size={16} />
            {selectedDoctor ? selectedDoctor.name : "No doctor selected"}
          </div>
        </section>

        {loading ? (
          <p style={{ color: "#64748b" }}>Loading patients...</p>
        ) : patientList.length === 0 ? (
          <p style={{ color: "#64748b" }}>No patients found for this doctor.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {patientList.map((patient) => (
              <div key={patient.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{patient.name}</p>
                  <p style={{ margin: "4px 0 0", color: "#64748b" }}>{patient.date} • {patient.time}</p>
                </div>
                <span style={{ padding: "6px 10px", borderRadius: 999, background: "#eff6ff", color: "#2563eb", fontSize: 13, fontWeight: 600 }}>
                  {patient.status}
                </span>
              </div>
            ))}
          </div>
        )}
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

export default Dashboard;