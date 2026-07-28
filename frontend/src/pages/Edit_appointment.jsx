import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarPlus, ArrowLeft } from "lucide-react";

function Edit_appointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    status: "",
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token || !["admin", "receptionist"].includes(role)) {
      setMessage("❌ You do not have access to edit appointments.");
      setLoadingData(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentRes] = await Promise.all([
          fetch("http://127.0.0.1:8001/patients/", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8001/doctors", { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`http://127.0.0.1:8001/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const patientsData = await patientsRes.json().catch(() => []);
        const doctorsData = await doctorsRes.json().catch(() => []);
        const appointmentData = await appointmentRes.json().catch(() => ({}));

        if (!patientsRes.ok || !doctorsRes.ok || !appointmentRes.ok) {
          const errorMessage = appointmentData.detail || "Unable to fetch appointment details.";
          setMessage(`❌ ${errorMessage}`);
          return;
        }

        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        setFormData({
          patient_id: appointmentData.patient?.patient_id || appointmentData.patient_id || "",
          doctor_id: appointmentData.doctor?.doctor_id || appointmentData.doctor_id || "",
          appointment_date: appointmentData.appointment_date || "",
          appointment_time: appointmentData.appointment_time || "",
          status: appointmentData.status || "Scheduled",
        });
      } catch (err) {
        setMessage(`❌ ${err.message}`);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("role") || "").toLowerCase();
    if (!token || !["admin", "receptionist"].includes(role)) {
      setMessage("❌ You do not have access to edit appointments.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8001/appointments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: Number(formData.patient_id),
          doctor_id: Number(formData.doctor_id),
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          status: formData.status,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Failed to update appointment.");
      }

      setMessage("✅ Appointment updated successfully.");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
      <button onClick={() => navigate(-1)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#2563eb", marginBottom: 16 }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <CalendarPlus size={24} color="#2563eb" />
        <h2 style={{ margin: 0 }}>Edit Appointment</h2>
      </div>

      {loadingData ? (
        <p>Loading appointment details...</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Patient</label>
            <select name="patient_id" value={formData.patient_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>{patient.full_name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Doctor</label>
            <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required style={inputStyle}>
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>{doctor.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Appointment Date</label>
            <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Appointment Time</label>
            <input type="time" name="appointment_time" value={formData.appointment_time} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} required style={inputStyle}>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{ padding: "12px 16px", border: "none", borderRadius: 10, background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {message && <p style={{ marginTop: 16, color: message.includes("✅") ? "#16a34a" : "#b91c1c" }}>{message}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
};

export default Edit_appointment;
