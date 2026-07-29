import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Sun,
  Moon,
  Menu,
  Calendar,
} from "lucide-react";

const TopNavbar = ({
  darkMode,
  setDarkMode,
  onToggleMobileSidebar,
  onOpenSearchModal
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onOpenSearchModal) {
      onOpenSearchModal(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-6 transition-colors duration-300">
      <div className="h-full flex items-center justify-between gap-4">

        {/* Left: Mobile Menu Toggle + Search */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          {/* Mobile Hamburger */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search patients, doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200"
            />
          </form>
        </div>

        {/* Right: Date + Dark Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Date */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50">
            <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span>{formattedDate}</span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <motion.div
              initial={false}
              animate={{ rotate: darkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {darkMode ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" style={{ width: 18, height: 18 }} />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-500" style={{ width: 18, height: 18 }} />
              )}
            </motion.div>
          </button>
        </div>

      </div>
    </header>
  );
};

export default TopNavbar;
