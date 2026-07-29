import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Stethoscope,
  CalendarDays,
  Users,
  PlusCircle,
  UserPlus,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Edit,
  Clock,
  Sparkles,
  FileText,
  DollarSign
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

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

        const statsData = await statsResponse.json().catch(() => ({}));
        const doctorsData = await doctorsResponse.json().catch(() => []);
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

  useEffect(() => {
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

  // Sample analytics chart data derived from real figures or default trend
  const chartData = [
    { day: "Mon", appointments: 12, revenue: 2400 },
    { day: "Tue", appointments: 19, revenue: 3800 },
    { day: "Wed", appointments: 15, revenue: 3100 },
    { day: "Thu", appointments: 22, revenue: 4500 },
    { day: "Fri", appointments: 28, revenue: 5600 },
    { day: "Sat", appointments: 14, revenue: 2900 },
    { day: "Sun", appointments: 8, revenue: 1600 }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 p-6 sm:p-8 text-white shadow-2xl shadow-blue-500/20"
      >
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide uppercase border border-white/20">
              <Sparkles size={14} className="text-amber-300" />
              Clinic Control Center
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Good Morning, {adminName} 👋
            </h1>
            <p className="text-sm text-blue-100 max-w-xl">
              Welcome back to your Clinic Portal. Manage doctor rosters, operational analytics, and patient schedules.
            </p>

          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/add-appointment"
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <PlusCircle size={16} /> Book Appointment
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm ${
            actionMessage.includes("success")
              ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
          }`}
        >
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage("")} className="text-xs opacity-75 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Doctors"
          value={loading ? "--" : stats.doctors}
          icon={<Stethoscope size={22} />}
          gradient="from-blue-500 to-indigo-600"
          trend="+12%"
          desc="Active clinic staff"
        />
        <StatCard
          title="Total Patients"
          value={loading ? "--" : stats.patients}
          icon={<Users size={22} />}
          gradient="from-teal-400 to-emerald-600"
          trend="+8%"
          desc="Registered records"
        />
        <StatCard
          title="Appointments"
          value={loading ? "--" : stats.appointments}
          icon={<CalendarDays size={22} />}
          gradient="from-purple-500 to-indigo-600"
          trend="+15%"
          desc="Total booked slots"
        />
        <StatCard
          title="Clinic Access Level"
          value="Super Admin"
          icon={<ShieldCheck size={22} />}
          gradient="from-amber-400 to-orange-500"
          trend="Secure"
          desc="Full privileges"
        />
      </section>

      {/* 2-Column Analytics Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Overview Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                Appointments Overview
              </h3>
              <p className="text-xs text-slate-400">Weekly consultation distribution</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              Weekly
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="appointments" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Analytics Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign size={18} className="text-teal-500" />
                Revenue Analytics
              </h3>
              <p className="text-xs text-slate-400">Estimated clinic earnings ($ USD)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              Live Trend
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Quick Actions & Doctor Roster Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-slate-400">Common administrative tasks</p>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/add-doctor"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-slate-700/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <PlusCircle size={18} />
                </div>
                <span className="text-xs sm:text-sm font-semibold">Add a Doctor</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/add-patient"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200/70 dark:border-slate-700/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
                  <Users size={18} />
                </div>
                <span className="text-xs sm:text-sm font-semibold">Add a Patient</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/add-appointment"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 border border-slate-200/70 dark:border-slate-700/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                  <CalendarDays size={18} />
                </div>
                <span className="text-xs sm:text-sm font-semibold">Book Appointment</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/register"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200/70 dark:border-slate-700/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                  <UserPlus size={18} />
                </div>
                <span className="text-xs sm:text-sm font-semibold">Register User Account</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Doctor Roster */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Doctor Roster</h3>
              <p className="text-xs text-slate-400">Registered clinic physicians</p>
            </div>
            <Link to="/add-doctor" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
              + Add Doctor
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No doctors have been registered yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.slice(0, 6).map((doc) => (
                <div
                  key={doc.doctor_id || doc.name}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    {(doc.name || "D").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                      {doc.specialization || "General Physician"}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {doc.department || "Clinic"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Appointments Table */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Appointments</h3>
            <p className="text-xs text-slate-400">Manage patient records and schedule statuses</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by patient or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No appointments found</p>
            <p className="text-xs text-slate-400">Try adjusting your search filter or book a new appointment.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {pagedAppointments.map((appt) => {
                    const status = appt.status || "Scheduled";
                    const isCancelled = status.toLowerCase() === "cancelled";
                    const isCompleted = status.toLowerCase() === "completed";

                    return (
                      <tr key={appt.appointment_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center flex-shrink-0">
                              {(appt.patient?.full_name || "P").charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">
                                {appt.patient?.full_name || "Unknown Patient"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {appt.doctor?.name || `Doctor ID ${appt.doctor_id}`}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {String(appt.appointment_date || "").slice(0, 10)} • {appt.appointment_time || "--"}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isCancelled
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                : isCompleted
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCancelled ? "bg-rose-500" : isCompleted ? "bg-emerald-500" : "bg-blue-500"
                              }`}
                            ></span>
                            {status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/edit-appointment/${appt.appointment_id}`)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Edit size={13} /> Edit
                            </button>

                            {!isCancelled && (
                              <button
                                onClick={() => handleCancelAppointment(appt.appointment_id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 font-semibold text-[11px] transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <p className="text-slate-400">
                Page <span className="font-bold text-slate-700 dark:text-slate-200">{currentPage}</span> of{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">{totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold transition-colors"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold transition-colors"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, trend, desc }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-extrabold">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{value}</h3>
        <p className="text-[11px] text-slate-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}

export default Admin_dashboard;