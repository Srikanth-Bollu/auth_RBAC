// app/utils/api.js
import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";

// Base axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api/auth",
  headers: { "Content-Type": "application/json" },
  // if you use cookie-based refresh token, enable:
  // withCredentials: true
});

/**
 * Request interceptor:
 * - attaches Authorization header with access token (if present)
 */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor:
 * - if response is 401 (access token expired), try refreshing
 * - queue requests while refresh is in progress
 */
let isRefreshing = false;
let failedQueue: any = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom: any) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // If no response or not 401, reject immediately
    if (!err.response) return Promise.reject(err);
    if (err.response.status !== 401) return Promise.reject(err);

    // Prevent infinite loop
    if (originalRequest._retry) return Promise.reject(err);
    originalRequest._retry = true;

    // If refresh already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((e) => Promise.reject(e));
    }

    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      isRefreshing = false;
      return Promise.reject(err);
    }

    try {
      // Call refresh endpoint
      const resp = await axios.post(
        "http://localhost:5000/api/auth/refresh",
        { token: refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const { accessToken, refreshToken: newRefresh } = resp.data;
      saveTokens({ accessToken, refreshToken: newRefresh });

      // Update original request and retry
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      processQueue(null, accessToken);

      isRefreshing = false;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      isRefreshing = false;
      return Promise.reject(refreshError);
    }
  }
);

export default api;
