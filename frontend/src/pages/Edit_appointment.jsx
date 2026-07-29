import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarPlus,
  ArrowLeft,
  User,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Activity
} from "lucide-react";

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
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-6"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <CalendarPlus size={24} />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Appointment #{id}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Edit Appointment</h2>
            <p className="text-xs text-slate-400">Modify appointment date, assigned physician, or status.</p>
          </div>
        </div>

        {loadingData ? (
          <div className="space-y-4 py-8">
            <div className="h-12 rounded-2xl skeleton-shimmer" />
            <div className="h-12 rounded-2xl skeleton-shimmer" />
            <div className="h-12 rounded-2xl skeleton-shimmer" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Patient *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.patient_id} value={patient.patient_id}>
                        {patient.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Doctor *</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id} value={doctor.doctor_id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status *</label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
              {loading ? "Saving Changes..." : "Update Appointment"}
            </button>
          </form>
        )}

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              message.includes("✅")
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
            }`}
          >
            {message.includes("✅") ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Edit_appointment;
