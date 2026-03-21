import axios from "axios";
import { API_BASE_URL } from "@/lib/api/config";

const API_SERVICE_BASE_URL = `${API_BASE_URL}/api`;

let getToken = () => null;

export const bindTokenGetter = (tokenGetter) => {
  getToken = typeof tokenGetter === "function" ? tokenGetter : () => null;
};

const api = axios.create({
  baseURL: API_SERVICE_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Request failed. Please try again.";
    return Promise.reject(new Error(message));
  }
);

export default api;
