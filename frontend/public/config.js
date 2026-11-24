// Overwritten by docker-entrypoint.sh in the container. Empty values fall back to
// VITE_API_BASE_URL (build time) and then http://localhost:8000.
window.__CHATTER_CONFIG__ = { apiBaseUrl: "" };
