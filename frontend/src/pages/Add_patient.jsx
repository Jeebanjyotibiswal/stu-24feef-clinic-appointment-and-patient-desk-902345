import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react";

function Add_patient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "Male",
    dob: "",
    phone: "",
    email: "",
    address: "",
    blood_group: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      setMessage("❌ You do not have access to add patients.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add patient");
      }

      setMessage(`✅ Patient added successfully!`);
      setFormData({
        full_name: "",
        gender: "Male",
        dob: "",
        phone: "",
        email: "",
        address: "",
        blood_group: "",
      });
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
        <UserPlus size={24} color="#2563eb" />
        <h2 style={{ margin: 0 }}>Add Patient</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Full Name" style={inputStyle} />
        <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required style={inputStyle} />
        <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone" style={inputStyle} />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" style={inputStyle} />
        <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" style={inputStyle} />
        <input name="blood_group" value={formData.blood_group} onChange={handleChange} placeholder="Blood Group" style={inputStyle} />

        <button type="submit" disabled={loading} style={{ padding: "12px 16px", border: "none", borderRadius: 10, background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
          {loading ? "Saving..." : "Save Patient"}
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

export default Add_patient;
