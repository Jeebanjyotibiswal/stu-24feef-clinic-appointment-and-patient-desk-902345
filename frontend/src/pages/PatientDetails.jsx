import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, User, Clock, FileText, CheckCircle2, XCircle } from "lucide-react";

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();

    if (!token) {
      navigate("/");
      return;
    }

    if (!["admin", "receptionist", "doctor"].includes(role)) {
      navigate("/");
      return;
    }

    const fetchPatient = async () => {
      try {
        const [patientRes, appointmentsRes] = await Promise.all([
          fetch(`http://localhost:8001/patients/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:8001/appointments/patient/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const patientData = await patientRes.json();
        const appointmentData = await appointmentsRes.json();

        if (!patientRes.ok) {
          throw new Error(patientData.detail || "Unable to load patient details");
        }

        if (!appointmentsRes.ok) {
          throw new Error(appointmentData.detail || "Unable to load appointments");
        }

        setPatient(patientData);
        setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
      } catch (err) {
        setError(err.message || "Unable to load patient details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, navigate]);

  const today = new Date().toISOString().slice(0, 10);
  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.appointment_date === b.appointment_date) {
      return (a.appointment_time || "").localeCompare(b.appointment_time || "");
    }
    return a.appointment_date.localeCompare(b.appointment_date);
  });

  const upcoming = sortedAppointments.filter((appointment) => appointment.appointment_date >= today);
  const history = sortedAppointments.filter((appointment) => appointment.appointment_date < today);

  const renderStatusChip = (status) => {
    const normalized = String(status || "").toLowerCase();
    const base = {
      Scheduled: { bg: "#eff6ff", color: "#2563eb" },
      Completed: { bg: "#ecfdf5", color: "#16a34a" },
      Cancelled: { bg: "#fef2f2", color: "#b91c1c" },
    }[status] || { bg: "#f8fafc", color: "#334155" };
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: base.bg, color: base.color, fontWeight: 600, fontSize: 13 }}>
        {normalized === "completed" ? <CheckCircle2 size={14} /> : normalized === "cancelled" ? <XCircle size={14} /> : <Clock size={14} />}
        {status}
      </span>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 24, fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <button onClick={() => navigate(-1)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#2563eb", marginBottom: 16 }}>
          <ArrowLeft size={18} /> Back
        </button>

        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 8px 24px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.1 }}>Patient Details</p>
            <h1 style={{ margin: "6px 0 0" }}>{patient?.full_name || "Patient"}</h1>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>View patient history, contact details, and appointment timeline.</p>
          </div>
          <div style={{ display: "grid", gap: 8, textAlign: "right" }}>
            <span style={{ color: "#64748b" }}><User size={16} /> {patient?.gender || "-"}</span>
            <span style={{ color: "#64748b" }}><CalendarDays size={16} /> DOB: {patient?.dob || "-"}</span>
          </div>
        </header>

        {error && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</p>}

        <section style={{ display: "grid", gap: 16, marginBottom: 20, gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0 }}>Patient Information</h3>
            {loading ? (
              <p style={{ color: "#64748b" }}>Loading patient record...</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <InfoRow label="Full Name" value={patient?.full_name || "-"} />
                <InfoRow label="Phone" value={patient?.phone || "-"} />
                <InfoRow label="Email" value={patient?.email || "-"} />
                <InfoRow label="Address" value={patient?.address || "-"} />
                <InfoRow label="Blood Group" value={patient?.blood_group || "-"} />
              </div>
            )}
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
            <h3 style={{ marginTop: 0 }}>Appointment Summary</h3>
            {loading ? (
              <p style={{ color: "#64748b" }}>Loading summary...</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <StatLabel label="Total Appointments" value={appointments.length} />
                <StatLabel label="Upcoming" value={upcoming.length} />
                <StatLabel label="History" value={history.length} />
              </div>
            )}
          </div>
        </section>

        <section style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Appointment History</h3>
            <p style={{ margin: 0, color: "#64748b" }}>All appointments for this patient.</p>
          </div>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading appointments...</p>
          ) : sortedAppointments.length === 0 ? (
            <p style={{ color: "#64748b" }}>No appointments found.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {sortedAppointments.map((appointment) => (
                <div key={appointment.appointment_id} style={{ border: "1px solid #e2e8f0", borderRadius: 14, padding: 18, display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700 }}>{appointment.appointment_date} • {appointment.appointment_time}</p>
                    <p style={{ margin: "6px 0 0", color: "#64748b" }}>Doctor: {appointment.doctor?.name || `ID ${appointment.doctor_id}`}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    {renderStatusChip(appointment.status)}
                    <button onClick={() => navigate(`/dashboard`)} style={{ border: "none", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "8px 12px", cursor: "pointer" }}>
                      Back to schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#334155" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function StatLabel({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default PatientDetails;
