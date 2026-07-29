import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import OperationsModal from "./OperationsModal";

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dark mode state with localStorage persistence
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved !== null) {
      return saved === "dark";
    }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Collapsible sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Operations Modal state
  const [opsModal, setOpsModal] = useState({ open: false, key: "", title: "" });

  // Sync dark mode class on <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Sync sidebar collapse state
  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", sidebarCollapsed ? "true" : "false");
  }, [sidebarCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("doctorId");
    navigate("/");
  };

  const handleOpenOpsModal = (key, title) => {
    setOpsModal({ open: true, key, title });
  };

  const isAuthPage = location.pathname === "/" || location.pathname === "/register";

  if (isAuthPage) {
    return <div className="min-h-screen font-sans">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenOperationsModal={handleOpenOpsModal}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-70"
        }`}
      >
        {/* Sticky Top Navbar */}
        <TopNavbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenSearchModal={(query) => handleOpenOpsModal("search", `Search: "${query}"`)}
        />


        {/* Page View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Interactive Operations Modal */}
      <OperationsModal
        isOpen={opsModal.open}
        onClose={() => setOpsModal({ ...opsModal, open: false })}
        modalKey={opsModal.key}
        modalTitle={opsModal.title}
      />
    </div>
  );
};

export default AppLayout;
