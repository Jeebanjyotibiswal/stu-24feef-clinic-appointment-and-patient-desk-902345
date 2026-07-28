import React, { useState } from "react";
import {
  User,
  Hash,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Save,
  RotateCcw,
} from "lucide-react";
import "./Add_doctor.css";

function Add_doctor() {
  const initialData = {
    doctor_id: "",
    name: "",
    gender: "Male",
    specialization: "",
    department: "",
    join_date: "",
    experience: "",
  };

  const [formData, setFormData] = useState(initialData);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Please login before adding a doctor.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        name: formData.name,
        gender: formData.gender,
        specialization: formData.specialization,
        department: formData.department,
        join_date: formData.join_date,
        experience: Number(formData.experience),
      };

      if (
        formData.doctor_id !== undefined &&
        formData.doctor_id !== null &&
        String(formData.doctor_id).trim() !== ""
      ) {
        payload.doctor_id = Number(formData.doctor_id);
      }

      let response;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      try {
        response = await fetch("http://127.0.0.1:8001/doctors", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      } catch {
        response = await fetch("http://localhost:8000/doctors", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `✅ Doctor added successfully! ${
            data.doctor_id ? `(Doctor ID: ${data.doctor_id})` : ""
          }`
        );
        setFormData(initialData);
      } else if (response.status === 401) {
        setMessage("❌ Authentication required. Please log in again.");
      } else if (response.status === 422) {
        if (Array.isArray(data.detail)) {
          const errs = data.detail
            .map((err) => `${err.loc?.slice(-1)[0] || "Field"}: ${err.msg}`)
            .join(", ");
          setMessage(`❌ Validation error: ${errs}`);
        } else {
          setMessage(`❌ Validation error: ${data.detail || "Invalid input"}`);
        }
      } else {
        setMessage(
          `❌ ${data.detail || data.message || "Failed to add doctor"}`
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setMessage("");
  };

  const inputClass = "text-input";
  const selectClass = "select-input";

  return (
    <div className="doctor-page">
      <div className="doctor-shell">
        <header className="doctor-header">
          <div>
            <p className="admin-eyebrow">Doctor Management</p>
            <h1>Add Doctor</h1>
            <p className="admin-subtitle">
              Add a doctor to your clinic roster with the form below.
            </p>
          </div>
          <button type="button" className="button-secondary" onClick={handleReset}>
            <RotateCcw size={18} /> Reset
          </button>
        </header>

        <section className="panel-card">
          <div className="panel-heading">
            <div>
              <h3>Doctor Profile</h3>
              <p>Complete the required fields and save to register the doctor.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="doctor-form">
            <div className="field-grid two-columns">
              <div className="field-group">
                <label className="field-label">Doctor ID (optional)</label>
                <div className="input-wrapper">
                  <Hash className="input-icon" />
                  <input
                    type="number"
                    name="doctor_id"
                    placeholder="e.g. 101"
                    value={formData.doctor_id}
                    onChange={handleChange}
                    min="1"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Full Name *</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Doctor Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="field-grid two-columns">
              <div className="field-group">
                <label className="field-label">Gender *</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Specialization *</label>
                <div className="input-wrapper">
                  <Stethoscope className="input-icon" />
                  <input
                    type="text"
                    name="specialization"
                    placeholder="Cardiology"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="field-grid two-columns">
              <div className="field-group">
                <label className="field-label">Department *</label>
                <div className="input-wrapper">
                  <Building2 className="input-icon" />
                  <input
                    type="text"
                    name="department"
                    placeholder="General Medicine"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Join Date *</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" />
                  <input
                    type="date"
                    name="join_date"
                    value={formData.join_date}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="field-grid two-columns">
              <div className="field-group">
                <label className="field-label">Experience (Years) *</label>
                <div className="input-wrapper">
                  <Clock className="input-icon" />
                  <input
                    type="number"
                    name="experience"
                    placeholder="5"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="field-group">
                <p className="field-label">Status</p>
                <div className="status-chip">Ready to submit</div>
              </div>
            </div>

            <div className="actions-row">
              <button type="submit" className="button-primary" disabled={loading}>
                <Save size={18} />
                {loading ? " Saving..." : " Save Doctor"}
              </button>
            </div>

            {message && (
              <div className={message.includes("successfully") ? "message-box message-success" : "message-box message-error"}>
                {message}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

export default Add_doctor;