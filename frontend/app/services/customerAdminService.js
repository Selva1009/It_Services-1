"use client";

import { apiRequest } from "@/app/services/apiClient";

export const fetchItUsers = (token) =>
  apiRequest({
    path: "/api/user-admin/It-users",
    token,
  });

export const fetchCustomerAdminCompanyName = (customerId) =>
  apiRequest({
    path: `/api/customer-users/company-name/${customerId}`,
  });

export const createCustomerUser = (payload) =>
  apiRequest({
    path: "/api/customer-users/customerUser",
    method: "POST",
    body: payload,
  });

export const createItUserEmployee = (token, payload) =>
  apiRequest({
    path: "/api/it-user-employee/signup",
    method: "POST",
    token,
    body: payload,
  });

export const updateCustomerUserProfile = (customerUserId, token, payload) =>
  apiRequest({
    path: `/api/customer-users/profile/${customerUserId}`,
    method: "PUT",
    token,
    body: payload,
  });

export const fetchItAdminTickets = (token) =>
  apiRequest({
    path: "/api/tickets/admin/list",
    token,
  });

export const fetchItAdminUsersSummary = (token) =>
  apiRequest({
    path: "/api/user-admin/It-users",
    token,
  });
