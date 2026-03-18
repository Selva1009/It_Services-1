import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

let getToken = () => null;

export const bindTokenGetter = (tokenGetter) => {
  getToken = typeof tokenGetter === "function" ? tokenGetter : () => null;
};

const api = axios.create({
  baseURL: API_BASE_URL,
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
