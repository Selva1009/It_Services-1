"use client";

import { apiRequest } from "@/app/services/apiClient";

export const fetchVendorAdminNotifications = ({
  token,
  vendorAdminId,
  limit = 50,
} = {}) =>
  apiRequest({
    path: "/api/notifications/vendor-admin",
    method: "POST",
    token,
    body: {
      vendorAdminID: vendorAdminId,
      limit,
    },
  });

export const fetchCustomerAdminNotifications = ({
  adminId,
  limit = 200,
} = {}) =>
  apiRequest({
    path: "/api/notifications/admin",
    method: "POST",
    body: {
      adminID: adminId,
      limit,
    },
  });

export const fetchVendorUserNotifications = ({ vendorUserId, limit = 50 } = {}) =>
  apiRequest({
    path: `/api/notifications/${vendorUserId}?limit=${limit}`,
  });

export const markNotificationRead = (notificationId) =>
  apiRequest({
    path: `/api/notifications/read/${notificationId}`,
    method: "PUT",
  });

export const markAllNotificationsRead = (vendorUserId) =>
  apiRequest({
    path: `/api/notifications/read-all/${vendorUserId}`,
    method: "PUT",
  });
