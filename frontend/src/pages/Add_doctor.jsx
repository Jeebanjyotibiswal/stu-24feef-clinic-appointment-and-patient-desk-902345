import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Hash,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Save,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

function Add_doctor() {
  const navigate = useNavigate();
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
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <Stethoscope size={24} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Doctor Roster
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Add Doctor</h2>
              <p className="text-xs text-slate-400">Register a new physician to your clinic roster.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Doctor ID (Optional)
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="doctor_id"
                  placeholder="e.g. 101"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  min="1"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Dr. Sarah Connor"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gender *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Specialization *
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="specialization"
                  placeholder="e.g. Cardiology"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department *</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. General Medicine"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Join Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Experience (Years) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  name="experience"
                  placeholder="e.g. 5"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            {loading ? "Saving Doctor..." : "Save Doctor Record"}
          </button>
        </form>

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              message.includes("successfully") || message.includes("✅")
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
            }`}
          >
            {message.includes("successfully") || message.includes("✅") ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{message}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Add_doctor;