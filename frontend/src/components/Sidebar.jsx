import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  LayoutDashboard,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  Users,
  Stethoscope,
  UserCheck,
  Building2,
  Pill,
  TestTube,
  Receipt,
  FileBarChart,
  Boxes,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  CalendarPlus,
  ClipboardList,
  Eye,
  History,
  UserCog,
  X
} from "lucide-react";

const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onOpenOperationsModal,
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeRole = (localStorage.getItem("role") || "user").toLowerCase();
  const currentUsername = localStorage.getItem("username") || "User";

  const dashboardRoute =
    activeRole === "admin"
      ? "/admin-dashboard"
      : activeRole === "receptionist"
      ? "/receptionist-dashboard"
      : "/dashboard";

  // ─── ROLE-BASED NAV SECTIONS ──────────────────────────────────────────────

  // ── DOCTOR sidebar ──
  const doctorNav = [
    {
      title: "MY PORTAL",
      items: [
        { name: "Today", path: "/dashboard?view=today", icon: CalendarCheck },
        { name: "History", path: "/dashboard?view=history", icon: History },
        { name: "Patients", path: "/dashboard?view=patients", icon: Eye },
      ],
    },
  ];

  // ── RECEPTIONIST sidebar ──
  const receptionistNav = [
    {
      title: "DESK",
      items: [
        { name: "Reception Dashboard", path: "/receptionist-dashboard", icon: LayoutDashboard },
        { name: "Book Appointment", path: "/add-appointment", icon: CalendarPlus },
        { name: "Add Patient", path: "/add-patient", icon: UserPlus },
        { name: "Appointments List", path: "/receptionist-dashboard", icon: ClipboardList },
      ],
    },
  ];

  // ── ADMIN sidebar ──
  const adminNav = [
    {
      title: "MAIN",
      items: [
        { name: "Admin Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
        { name: "Book Appointment", path: "/add-appointment", icon: CalendarPlus },
        { name: "Add Patient", path: "/add-patient", icon: UserPlus },
        { name: "Add Doctor", path: "/add-doctor", icon: Stethoscope },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        { name: "Staff", modalKey: "staff", icon: UserCheck },
        { name: "Departments", modalKey: "departments", icon: Building2 },
        { name: "Pharmacy", modalKey: "pharmacy", icon: Pill },
        { name: "Laboratory", modalKey: "laboratory", icon: TestTube },
      ],
    },
    {
      title: "OPERATIONS",
      items: [
        { name: "Billing", modalKey: "billing", icon: Receipt },
        { name: "Reports", modalKey: "reports", icon: FileBarChart },
        { name: "Inventory", modalKey: "inventory", icon: Boxes },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Settings", modalKey: "settings", icon: Settings },
        { name: "Notifications", modalKey: "notifications", icon: Bell },
        { name: "Help Center", modalKey: "help", icon: HelpCircle },
        { name: "Register User", path: "/register", icon: UserCog },
      ],
    },
  ];

  const navSections =
    activeRole === "admin"
      ? adminNav
      : activeRole === "receptionist"
      ? receptionistNav
      : doctorNav;

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.modalKey) {
      onOpenOperationsModal(item.modalKey, item.name);
    }
    setMobileOpen(false);
  };

  const isItemActive = (item) => {
    if (!item.path) return false;
    const [itemPath, itemQuery] = item.path.split("?");
    if (location.pathname !== itemPath) return false;
    if (!itemQuery) return true;

    const normalizedSearch = location.search || "?view=today";
    return normalizedSearch === `?${itemQuery}`;
  };

  // Role badge colours
  const roleBadge = {
    admin: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    receptionist: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400",
    doctor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  }[activeRole] || "bg-slate-100 text-slate-600";

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300 rounded-r-2xl overflow-hidden select-none">

      {/* ── Header / Logo ── */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 flex-shrink-0">
        <div
          onClick={() => navigate(dashboardRoute)}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col overflow-hidden"
            >
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-300 bg-clip-text text-transparent truncate leading-tight">
                Clinic Portal
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
                {activeRole} ACCESS
              </span>
            </motion.div>
          )}
        </div>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Navigation Links ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
                {section.title}
              </p>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <div key={item.name} className="relative group">
                    <button
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center ${
                        collapsed ? "justify-center py-3 px-0" : "px-3 py-2.5"
                      } rounded-xl text-xs font-semibold transition-all duration-150 ${
                        active
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`flex-shrink-0 transition-transform duration-150 ${
                          collapsed ? "w-5 h-5" : "w-4 h-4 mr-3"
                        } ${
                          active
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-110"
                        }`}
                      />

                      {!collapsed && (
                        <span className="truncate flex-1 text-left">{item.name}</span>
                      )}
                    </button>

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                        {item.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom Profile Card ── */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex-shrink-0">
        <div
          className={`flex items-center ${
            collapsed ? "flex-col gap-2 p-2 justify-center" : "gap-3 px-2 py-2"
          } bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/50`}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs shadow">
              {currentUsername.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-none">
                {currentUsername}
              </p>
              <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${roleBadge}`}>
                {activeRole}
              </span>
            </div>
          )}

          <button
            onClick={onLogout}
            title="Logout"
            className={`p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${
              collapsed ? "w-full flex justify-center" : ""
            }`}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Fixed Sidebar ── */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Slide-out Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
