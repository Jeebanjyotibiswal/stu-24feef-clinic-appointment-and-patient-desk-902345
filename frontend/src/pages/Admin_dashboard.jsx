import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Stethoscope, CalendarDays, Users, PlusCircle, UserPlus, ArrowRight, LogOut } from "lucide-react";
import "./Admin_dashboard.css";

function Admin_dashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";
    const username = localStorage.getItem("username") || "Admin";

    setAdminName(username);

    if (!token) {
      navigate("/");
      return;
    }

    if (role.toLowerCase() !== "admin") {
      navigate("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const [statsResponse, doctorsResponse, appointmentsResponse] = await Promise.all([
          fetch("http://127.0.0.1:8001/admin/stats", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://127.0.0.1:8001/doctors", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://127.0.0.1:8001/appointments/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const statsData = await statsResponse.json();
        const doctorsData = await doctorsResponse.json();
        const appointmentsData = await appointmentsResponse.json().catch(() => null);

        if (!statsResponse.ok) {
          throw new Error(statsData.detail || "Unable to load dashboard data");
        }

        if (!doctorsResponse.ok) {
          throw new Error(doctorsData.detail || "Unable to load doctor data");
        }

        if (!appointmentsResponse.ok) {
          throw new Error((appointmentsData?.detail) || "Unable to load appointment data");
        }

        setStats({
          doctors: Number(statsData.doctors || 0),
          patients: Number(statsData.patients || 0),
          appointments: statsData.appointments ?? ""
        });
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } catch (err) {
        setError(err.message || "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/");
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, appointments]);

  const filteredAppointments = appointments.filter((appt) => {
    if (!searchTerm) return true;
    const patientName = appt.patient?.full_name || "";
    const doctorName = appt.doctor?.name || "";
    return (
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(appt.appointment_date || "").includes(searchTerm) ||
      String(appt.appointment_time || "").includes(searchTerm)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const pagedAppointments = filteredAppointments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

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
      setAppointments((prev) => prev.map((appt) => appt.appointment_id === updatedAppointment.appointment_id ? updatedAppointment : appt));
      setActionMessage("Appointment cancelled successfully.");
    } catch (err) {
      setActionMessage(err.message || "Failed to cancel appointment.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Clinic Control Center</p>
            <h1>Welcome back, {adminName}</h1>
            <p className="admin-subtitle">Manage doctors, monitor operations, and keep the clinic running smoothly.</p>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon blue">
              <Stethoscope size={20} />
            </div>
            <div>
              <p className="stat-label">Doctors</p>
              <h2>{loading ? "--" : stats.doctors}</h2>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">
              <Users size={20} />
            </div>
            <div>
              <p className="stat-label">Patients</p>
              <h2>{loading ? "--" : stats.patients}</h2>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon purple">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="stat-label">Appointments</p>
              <h2>{loading ? "--" : stats.appointments}</h2>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon gold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="stat-label">Access</p>
              <h2>Admin</h2>
            </div>
          </article>
        </section>

        <section className="content-grid">
          <div className="panel-card">
            <div className="panel-heading">
              <h3>Quick actions</h3>
              <p>Common admin tasks</p>
            </div>

            <div className="action-list">
              <Link to="/add-doctor" className="action-item">
                <PlusCircle size={18} />
                <span>Add a doctor</span>
                <ArrowRight size={16} />
              </Link>

              <Link to="/add-patient" className="action-item">
                <Users size={18} />
                <span>Add a patient</span>
                <ArrowRight size={16} />
              </Link>

              <Link to="/add-appointment" className="action-item">
                <CalendarDays size={18} />
                <span>Book an appointment</span>
                <ArrowRight size={16} />
              </Link>

              <Link to="/register" className="action-item">
                <UserPlus size={18} />
                <span>Register a user</span>
                <ArrowRight size={16} />
              </Link>

              <Link to="/dashboard" className="action-item">
                <Users size={18} />
                <span>Open staff dashboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="panel-card">
            <div className="panel-heading">
              <h3>Doctor roster</h3>
              <p>Latest records available in the clinic system</p>
            </div>

            {loading ? (
              <p className="panel-state">Loading doctors...</p>
            ) : error ? (
              <p className="panel-state error">{error}</p>
            ) : doctors.length === 0 ? (
              <p className="panel-state">No doctors have been added yet.</p>
            ) : (
              <ul className="doctor-list">
                {doctors.slice(0, 5).map((doctor) => (
                  <li key={doctor.doctor_id || doctor.name} className="doctor-item">
                    <div>
                      <strong>{doctor.name}</strong>
                      <p>{doctor.specialization || "Specialization pending"}</p>
                    </div>
                    <span>{doctor.department || "Department"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {actionMessage && (
          <div className="panel-card" style={{ background: actionMessage.includes("success") ? "#ecfdf5" : "#fee2e2", color: actionMessage.includes("success") ? "#166534" : "#991b1b", marginBottom: 20 }}>
            {actionMessage}
          </div>
        )}

        <section className="panel-card">
          <div className="panel-heading">
            <h3>Recent Appointments</h3>
            <p>View and cancel appointments across the clinic.</p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", minWidth: 240 }}
            />
          </div>

          {loading ? (
            <p className="panel-state">Loading appointments...</p>
          ) : error ? (
            <p className="panel-state error">{error}</p>
          ) : appointments.length === 0 ? (
            <p className="panel-state">No appointments found.</p>
          ) : filteredAppointments.length === 0 ? (
            <p className="panel-state">No appointments match your search.</p>
          ) : (
            <>
              <div style={{ display: "grid", gap: 12 }}>
                {pagedAppointments.map((appt) => {
                  const status = appt.status || "Scheduled";
                  const appointmentDate = String(appt.appointment_date || "").slice(0, 10);
                  return (
                    <div key={appt.appointment_id} className="doctor-item" style={{ flexDirection: "column", alignItems: "flex-start" }}>
                      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <strong>{appt.patient?.full_name || "Unknown patient"}</strong>
                          <p>{appt.doctor?.name || `Doctor ID ${appt.doctor_id}`}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ padding: "6px 10px", borderRadius: 999, background: status === "Cancelled" ? "#fee2e2" : "#eff6ff", color: status === "Cancelled" ? "#b91c1c" : "#2563eb", fontSize: "0.85rem", fontWeight: 600 }}>
                            {status}
                          </span>
                          <span style={{ color: "#64748b" }}>{appointmentDate} • {appt.appointment_time || "--"}</span>
                        </div>
                      </div>
                      {status.toLowerCase() === "scheduled" && (
                        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                          <button
                            onClick={() => navigate(`/edit-appointment/${appt.appointment_id}`)}
                            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #2563eb", background: "#eff6ff", color: "#2563eb", cursor: "pointer" }}
                          >
                            Edit Appointment
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appt.appointment_id)}
                            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ef4444", background: "#fee2e2", color: "#b91c1c", cursor: "pointer" }}
                          >
                            Cancel Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pagination-bar">
                <button className="pagination-button" onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Previous
                </button>
                <div className="pagination-summary">
                  Page {currentPage} of {totalPages}
                </div>
                <button className="pagination-button" onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Admin_dashboard;