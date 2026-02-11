import axios from "axios";
import { 
  loadAccessToken, 
  saveTokens,
  clearTokens, 
  getTimeUntilExpiry 
} from "./auth";
import { server_domain } from "../Helpers/Domain";

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
}

const API_BASE = `${server_domain}api`;

// withCredentials: true is MANDATORY to send/receive the HttpOnly cookie
const api = axios.create({ 
  baseURL: API_BASE, 
  withCredentials: true 
});

let refreshTimeout = null;

/* ===============================
   HELPER: Check if expiring soon
================================ */
const isTokenExpiringSoon = (token, buffer = 15000) => {
  const ms = getTimeUntilExpiry(token);
  return ms <= buffer;
};

/* ===============================
   SCHEDULE AUTO REFRESH
================================ */
const scheduleRefresh = (accessToken) => {
  if (!accessToken) return;

  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }

  const msUntilExpiry = getTimeUntilExpiry(accessToken);

  // Refresh 15 seconds before expiry
  const delay = msUntilExpiry - 15000;

  if (delay > 0) {
    refreshTimeout = setTimeout(async () => {
      try {
        const resp = await axios.post(
          `${API_BASE}/token/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccess = resp.data.access;

        saveTokens({ access: newAccess });
        setAuthToken(newAccess);
        scheduleRefresh(newAccess);

        console.log("Token auto-refreshed (scheduled).");
      } catch (err) {
        console.error("Scheduled auto-refresh failed.");
        clearTokens();
      }
    }, delay);
  }
};

/* ===============================
   INITIAL LOAD
================================ */
const existingToken = loadAccessToken();
if (existingToken) {
  scheduleRefresh(existingToken);
}

/* ===============================
   REFRESH ON TAB FOCUS (FIX)
================================ */
window.addEventListener("focus", async () => {
  const token = loadAccessToken();
  if (!token) return;

  if (isTokenExpiringSoon(token)) {
    try {
      const resp = await axios.post(
        `${API_BASE}/token/refresh/`,
        {},
        { withCredentials: true }
      );

      const newAccess = resp.data.access;

      saveTokens({ access: newAccess });
      setAuthToken(newAccess);
      scheduleRefresh(newAccess);

      console.log("Token refreshed on tab focus.");
    } catch (err) {
      console.error("Focus refresh failed.");
      clearTokens();
    }
  }
});

/* ===============================
   REQUEST INTERCEPTOR
================================ */
api.interceptors.request.use(
  (config) => {
    const token = loadAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      scheduleRefresh(token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ===============================
   RESPONSE INTERCEPTOR (SAFETY NET)
================================ */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE}/token/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccess = response.data.access;

        saveTokens({ access: newAccess });
        setAuthToken(newAccess);
        scheduleRefresh(newAccess);

        processQueue(null, newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
