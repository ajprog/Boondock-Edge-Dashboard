import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";

/**
 * Flat index of settings destinations (top-level tabs and subtabs).
 * Used to jump via URL params: ?tab=…, &systemTab=…
 */
const SETTINGS_DESTINATIONS = [
  { section: "summary", label: "Summary", match: "summary overview" },
  { section: "recorders", label: "Recorders", match: "recorders channels devices" },
  {
    section: "keywords-tags",
    label: "Keyword tracking",
    match: "keywords tags tracking alerts",
  },
  { section: "user-management", label: "Users", match: "users accounts roles" },
  {
    section: "system",
    systemTab: "display-language",
    label: "System · Display & Language",
    match: "display language timezone time format sort",
  },
  {
    section: "transcription-engine",
    label: "Transcriptions · Service settings",
    match: "transcription services api boondock whisper openai",
  },
  {
    section: "system",
    systemTab: "audio-post-processing",
    label: "System · Audio post processing",
    match: "audio post processing hallucination keywords",
  },
  {
    section: "system",
    systemTab: "api-keys",
    label: "System · API Keys",
    match: "api keys access tokens authentication",
  },
  {
    section: "system",
    systemTab: "interfaces",
    label: "System · Interfaces",
    match: "interfaces network ports",
  },
  {
    section: "system",
    systemTab: "hotspot-configuration",
    label: "System · WiFi",
    match: "hotspot wifi access point wlan",
  },
  {
    section: "system",
    systemTab: "maintenance",
    label: "System · Maintenance · Backup & restore",
    match: "backup restore s3 samba",
  },
  {
    section: "system",
    systemTab: "maintenance",
    label: "System · Maintenance",
    match: "maintenance updates reboot",
  },
  {
    section: "recorders",
    recorderTab: "health",
    label: "Recorders · Health",
    match: "health status diagnostics",
  },
  {
    section: "system",
    systemTab: "danger-zone",
    label: "System · Danger zone",
    match: "danger reset factory delete",
  },
  {
    section: "transcription-engine",
    label: "Transcriptions",
    match: "transcriptions queue logs whisper",
  },
  {
    section: "Logs",
    logsTab: "error",
    label: "Logs · Critical",
    match: "logs critical errors red alerts failures",
  },
  {
    section: "Logs",
    logsTab: "warning",
    label: "Logs · Warnings",
    match: "logs warnings yellow",
  },
  {
    section: "Logs",
    logsTab: "transcription",
    label: "Logs · Comms",
    match: "logs comms communications transcription messages",
  },
  {
    section: "Logs",
    logsTab: "database",
    label: "Logs · Database",
    match: "logs database sql",
  },
  {
    section: "Logs",
    logsTab: "event",
    label: "Logs · Events",
    match: "logs events purple calendar",
  },
  {
    section: "Logs",
    logsTab: "device",
    label: "Logs · Devices",
    match: "logs devices recorder com ports hardware",
  },
];

function splitJumpLabel(label) {
  const sep = " · ";
  const i = label.indexOf(sep);
  if (i === -1) return { group: null, title: label };
  return { group: label.slice(0, i), title: label.slice(i + sep.length) };
}

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function scoreMatch(query, entry) {
  const q = normalize(query);
  if (!q) return 0;
  const hay = `${entry.label} ${entry.match}`;
  if (hay.includes(q)) return 3;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const allWords = words.every((w) => hay.includes(w));
  return allWords ? 2 : 0;
}

export default function SettingsSearchBar({
  isDarkMode,
  allowedSectionIds,
  setSearchParams,
  setIsSidebarOpen,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const rootRef = useRef(null);

  const allowed = useMemo(() => new Set(allowedSectionIds || []), [allowedSectionIds]);

  const visibleDestinations = useMemo(() => {
    return SETTINGS_DESTINATIONS.filter((e) => allowed.has(e.section));
  }, [allowed]);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) {
      return visibleDestinations;
    }
    return visibleDestinations
      .map((e) => ({ e, s: scoreMatch(q, e) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .map(({ e }) => e)
      .slice(0, 12);
  }, [query, visibleDestinations]);

  const go = useCallback(
    (entry) => {
      if (entry.globalTab) {
        setSearchParams({ tab: "global", globalTab: entry.globalTab });
      } else if (entry.systemTab) {
        setSearchParams({ tab: "system", systemTab: entry.systemTab });
      } else if (entry.recorderTab) {
        setSearchParams({ tab: "recorders", recorderTab: entry.recorderTab });
      } else if (entry.logsTab) {
        setSearchParams({ tab: "Logs", logsTab: entry.logsTab });
      } else {
        setSearchParams({ tab: entry.section });
      }
      setQuery("");
      setOpen(false);
      setIsSidebarOpen(false);
    },
    [setSearchParams, setIsSidebarOpen],
  );

  useEffect(() => {
    const onDoc = (ev) => {
      if (rootRef.current && !rootRef.current.contains(ev.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const shellRing = focused || open;

  const fieldWrap = isDarkMode
    ? `border border-slate-500/95 bg-slate-900/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${
        shellRing
          ? "border-slate-400/90 ring-2 ring-slate-400/35"
          : "hover:border-slate-400/80"
      }`
    : `border border-slate-300/95 bg-white shadow-sm ${
        shellRing
          ? "border-slate-400 ring-2 ring-slate-400/30"
          : "hover:border-slate-400/90"
      }`;

  const inputClass = `h-10 w-full min-w-0 rounded-full border-0 bg-transparent py-2 pl-10 pr-4 text-[13px] font-normal tracking-wide outline-none transition-colors placeholder:font-normal ${
    isDarkMode
      ? "text-slate-100 placeholder:text-slate-500"
      : "text-slate-700 placeholder:text-slate-400"
  }`;

  const searchGlyph = isDarkMode ? "text-slate-500" : "text-slate-400";

  const panelClass = `absolute right-0 top-[calc(100%+8px)] z-[60] max-h-[min(70vh,22rem)] w-[min(100vw-1.5rem,20rem)] overflow-hidden overflow-y-auto rounded-xl border py-1 shadow-[0_16px_48px_-12px_rgba(15,23,42,0.25)] ${
    isDarkMode
      ? "border-slate-700/90 bg-slate-950 text-slate-100"
      : "border-slate-200/80 bg-white text-slate-900"
  }`;

  const rowClass = isDarkMode
    ? "border-b border-slate-800/80 last:border-b-0 hover:bg-slate-900/80"
    : "border-b border-slate-100 last:border-b-0 hover:bg-slate-50/90";

  return (
    <div ref={rootRef} className="relative w-full min-w-[min(100%,260px)] max-w-[20rem]">
      <div className={`relative rounded-full transition-[box-shadow,border-color] duration-200 ${fieldWrap}`}>
        <span
          className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 material-symbols-outlined text-[20px] leading-none ${searchGlyph}`}
          aria-hidden
        >
          search
        </span>
        <label htmlFor="settings-jump-search" className="sr-only">
          Search settings — find a page or tab
        </label>
        <input
          id="settings-jump-search"
          type="search"
          value={query}
          onChange={(ev) => {
            setQuery(ev.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(ev) => {
            if (ev.key === "Escape") {
              setOpen(false);
              ev.target.blur();
            }
            if (ev.key === "Enter" && results.length === 1) {
              ev.preventDefault();
              go(results[0]);
            }
          }}
          placeholder="search settings"
          className={inputClass}
          aria-autocomplete="list"
          aria-controls="settings-jump-results"
          autoComplete="off"
        />
      </div>

      {open && results.length > 0 ? (
        <ul id="settings-jump-results" className={panelClass} role="listbox">
          <li
            className={`px-4 pb-2 pt-2 text-[11px] font-medium tracking-[0.12em] ${
              isDarkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {normalize(query) ? "Matching" : "Go to"}
          </li>
          {results.map((entry) => {
            const { group, title } = splitJumpLabel(entry.label);
            return (
              <li
                key={`${entry.section}-${entry.globalTab || ""}-${entry.systemTab || ""}-${entry.recorderTab || ""}-${entry.logsTab || ""}`}
                className={rowClass}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="w-full px-4 py-2.5 text-left transition-colors duration-150"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => go(entry)}
                >
                  {group ? (
                    <span className="block">
                      <span
                        className={`mb-0.5 block text-[11px] font-normal uppercase tracking-[0.14em] ${
                          isDarkMode ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {group}
                      </span>
                      <span
                        className={`block text-[13px] font-normal leading-snug ${
                          isDarkMode ? "text-slate-100" : "text-slate-800"
                        }`}
                      >
                        {title}
                      </span>
                    </span>
                  ) : (
                    <span
                      className={`block text-[13px] font-normal leading-snug ${
                        isDarkMode ? "text-slate-100" : "text-slate-800"
                      }`}
                    >
                      {title}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {open && query && results.length === 0 ? (
        <div
          className={`absolute right-0 top-[calc(100%+8px)] z-[60] w-[min(100vw-1.5rem,20rem)] rounded-xl border px-4 py-3 text-[13px] font-normal leading-relaxed shadow-lg ${
            isDarkMode
              ? "border-slate-700/90 bg-slate-950 text-slate-500"
              : "border-slate-200/80 bg-white text-slate-500"
          }`}
        >
          No matches. Try a different word.
        </div>
      ) : null}
    </div>
  );
}
