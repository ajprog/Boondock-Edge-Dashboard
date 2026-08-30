import React from 'react';

/** Main content card — matches System settings panel (outline + shadow). */
export function settingsMainCardClass(isDarkMode) {
  return isDarkMode
    ? 'bg-slate-900/40 border-slate-700/80'
    : 'bg-white border-outline-variant/20 shadow-sm';
}

/**
 * Page title block above the main card (uppercase headline, subtitle, MD3 icon tile).
 * Optional `trailing` renders on the right (e.g. status pill).
 */
export function SettingsPageHero({ isDarkMode, title, description, icon, trailing = null }) {
  return (
    <header className="mb-10">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
            {icon}
          </div>
          <div className="min-w-0">
            <h1
              className={`font-headline text-3xl font-extrabold uppercase tracking-tight ${
                isDarkMode ? 'text-slate-100' : 'text-on-surface'
              }`}
            >
              {title}
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>
              {description}
            </p>
          </div>
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  );
}

/** Outer width constraint for settings sections (same as System). */
export function SettingsSectionWidth({ children }) {
  return <div className="mx-auto max-w-5xl">{children}</div>;
}
