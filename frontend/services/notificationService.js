import api from "@/services/api";

export const getNotifications = () => api.get("/notifications");

export const getUnreadCount = () => api.get("/notifications/unread-count");

export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`, {});

export const markAllNotificationsRead = () => api.patch("/notifications/read-all", {});
