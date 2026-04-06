"use client";

import { apiRequest } from "@/app/services/apiClient";

export const fetchVendorAdminUsers = (token) =>
  apiRequest({
    path: "/api/vendor-admin/vendor-users",
    token,
  });


export const createVendorUser = (token, payload) =>
  apiRequest({
    path: "/api/vendor-user/signup",
    method: "POST",
    token,
    body: payload,
  });
