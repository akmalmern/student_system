import axios from "axios";
import { store } from "../app/store";
import { setAccessToken, logoutLocal } from "../features/auth/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true, // refresh cookie uchun MUHIM
});

http.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function flushQueue(token) {
  queue.forEach((cb) => cb(token));
  queue = [];
}

async function refreshAccess() {
  const res = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const token = res.data?.accessToken;
  store.dispatch(setAccessToken(token));
  return token;
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        const token = await new Promise((resolve) => queue.push(resolve));
        if (!token) {
          store.dispatch(logoutLocal());
          throw err;
        }
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      }

      isRefreshing = true;
      try {
        const token = await refreshAccess();
        flushQueue(token);
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      } catch (e) {
        flushQueue(null);
        store.dispatch(logoutLocal());
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    throw err;
  },
);
