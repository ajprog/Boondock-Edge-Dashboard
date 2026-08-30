/**
 * Base URL for the edge server (e.g. http://localhost:4000). Empty in production
 * when the app is served by Flask — then fetch uses same-origin /api/...
 *
 * In dev, leave REACT_APP_EDGE_SERVER_ENDPOINT unset and use package.json "proxy"
 * so /api/* goes to the Flask port with no CORS issues, or set the full URL and
 * ensure the backend CORS allows Authorization.
 */

/**
 * Normalized Authorization header for /api/* (avoids double "Bearer " and reads from user if needed).
 */
export function getBearerAuthHeader() {
  let t = null;
  try {
    t = localStorage.getItem('token');
    if (!t) {
      const raw = localStorage.getItem('user');
      if (raw) t = JSON.parse(raw).token;
    }
  } catch (e) {
    t = null;
  }
  if (typeof t !== 'string') return {};
  t = t.trim();
  if (t.toLowerCase().startsWith('bearer ')) {
    t = t.slice(7).trim();
  }
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}
