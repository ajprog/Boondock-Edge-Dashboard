import React from "react";

const SidebarHeader = ({ isDarkMode, isMobile, closeSidebar }) => {
  return (
    <div className="bg-inherit px-6 pb-2 pt-6 md:px-8 md:pb-1 md:pt-8">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h1
            className={`font-headline text-xl font-extrabold tracking-tight ${
              isDarkMode ? "text-blue-100" : "text-blue-900"
            }`}
          >
            Boondock Edge
          </h1>
          <p
            className={`font-body text-xs font-medium ${
              isDarkMode ? "text-slate-500" : "text-slate-500"
            }`}
          >
            Recordings &amp; live feed
          </p>
        </div>
        {isMobile && closeSidebar ? (
          <button
            type="button"
            onClick={closeSidebar}
            className={`rounded-full p-2 transition-colors ${
              isDarkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-200/80"
            }`}
            aria-label="Close sidebar"
          >
            <span className="material-symbols-outlined text-[22px] leading-none">close</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SidebarHeader;
