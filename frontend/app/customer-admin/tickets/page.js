"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Alert,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  tooltipClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import {
  X, Tag, Building2, User, AlertTriangle,
  Activity, MessageSquare, Hash,
  Layers, Monitor, Wrench, Calendar,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import "./AdminTickets.css";

/* ─── Styled Tooltip ─────────────────────────────────────── */
const VtTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: { color: "#1e293b" },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    fontWeight: 400,
    lineHeight: 1.5,
    padding: "7px 12px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(15,23,42,0.22)",
    maxWidth: 280,
  },
}));

/* ─── Chip colour maps ───────────────────────────────────── */
const STATUS_CHIP = {
  Open:          { bg: "#eff6ff", color: "#1d4ed8" },
  Assigned:      { bg: "#f5f3ff", color: "#6d28d9" },
  "In Progress": { bg: "#fffbeb", color: "#b45309" },
  Escalated:     { bg: "#fff1f2", color: "#be123c" },
  Resolved:      { bg: "#f0fdf4", color: "#16a34a" },
  Closed:        { bg: "#f1f5f9", color: "#475569" },
};

const PRIORITY_CHIP = {
  Low:      { bg: "#f0fdf4", color: "#16a34a" },
  Medium:   { bg: "#fffbeb", color: "#b45309" },
  High:     { bg: "#fff1f2", color: "#be123c" },
  Critical: { bg: "#fce7f3", color: "#9f1239" },
};

const STATUS_OPTIONS   = ["All","Open","Assigned","In Progress","Escalated","Resolved","Closed"];
const PRIORITY_OPTIONS = ["All","High","Medium","Low","Critical"];
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

/* ─── Helpers ────────────────────────────────────────────── */
const fmtDate = (v) =>
  v ? new Date(v).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "-";

const formatDate = (v) => fmtDate(v);

const chipSx = (map, key, fallback) => {
  const s = map[key] || map[fallback];
  return {
    backgroundColor: s.bg,
    color: s.color,
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    height: 23,
    borderRadius: "6px",
    border: "none",
  };
};

const formatTimeAgo = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

/* ─── Tooltip cell — same as vendor TipCell ─────────────── */
function TipCell({ value }) {
  const text = value || "-";
  return (
    <TableCell className="it-td it-td-soft it-td-tip">
      <VtTooltip title={text !== "-" ? text : ""} placement="top" enterDelay={300} enterNextDelay={200}>
        <span className="it-tip-inner">{text}</span>
      </VtTooltip>
    </TableCell>
  );
}

/* ─── Columns definition ─────────────────────────────────── */
const COLUMNS = [
  { label: "Ticket #",      cls: "col-ticket"   },
  { label: "Title",         cls: "col-title"    },
  { label: "Category",      cls: "col-cat"      },
  { label: "Support Level", cls: "col-support"  },
  { label: "Sub Category",  cls: "col-subcat"   },
  { label: "Vendor",        cls: "col-company"  },
  { label: "Assigned To",   cls: "col-raised"   },
  { label: "Priority",      cls: "col-priority" },
  { label: "Status",        cls: "col-status"   },
  { label: "Last Activity", cls: "col-created"  },
  { label: "Actions",       cls: "col-actions"  },
];

/* ─── Actor colours for timeline ─────────────────────────── */
const ACTOR_LABELS = {
  it_user:     "User",
  it_admin:    "IT Admin",
  vendor:      "Vendor",
  vendor_user: "Vendor",
  system:      "System",
};

const ACTOR_COLOR = {
  it_user:     { bg: "#dbeafe", color: "#1d4ed8" },
  it_admin:    { bg: "#ede9fe", color: "#5b21b6" },
  vendor:      { bg: "#d1fae5", color: "#065f46" },
  vendor_user: { bg: "#d1fae5", color: "#065f46" },
  system:      { bg: "#f1f5f9", color: "#475569" },
};

/* ─── Ticket Detail Modal ────────────────────────────────── */
function TicketDetailModal({ ticket, activity, loading, onClose }) {
  return (
    <>
      <div className="td-backdrop" onClick={onClose} />
      <div className="td-modal">
        <div className="td-modal-header">
          <div className="td-modal-header-left">
            <div className="td-ticket-num">
              <Hash size={12} />
              {ticket?.ticket_number || "—"}
            </div>
            <h2 className="td-modal-title">{ticket?.title || "Ticket Details"}</h2>
          </div>
          <button className="td-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="td-modal-body">
          {loading ? (
            <div className="td-loading">
              <div className="td-spinner" />
              Loading details…
            </div>
          ) : (
            <>
              <div className="td-chips-row">
                {(() => {
                  const s = STATUS_CHIP[ticket?.status]   || STATUS_CHIP["Open"];
                  const p = PRIORITY_CHIP[ticket?.priority] || PRIORITY_CHIP["Medium"];
                  return (
                    <>
                      <span className="td-chip" style={{ background: s.bg, color: s.color }}>
                        <span className="td-chip-dot" style={{ background: s.color }} />
                        {ticket?.status || "Open"}
                      </span>
                      <span className="td-chip" style={{ background: p.bg, color: p.color }}>
                        <AlertTriangle size={11} />
                        {ticket?.priority || "Medium"}
                      </span>
                    </>
                  );
                })()}
              </div>

              <div className="td-modal-cols">
                <div className="td-modal-left">
                  <div className="td-info-grid">
                    <div className="td-info-item">
                      <div className="td-info-label"><User size={11} /> Raised By</div>
                      <div className="td-info-value">{ticket?.raised_by_name || "—"}</div>
                      <div className="td-info-sub">{ticket?.raised_by_email || ""}</div>
                    </div>
                    <div className="td-info-item">
                      <div className="td-info-label"><Building2 size={11} /> Company</div>
                      <div className="td-info-value">{ticket?.it_company || "—"}</div>
                    </div>
                    <div className="td-info-item">
                      <div className="td-info-label"><Wrench size={11} /> Vendor</div>
                      <div className="td-info-value">{ticket?.vendor_company || "—"}</div>
                    </div>
                    <div className="td-info-item">
                      <div className="td-info-label"><User size={11} /> Assigned To</div>
                      <div className="td-info-value">{ticket?.assigned_vendor_user || "Unassigned"}</div>
                    </div>
                    <div className="td-info-item">
                      <div className="td-info-label"><Tag size={11} /> Category</div>
                      <div className="td-info-value">{ticket?.category || "—"}</div>
                    </div>
                    <div className="td-info-item">
                      <div className="td-info-label"><Monitor size={11} /> Sub Category</div>
                      <div className="td-info-value">{ticket?.sub_category || "—"}</div>
                    </div>
                    <div className="td-info-item">
                      <div className="td-info-label"><Layers size={11} /> Support Level</div>
                      <div className="td-info-value">{ticket?.support_level || "—"}</div>
                    </div>
                    <div className="td-info-item">
                      <div className="td-info-label"><Calendar size={11} /> Raised On</div>
                      <div className="td-info-value">{fmtDate(ticket?.created_at)}</div>
                    </div>
                  </div>
                  <div className="td-section">
                    <div className="td-section-title"><MessageSquare size={13} /> Description</div>
                    <div className="td-description">{ticket?.description || "No description provided."}</div>
                  </div>
                </div>

                <div className="td-modal-right">
                  <div className="td-section-title" style={{ marginBottom: 12 }}>
                    <Activity size={13} /> Activity
                  </div>
                  {activity.length === 0 ? (
                    <div className="td-empty">No activity recorded yet.</div>
                  ) : (
                    <div className="td-timeline">
                      {activity.map((item, idx) => {
                        const actorKey   = item.actor_type || "system";
                        const actorStyle = ACTOR_COLOR[actorKey] || ACTOR_COLOR.system;
                        const actorLabel = ACTOR_LABELS[actorKey] || actorKey;
                        const isLast     = idx === activity.length - 1;
                        return (
                          <div key={item.id || idx} className={`td-tl-item${isLast ? " last" : ""}`}>
                            <div className="td-tl-left">
                              <div className="td-tl-dot" style={{ background: actorStyle.color }} />
                              {!isLast && <div className="td-tl-line" />}
                            </div>
                            <div className="td-tl-content">
                              <div className="td-tl-header">
                                <span className="td-tl-actor" style={{ background: actorStyle.bg, color: actorStyle.color }}>
                                  {actorLabel}
                                </span>
                                <span className="td-tl-time">{formatTimeAgo(item.created_at)}</span>
                              </div>
                              <div className="td-tl-message">{item.message || "—"}</div>
                              {(item.old_value || item.new_value) && (
                                <div className="td-tl-change">
                                  {item.old_value && <span className="td-tl-old">{item.old_value}</span>}
                                  {item.old_value && item.new_value && <span className="td-tl-arrow">→</span>}
                                  {item.new_value && <span className="td-tl-new">{item.new_value}</span>}
                                </div>
                              )}
                              <div className="td-tl-date">{fmtDate(item.created_at)}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function AdminTicketsPage() {
  const { auth, getAuthToken } = useAuth();
  const token = getAuthToken?.() || auth?.authToken || null;

  const [tickets,        setTickets]       = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState("");
  const [statusFilter,   setStatus]        = useState("All");
  const [priorityFilter, setPriority]      = useState("All");
  const [search,         setSearch]        = useState("");
  const [page,           setPage]          = useState(0);
  const [pageSize,       setPageSize]      = useState(10);
  const [modalOpen,      setModalOpen]     = useState(false);
  const [selectedTicket, setSelectedTicket]= useState(null);
  const [activity,       setActivity]      = useState([]);
  const [detailLoading,  setDetailLoading] = useState(false);
  const fetchedRef = useRef(null);

  /* ── Load ── */
  const loadTickets = useCallback(async () => {
    if (!token) { setTickets([]); setLoading(false); return; }
    setLoading(true); setError("");
    try {
      const response = await fetchItAdminTickets(token);
      const raw = response?.tickets ?? response?.data?.tickets ?? [];
      setTickets(Array.isArray(raw) ? raw : []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) { fetchedRef.current = null; return; }
    if (fetchedRef.current === token) return;
    fetchedRef.current = token;
    loadTickets();
    loadUnreadCount();
  }, [token, loadTickets, loadUnreadCount]);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchQ =
        !q ||
        String(t.ticket_number  || "").toLowerCase().includes(q) ||
        String(t.title          || "").toLowerCase().includes(q) ||
        String(t.category       || "").toLowerCase().includes(q) ||
        String(t.support_level  || "").toLowerCase().includes(q) ||
        String(t.sub_category   || "").toLowerCase().includes(q) ||
        String(t.vendor_company || "").toLowerCase().includes(q);
      return (
        matchQ &&
        (statusFilter   === "All" || t.status   === statusFilter) &&
        (priorityFilter === "All" || t.priority === priorityFilter)
      );
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged      = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const from       = filtered.length === 0 ? 0 : page * pageSize + 1;
  const to         = Math.min((page + 1) * pageSize, filtered.length);

  /* ── Stats ── */
  const total    = tickets.length;
  const open     = tickets.filter((t) => t.status   === "Open").length;
  const inProg   = tickets.filter((t) => t.status   === "In Progress").length;
  const crit     = tickets.filter((t) => t.priority === "Critical").length;
  const resolved = tickets.filter((t) => t.status   === "Resolved").length;

  const chips = [
    statusFilter   !== "All" && { k: "s", label: `Status: ${statusFilter}`,     clear: () => setStatus("All")   },
    priorityFilter !== "All" && { k: "p", label: `Priority: ${priorityFilter}`, clear: () => setPriority("All") },
  ].filter(Boolean);

  return (
    <div className="it-page">
      <CustomerAdminNavbar />

      <div className="it-content">

        {/* ── Header ── */}
        <div className="it-header">
          <div className="it-header-left">
            <div className="it-badge">
              <span className="it-badge-dot" />
              Customer Portal
            </div>
            <Typography className="it-title">
              IT Admin&nbsp;<span className="it-title-hi">Tickets</span>
            </Typography>
            <Typography className="it-subtitle">
              All tickets raised by IT users under your company.
            </Typography>
          </div>

          <div className="it-stats">
            {[
              { n: total,    cls: "",      lbl: "Total"       },
              { n: open,     cls: "amber", lbl: "Open"        },
              { n: inProg,   cls: "amber", lbl: "In Progress" },
              { n: crit,     cls: "red",   lbl: "Critical"    },
              { n: resolved, cls: "green", lbl: "Resolved"    },
            ].map((s) => (
              <div className="it-stat" key={s.lbl}>
                <div className={`it-stat-n ${s.cls}`}>{s.n}</div>
                <div className="it-stat-l">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="it-toolbar">
          <div className="it-toolbar-left">
            <div className="it-field-group it-search">
              <p className="it-label">Search</p>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ticket #, title, category, vendor…"
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </div>

          <div className="it-toolbar-right">
            <div className="it-field-group it-select">
              <p className="it-label">Status</p>
              <FormControl fullWidth size="small">
                <Select value={statusFilter} onChange={(e) => setStatus(e.target.value)} MenuProps={{ className: "it-menu" }}>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </div>

            <div className="it-field-group it-select">
              <p className="it-label">Priority</p>
              <FormControl fullWidth size="small">
                <Select value={priorityFilter} onChange={(e) => setPriority(e.target.value)} MenuProps={{ className: "it-menu" }}>
                  {PRIORITY_OPTIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>

        {/* ── Active chips ── */}
        {chips.length > 0 && (
          <div className="it-chips">
            {chips.map((c) => (
              <span key={c.k} className="it-chip" onClick={c.clear}>
                {c.label}<span className="it-chip-x">×</span>
              </span>
            ))}
          </div>
        )}

        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

        {/* ── Table ── */}
        {loading ? (
          <div className="it-loading"><CircularProgress /></div>
        ) : (
          <Paper className="it-card" variant="outlined">
            <div className="it-scroll">
              <Table className="it-table" size="small">
                <colgroup>
                  {COLUMNS.map((c) => <col key={c.label} className={c.cls} />)}
                </colgroup>

                <TableHead className="it-thead">
                  <TableRow>
                    {COLUMNS.map((c) => (
                      <TableCell key={c.label} className="it-th">{c.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow className="it-empty">
                      <TableCell colSpan={COLUMNS.length}>
                        <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.16 }}>🎫</div>
                        No tickets match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map((t, i) => (
                      <TableRow key={t.id} className="it-tr" style={{ animationDelay: `${i * 20}ms` }}>
                        <TableCell className="it-td it-td-id">{t.ticket_number || "-"}</TableCell>
                        <TableCell className="it-td" title={t.title}>{t.title || "-"}</TableCell>
                        <TipCell value={t.category} />
                        <TableCell className="it-td it-td-soft">{t.support_level || "-"}</TableCell>
                        <TipCell value={t.sub_category} />
                        <TableCell className="it-td">{t.vendor_company || "-"}</TableCell>
                        <TableCell className="it-td it-td-soft">{t.assigned_vendor_user || "Unassigned"}</TableCell>
                        <TableCell className="it-td">
                          <Chip size="small" label={t.priority || "-"} sx={chipSx(PRIORITY_CHIP, t.priority, "Medium")} />
                        </TableCell>
                        <TableCell className="it-td">
                          <Chip size="small" label={t.status || "-"} sx={chipSx(STATUS_CHIP, t.status, "Open")} />
                        </TableCell>
                        <TableCell className="it-td it-td-soft">{fmtDate(t.latest_activity_at || t.updated_at || t.created_at)}</TableCell>
                        <TableCell className="it-td">
                          <button className="it-view-btn" onClick={() => openDetail(t)}>
                            <Eye size={15} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* ── Footer ── */}
            <div className="it-footer">
              <div className="it-footer-left">
                <span className="it-rows-label">Rows per page:</span>
                <select
                  className="it-rows-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="it-footer-right">
                <span className="it-count">
                  {filtered.length === 0 ? "0–0 of 0" : `${from}–${to} of ${filtered.length}`}
                </span>
                <button
                  className="it-nav-btn"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="it-nav-btn"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </Paper>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {modalOpen && (
        <TicketDetailModal
          ticket={selectedTicket}
          activity={activity}
          loading={detailLoading}
          onClose={() => { setModalOpen(false); setSelectedTicket(null); setActivity([]); }}
        />
      )}
    </div>
  );
}