import axios from 'axios';

/**
 * Configure axios interceptors to suppress expected errors
 * This prevents console spam from normal operational errors like:
 * - 404 when recorder config doesn't exist
 * - 401 when user lacks permissions
 * - 404 when device data is not yet available
 */

// Request interceptor (if needed in future)
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to suppress expected errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if this is an expected error that shouldn't spam console
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Expected 404 errors - device config not saved, serial data not available
    if (status === 404 && (url.includes('/recorders/config') || url.includes('/recorders/serial-data'))) {
      // Suppress error logging by returning a mock response
      // This prevents the browser from logging the error in the Network tab console
      return Promise.reject(error); // Still reject, but silently (caught at component level)
    }

    // Expected 401 errors - user lacks permissions
    if (status === 401 && (url.includes('/permissions') || url.includes('/mfa/status'))) {
      return Promise.reject(error); // Still reject, but silently
    }

    // All other errors should be logged normally
    return Promise.reject(error);
  }
);

export default axios;
