import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  User,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Activity,
  Calendar
} from "lucide-react";

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
          fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments/patient/${id}`, {
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
    const isCompleted = normalized === "completed";
    const isCancelled = normalized === "cancelled";

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
          isCompleted
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            : isCancelled
            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
        }`}
      >
        {isCompleted ? <CheckCircle2 size={14} /> : isCancelled ? <XCircle size={14} /> : <Clock size={14} />}
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft size={16} /> Back to List
      </button>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-2xl shadow-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-2xl flex items-center justify-center shadow-inner">
              {(patient?.full_name || "P").charAt(0)}
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                Patient Record #{id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {patient?.full_name || "Patient Profile"}
              </h1>
              <p className="text-xs text-blue-100 mt-1">
                Medical history, contact details, and appointment timeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <div>
              <span className="text-blue-200 block text-[10px] uppercase">Gender</span>
              <span>{patient?.gender || "-"}</span>
            </div>
            <div className="h-6 w-[1px] bg-white/20" />
            <div>
              <span className="text-blue-200 block text-[10px] uppercase">DOB</span>
              <span>{patient?.dob || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-semibold">{error}</div>}

      {/* Patient Overview Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-blue-600 dark:text-blue-400" />
            Patient Information
          </h3>

          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-10 rounded-2xl skeleton-shimmer" />
              <div className="h-10 rounded-2xl skeleton-shimmer" />
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{patient?.full_name || "-"}</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Phone Number</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Phone size={13} className="text-blue-500" /> {patient?.phone || "-"}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Email Address</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Mail size={13} className="text-teal-500" /> {patient?.email || "-"}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Address</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin size={13} className="text-purple-500" /> {patient?.address || "-"}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Blood Group</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold">
                  {patient?.blood_group || "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Appointment Summary Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={18} className="text-teal-500" />
            Appointment Summary
          </h3>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-center">
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Total</span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {appointments.length}
              </h4>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50 text-center">
              <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400">Upcoming</span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {upcoming.length}
              </h4>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-center">
              <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">History</span>
              <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {history.length}
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment History Timeline */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Appointment History</h3>
          <p className="text-xs text-slate-400">Timeline of past and scheduled consultations</p>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        ) : sortedAppointments.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No appointment history found for this patient.</p>
        ) : (
          <div className="space-y-3">
            {sortedAppointments.map((appointment) => (
              <div
                key={appointment.appointment_id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {appointment.appointment_date} • {appointment.appointment_time}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Doctor: {appointment.doctor?.name || `ID ${appointment.doctor_id}`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {renderStatusChip(appointment.status)}
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                  >
                    Back to Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PatientDetails;
