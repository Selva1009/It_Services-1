import { apiRequest } from "./http-client";
import { API_V1_PREFIX } from "./config";

export const createSession = async ({ email, password }) => {
  return apiRequest(`${API_V1_PREFIX}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
};
