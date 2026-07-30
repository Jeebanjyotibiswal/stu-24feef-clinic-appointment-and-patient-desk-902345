import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Users,
  Stethoscope,
  UserPlus,
  ClipboardPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Sparkles,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Eye,
} from "lucide-react";

function Receptionist_dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    todaysAppointments: 0, waitingPatients: 0, completed: 0, cancelled: 0,
    newRegistrations: 0, patients: 0, doctors: 0, appointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Appointment table search + pagination
  const [apptSearch, setApptSearch] = useState("");
  const [apptPage, setApptPage] = useState(1);
  const apptPageSize = 5;

  // Patient table search + pagination
  const [patientSearch, setPatientSearch] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const patientPageSize = 5;

  // Active section tab
  const [activeTab, setActiveTab] = useState("appointments");

  const filteredAppts = appointments.filter((a) =>
    !apptSearch || (a.patient?.full_name || "").toLowerCase().includes(apptSearch.toLowerCase())
  );
  const totalApptPages = Math.max(1, Math.ceil(filteredAppts.length / apptPageSize));
  const paginatedAppts = filteredAppts.slice((apptPage - 1) * apptPageSize, apptPage * apptPageSize);

  const filteredPatients = patients.filter((p) =>
    !patientSearch || (p.full_name || "").toLowerCase().includes(patientSearch.toLowerCase())
  );
  const totalPatientPages = Math.max(1, Math.ceil(filteredPatients.length / patientPageSize));
  const paginatedPatients = filteredPatients.slice((patientPage - 1) * patientPageSize, patientPage * patientPageSize);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role") || "";
    if (!token) { navigate("/"); return; }
    if (role.toLowerCase() !== "receptionist") { navigate("/dashboard"); return; }

    const loadStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const patientsData = await patientsRes.json().catch(() => []);
        const doctorsData = await doctorsRes.json().catch(() => []);
        const appointmentsData = await appointmentsRes.json().catch(() => []);
        const appts = Array.isArray(appointmentsData) ? appointmentsData : [];
        const pts = Array.isArray(patientsData) ? patientsData : [];
        const today = new Date().toLocaleDateString("en-CA");

        setAppointments(appts);
        setPatients(pts);

        setStats({
          todaysAppointments: appts.filter((i) => String(i.appointment_date || "").slice(0, 10) === today).length,
          waitingPatients: appts.filter((i) => String(i.status || "").toLowerCase() === "scheduled").length,
          completed: appts.filter((i) => String(i.status || "").toLowerCase() === "completed").length,
          cancelled: appts.filter((i) => String(i.status || "").toLowerCase() === "cancelled").length,
          newRegistrations: pts.length,
          patients: pts.length,
          doctors: Array.isArray(doctorsData) ? doctorsData.length : 0,
          appointments: appts.length,
        });
      } catch (err) {
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [navigate]);

  useEffect(() => { setApptPage(1); }, [apptSearch]);
  useEffect(() => { setPatientPage(1); }, [patientSearch]);

  const handleCancelAppointment = async (appointmentId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/${appointmentId}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || "Unable to cancel");
      const updated = await res.json();
      setAppointments((prev) => {
        const next = prev.map((a) => a.appointment_id === updated.appointment_id ? updated : a);
        const today = new Date().toLocaleDateString("en-CA");
        setStats((s) => ({
          ...s,
          todaysAppointments: next.filter((i) => String(i.appointment_date || "").slice(0, 10) === today).length,
          waitingPatients: next.filter((i) => String(i.status || "").toLowerCase() === "scheduled").length,
          completed: next.filter((i) => String(i.status || "").toLowerCase() === "completed").length,
          cancelled: next.filter((i) => String(i.status || "").toLowerCase() === "cancelled").length,
          appointments: next.length,
        }));
        return next;
      });
      setActionMessage("Appointment cancelled successfully.");
    } catch (err) { setActionMessage(err.message || "Failed to cancel."); }
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-blue-700 p-6 sm:p-8 text-white shadow-2xl shadow-teal-500/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,#fff_0%,transparent_70%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wide">
              <Sparkles size={14} className="text-amber-300" /> Reception Desk Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Receptionist Dashboard</h1>
            <p className="text-sm text-teal-100 max-w-xl">Patient check-ins, appointment desk bookings, and daily queue management.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/add-appointment")} className="px-4 py-2.5 bg-white text-teal-700 hover:bg-teal-50 rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105">
              <PlusCircle size={16} /> Book Appointment
            </button>
            <button onClick={() => navigate("/add-patient")} className="px-4 py-2.5 bg-teal-800/80 hover:bg-teal-900 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all border border-teal-500/30">
              <UserPlus size={16} /> Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-semibold">{error}</div>}
      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs font-semibold ${actionMessage.includes("success") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"}`}>
          {actionMessage}
        </div>
      )}

      {/* Stats Row 1 */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value={loading ? "--" : stats.todaysAppointments} icon={<CalendarDays size={20} />} color="from-blue-500 to-indigo-600" onClick={() => setActiveTab("appointments")} />
        <StatCard title="Waiting Patients" value={loading ? "--" : stats.waitingPatients} icon={<Users size={20} />} color="from-teal-400 to-emerald-600" onClick={() => setActiveTab("appointments")} />
        <StatCard title="Completed" value={loading ? "--" : stats.completed} icon={<ClipboardPlus size={20} />} color="from-emerald-500 to-teal-600" onClick={() => setActiveTab("appointments")} />
        <StatCard title="Cancelled" value={loading ? "--" : stats.cancelled} icon={<XCircle size={20} />} color="from-rose-500 to-red-600" onClick={() => setActiveTab("appointments")} />
      </section>

      {/* Stats Row 2 */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Patient Database" value={loading ? "--" : stats.patients} icon={<Users size={20} />} color="from-purple-500 to-indigo-600" onClick={() => setActiveTab("patients")} />
        <StatCard title="Total Doctors Available" value={loading ? "--" : stats.doctors} icon={<Stethoscope size={20} />} color="from-amber-400 to-orange-500" />
        <StatCard title="New Registrations" value={loading ? "--" : stats.newRegistrations} icon={<UserPlus size={20} />} color="from-slate-600 to-slate-800" onClick={() => setActiveTab("patients")} />
      </section>

      {/* Section Tabs */}
      <div className="flex gap-2">
        {[
          { key: "appointments", label: "Appointments Queue", icon: CalendarDays },
          { key: "patients", label: "Patient Records", icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === key
                ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Appointments Queue ── */}
      {activeTab === "appointments" && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appointments Queue</h3>
              <p className="text-xs text-slate-400">Search and manage active patient appointments</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={apptSearch}
                onChange={(e) => setApptSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
          ) : paginatedAppts.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No appointments found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Assigned Doctor</th>
                      <th className="py-3 px-4">Schedule</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {paginatedAppts.map((appt) => {
                      const status = appt.status || "Scheduled";
                      const isCancelled = status.toLowerCase() === "cancelled";
                      const isCompleted = status.toLowerCase() === "completed";
                      return (
                        <tr key={appt.appointment_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">{appt.patient?.full_name || "Unknown"}</td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">{appt.doctor?.name || `ID ${appt.doctor_id}`}</td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{String(appt.appointment_date || "").slice(0, 10)} • {appt.appointment_time || "--"}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isCancelled ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                              : isCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                              : "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400"
                            }`}>{status}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => navigate(`/edit-appointment/${appt.appointment_id}`)} className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Edit</button>
                              {!isCancelled && (
                                <button onClick={() => handleCancelAppointment(appt.appointment_id)} className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-semibold text-[11px] hover:bg-rose-100 transition-colors">Cancel</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <PaginationControls current={apptPage} total={totalApptPages} onPrev={() => setApptPage((p) => Math.max(1, p - 1))} onNext={() => setApptPage((p) => Math.min(totalApptPages, p + 1))} />
            </>
          )}
        </section>
      )}

      {/* ── Patient Records ── */}
      {activeTab === "patients" && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Patient Records</h3>
              <p className="text-xs text-slate-400">All registered patients in the clinic database</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={() => navigate("/add-patient")}
                className="flex-shrink-0 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <UserPlus size={14} /> Add
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 py-4">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
          ) : paginatedPatients.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No patients found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Age</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                    {paginatedPatients.map((patient, index) => (
                      <tr key={patient.patient_id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">
                          {(patientPage - 1) * patientPageSize + index + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-blue-400 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                              {(patient.full_name || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{patient.full_name || "—"}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">{patient.age || "—"}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            (patient.gender || "").toLowerCase() === "female"
                              ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                          }`}>
                            {patient.gender || "—"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{patient.contact_number || patient.phone || "—"}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => navigate(`/patients/${patient.patient_id}`)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-teal-600 dark:text-teal-400 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Eye size={11} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationControls current={patientPage} total={totalPatientPages} onPrev={() => setPatientPage((p) => Math.max(1, p - 1))} onNext={() => setPatientPage((p) => Math.min(totalPatientPages, p + 1))} />
            </>
          )}
        </section>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center gap-4 hover:border-teal-300 dark:hover:border-teal-700 hover:-translate-y-0.5 transition-all"
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

function PaginationControls({ current, total, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
      <p className="text-slate-400">Page <span className="font-bold text-slate-700 dark:text-slate-200">{current}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{total}</span></p>
      <div className="flex items-center gap-2">
        <button onClick={onPrev} disabled={current === 1} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold transition-colors">
          <ChevronLeft size={14} /> Previous
        </button>
        <button onClick={onNext} disabled={current === total} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold transition-colors">
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default Receptionist_dashboard;
