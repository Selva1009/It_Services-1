import api from "@/services/api";

export const raiseTicket = (payload) => api.post("/tickets/raise", payload);

export const getVendorTickets = () => api.get("/tickets/vendor/list");

export const getAdminTickets = () => api.get("/tickets/admin/list");

export const getMyTickets = () => api.get("/tickets/my");

export const getTicketDetail = (ticketId) => api.get(`/tickets/${ticketId}/detail`);

export const updateTicketStatus = (ticketId, payload) =>
  api.patch(`/tickets/${ticketId}/status`, payload);
