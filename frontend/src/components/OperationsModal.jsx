import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Receipt,
  FileBarChart,
  Boxes,
  UserCheck,
  Building2,
  Pill,
  TestTube,
  Settings,
  HelpCircle,
  CheckCircle,
  Download,
  Plus
} from "lucide-react";

const OperationsModal = ({ isOpen, onClose, modalKey, modalTitle }) => {
  if (!isOpen) return null;

  const renderModalContent = () => {
    switch (modalKey) {
      case "billing":
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Total Revenue Today</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">$14,280.00</h3>
              </div>
              <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md">
                <Plus size={16} /> Create Invoice
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Invoices</h4>
              {[
                { id: "INV-2026-001", patient: "Sarah Connor", amount: "$350.00", status: "Paid" },
                { id: "INV-2026-002", patient: "Michael Scott", amount: "$1,200.00", status: "Pending" },
                { id: "INV-2026-003", patient: "Pam Beesly", amount: "$180.00", status: "Paid" }
              ].map((inv) => (
                <div key={inv.id} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{inv.patient}</p>
                    <p className="text-xs text-slate-400">{inv.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{inv.amount}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "reports":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">Monthly Consultations</p>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">1,420</h4>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">Avg. Satisfaction</p>
                <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">98.4%</h4>
              </div>
            </div>
            <button
              onClick={() => alert("Report downloaded successfully in PDF format.")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download size={16} /> Export Full Monthly Analytics (PDF)
            </button>
          </div>
        );

      case "inventory":
      case "pharmacy":
        return (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medicine Stock Status</h4>
            {[
              { name: "Amoxicillin 500mg", qty: "1,200 tablets", status: "In Stock", badge: "bg-emerald-100 text-emerald-700" },
              { name: "Paracetamol 650mg", qty: "450 tablets", status: "Low Stock", badge: "bg-amber-100 text-amber-700" },
              { name: "Ibuprofen 400mg", qty: "2,100 tablets", status: "In Stock", badge: "bg-emerald-100 text-emerald-700" }
            ].map((med, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{med.name}</p>
                  <p className="text-xs text-slate-400">{med.qty}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${med.badge}`}>
                  {med.status}
                </span>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{modalTitle} Active</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              This module is active and synced with your MediPulse clinic dashboard backend.
            </p>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              {modalTitle}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="py-4">{renderModalContent()}</div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Close Window
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OperationsModal;
