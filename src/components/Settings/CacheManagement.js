import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const CACHE_KEYS = {
  CHANNELS: 'cached_channels',
  MESSAGES: 'cached_messages',
  KEYWORDS: 'cached_keywords',
  TIMEZONE: 'cached_timezone',
  LAST_FETCH: 'last_fetch_time'
};

const CacheManagement = ({ isDarkMode }) => {
  const [cacheStats, setCacheStats] = useState({});
  const [isClearing, setIsClearing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const getCacheSize = (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      return 0;
    }
  };

  const getTotalCacheSize = () => {
    try {
      let totalSize = 0;
      Object.values(CACHE_KEYS).forEach(key => {
        totalSize += getCacheSize(key);
      });
      return totalSize;
    } catch (error) {
      return 0;
    }
  };

  const getCacheStats = () => {
    const stats = {};
    let totalSize = 0;

    Object.entries(CACHE_KEYS).forEach(([name, key]) => {
      const size = getCacheSize(key);
      const data = localStorage.getItem(key);
      let itemCount = 0;
      
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            itemCount = parsed.length;
          } else if (typeof parsed === 'object') {
            itemCount = Object.keys(parsed).length;
          }
        } catch (e) {
          itemCount = 1; // Single item if not parseable
        }
      }

      stats[name] = {
        size,
        itemCount,
        key
      };
      totalSize += size;
    });

    stats.total = { size: totalSize };
    return stats;
  };

  const clearCache = () => {
    setIsClearing(true);
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      setCacheStats(getCacheStats());
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const refreshStats = () => {
    setCacheStats(getCacheStats());
    setLastRefresh(Date.now());
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageQuota = () => {
    try {
      // Estimate available storage (this is approximate)
      const testKey = 'storage_test';
      const testData = 'x'.repeat(1024 * 1024); // 1MB test
      let available = 0;
      
      try {
        localStorage.setItem(testKey, testData);
        localStorage.removeItem(testKey);
        available = 5 * 1024 * 1024; // Assume 5MB available
      } catch (e) {
        available = 0;
      }
      
      return available;
    } catch (error) {
      return 0;
    }
  };

  const totalSize = cacheStats.total?.size || 0;
  const availableStorage = getStorageQuota();
  const usagePercentage = availableStorage > 0 ? (totalSize / availableStorage) * 100 : 0;
  const isHighUsage = usagePercentage > 80;

  return (
    <div className={`p-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Cache Management</h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage local storage cache to optimize performance and prevent storage issues.
        </p>
      </div>

      {/* Storage Usage Overview */}
      <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Storage Usage</h3>
          <button
            onClick={refreshStats}
            className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Refresh stats"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Used: {formatBytes(totalSize)}</span>
            <span>Available: ~{formatBytes(availableStorage)}</span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isHighUsage ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            {isHighUsage ? (
              <AlertTriangle className="text-red-500 mr-1" size={14} />
            ) : (
              <CheckCircle className="text-green-500 mr-1" size={14} />
            )}
            <span className={isHighUsage ? 'text-red-500' : 'text-green-500'}>
              {usagePercentage.toFixed(1)}% used
            </span>
          </div>
        </div>

        {isHighUsage && (
          <div className={`p-3 rounded-md ${isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              <AlertTriangle className="text-red-500 mr-2" size={16} />
              <span className="text-sm text-red-600">
                High storage usage detected. Consider clearing cache to prevent storage errors.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cache Items */}
      <div className={`mb-6 p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">Cache Items</h3>
        <div className="space-y-3">
          {Object.entries(cacheStats).map(([name, stats]) => {
            if (name === 'total') return null;
            return (
              <div key={name} className={`flex items-center justify-between p-3 rounded-md ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                <div>
                  <div className="font-medium capitalize">{name.replace(/_/g, ' ')}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {stats.itemCount} items • {formatBytes(stats.size)}
                  </div>
                </div>
                {stats.size > 0 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem(stats.key);
                      refreshStats();
                    }}
                    className={`p-1 rounded ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                    title="Clear this cache item"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h3 className="text-lg font-semibold mb-4">Actions</h3>
        <div className="space-y-3">
          <button
            onClick={clearCache}
            disabled={isClearing || totalSize === 0}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
              isClearing || totalSize === 0
                ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                : `${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`
            }`}
          >
            {isClearing ? (
              <>
                <RefreshCw className="animate-spin mr-2" size={16} />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2" size={16} />
                Clear All Cache
              </>
            )}
          </button>
          
          <div className={`p-3 rounded-md ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-start">
              <Info className="text-blue-500 mr-2 mt-0.5" size={16} />
              <div className="text-sm">
                <div className="font-medium text-blue-700 mb-1">Cache Information</div>
                <ul className={`space-y-1 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  <li>• Cache helps improve app performance by storing frequently accessed data</li>
                  <li>• Messages are automatically limited to prevent storage issues</li>
                  <li>• Cache is automatically cleared when it becomes too old</li>
                  <li>• Last refreshed: {new Date(lastRefresh).toLocaleString()}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheManagement;
