"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Badge,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAuth } from "@/app/contexts/AuthContext";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import "./AdminTickets.css";

const STATUS_OPTIONS = ["Open", "Assigned", "In Progress", "Escalated", "Resolved", "Closed"];
const STATUS_FILTERS = ["All", ...STATUS_OPTIONS];

const PRIORITY_CLASS = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
  Critical: "priority-critical",
};

const STATUS_CLASS = {
  Open: "status-open",
  Assigned: "status-assigned",
  "In Progress": "status-progress",
  Escalated: "status-escalated",
  Resolved: "status-resolved",
  Closed: "status-closed",
};

const SUPPORT_CLASS = { L1: "support-l1", L2: "support-l2", L3: "support-l3" };

export default function AdminTicketsPage() {
  const { auth, getAuthToken } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [vendorFilter, setVendorFilter] = useState("All");

  const token = getAuthToken() || auth?.authToken || null;

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadTickets = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tickets/admin/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data.tickets || []);
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications || []);
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    }
  };

  useEffect(() => {
    loadTickets();
    loadUnreadCount();
  }, [loadTickets, loadUnreadCount]);

  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "Open").length;
  const inProgress = tickets.filter((t) => t.status === "In Progress").length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;

  const vendorOptions = useMemo(() => {
    return ["All", ...new Set(tickets.map((t) => t.vendor_company).filter(Boolean))];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      const matchesVendor = vendorFilter === "All" || t.vendor_company === vendorFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        t.ticket_number?.toLowerCase().includes(query) ||
        t.raised_by_name?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query);
      return matchesStatus && matchesVendor && matchesSearch;
    });
  }, [tickets, statusFilter, vendorFilter, search]);

  const openTicketDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const response = await axios.get(`http://localhost:5000/api/tickets/${ticket.id}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTicket(response.data.ticket);
      setActivity(response.data.activity || []);
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(
        "http://localhost:5000/api/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    }
  };

  const toggleDrawer = async () => {
    const nextState = !drawerOpen;
    setDrawerOpen(nextState);
    if (nextState) {
      await loadNotifications();
    }
  };

  return (
    <div className="admin-tickets-page">
      <CustomerAdminNavbar />

      <div className="page-header">
        <div>
          <h1>Ticket Overview</h1>
          <p>Monitor all tickets raised by IT users.</p>
        </div>
        <IconButton className="notification-btn" onClick={toggleDrawer}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-total">
          <h2>{total}</h2>
          <p>Total Tickets</p>
        </div>
        <div className="stat-card stat-open">
          <h2>{open}</h2>
          <p>Open Tickets</p>
        </div>
        <div className="stat-card stat-progress">
          <h2>{inProgress}</h2>
          <p>In Progress</p>
        </div>
        <div className="stat-card stat-resolved">
          <h2>{resolved}</h2>
          <p>Resolved Tickets</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-chips">
          {STATUS_FILTERS.map((item) => (
            <Chip
              key={item}
              label={item}
              onClick={() => setStatusFilter(item)}
              className={`status-filter-chip${statusFilter === item ? " active" : ""}`}
            />
          ))}
        </div>

        <div className="filter-controls">
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
            placeholder="Search by ticket number, raised by, or category"
          />
          <Select
            value={vendorFilter}
            onChange={(event) => setVendorFilter(event.target.value)}
            className="vendor-select"
            fullWidth
          >
            {vendorOptions.map((vendor) => (
              <MenuItem key={vendor} value={vendor}>{vendor}</MenuItem>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <CircularProgress className="navy-spinner" />
        </div>
      ) : !Array.isArray(tickets) || tickets.length === 0 ? (
        <div className="table-empty">No tickets found.</div>
      ) : (
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="table-header-cell">Ticket No</TableCell>
                <TableCell className="table-header-cell">Raised By</TableCell>
                <TableCell className="table-header-cell">Company</TableCell>
                <TableCell className="table-header-cell">Category</TableCell>
                <TableCell className="table-header-cell">Vendor Assigned</TableCell>
                <TableCell className="table-header-cell">Vendor User</TableCell>
                <TableCell className="table-header-cell">Priority</TableCell>
                <TableCell className="table-header-cell">Status</TableCell>
                <TableCell className="table-header-cell">Support Level</TableCell>
                <TableCell className="table-header-cell">Raised On</TableCell>
                <TableCell className="table-header-cell">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="table-empty">No tickets found.</TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="ticket-number">{ticket.ticket_number || "-"}</TableCell>
                    <TableCell>{ticket.raised_by_name || "-"}</TableCell>
                    <TableCell>{ticket.it_company || "-"}</TableCell>
                    <TableCell>{ticket.category || "-"}</TableCell>
                    <TableCell>{ticket.vendor_company || "-"}</TableCell>
                    <TableCell>
                      {ticket.assigned_vendor_user ? (
                        ticket.assigned_vendor_user
                      ) : (
                        <Chip label="Unassigned" className="unassigned-chip" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority || "Medium"}
                        className={PRIORITY_CLASS[ticket.priority] || "priority-medium"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status || "Open"}
                        className={STATUS_CLASS[ticket.status] || "status-open"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.support_level || "L1"}
                        className={SUPPORT_CLASS[ticket.support_level] || "support-l1"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(ticket.created_at)}</TableCell>
                    <TableCell>
                      <Button className="action-btn" onClick={() => openTicketDetail(ticket)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Ticket Detail</DialogTitle>
        <DialogContent className="ticket-detail-content">
          {detailLoading ? (
            <div className="loading-wrapper">
              <CircularProgress className="navy-spinner" />
            </div>
          ) : (
            <div className="ticket-detail-grid">
              <div className="ticket-info">
                <div className="ticket-detail-header">
                  <div className="ticket-number-large">{selectedTicket?.ticket_number || "-"}</div>
                  <Chip
                    label={selectedTicket?.status || "Open"}
                    className={STATUS_CLASS[selectedTicket?.status] || "status-open"}
                    size="small"
                  />
                </div>

                <div className="ticket-meta">
                  <div>
                    <div className="meta-label">Category</div>
                    <div className="meta-value">{selectedTicket?.category || "-"}</div>
                  </div>
                  <div>
                    <div className="meta-label">Sub Category</div>
                    <div className="meta-value">{selectedTicket?.sub_category || "-"}</div>
                  </div>
                  <div>
                    <div className="meta-label">Support Level</div>
                    <div className="meta-value">{selectedTicket?.support_level || "-"}</div>
                  </div>
                  <div>
                    <div className="meta-label">Priority</div>
                    <div className="meta-value">{selectedTicket?.priority || "-"}</div>
                  </div>
                </div>

                <div className="meta-label">Title</div>
                <div className="ticket-title">{selectedTicket?.title || "-"}</div>

                <div className="meta-label">Description</div>
                <div className="description-box">{selectedTicket?.description || "-"}</div>

                <div className="ticket-meta">
                  <div>
                    <div className="meta-label">Raised By</div>
                    <div className="meta-value">{selectedTicket?.raised_by_name || "-"}</div>
                  </div>
                  <div>
                    <div className="meta-label">Email</div>
                    <div className="meta-value">{selectedTicket?.raised_by_email || "-"}</div>
                  </div>
                  <div>
                    <div className="meta-label">Company</div>
                    <div className="meta-value">{selectedTicket?.it_company || "-"}</div>
                  </div>
                  <div>
                    <div className="meta-label">Raised On</div>
                    <div className="meta-value">{formatDate(selectedTicket?.created_at)}</div>
                  </div>
                </div>
              </div>

              <div className="ticket-activity">
                <div className="detail-summary">
                  <div className="detail-summary-row">
                    <span className="detail-summary-label">Raised By</span>
                    <span className="detail-summary-value">{selectedTicket?.raised_by_name || "-"}</span>
                  </div>
                  <div className="detail-summary-row">
                    <span className="detail-summary-label">Email</span>
                    <span className="detail-summary-value">{selectedTicket?.raised_by_email || "-"}</span>
                  </div>
                  <div className="detail-summary-row">
                    <span className="detail-summary-label">Vendor</span>
                    <span className="detail-summary-value">{selectedTicket?.vendor_company || "-"}</span>
                  </div>
                  <div className="detail-summary-row">
                    <span className="detail-summary-label">Vendor User</span>
                    <span className="detail-summary-value">{selectedTicket?.assigned_vendor_user || "Not assigned yet"}</span>
                  </div>
                  <div className="detail-summary-row">
                    <span className="detail-summary-label">Latest Comment</span>
                    <span className="detail-summary-value">{selectedTicket?.latest_comment || "-"}</span>
                  </div>
                </div>

                <div className="activity-section">
                  <h3>Activity Log</h3>
                  <div className="activity-list">
                    {activity.length === 0 ? (
                      <div className="table-empty">No activity found.</div>
                    ) : (
                      activity.map((item) => (
                        <div className="activity-item" key={item.id}>
                          <div className="activity-row">
                            <span className={`actor-badge ${item.actor_type || ""}`}>{item.actor_type || "system"}</span>
                            <span className="activity-message">{item.message}</span>
                          </div>
                          {(item.old_value || item.new_value) && (
                            <div className="activity-change">{item.old_value || "-"} -&gt; {item.new_value || "-"}</div>
                          )}
                          <div className="activity-time">{formatDate(item.created_at)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className={`notification-overlay${drawerOpen ? " open" : ""}`} onClick={toggleDrawer} />
      <div className={`notification-drawer${drawerOpen ? " open" : ""}`}>
        <div className="notification-header">
          <h3>Notifications</h3>
          <Button onClick={handleMarkAllRead}>Mark all as read</Button>
        </div>

        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications found.</div>
          ) : (
            notifications.map((item) => (
              <div
                className={`notification-item${item.is_read ? "" : " unread"}`}
                key={item.id}
                onClick={() => handleMarkRead(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleMarkRead(item.id);
                  }
                }}
              >
                <div className="notification-message">{item.message}</div>
                <div className="notification-meta">
                  <span>{item.ticket_number || "-"}</span>
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

