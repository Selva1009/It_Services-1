"use client";

import { API_BASE_URL } from "@/lib/api/config";

const buildHeaders = ({ token, headers, json } = {}) => {
  const nextHeaders = { ...(headers || {}) };
  if (json) {
    nextHeaders["Content-Type"] = nextHeaders["Content-Type"] || "application/json";
  }
  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }
  return nextHeaders;
};

export const apiRequest = async ({
  path,
  method = "GET",
  token,
  headers,
  body,
  cache,
} = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    cache,
    headers: buildHeaders({
      token,
      headers,
      json: body !== undefined,
    }),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json();
      message = payload?.error || payload?.message || message;
    } catch {
      // Ignore parse errors.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
};
