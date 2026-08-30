import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InteractiveUserGuide from './InteractiveUserGuide';
import { ArrowLeft } from 'lucide-react';

const UserGuidePage = ({ isDarkMode: isDarkModeProp }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Use prop if provided, otherwise read from localStorage
    return isDarkModeProp !== undefined 
      ? isDarkModeProp 
      : JSON.parse(localStorage.getItem("isDarkMode")) || false;
  });

  // Sync with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = JSON.parse(localStorage.getItem("isDarkMode")) || false;
      setIsDarkMode(stored);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Header - Similar to troubleshoot.boondockecho.com style */}
      <div className={`
        sticky top-0 z-10 border-b backdrop-blur-sm
        ${isDarkMode 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-gray-200'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`
                  p-2 rounded-md transition-all duration-200
                  ${isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className={`
                  w-9 h-9 rounded-md flex items-center justify-center
                  ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-50'}
                `}>
                  <span className={`text-base ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>📚</span>
                </div>
                <div>
                  <h1 className={`
                    text-xl font-semibold
                    ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}
                  `}>
                    Documentation
                  </h1>
                </div>
              </div>
            </div>
            
            {/* Navigation menu similar to troubleshoot site */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/settings')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content - Clean, minimal style like troubleshoot site */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveUserGuide isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default UserGuidePage;
