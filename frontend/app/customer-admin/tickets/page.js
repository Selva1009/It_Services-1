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

const SUPPORT_CLASS = {
  L1: "support-l1",
  L2: "support-l2",
  L3: "support-l3",
};

export default function AdminTicketsPage() {
  const { auth, getAuthToken } = useAuth();
  const token = getAuthToken() || auth?.authToken || null;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      Swal.fire("Error", err.response?.data?.message || "Something went wrong.", "error");
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
    } catch {
      // silent
    }
  }, [token]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications || []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Something went wrong.", "error");
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadTickets();
    loadUnreadCount();
  }, [token, loadTickets, loadUnreadCount]);

  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "Open").length;
  const inProgress = tickets.filter((t) => t.status === "In Progress").length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;
  const unclaimed = tickets.filter((t) => t.vendor_id === null).length;

  const vendorOptions = useMemo(() => {
    return ["All", ...new Set(tickets.map((t) => t.vendor_company).filter(Boolean))];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === "All" || ticket.status === statusFilter;
      const matchesVendor = vendorFilter === "All" || ticket.vendor_company === vendorFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        String(ticket.ticket_number || "").toLowerCase().includes(q) ||
        String(ticket.raised_by_name || "").toLowerCase().includes(q) ||
        String(ticket.category || "").toLowerCase().includes(q);
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
      Swal.fire("Error", err.response?.data?.message || "Something went wrong.", "error");
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
      Swal.fire("Error", err.response?.data?.message || "Something went wrong.", "error");
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
      Swal.fire("Error", err.response?.data?.message || "Something went wrong.", "error");
    }
  };

  const toggleDrawer = async () => {
    const opening = !drawerOpen;
    setDrawerOpen(opening);
    if (opening) {
      await loadNotifications();
    }
  };

  return (
    <div className="page-wrapper">
      <CustomerAdminNavbar />

      <div className="page-header">
        <div>
          <h1>Ticket Overview</h1>
          <p>Monitor all tickets raised by IT users.</p>
        </div>
        <div className="header-right">
          <Badge badgeContent={unreadCount} color="error">
            <IconButton onClick={toggleDrawer}>
              <NotificationsIcon className="header-bell-icon" />
            </IconButton>
          </Badge>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card border-navy"><h2>{total}</h2><p>Total Tickets</p></div>
        <div className="stat-card border-blue"><h2>{open}</h2><p>Open</p></div>
        <div className="stat-card border-orange"><h2>{inProgress}</h2><p>In Progress</p></div>
        <div className="stat-card border-green"><h2>{resolved}</h2><p>Resolved</p></div>
        <div className="stat-card border-red"><h2>{unclaimed}</h2><p>Unclaimed</p></div>
      </div>

      <div className="filter-bar">
        <div className="filter-chips">
          {STATUS_FILTERS.map((item) => (
            <Chip
              key={item}
              label={item}
              onClick={() => setStatusFilter(item)}
              className={`filter-chip${statusFilter === item ? " active" : ""}`}
            />
          ))}
        </div>

        <div className="filter-row">
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
            placeholder="Search by ticket number, raised by or category"
          />
          <Select value={vendorFilter} onChange={(event) => setVendorFilter(event.target.value)}>
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
        <div className="empty-state">No tickets found.</div>
      ) : (
        <TableContainer className="table-wrapper" component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className="th-cell">Ticket No</TableCell>
                <TableCell className="th-cell">Raised By</TableCell>
                <TableCell className="th-cell">Company</TableCell>
                <TableCell className="th-cell">Category</TableCell>
                <TableCell className="th-cell">Vendor Assigned</TableCell>
                <TableCell className="th-cell">Vendor User</TableCell>
                <TableCell className="th-cell">Priority</TableCell>
                <TableCell className="th-cell">Status</TableCell>
                <TableCell className="th-cell">Support Level</TableCell>
                <TableCell className="th-cell">Raised On</TableCell>
                <TableCell className="th-cell">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="empty-state">No tickets found.</TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="td-num">{ticket.ticket_number || "-"}</TableCell>
                    <TableCell>{ticket.raised_by_name || "-"}</TableCell>
                    <TableCell>{ticket.it_company || "-"}</TableCell>
                    <TableCell>{ticket.category || "-"}</TableCell>
                    <TableCell>
                      {ticket.vendor_company ? ticket.vendor_company : <Chip label="Unassigned" className="unassigned-chip" size="small" />}
                    </TableCell>
                    <TableCell>
                      {ticket.assigned_vendor_user ? ticket.assigned_vendor_user : <Chip label="Unassigned" className="unassigned-chip" size="small" />}
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
                      <Button className="view-btn" onClick={() => openTicketDetail(ticket)}>View Details</Button>
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
        <DialogContent className="detail-content">
          {detailLoading ? (
            <div className="loading-wrapper">
              <CircularProgress className="navy-spinner" />
            </div>
          ) : (
            <div className="detail-grid">
              <div className="detail-left">
                <div className="detail-header">
                  <div className="detail-num">{selectedTicket?.ticket_number || "-"}</div>
                  <Chip
                    label={selectedTicket?.status || "Open"}
                    className={STATUS_CLASS[selectedTicket?.status] || "status-open"}
                    size="small"
                  />
                </div>

                <div className="detail-meta">
                  <div><div className="meta-label">Category</div><div className="meta-value">{selectedTicket?.category || "-"}</div></div>
                  <div><div className="meta-label">Sub Category</div><div className="meta-value">{selectedTicket?.sub_category || "-"}</div></div>
                  <div><div className="meta-label">Support Level</div><div className="meta-value">{selectedTicket?.support_level || "-"}</div></div>
                  <div><div className="meta-label">Priority</div><div className="meta-value">{selectedTicket?.priority || "-"}</div></div>
                </div>

                <h3 className="detail-title">{selectedTicket?.title || "-"}</h3>
                <div className="desc-box">{selectedTicket?.description || "-"}</div>

                <div className="raised-grid">
                  <div><div className="meta-label">Raised By</div><div className="meta-value">{selectedTicket?.raised_by_name || "-"}</div></div>
                  <div><div className="meta-label">Email</div><div className="meta-value">{selectedTicket?.raised_by_email || "-"}</div></div>
                  <div><div className="meta-label">Company</div><div className="meta-value">{selectedTicket?.it_company || "-"}</div></div>
                  <div><div className="meta-label">Raised On</div><div className="meta-value">{formatDate(selectedTicket?.created_at)}</div></div>
                </div>
              </div>

              <div className="detail-right">
                <div className="summary-box">
                  <div className="summary-row"><span className="summary-label">Raised by</span><span className="summary-value">{selectedTicket?.raised_by_name || "-"} ({selectedTicket?.raised_by_email || "-"})</span></div>
                  <div className="summary-row"><span className="summary-label">Vendor</span><span className="summary-value">{selectedTicket?.vendor_company || "Not assigned yet"}</span></div>
                  <div className="summary-row"><span className="summary-label">Assigned to</span><span className="summary-value">{selectedTicket?.assigned_vendor_user || "Not assigned yet"}</span></div>
                  <div className="summary-row"><span className="summary-label">Latest comment</span><span className="summary-value">{selectedTicket?.latest_comment || "-"}</span></div>
                  <div className="summary-row"><span className="summary-label">Last activity</span><span className="summary-value">{formatDate(selectedTicket?.latest_activity_at)}</span></div>
                </div>

                <div className="activity-section">
                  <h3>Activity Log</h3>
                  <div className="activity-list">
                    {activity.length === 0 ? (
                      <div className="activity-empty">No activity found.</div>
                    ) : (
                      activity.map((item) => (
                        <div className="activity-item" key={item.id}>
                          <div className="activity-top">
                            <span className={`actor-badge actor-${item.actor_type || "system"}`}>{item.actor_type || "system"}</span>
                            <span className="activity-msg">{item.message || "-"}</span>
                          </div>
                          {(item.old_value || item.new_value) ? (
                            <div className="activity-change">{item.old_value || "-"} -&gt; {item.new_value || "-"}</div>
                          ) : null}
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

      <div className={`notif-overlay${drawerOpen ? " open" : ""}`} onClick={toggleDrawer} />
      <div className={`notif-drawer${drawerOpen ? " open" : ""}`}>
        <div className="notif-header">
          <div>
            <h3>Notifications</h3>
            <p>{unreadCount} unread</p>
          </div>
          <Button onClick={handleMarkAllRead} className="mark-all-btn">Mark all read</Button>
        </div>
        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="notif-empty">No notifications yet.</div>
          ) : notifications.map((item) => (
            <div
              key={item.id}
              className={`notif-item${item.is_read ? "" : " unread"}`}
              onClick={() => handleMarkRead(item.id)}
            >
              <p className="notif-msg">{item.message}</p>
              <div className="notif-meta">
                <span>{item.ticket_number} � {item.category}</span>
                <span>{formatDate(item.created_at)}</span>
                {!item.is_read && <span className="unread-dot" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
