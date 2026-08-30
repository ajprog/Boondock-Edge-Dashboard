import React from "react";

const KeywordsSection = ({
  keywordCounts,
  activeKeywords,
  handleKeywordClick,
  isDarkMode,
  maxHeightClass = "max-h-96",
}) => (
  <div className="flex h-full flex-col">
    <div
      className={`flex-1 overflow-y-auto ${maxHeightClass} ${isDarkMode ? "dark-mode-scrollbar" : ""}`}
    >
      <div className="flex flex-wrap gap-2 pb-2">
        {Object.entries(keywordCounts).map(([keyword, count]) => (
          <button
            key={keyword}
            type="button"
            onClick={() => handleKeywordClick(keyword)}
            className={`flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
              activeKeywords.has(keyword)
                ? isDarkMode
                  ? "bg-primary/25 text-blue-200 ring-1 ring-primary/35"
                  : "bg-primary/12 text-primary ring-1 ring-primary/20"
                : isDarkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-200/90 text-slate-700 hover:bg-slate-300"
            }`}
          >
            <span>{keyword}</span>
            <span className="opacity-50">{count}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default KeywordsSection;
