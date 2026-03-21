export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
  },
  userAdmin: {
    sendOtp: "/api/user-admin/send-otp",
    signup: "/api/user-admin/signup",
  },
  vendorAdmin: {
    sendOtp: "/api/vendor-admin/send-otp",
    signup: "/api/vendor-admin/signup",
  },
  tickets: {
    my: "/api/tickets/my",
    raise: "/api/tickets/raise",
    vendorUnclaimed: "/api/tickets/vendor/unclaimed",
    vendorList: "/api/tickets/vendor/list",
    claim: (ticketId) => `/api/tickets/${ticketId}/claim`,
    detail: (ticketId) => `/api/tickets/${ticketId}/detail`,
    status: (ticketId) => `/api/tickets/${ticketId}/status`,
  },
  notifications: {
    list: "/api/notifications",
    unreadCount: "/api/notifications/unread-count",
    markRead: (notificationId) => `/api/notifications/${notificationId}/read`,
    markAllRead: "/api/notifications/read-all",
  },
};
