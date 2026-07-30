import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Users,
  Stethoscope,
  Clock,
  UserCheck,
  XCircle,
  ChevronRight,
  History,
  Eye,
  Sparkles,
  Search,
  CalendarClock,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Read view from URL query param e.g. ?view=history
  const queryView = new URLSearchParams(location.search).get("view") || "today";
  const [viewMode, setViewMode] = useState(queryView);

  // Sync when URL changes (sidebar clicks)
  useEffect(() => {
    setViewMode(queryView);
  }, [queryView]);

  const setView = (mode) => {
    setViewMode(mode);
    navigate(`/dashboard?view=${mode}`, { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = (localStorage.getItem("role") || "").toLowerCase();
    setRole(storedRole);

    if (!token) { navigate("/"); return; }
    if (storedRole && storedRole !== "doctor") {
      navigate(storedRole === "admin" ? "/admin-dashboard" : storedRole === "receptionist" ? "/receptionist-dashboard" : "/dashboard");
      return;
    }

    const loadData = async () => {
      try {
        let doctorList = [];
        let appointmentList = [];

        if (storedRole === "doctor") {
          const doctorsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } });
          const doctorsData = await doctorsRes.json().catch(() => []);
          doctorList = Array.isArray(doctorsData) ? doctorsData : [];

          const username = (localStorage.getItem("username") || "").toLowerCase();
          const matched = doctorList.find((d) => (d.name || "").toLowerCase().includes(username));
          const fallbackDoctor = doctorList.length === 1 ? doctorList[0] : null;
          const doctorIdToFetch = matched ? matched.doctor_id : localStorage.getItem("doctorId") || fallbackDoctor?.doctor_id;

          if (doctorIdToFetch) {
            const apptRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/doctor/${doctorIdToFetch}`, { headers: { Authorization: `Bearer ${token}` } });
            appointmentList = await apptRes.json().catch(() => []);
            setSelectedDoctorId(String(doctorIdToFetch));
            localStorage.setItem("doctorId", String(doctorIdToFetch));
          }
        } else {
          const [doctorsRes, appointmentsRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/`, { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          const doctorsData = await doctorsRes.json().catch(() => []);
          const appointmentsData = await appointmentsRes.json().catch(() => []);
          doctorList = Array.isArray(doctorsData) ? doctorsData : [];
          appointmentList = Array.isArray(appointmentsData) ? appointmentsData : [];
        }

        setDoctors(doctorList);
        setAppointments(appointmentList);

        if (storedRole !== "doctor") {
          const storedDoctorId = localStorage.getItem("doctorId");
          const username = (localStorage.getItem("username") || "").toLowerCase();
          let initialDoctor = doctorList.find((d) => String(d.doctor_id) === storedDoctorId);
          if (!initialDoctor) initialDoctor = doctorList.find((d) => d.name?.toLowerCase().includes(username));
          if (!initialDoctor && doctorList.length > 0) initialDoctor = doctorList[0];
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
    () => doctors.find((d) => String(d.doctor_id) === String(selectedDoctorId)) || null,
    [doctors, selectedDoctorId]
  );

  const doctorAppointments = useMemo(() => {
    if (!selectedDoctor) return [];
    return appointments.filter((a) => {
      const dId = a.doctor?.doctor_id ?? a.doctor_id;
      return String(dId) === String(selectedDoctor.doctor_id);
    });
  }, [appointments, selectedDoctor]);

  const normalizeDate = (v) => {
    if (v instanceof Date) return v.toLocaleDateString("en-CA");
    return String(v || "").slice(0, 10);
  };

  const today = new Date().toLocaleDateString("en-CA");

  const todaysAppointments = doctorAppointments.filter((a) => normalizeDate(a.appointment_date) === today).length;
  const completedToday = doctorAppointments.filter((a) => normalizeDate(a.appointment_date) === today && String(a.status || "").toLowerCase() === "completed").length;
  const upcomingCount = doctorAppointments.filter((a) => normalizeDate(a.appointment_date) > today && String(a.status || "").toLowerCase() !== "cancelled").length;

  const patientList = [...doctorAppointments]
    .sort((a, b) => {
      const dA = normalizeDate(a.appointment_date), dB = normalizeDate(b.appointment_date);
      return dA === dB ? (a.appointment_time || "").localeCompare(b.appointment_time || "") : dA.localeCompare(dB);
    })
    .map((a) => ({
      id: a.appointment_id,
      patientId: a.patient?.patient_id || null,
      name: a.patient?.full_name || "Unknown patient",
      time: a.appointment_time || "--",
      date: normalizeDate(a.appointment_date) || "--",
      status: a.status || "Scheduled",
    }));

  const todayList = patientList.filter((p) => normalizeDate(p.date) === today && String(p.status).toLowerCase() === "scheduled");
  const historyList = patientList.filter((p) => normalizeDate(p.date) < today || ["completed", "cancelled"].includes(String(p.status).toLowerCase()));
  const upcomingList = patientList.filter((p) => normalizeDate(p.date) > today && String(p.status).toLowerCase() !== "cancelled");
  const allPatients = [...new Map(patientList.map((p) => [p.patientId, p])).values()];

  const visibleList =
    viewMode === "history" ? historyList :
    viewMode === "upcoming" ? upcomingList :
    viewMode === "patients" ? allPatients :
    todayList;

  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Unable to cancel");
      const updated = await res.json();
      setAppointments((prev) => prev.map((a) => a.appointment_id === updated.appointment_id ? updated : a));
      setActionMessage("Appointment cancelled successfully.");
    } catch (err) { setActionMessage(err.message || "Failed to cancel."); }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "Completed" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Unable to complete");
      const updated = await res.json();
      setAppointments((prev) => prev.map((a) => a.appointment_id === updated.appointment_id ? updated : a));
      setActionMessage("Appointment marked complete.");
    } catch (err) { setActionMessage(err.message || "Failed to complete."); }
  };

  const tabConfig = [
    { key: "today",    label: "Today's Schedule",      icon: CalendarCheck },
    { key: "upcoming", label: "Upcoming Appointments",  icon: CalendarClock },
    { key: "history",  label: "Appointment History",    icon: History },
    { key: "patients", label: "View Patients",          icon: Eye },
  ];

  const sectionLabel = tabConfig.find((t) => t.key === viewMode)?.label || "Today's Schedule";
  const sectionDesc = {
    today: "Scheduled consultations for today",
    upcoming: "Future appointments not yet occurred",
    history: "Past consults and historical records",
    patients: "All patients assigned to you",
  }[viewMode];

  return (
    <div className="space-y-8">
      {/* Doctor Portal Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-2xl shadow-blue-500/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,#fff_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wide">
              <Sparkles size={14} className="text-amber-300" /> Doctor Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Good Morning, {selectedDoctor ? selectedDoctor.name : "Doctor"} 👋
            </h1>
            <p className="text-sm text-blue-100 max-w-xl">
              Here is your appointment schedule for today and patient consultation timeline.
            </p>
          </div>

          {role !== "doctor" && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-blue-200 uppercase">Select Doctor Profile</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => { setSelectedDoctorId(e.target.value); localStorage.setItem("doctorId", e.target.value); }}
                className="w-full px-4 py-2.5 rounded-2xl bg-white text-slate-900 text-xs font-bold shadow-lg focus:outline-none cursor-pointer"
              >
                {doctors.length === 0
                  ? <option value="">No doctors available</option>
                  : doctors.map((d) => <option key={d.doctor_id} value={d.doctor_id}>{d.name} - {d.specialization}</option>)
                }
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-semibold">{error}</div>}
      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs font-semibold ${actionMessage.includes("success") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"}`}>
          {actionMessage}
        </div>
      )}

      {/* Stat Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value={loading ? "--" : todaysAppointments} icon={<CalendarDays size={20} />} color="from-blue-500 to-indigo-600" onClick={() => setView("today")} />
        <StatCard title="Completed Today" value={loading ? "--" : completedToday} icon={<CheckCircle2 size={20} />} color="from-emerald-400 to-teal-600" onClick={() => setView("history")} />
        <StatCard title="Upcoming Patients" value={loading ? "--" : upcomingCount} icon={<CalendarClock size={20} />} color="from-purple-500 to-indigo-600" onClick={() => setView("upcoming")} />
        <StatCard title="Total Patients" value={loading ? "--" : allPatients.length} icon={<Users size={20} />} color="from-amber-400 to-orange-500" onClick={() => setView("patients")} />
      </section>

      {/* View Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabConfig.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              viewMode === key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Main Content Panel */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{sectionLabel}</h3>
            <p className="text-xs text-slate-400">{sectionDesc}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Stethoscope size={16} />
            {selectedDoctor ? selectedDoctor.name : "No doctor assigned"}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
        ) : visibleList.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No records found for this view</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleList.map((patient) => {
              const status = String(patient.status || "").toLowerCase();
              const statusColor =
                status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" :
                status === "cancelled" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" :
                "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";

              return (
                <motion.div
                  key={`${patient.id}-${patient.patientId}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 text-white font-bold text-sm flex items-center justify-center shadow-sm flex-shrink-0">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{patient.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{patient.date} • {patient.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                      {patient.status}
                    </span>

                    {patient.patientId && (
                      <>
                        <button
                          onClick={() => navigate(`/patients/${patient.patientId}`)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          View Record
                        </button>

                        {status === "scheduled" && (
                          <>
                            <button
                              onClick={() => handleCompleteAppointment(patient.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(patient.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center gap-4 hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-0.5 transition-all"
    >
      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${color} text-white flex items-center justify-center shadow-md flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</h3>
      </div>
    </button>
  );
}

export default Dashboard;