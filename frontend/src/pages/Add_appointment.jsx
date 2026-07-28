import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, ArrowLeft } from "lucide-react";

function Add_appointment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";
    if (!token || !["admin", "receptionist"].includes(role.toLowerCase())) {
      setMessage("❌ You do not have access to book appointments.");
      return;
    }

    Promise.all([
      fetch("http://127.0.0.1:8001/patients/", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://127.0.0.1:8001/doctors", { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(async ([patientsRes, doctorsRes]) => {
      const patientsData = await patientsRes.json().catch(() => []);
      const doctorsData = await doctorsRes.json().catch(() => []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    });
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.full_name?.toLowerCase().includes(patientQuery.toLowerCase())
  );

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name?.toLowerCase().includes(doctorQuery.toLowerCase())
  );

  const selectedPatient = patients.find((patient) => String(patient.patient_id) === String(formData.patient_id));
  const selectedDoctor = doctors.find((doctor) => String(doctor.doctor_id) === String(formData.doctor_id));

  const visiblePatients = selectedPatient
    ? [selectedPatient, ...filteredPatients.filter((p) => p.patient_id !== selectedPatient.patient_id)]
    : filteredPatients;

  const visibleDoctors = selectedDoctor
    ? [selectedDoctor, ...filteredDoctors.filter((d) => d.doctor_id !== selectedDoctor.doctor_id)]
    : filteredDoctors;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";

    if (!token || !["admin", "receptionist"].includes(role.toLowerCase())) {
      setMessage("❌ You do not have access to book appointments.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/appointments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          patient_id: Number(formData.patient_id),
          doctor_id: Number(formData.doctor_id),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Failed to book appointment");
      }

      setMessage("✅ Appointment booked successfully!");
      setFormData({ patient_id: "", doctor_id: "", appointment_date: "", appointment_time: "" });
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
      <button onClick={() => navigate(-1)} style={{ border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: "#2563eb", marginBottom: 16 }}>
        <ArrowLeft size={18} /> Back
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <CalendarPlus size={24} color="#2563eb" />
        <h2 style={{ margin: 0 }}>Book Appointment</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontWeight: 600 }}>Search Patient</label>
          <input
            type="text"
            placeholder="Search patient by name"
            value={patientQuery}
            onChange={(e) => setPatientQuery(e.target.value)}
            style={inputStyle}
          />
          <select name="patient_id" value={formData.patient_id} onChange={handleChange} required style={inputStyle}>
            <option value="">Select Patient</option>
            {visiblePatients.length === 0 ? (
              <option value="" disabled>No patients found</option>
            ) : (
              visiblePatients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>{patient.full_name}</option>
              ))
            )}
          </select>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontWeight: 600 }}>Search Doctor</label>
          <input
            type="text"
            placeholder="Search doctor by name"
            value={doctorQuery}
            onChange={(e) => setDoctorQuery(e.target.value)}
            style={inputStyle}
          />
          <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required style={inputStyle}>
            <option value="">Select Doctor</option>
            {visibleDoctors.length === 0 ? (
              <option value="" disabled>No doctors found</option>
            ) : (
              visibleDoctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>{doctor.name}</option>
              ))
            )}
          </select>
        </div>

        <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} required style={inputStyle} />
        <input type="time" name="appointment_time" value={formData.appointment_time} onChange={handleChange} required style={inputStyle} />

        <button type="submit" disabled={loading} style={{ padding: "12px 16px", border: "none", borderRadius: 10, background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
          {loading ? "Booking..." : "Book Appointment"}
        </button>
      </form>

      {message && <p style={{ marginTop: 16, color: message.includes("✅") ? "green" : "#b91c1c" }}>{message}</p>}
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

export default Add_appointment;
