"use client";

import { apiRequest } from "@/app/services/apiClient";

export const fetchNotifications = ({ token, limit = 50 } = {}) =>
  apiRequest({
    path: "/api/notifications",
    method: "GET",
    token,
  });

export const fetchUnreadCount = ({ token } = {}) =>
  apiRequest({
    path: "/api/notifications/unread-count",
    method: "GET",
    token,
  });

export const fetchVendorAdminNotifications = ({
  token,
  limit = 50,
} = {}) =>
  fetchNotifications({ token, limit });

export const fetchCustomerAdminNotifications = ({
  token,
  adminId,
  limit = 200,
} = {}) =>
  fetchNotifications({ token, limit });

export const fetchVendorUserNotifications = ({ token, limit = 50 } = {}) =>
  fetchNotifications({ token, limit });

export const markNotificationRead = (notificationId, token) =>
  apiRequest({
    path: `/api/notifications/${notificationId}/read`,
    method: "PATCH",
    token,
  });

export const markAllNotificationsRead = (token) =>
  apiRequest({
    path: "/api/notifications/read-all",
    method: "PATCH",
    token,
  });
