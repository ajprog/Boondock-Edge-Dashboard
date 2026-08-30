import React from 'react';

/** Tab button classes matching System settings sub-menu (primary underline, optional danger). */
export function settingsSubnavTabClass(isDarkMode, active, danger = false) {
  if (active) {
    if (danger) {
      return 'border-b-2 border-red-600 font-bold text-red-600 dark:border-red-400 dark:text-red-400';
    }
    return 'border-b-2 border-primary font-bold text-primary';
  }
  if (danger) {
    return isDarkMode
      ? 'font-medium text-sky-400 hover:opacity-80'
      : 'font-medium text-tertiary hover:opacity-80';
  }
  return isDarkMode
    ? 'font-medium text-slate-400 hover:text-primary'
    : 'font-medium text-on-surface-variant hover:text-primary';
}

export function SettingsSubnav({
  isDarkMode,
  'aria-label': ariaLabel,
  className = '',
  /** When true, nav sits inside the main card (tighter bottom margin). */
  embedded = false,
  children,
}) {
  const border = isDarkMode ? 'border-slate-700/80' : 'border-outline-variant/30';
  const mb = embedded ? 'mb-6' : 'mb-10';
  return (
    <nav
      className={`${mb} flex flex-wrap items-center gap-x-6 gap-y-2 border-b md:gap-x-8 ${border} ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {children}
    </nav>
  );
}

export function SettingsSubnavTab({
  isDarkMode,
  active,
  danger = false,
  onClick,
  children,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-4 text-sm transition-colors ${settingsSubnavTabClass(isDarkMode, active, danger)} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
