import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Home, Stethoscope } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl"
      >
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle size={40} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full uppercase tracking-wider">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The clinic page or record you are looking for doesn't exist or may have been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
          >
            <Home size={16} /> Return to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
