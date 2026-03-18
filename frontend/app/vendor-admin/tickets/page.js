"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  MenuItem,
  Pagination,
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
import { getVendorTickets } from "@/services/ticketService";
import "./vendorTicketsPage.css";

/* ─── Styled MUI Tooltip ─────────────────────────────────── */
const VtTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#1e293b",
  },
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
const PRIORITY_OPTIONS = ["All","Low","Medium","High","Critical"];
const PAGE_SIZE = 10;

/* ─── Helpers ────────────────────────────────────────────── */
const fmtDate = (v) =>
  v ? new Date(v).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "-";

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

/* ─── Tooltip cell ───────────────────────────────────────── */
function TipCell({ value }) {
  const text = value || "-";
  return (
    <TableCell className="vt-td vt-td-soft vt-td-tip">
      <VtTooltip
        title={text !== "-" ? text : ""}
        placement="top"
        enterDelay={300}
        enterNextDelay={200}
      >
        <span className="vt-tip-inner">{text}</span>
      </VtTooltip>
    </TableCell>
  );
}

/* ─── Columns ────────────────────────────────────────────── */
const COLUMNS = [
  { label: "Ticket #",      cls: "col-ticket"   },
  { label: "Title",         cls: "col-title"    },
  { label: "Category",      cls: "col-cat"      },
  { label: "Support Level", cls: "col-support"  },
  { label: "Sub Category",  cls: "col-subcat"   },
  { label: "Raised By",     cls: "col-raised"   },
  { label: "Email",         cls: "col-email"    },
  { label: "Company",       cls: "col-company"  },
  { label: "Priority",      cls: "col-priority" },
  { label: "Status",        cls: "col-status"   },
  { label: "Created",       cls: "col-created"  },
];

/* ─── Component ──────────────────────────────────────────── */
export default function VendorAdminTicketsPage() {
  const [tickets, setTickets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("All");
  const [priorityFilter, setPriority] = useState("All");
  const [page, setPage]               = useState(1);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await getVendorTickets();
        if (live) setTickets(res.data.tickets || []);
      } catch { if (live) setTickets([]); }
      finally  { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => { setPage(1); }, [search, statusFilter, priorityFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchQ =
        !q ||
        String(t.ticket_number  || "").toLowerCase().includes(q) ||
        String(t.title          || "").toLowerCase().includes(q) ||
        String(t.category       || "").toLowerCase().includes(q) ||
        String(t.raised_by_name || "").toLowerCase().includes(q);
      return (
        matchQ &&
        (statusFilter   === "All" || t.status   === statusFilter) &&
        (priorityFilter === "All" || t.priority === priorityFilter)
      );
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const total    = tickets.length;
  const open     = tickets.filter((t) => t.status   === "Open").length;
  const crit     = tickets.filter((t) => t.priority === "Critical").length;
  const inProg   = tickets.filter((t) => t.status   === "In Progress").length;
  const resolved = tickets.filter((t) => t.status   === "Resolved").length;

  const chips = [
    statusFilter   !== "All" && { k:"s", label:`Status: ${statusFilter}`,     clear:()=>setStatus("All")   },
    priorityFilter !== "All" && { k:"p", label:`Priority: ${priorityFilter}`, clear:()=>setPriority("All") },
  ].filter(Boolean);

  return (
    <div className="vt-page">

      {/* ── Header ── */}
      <div className="vt-header">
        <div className="vt-header-left">
          <div className="vt-badge">
            <span className="vt-badge-dot" />
            Vendor Portal
          </div>
          <Typography className="vt-title">
            Support&nbsp;<span className="vt-title-hi">Tickets</span>
          </Typography>
          <Typography className="vt-subtitle">
            All tickets assigned to your vendor account.
          </Typography>
        </div>

        <div className="vt-stats">
          {[
            { n: total,    cls: "",      lbl: "Total"       },
            { n: open,     cls: "amber", lbl: "Open"        },
            { n: inProg,   cls: "amber", lbl: "In Progress" },
            { n: crit,     cls: "red",   lbl: "Critical"    },
            { n: resolved, cls: "green", lbl: "Resolved"    },
          ].map((s) => (
            <div className="vt-stat" key={s.lbl}>
              <div className={`vt-stat-n ${s.cls}`}>{s.n}</div>
              <div className="vt-stat-l">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ──
           ONLY CHANGE: search wrapped in .vt-toolbar-left,
           Status + Priority wrapped in .vt-toolbar-right
      ── */}
      <div style={{display:"flex",justifyContent:"space-between"}}>

        {/* LEFT — search */}
        <div className="vt-toolbar-left">
          <div className="vt-field-group vt-search">
            <p className="vt-label">Search</p>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ticket, title, category, raised by…"
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

        {/* RIGHT — Status + Priority pinned to right edge */}
        <div style={{display:"flex",gap:"25px",position:"relative",bottom:"3px"}}>
          <div className="vt-field-group vt-select">
            <p className="vt-label">Status</p>
            <FormControl fullWidth size="small">
              <Select
                value={statusFilter}
                onChange={(e) => setStatus(e.target.value)}
                MenuProps={{ className: "vt-menu" }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="vt-field-group vt-select">
            <p className="vt-label">Priority</p>
            <FormControl fullWidth size="small">
              <Select
                value={priorityFilter}
                onChange={(e) => setPriority(e.target.value)}
                MenuProps={{ className: "vt-menu" }}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

      </div>

      {/* ── Active chips ── */}
      {chips.length > 0 && (
        <div className="vt-chips">
          {chips.map((c) => (
            <span key={c.k} className="vt-chip" onClick={c.clear}>
              {c.label}<span className="vt-chip-x">×</span>
            </span>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="vt-loading"><CircularProgress /></div>
      ) : (
        <Paper className="vt-card" variant="outlined">
          <div className="vt-scroll">
            <Table className="vt-table" size="small">
              <colgroup>
                {COLUMNS.map((c) => (
                  <col key={c.label} className={c.cls} />
                ))}
              </colgroup>

              <TableHead className="vt-thead">
                <TableRow>
                  {COLUMNS.map((c) => (
                    <TableCell key={c.label} className="vt-th">
                      {c.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paged.length === 0 ? (
                  <TableRow className="vt-empty">
                    <TableCell colSpan={COLUMNS.length}>
                      <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.16 }}>🎫</div>
                      No tickets match your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((t, i) => (
                    <TableRow
                      key={t.id}
                      className="vt-tr"
                      style={{ animationDelay: `${i * 20}ms` }}
                    >
                      <TableCell className="vt-td vt-td-id">
                        {t.ticket_number || "-"}
                      </TableCell>
                      <TableCell className="vt-td" title={t.title}>
                        {t.title || "-"}
                      </TableCell>
                      <TipCell value={t.category} />
                      <TableCell className="vt-td vt-td-soft">
                        {t.support_level || "-"}
                      </TableCell>
                      <TipCell value={t.sub_category} />
                      <TableCell className="vt-td">
                        {t.raised_by_name || "-"}
                      </TableCell>
                      <TableCell className="vt-td vt-td-soft" title={t.raised_by_email}>
                        {t.raised_by_email || "-"}
                      </TableCell>
                      <TableCell className="vt-td">
                        {t.it_company || "-"}
                      </TableCell>
                      <TableCell className="vt-td">
                        <Chip size="small" label={t.priority || "-"}
                          sx={chipSx(PRIORITY_CHIP, t.priority, "Medium")} />
                      </TableCell>
                      <TableCell className="vt-td">
                        <Chip size="small" label={t.status || "-"}
                          sx={chipSx(STATUS_CHIP, t.status, "Open")} />
                      </TableCell>
                      <TableCell className="vt-td vt-td-soft">
                        {fmtDate(t.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="vt-footer">
            <Typography className="vt-count">
              {filtered.length === 0
                ? "No results"
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                    page * PAGE_SIZE, filtered.length
                  )} of ${filtered.length} tickets`}
            </Typography>
            <Pagination
              className="vt-pages"
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              size="small"
              shape="rounded"
              variant="outlined"
            />
          </div>
        </Paper>
      )}
    </div>
  );
}