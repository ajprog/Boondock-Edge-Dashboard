import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { LogOut } from "lucide-react";

const SidebarFooter = ({ isDarkMode }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const appVersion = process.env.REACT_APP_VERSION || "v1.0.0";
  const releaseDate = process.env.REACT_APP_BUILD_DATE;

  return (
    <div
      className={`mt-auto border-t p-4 transition-colors duration-200 ${
        isDarkMode ? "border-slate-800/80" : "border-slate-200/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="flex min-w-0 flex-1 items-center gap-2 text-left transition-opacity hover:opacity-80"
          title="View profile"
        >
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-bold ${
              isDarkMode
                ? "border-slate-600 bg-slate-800 text-slate-200"
                : "border-outline-variant bg-primary-container text-on-primary-container"
            }`}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(user?.name || user?.username || "User")
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className={`block truncate text-xs font-semibold ${
                isDarkMode ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {user?.name || user?.username || "Guest"}
            </span>
            <span
              className={`block truncate text-[10px] leading-4 ${
                isDarkMode ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {releaseDate ? `${appVersion} | ${releaseDate}` : appVersion}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => logout()}
          className={`rounded-lg p-2 transition-colors ${
            isDarkMode
              ? "text-slate-400 hover:bg-slate-800"
              : "text-slate-500 hover:bg-slate-200/80"
          }`}
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SidebarFooter;
