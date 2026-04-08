"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
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
import { useAuth } from "@/app/contexts/AuthContext";
import { toApiUrl } from "@/lib/api/config";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import VendorNavbar from "../navbar";
import "./VendorTickets.css";

const STATUS_OPTIONS = ["Open", "Assigned", "In Progress", "Escalated", "Resolved", "Closed"];
const STATUS_FILTERS = ["All", ...STATUS_OPTIONS];
const PRIORITY_FILTERS = ["All", "Low", "Medium", "High", "Critical"];

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

const isHighPriorityNotification = (notification) => {
  const priority = String(notification?.priority || "").toLowerCase();
  const message = String(notification?.message || "").toLowerCase();
  return priority === "high" || priority === "critical" || message.includes("high priority");
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
  const [priorityFilter, setPriorityFilter] = useState("All");
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
  const [notifFilter, setNotifFilter] = useState("all");

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
      const response = await axios.get(toApiUrl(API_ENDPOINTS.notifications.unreadCount), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(response.data.unreadCount || 0);
    } catch {
      // silent catch
    }
  }, [token]);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await axios.get(toApiUrl(API_ENDPOINTS.notifications.list), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications || []);
    } catch (err) {
      Swal.fire("error", err.response?.data?.message || "Something went wrong.", "error");
    }
  }, [token]);

  const loadUnclaimedTickets = useCallback(async () => {
    try {
      const response = await axios.get(toApiUrl(API_ENDPOINTS.tickets.vendorUnclaimed), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnclaimedTickets(response.data.tickets || []);
    } catch {
      setUnclaimedTickets([]);
    }
  }, [token]);

  const loadMyTickets = useCallback(async () => {
    try {
      const response = await axios.get(toApiUrl(API_ENDPOINTS.tickets.vendorList), {
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
        toApiUrl(API_ENDPOINTS.tickets.claim(ticketId)),
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
      const response = await axios.get(toApiUrl(API_ENDPOINTS.tickets.detail(ticket.id)), {
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
        toApiUrl(API_ENDPOINTS.tickets.status(selectedTicket.id)),
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
        toApiUrl(API_ENDPOINTS.notifications.markRead(id)),
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
        toApiUrl(API_ENDPOINTS.notifications.markAllRead),
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
      const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
      const priorityMatch = priorityFilter === "All" || ticket.priority === priorityFilter;
      const searchMatch =
        !q ||
        String(ticket.ticket_number || "").toLowerCase().includes(q) ||
        String(ticket.title || "").toLowerCase().includes(q);
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [unclaimedTickets, search, statusFilter, priorityFilter]);

  const filteredMy = useMemo(() => {
    const q = search.trim().toLowerCase();
    return myTickets.filter((ticket) => {
      const statusMatch = statusFilter === "All" || ticket.status === statusFilter;
      const priorityMatch = priorityFilter === "All" || ticket.priority === priorityFilter;
      const searchMatch =
        !q ||
        String(ticket.ticket_number || "").toLowerCase().includes(q) ||
        String(ticket.title || "").toLowerCase().includes(q);
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [myTickets, statusFilter, priorityFilter, search]);

  const filteredNotifications = useMemo(() => {
    if (notifFilter === "all") return notifications;
    return notifications.filter((item) => (notifFilter === "read" ? Boolean(item.is_read) : !item.is_read));
  }, [notifFilter, notifications]);

  return (
    <div className="page-wrapper">
      <VendorNavbar
        search={search}
        setSearch={setSearch}
        unreadCount={unreadCount}
        onToggleNotifications={toggleDrawer}
        onGoAvailable={() => setActiveTab(0)}
        onGoMyTickets={() => setActiveTab(1)}
      />

      <div className="page-header">
        <div>
          <h1>My Tickets</h1>
          <p>Claim and manage support tickets</p>
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
            <div className="filter-controls">
              <div className="filter-control filter-control-search">
                <p className="filter-label">Search</p>
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                  placeholder="Search by ticket number or title"
                />
              </div>

              <div className="filter-control">
                <p className="filter-label">Status</p>
                <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} fullWidth size="small">
                  {STATUS_FILTERS.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </div>

              <div className="filter-control">
                <p className="filter-label">Priority</p>
                <Select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} fullWidth size="small">
                  {PRIORITY_FILTERS.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </div>
            </div>
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
            <div className="filter-controls">
              <div className="filter-control filter-control-search">
                <p className="filter-label">Search</p>
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                  placeholder="Search by ticket number or title"
                />
              </div>

              <div className="filter-control">
                <p className="filter-label">Status</p>
                <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} fullWidth size="small">
                  {STATUS_FILTERS.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </div>

              <div className="filter-control">
                <p className="filter-label">Priority</p>
                <Select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} fullWidth size="small">
                  {PRIORITY_FILTERS.map((item) => (
                    <MenuItem key={item} value={item}>{item}</MenuItem>
                  ))}
                </Select>
              </div>
            </div>
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
      <aside className={`notif-drawer${drawerOpen ? " open" : ""}`}>
        <div className="notif-header-clean">
          <h3>Notifications</h3>
          <button type="button" className="notif-close-btn" onClick={toggleDrawer}>x</button>
        </div>

        <div className="notif-controls-clean">
          <select value={notifFilter} onChange={(event) => setNotifFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button type="button" onClick={handleMarkAllRead}>Mark all as read</button>
        </div>

        <div className="notif-list-clean">
          {filteredNotifications.length === 0 ? (
            <p className="notif-empty-clean">No notifications found.</p>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`notif-item-clean${item.is_read ? "" : " unread"}${isHighPriorityNotification(item) ? " high-priority" : ""}`}
              >
                {isHighPriorityNotification(item) ? (
                  <div className="notif-priority-banner">
                    <span className="notif-priority-signal" />
                    High Priority
                  </div>
                ) : null}
                <div className="notif-card-head">
                  <div className="notif-message-clean">{item.message}</div>
                </div>
                <div className="notif-meta-clean">
                  <span className="notif-meta-pill">{item.ticket_number || "-"}</span>
                  <span className="notif-meta-pill">{new Date(item.created_at).toLocaleString("en-IN")}</span>
                </div>
                {!item.is_read ? (
                  <button type="button" onClick={() => handleMarkRead(item.id)} className="notif-read-btn-clean">
                    Mark as Read
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
