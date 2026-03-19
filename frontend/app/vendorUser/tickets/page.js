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
  Tab,
  Tabs,
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

const SUPPORT_CLASS = {
  L1: "support-l1",
  L2: "support-l2",
  L3: "support-l3",
};

export default function VendorUserTicketsPage() {
  const { auth, getAuthToken } = useAuth();
  const token = getAuthToken() || auth?.authToken || null;

  const [activeTab, setActiveTab] = useState(0);
  const [unclaimedTickets, setUnclaimedTickets] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);
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

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(response.data.unreadCount || 0);
    } catch {
      // silent catch
    }
  }, [token]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications || []);
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    }
  }, [token]);

  const loadUnclaimedTickets = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tickets/vendor/unclaimed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnclaimedTickets(response.data.tickets || []);
    } catch {
      setUnclaimedTickets([]);
    }
  }, [token]);

  const loadMyTickets = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tickets/vendor/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyTickets(response.data.tickets || []);
    } catch {
      setMyTickets([]);
    }
  }, [token]);

  const loadAll = useCallback(async () => {
    try {
      await Promise.all([loadUnclaimedTickets(), loadMyTickets()]);
    } finally {
      setLoading(false);
    }
  }, [loadMyTickets, loadUnclaimedTickets]);

  useEffect(() => {
    if (!token) return;
    loadAll();
    loadUnreadCount();
  }, [token, loadAll, loadUnreadCount]);

  const handleClaim = async (ticketId) => {
    try {
      setClaiming(ticketId);
      await axios.patch(
        `http://localhost:5000/api/tickets/${ticketId}/claim`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("success", "Ticket claimed. Check My Tickets tab.", "success");
      setActiveTab(1);
      await loadAll();
      await loadUnreadCount();
    } catch (err) {
      if (err.response?.status === 400) {
        Swal.fire("warning", "This ticket was already claimed.", "warning");
        await loadUnclaimedTickets();
      } else {
        Swal.fire("error", err.response?.data?.message || "Failed.", "error");
      }
    } finally {
      setClaiming(null);
    }
  };

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
    if (!statusValue) {
      Swal.fire("error", "Select a status", "error");
      return;
    }

    try {
      setUpdatingStatus(true);
      await axios.patch(
        `http://localhost:5000/api/tickets/${selectedTicket.id}/status`,
        { status: statusValue, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("success", "Status updated", "success");
      await openTicketDetail(selectedTicket);
      await loadMyTickets();
      await loadUnreadCount();
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
    const opening = !drawerOpen;
    setDrawerOpen(opening);
    if (opening) {
      await loadNotifications();
    }
  };

  const filteredUnclaimed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return unclaimedTickets.filter((ticket) => {
      if (!q) return true;
      return (
        String(ticket.ticket_number || "").toLowerCase().includes(q) ||
        String(ticket.title || "").toLowerCase().includes(q)
      );
    });
  }, [unclaimedTickets, search]);

  const filteredMy = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myTickets.filter((ticket) => {
      const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
      const searchMatch =
        !q ||
        String(ticket.ticket_number || "").toLowerCase().includes(q) ||
        String(ticket.title || "").toLowerCase().includes(q);
      return statusMatch && searchMatch;
    });
  }, [myTickets, statusFilter, search]);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>My Tickets</h1>
          <p>Claim and manage support tickets</p>
        </div>
        <div className="header-right">
          <Badge badgeContent={unreadCount} color="error">
            <IconButton onClick={toggleDrawer}>
              <NotificationsIcon className="header-bell-icon" />
            </IconButton>
          </Badge>
        </div>
      </div>

      <div className="tabs-wrapper">
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab
            label={<span>Available to Claim<span className="tab-badge">{unclaimedTickets.length}</span></span>}
          />
          <Tab
            label={<span>My Tickets<span className="tab-badge-blue">{myTickets.length}</span></span>}
          />
        </Tabs>
      </div>

      {activeTab === 0 ? (
        <>
          <div className="filter-bar">
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
          ) : !Array.isArray(filteredUnclaimed) || filteredUnclaimed.length === 0 ? (
            <div className="empty-state">No tickets available for your service categories.</div>
          ) : (
            <TableContainer className="table-wrapper" component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="th-cell">Ticket No</TableCell>
                    <TableCell className="th-cell">Category</TableCell>
                    <TableCell className="th-cell">Sub Category</TableCell>
                    <TableCell className="th-cell">Raised By</TableCell>
                    <TableCell className="th-cell">Company</TableCell>
                    <TableCell className="th-cell">Priority</TableCell>
                    <TableCell className="th-cell">Support Level</TableCell>
                    <TableCell className="th-cell">Raised On</TableCell>
                    <TableCell className="th-cell">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUnclaimed.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="td-num">{ticket.ticket_number || "-"}</TableCell>
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
                          label={ticket.support_level || "L1"}
                          className={SUPPORT_CLASS[ticket.support_level] || "support-l1"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(ticket.created_at)}</TableCell>
                      <TableCell>
                        <Button className="claim-btn" onClick={() => handleClaim(ticket.id)} disabled={claiming === ticket.id}>
                          {claiming === ticket.id ? <CircularProgress size={16} color="inherit" /> : "Claim Ticket"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : (
        <>
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
          ) : !Array.isArray(filteredMy) || filteredMy.length === 0 ? (
            <div className="empty-state">No tickets claimed yet.</div>
          ) : (
            <TableContainer className="table-wrapper" component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="th-cell">Ticket No</TableCell>
                    <TableCell className="th-cell">Category</TableCell>
                    <TableCell className="th-cell">Sub Category</TableCell>
                    <TableCell className="th-cell">Raised By</TableCell>
                    <TableCell className="th-cell">Company</TableCell>
                    <TableCell className="th-cell">Priority</TableCell>
                    <TableCell className="th-cell">Status</TableCell>
                    <TableCell className="th-cell">Support Level</TableCell>
                    <TableCell className="th-cell">Raised On</TableCell>
                    <TableCell className="th-cell">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMy.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="td-num">{ticket.ticket_number || "-"}</TableCell>
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
                        <Button className="view-btn" onClick={() => openTicketDetail(ticket)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
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
                  <div><div className="meta-label">Created</div><div className="meta-value">{formatDate(selectedTicket?.created_at)}</div></div>
                </div>
              </div>

              <div className="detail-right">
                <div className="update-section">
                  <h3>Update Status</h3>
                  <Select value={statusValue} onChange={(event) => setStatusValue(event.target.value)} fullWidth>
                    {STATUS_OPTIONS.map((item) => (
                      <MenuItem key={item} value={item}>{item}</MenuItem>
                    ))}
                  </Select>
                  <TextField
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    multiline
                    rows={3}
                    placeholder="Add a comment"
                    fullWidth
                  />
                  <Button className="submit-btn" onClick={handleStatusUpdate} disabled={updatingStatus}>
                    {updatingStatus ? <CircularProgress size={18} color="inherit" /> : "Submit"}
                  </Button>
                </div>

                <Divider />

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
                <span>{item.ticket_number} • {item.category}</span>
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
