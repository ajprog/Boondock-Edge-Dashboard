// TO-DO Use this for all axios and fetch calls
import axios from 'axios';

const api = axios.create({
  baseURL: (localStorage.getItem("EDGE_SERVER_ENDPOINT") || process.env.REACT_APP_EDGE_SERVER_ENDPOINT || '/api')
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get authentication headers for fetch requests
 * @returns {Object} Headers object with Authorization header if token exists
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Authenticated fetch wrapper
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };
  
  return fetch(url, {
    ...options,
    headers
  });
};

export default api;