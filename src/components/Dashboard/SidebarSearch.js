import React from "react";

const SidebarSearch = ({ searchQuery, setSearchQuery, isDarkMode }) => (
  <div className="relative mb-6 px-6 md:px-6">
    <span
      className={`material-symbols-outlined pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-[18px] md:left-9 ${
        isDarkMode ? "text-slate-500" : "text-slate-400"
      }`}
    >
      search
    </span>
    <input
      type="text"
      placeholder="Search channels or messages"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`w-full rounded-xl border-none py-2 pl-10 pr-4 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/25 ${
        isDarkMode
          ? "bg-slate-800 text-slate-100 placeholder:text-slate-500"
          : "bg-slate-100 text-slate-900 placeholder:text-slate-400"
      }`}
    />
  </div>
);

export default SidebarSearch;
