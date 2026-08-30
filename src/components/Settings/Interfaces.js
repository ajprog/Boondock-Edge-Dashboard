import React, { useState, useEffect, useCallback } from 'react';
import { 
  Network, 
  Lightbulb, 
  Power, 
  Plus, 
  Trash2, 
  PowerOff, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Play,
  Square,
  Edit2,
  X,
  Check
} from 'lucide-react';
import { gpioService, LED_PATTERNS } from '../services/gpioService';
import { toast } from 'react-toastify';
import SettingsSectionHeader from './SettingsSectionHeader';

const Interfaces = ({ isDarkMode }) => {
  // Configuration state
  const [ledEnabled, setLedEnabled] = useState(() => {
    const stored = localStorage.getItem('ledStatusIndicatorsEnabled');
    return stored === 'true';
  });
  
  // Relay state
  const [relays, setRelays] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown'); // 'connected', 'disconnected', 'unknown'
  const [ledGPIO, setLedGPIO] = useState(null);
  const [ledMode, setLedMode] = useState('source'); // 'source' or 'sink'
  
  // New relay form
  const [showAddRelay, setShowAddRelay] = useState(false);
  const [newRelayName, setNewRelayName] = useState('');
  const [newRelayGPIO, setNewRelayGPIO] = useState('');
  const [newRelayNormalState, setNewRelayNormalState] = useState('off');
  
  // Edit relay state
  const [editingRelay, setEditingRelay] = useState(null); // {name, gpio}

  // Save LED enabled state
  useEffect(() => {
    localStorage.setItem('ledStatusIndicatorsEnabled', ledEnabled.toString());
  }, [ledEnabled]);

  // Test connection and load relays
  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Test connection by getting LED pattern through backend
      await gpioService.getPattern();
      setConnectionStatus('connected');
      // Load LED GPIO and mode
      try {
        const gpioInfo = await gpioService.getLEDGPIO();
        if (gpioInfo && typeof gpioInfo.gpio === 'number') {
          setLedGPIO(gpioInfo.gpio);
        }
      } catch (e) {
        console.error('Error loading LED GPIO:', e);
      }
      try {
        const mode = await gpioService.getLEDMode();
        if (mode === 'source' || mode === 'sink') {
          setLedMode(mode);
        }
      } catch (e) {
        console.error('Error loading LED mode:', e);
      }
      await loadRelays();
      // Success - no message needed, connection status indicator will show it
    } catch (err) {
      setConnectionStatus('disconnected');
      
      // Provide more detailed error message
      let errorMessage = 'Unable to connect to GPIO service. ';
      if (err.response?.status === 503) {
        errorMessage += 'GPIO service is not available. Please check if the GPIO service is running on the server.';
      } else if (err.response?.status === 504) {
        errorMessage += 'GPIO service request timed out.';
      } else if (err.response) {
        errorMessage += `Server responded with status ${err.response.status}.`;
        if (err.response.data?.error) {
          errorMessage += ` ${err.response.data.error}`;
        }
      } else {
        errorMessage += 'Please check if the backend server is running and can reach the GPIO service.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Connection test failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load relays from API
  const loadRelays = useCallback(async () => {
    try {
      const relaysData = await gpioService.getAllRelays();
      setRelays(relaysData);
      setError(null);
    } catch (err) {
      console.error('Error loading relays:', err);
      setError('Failed to load relays');
    }
  }, []);

  // Initial load - always test connection so existing relays/LED config are visible
  useEffect(() => {
    testConnection();
  }, []); // Only run once on mount

  // Note: API URL is now configured on the backend via GPIO_SERVICE_URL environment variable

  // Handle LED enabled toggle
  const handleLEDEnabledToggle = async (enabled) => {
    setLedEnabled(enabled);
    if (enabled) {
      // Test connection when enabling
      await testConnection();
    }
    // Note: LED status is now managed automatically by the backend
    // This toggle is kept for UI consistency but doesn't control backend behavior
  };

  // Handle LED GPIO change
  const handleUpdateLedGPIO = async () => {
    if (ledGPIO == null) return;
    const gpio = parseInt(ledGPIO, 10);
    if (isNaN(gpio) || gpio < 1 || gpio > 40) {
      toast.error('LED GPIO pin must be a number between 1 and 40');
      return;
    }
    setLoading(true);
    try {
      await gpioService.setLEDGPIO(gpio);
      toast.success(`LED GPIO updated to ${gpio}`);
      setLedGPIO(gpio);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update LED GPIO';
      toast.error(errorMsg);
      console.error('Error updating LED GPIO:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle LED mode change
  const handleUpdateLedMode = async (mode) => {
    setLoading(true);
    try {
      await gpioService.setLEDMode(mode);
      setLedMode(mode);
      toast.success(`LED mode set to ${mode === 'source' ? 'Source (active high)' : 'Sink (active low)'}`);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update LED mode';
      toast.error(errorMsg);
      console.error('Error updating LED mode:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add new relay
  const handleAddRelay = async () => {
    if (!newRelayName.trim() || !newRelayGPIO) {
      toast.error('Please provide both relay name and GPIO pin');
      return;
    }

    const gpio = parseInt(newRelayGPIO);
    if (isNaN(gpio) || gpio < 1 || gpio > 40) {
      toast.error('GPIO pin must be a number between 1 and 40');
      return;
    }

    setLoading(true);
    try {
      await gpioService.addRelay(newRelayName.trim(), gpio, newRelayNormalState);
      toast.success(`Relay "${newRelayName}" added successfully`);
      setNewRelayName('');
      setNewRelayGPIO('');
      setNewRelayNormalState('off');
      setShowAddRelay(false);
      await loadRelays();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to add relay';
      toast.error(errorMsg);
      console.error('Error adding relay:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove relay
  const handleRemoveRelay = async (name) => {
    if (!window.confirm(`Are you sure you want to remove relay "${name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await gpioService.removeRelay(name);
      toast.success(`Relay "${name}" removed successfully`);
      await loadRelays();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to remove relay';
      toast.error(errorMsg);
      console.error('Error removing relay:', err);
    } finally {
      setLoading(false);
    }
  };

  // Control relay
  const handleControlRelay = async (name, action) => {
    setLoading(true);
    try {
      await gpioService.controlRelay(name, action);
      toast.success(`Relay "${name}" turned ${action}`);
      await loadRelays();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to control relay';
      toast.error(errorMsg);
      console.error('Error controlling relay:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update relay normal state
  const handleUpdateNormalState = async (name, normalState) => {
    setLoading(true);
    try {
      await gpioService.setRelayNormalState(name, normalState);
      toast.success(`Relay "${name}" normal state set to ${normalState.toUpperCase()}`);
      await loadRelays();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update normal state';
      toast.error(errorMsg);
      console.error('Error updating normal state:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update relay GPIO
  const handleUpdateRelayGPIO = async (name, newGPIO) => {
    const gpio = parseInt(newGPIO, 10);
    if (isNaN(gpio) || gpio < 1 || gpio > 40) {
      toast.error('GPIO pin must be a number between 1 and 40');
      return;
    }

    setLoading(true);
    try {
      await gpioService.updateRelayGPIO(name, gpio);
      toast.success(`Relay "${name}" GPIO updated to ${gpio}`);
      setEditingRelay(null);
      await loadRelays();
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update relay GPIO';
      toast.error(errorMsg);
      console.error('Error updating relay GPIO:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SettingsSectionHeader
        icon={Network}
        title="Interfaces"
        description="Configure GPIO interfaces for LED status indicators and relay control"
        isDarkMode={isDarkMode}
        iconColor="blue"
      />

      <div className="space-y-6">
        {/* Current Configuration Summary */}
        {connectionStatus === 'connected' && (
          <div className={`p-5 rounded-xl border-2 mb-6 transition-all duration-300 ${
            isDarkMode
              ? 'bg-green-900/20 border-green-700/50'
              : 'bg-green-50 border-green-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Current Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* LED GPIO */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-blue-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    LED GPIO Pin
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {ledGPIO !== null ? `GPIO ${ledGPIO}` : 'Not Set'}
                </p>
              </div>
              
              {/* LED Mode */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-blue-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    LED Mode
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {ledMode === 'source' ? 'Source' : ledMode === 'sink' ? 'Sink' : 'Unknown'}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {ledMode === 'source' ? 'Active High' : ledMode === 'sink' ? 'Active Low' : ''}
                </p>
              </div>
              
              {/* Relays Count */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Power size={16} className="text-purple-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Configured Relays
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {Object.keys(relays).length}
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {Object.keys(relays).length === 0 
                    ? 'No relays configured' 
                    : Object.keys(relays).length === 1 
                      ? '1 relay' 
                      : `${Object.keys(relays).length} relays`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Configuration */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Network size={18} className="text-blue-500" />
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    GPIO Service Connection
                  </label>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  GPIO service calls are handled by the backend server. Configure GPIO_SERVICE_URL on the server if needed.
                </p>
              </div>
              <button
                onClick={testConnection}
                disabled={loading}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  loading
                    ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                    : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white hover:shadow-lg`
                }`}
                title="Test Connection"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Test Connection
              </button>
            </div>
            
            {/* Connection Status */}
            <div className="mt-3 flex items-center gap-2">
              {connectionStatus === 'connected' && (
                <>
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Connected to GPIO service
                  </span>
                </>
              )}
              {connectionStatus === 'disconnected' && (
                <>
                  <AlertCircle size={16} className="text-red-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    GPIO service unavailable
                  </span>
                </>
              )}
              {connectionStatus === 'unknown' && (
                <>
                  <AlertCircle size={16} className="text-gray-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Connection status unknown
                  </span>
                </>
              )}
            </div>
          </div>

          {/* LED Status Indicators Toggle */}
          <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
            ledEnabled
              ? isDarkMode
                ? 'bg-blue-900/30 border-blue-400 shadow-lg'
                : 'bg-blue-50 border-blue-500 shadow-lg'
              : isDarkMode
                ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  ledEnabled
                    ? isDarkMode
                      ? 'bg-blue-500/20 shadow-inner'
                      : 'bg-blue-500 shadow-inner'
                    : isDarkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-100'
                }`}>
                  <Lightbulb size={24} className={ledEnabled
                    ? isDarkMode
                      ? 'text-blue-300'
                      : 'text-white'
                    : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  } />
                </div>
                <div className="text-left">
                  <h4 className={`font-semibold text-lg ${
                    isDarkMode
                      ? ledEnabled
                        ? 'text-blue-300'
                        : 'text-gray-300'
                      : ledEnabled
                        ? 'text-blue-900'
                        : 'text-gray-700'
                  }`}>
                    Enable LED Status Indicators
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    LED status indicators are automatically managed by the backend server (startup → ready → active heartbeat)
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleLEDEnabledToggle(!ledEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                    ledEnabled
                      ? isDarkMode
                        ? 'bg-blue-500'
                        : 'bg-blue-500'
                      : isDarkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                  }`}
                >
                  <div className={`absolute w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 top-0.5 ${
                    ledEnabled ? 'translate-x-6 left-1' : 'translate-x-0 left-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* LED GPIO & Mode Configuration */}
          <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-blue-500" />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                LED GPIO & Mode
              </h3>
            </div>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Configure which GPIO pin drives the status LED and whether it operates as a source (active high) or sink (active low).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  LED GPIO Pin (1-40)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={ledGPIO ?? ''}
                    onChange={(e) => setLedGPIO(e.target.value)}
                    placeholder="e.g., 13"
                    min="1"
                    max="40"
                    className={`flex-1 p-3 rounded-xl border-2 transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-400'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    }`}
                  />
                  <button
                    onClick={handleUpdateLedGPIO}
                    disabled={loading || ledGPIO == null || ledGPIO === ''}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      loading || ledGPIO == null || ledGPIO === ''
                        ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                        : `${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                    }`}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  LED Mode
                </label>
                <div className="flex items-center gap-3">
                  <select
                    value={ledMode}
                    onChange={(e) => handleUpdateLedMode(e.target.value)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-blue-400'
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                    }`}
                  >
                    <option value="source">Source (GPIO → LED → Ground, active high)</option>
                    <option value="sink">Sink (3.3V → LED → GPIO, active low)</option>
                  </select>
                </div>
                <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Use <strong>Source</strong> when the GPIO drives current into the LED (LED to ground). Use <strong>Sink</strong> when the LED is tied to 3.3V and the GPIO sinks current.
                </p>
              </div>
            </div>
          </div>

          {/* LED Pattern Testing */}
          <div className={`p-5 rounded-xl border-2 transition-all duration-300 ${
            isDarkMode
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Play size={18} className="text-blue-500" />
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                Test LED Patterns
              </h3>
            </div>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Test different LED flashing patterns to verify your GPIO service is working correctly
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { pattern: LED_PATTERNS.STARTUP, label: 'Startup', description: '3s on/off' },
                { pattern: LED_PATTERNS.FAST, label: 'Fast', description: '0.25s blink' },
                { pattern: LED_PATTERNS.MEDIUM, label: 'Medium', description: '0.5s blink' },
                { pattern: LED_PATTERNS.SLOW, label: 'Slow', description: '1s blink' },
                { pattern: LED_PATTERNS.PULSE, label: 'Pulse', description: 'Quick pulse' },
                { pattern: LED_PATTERNS.TWO, label: 'Two Blinks', description: '2 blinks' },
                { pattern: LED_PATTERNS.THREE, label: 'Three Blinks', description: '3 blinks' },
                { pattern: LED_PATTERNS.ON, label: 'On', description: 'Solid on' },
                { pattern: LED_PATTERNS.OFF, label: 'Off', description: 'Solid off' },
              ].map(({ pattern, label, description }) => (
                <button
                  key={pattern}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await gpioService.setPattern(pattern);
                      toast.success(`LED pattern set to: ${label}`);
                    } catch (err) {
                      const errorMsg = err.response?.data?.detail || err.message || 'Failed to set LED pattern';
                      toast.error(errorMsg);
                      console.error('Error setting LED pattern:', err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || connectionStatus === 'disconnected'}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 text-left ${
                    loading || connectionStatus === 'disconnected'
                      ? `${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-400'} cursor-not-allowed`
                      : `${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-700' : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-blue-50'} cursor-pointer`
                  }`}
                  title={description}
                >
                  <div className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {label}
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {description}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Stop LED Button */}
            <div className="mt-4">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await gpioService.stopLED();
                    toast.success('LED stopped');
                  } catch (err) {
                    const errorMsg = err.response?.data?.detail || err.message || 'Failed to stop LED';
                    toast.error(errorMsg);
                    console.error('Error stopping LED:', err);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || connectionStatus === 'disconnected'}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  loading || connectionStatus === 'disconnected'
                    ? `${isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                    : `${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`
                }`}
              >
                <Square size={16} />
                Stop LED
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-xl border-2 ${
              isDarkMode
                ? 'bg-red-900/20 border-red-700 text-red-300'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <span className="text-sm">{typeof error === 'string' ? error : (error?.message || String(error))}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Relay Management */}
      <div className={`rounded-2xl shadow-lg p-8 transition-all duration-300 border ${
        isDarkMode
          ? 'bg-gray-900/60 border-gray-800'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-3 rounded-2xl shadow-md ${isDarkMode ? 'bg-purple-600' : 'bg-purple-500'}`}>
            <Power size={24} className="text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Relay Management
            </h2>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Configure and control GPIO relays
            </p>
          </div>
        </div>

        {/* Add Relay Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddRelay(!showAddRelay)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
              isDarkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <Plus size={16} />
            Add Relay
          </button>
        </div>

        {/* Add Relay Form */}
        {showAddRelay && (
          <div className={`mb-6 p-5 rounded-xl border-2 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Add New Relay
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Relay Name
                </label>
                <input
                  type="text"
                  value={newRelayName}
                  onChange={(e) => setNewRelayName(e.target.value)}
                  placeholder="e.g., Relay1"
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-purple-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  GPIO Pin (1-40)
                </label>
                <input
                  type="number"
                  value={newRelayGPIO}
                  onChange={(e) => setNewRelayGPIO(e.target.value)}
                  placeholder="e.g., 18"
                  min="1"
                  max="40"
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-purple-400'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Normal State
                </label>
                <select
                  value={newRelayNormalState}
                  onChange={(e) => setNewRelayNormalState(e.target.value)}
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-purple-400'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500'
                  }`}
                >
                  <option value="off">Normal Off (default OFF state)</option>
                  <option value="on">Normal On (default ON state)</option>
                </select>
                <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  The default state when the relay is initialized or reset.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleAddRelay}
                disabled={loading || !newRelayName.trim() || !newRelayGPIO}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  loading || !newRelayName.trim() || !newRelayGPIO
                    ? `${isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                    : `${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white`
                }`}
              >
                Add Relay
              </button>
              <button
                onClick={() => {
                  setShowAddRelay(false);
                  setNewRelayName('');
                  setNewRelayGPIO('');
                  setNewRelayNormalState('off');
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Relays Summary */}
        {connectionStatus === 'connected' && Object.keys(relays).length > 0 && (
          <div className={`p-4 rounded-xl border-2 mb-6 transition-all duration-300 ${
            isDarkMode
              ? 'bg-purple-900/20 border-purple-700/50'
              : 'bg-purple-50 border-purple-200'
          }`}>
            <h3 className={`text-md font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Configured Relays
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(relays).map(([name, relay]) => (
                <div
                  key={name}
                  className={`p-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-800/50 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {name}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        GPIO {relay.gpio}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        relay.state
                          ? isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {relay.state ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relays List */}
        <div className="space-y-4">
          {Object.keys(relays).length === 0 ? (
            <div className={`p-6 rounded-xl text-center ${
              isDarkMode
                ? 'bg-gray-800/50 text-gray-400'
                : 'bg-white text-gray-500'
            }`}>
              <Power size={32} className="mx-auto mb-2 opacity-50" />
              <p>No relays configured. Click "Add Relay" to create one.</p>
            </div>
          ) : (
            Object.entries(relays).map(([name, relay]) => (
              <div
                key={name}
                className={`p-5 rounded-xl border-2 transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      {editingRelay?.name === name ? (
                        <div className="flex items-center gap-2">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>GPIO:</span>
                          <input
                            type="number"
                            min="1"
                            max="40"
                            value={editingRelay.gpio}
                            onChange={(e) => setEditingRelay({ ...editingRelay, gpio: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateRelayGPIO(name, editingRelay.gpio);
                              } else if (e.key === 'Escape') {
                                setEditingRelay(null);
                              }
                            }}
                            className={`w-20 p-1 rounded border-2 ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-200'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateRelayGPIO(name, editingRelay.gpio)}
                            className={`p-1 rounded ${
                              isDarkMode ? 'text-green-400 hover:bg-gray-700' : 'text-green-600 hover:bg-gray-100'
                            }`}
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingRelay(null)}
                            className={`p-1 rounded ${
                              isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                            }`}
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            GPIO: {relay.gpio}
                          </span>
                          <button
                            onClick={() => setEditingRelay({ name, gpio: relay.gpio })}
                            disabled={loading}
                            className={`p-1 rounded transition-colors ${
                              isDarkMode
                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Edit GPIO"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                      <span className={`font-medium ${
                        relay.state
                          ? isDarkMode ? 'text-green-400' : 'text-green-600'
                          : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {relay.state ? 'ON' : 'OFF'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        relay.normal_state === 'on'
                          ? isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                          : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                      }`}>
                        Normal: {relay.normal_state === 'on' ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleControlRelay(name, relay.state ? 'off' : 'on')}
                      disabled={loading}
                      className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-1 md:gap-2 text-sm md:text-base flex-shrink-0 ${
                        relay.state
                          ? isDarkMode
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                          : isDarkMode
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span>🔋</span>
                      <span className="hidden sm:inline">{relay.state ? 'Disconnect Battery' : 'Connect Battery'}</span>
                      <span className="sm:hidden">{relay.state ? 'Disconnect' : 'Connect'}</span>
                    </button>
                    <button
                      onClick={() => handleControlRelay(name, 'toggle')}
                      disabled={loading}
                      className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Toggle"
                    >
                      ↕
                    </button>
                    <select
                      value={relay.normal_state || 'off'}
                      onChange={(e) => handleUpdateNormalState(name, e.target.value)}
                      disabled={loading}
                      className={`px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 border-2 flex-shrink-0 ${
                        relay.normal_state === 'on'
                          ? isDarkMode
                            ? 'bg-blue-900/50 border-blue-700 text-blue-300'
                            : 'bg-blue-100 border-blue-300 text-blue-700'
                          : isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                            : 'bg-white border-gray-300 text-gray-700'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Set Normal State (default state when initialized)"
                    >
                      <option value="off">Normal Off</option>
                      <option value="on">Normal On</option>
                    </select>
                    <button
                      onClick={() => handleRemoveRelay(name)}
                      disabled={loading}
                      className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${
                        isDarkMode
                          ? 'bg-red-900/50 hover:bg-red-800/50 text-red-300'
                          : 'bg-red-50 hover:bg-red-100 text-red-600'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Remove Relay"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        {Object.keys(relays).length > 0 && (
          <div className="mt-6">
            <button
              onClick={loadRelays}
              disabled={loading}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh Relays
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interfaces;

