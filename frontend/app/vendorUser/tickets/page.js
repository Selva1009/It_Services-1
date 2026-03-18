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
  Divider,
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
import "./VendorTickets.css";

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

export default function VendorTicketsPage() {
  const { auth, getAuthToken } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const [statusValue, setStatusValue] = useState("");
  const [comment, setComment] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      const response = await axios.get("http://localhost:5000/api/tickets/vendor/list", {
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

  const filteredTickets = useMemo(() => {
    return (tickets || []).filter((ticket) => {
      const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        ticket.ticket_number?.toLowerCase().includes(query) ||
        ticket.title?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, search]);

  const openTicketDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setStatusValue(ticket.status || "");
    setComment("");
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

  const handleStatusUpdate = async () => {
    if (!selectedTicket) {
      return;
    }

    if (!statusValue) {
      Swal.fire("Error", "Please select a status.", "error");
      return;
    }

    try {
      setUpdatingStatus(true);
      await axios.patch(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/status`,
        { status: statusValue, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", "Status updated successfully.", "success");
      await openTicketDetail(selectedTicket);
      await loadTickets();
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setUpdatingStatus(false);
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
    <div className="vendor-tickets-page">
      <div className="page-header">
        <div>
          <h1>Support Tickets</h1>
          <p>Track and update assigned tickets.</p>
        </div>
        <div className="header-right">
          <IconButton className="notification-btn" onClick={toggleDrawer}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Chip label={`Total ${Array.isArray(tickets) ? tickets.length : 0}`} className="total-chip" />
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

        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
          placeholder="Search by ticket number or title"
        />
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
    <TableCell className="table-header-cell">Category</TableCell>
    <TableCell className="table-header-cell">Sub Category</TableCell>
    <TableCell className="table-header-cell">Raised By</TableCell>
    <TableCell className="table-header-cell">Company</TableCell>
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
                  <TableCell colSpan={10} className="table-empty">No tickets found.</TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="ticket-number">{ticket.ticket_number || "-"}</TableCell>
                    <TableCell>{ticket.category || "-"}</TableCell>
                    <TableCell>{ticket.sub_category || "-"}</TableCell>
                    <TableCell>{ticket.raised_by_name || "-"}</TableCell>
                    <TableCell>{ticket.it_company || "-"}</TableCell>
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
                      <Button className="action-btn" onClick={() => openTicketDetail(ticket)}>View</Button>
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
                <div className="update-status">
                  <h3>Update Status</h3>
                  <Select
                    value={statusValue}
                    onChange={(event) => setStatusValue(event.target.value)}
                    fullWidth
                  >
                    {STATUS_OPTIONS.map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>

                  <TextField
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Add comment"
                  />

                  <Button className="btn-primary" onClick={handleStatusUpdate} disabled={updatingStatus}>
                    {updatingStatus ? <CircularProgress size={20} className="btn-spinner" /> : "Submit"}
                  </Button>
                </div>

                <Divider />

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

