"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  subMonths,
  startOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
} from "date-fns";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Users,
  TicketCheck,
  Clock,
  Activity,
  AlertTriangle,
  UserX,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler,
} from "chart.js";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  fetchItAdminTickets,
  fetchItAdminUsersSummary,
} from "@/app/services/customerAdminService";
import "./customerAdminDashboard.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
);

const C = {
  border: "#e2e8f0",
  text: "#0f172a",
  text2: "#475569",
  text3: "#94a3b8",
  white: "#ffffff",
  blue: "#3b82f6",
};

const STATUS_COLOR_MAP = {
  open: "#3b82f6",
  assigned: "#f59e0b",
  "in progress": "#8b5cf6",
  escalated: "#ef4444",
  resolved: "#10b981",
  closed: "#06b6d4",
};

const FALLBACK_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const AVATAR_VARS = ["v0", "v1", "v2", "v3", "v4"];

const toSlug = (s) => (s || "").toLowerCase().replace(/\s+/g, "-");

const getInitials = (name) =>
  (name || "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const makeLineOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: C.white,
      titleColor: C.text,
      bodyColor: C.text2,
      borderColor: C.border,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: (ctx) =>
          ` ${ctx.parsed.y} ticket${ctx.parsed.y !== 1 ? "s" : ""}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: C.text3, font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { color: C.text3, stepSize: 1, font: { size: 11 }, precision: 0 },
    },
  },
});

const makeDoughnutOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: {
        color: C.text,
        font: { size: 12 },
        padding: 16,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: C.white,
      titleColor: C.text,
      bodyColor: C.text2,
      borderColor: C.border,
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return ` ${ctx.label}: ${ctx.raw} (${Math.round(
            (ctx.raw / total) * 100
          )}%)`;
        },
      },
    },
  },
  cutout: "65%",
  borderRadius: 6,
});

export default function CustomerAdminDashboard() {
  const router = useRouter();
  const { auth, getAuthToken } = useAuth();
  const token = getAuthToken?.() || auth?.authToken || null;

  const [tickets, setTickets] = useState([]);
  const [userSummary, setUserSummary] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("week");
  const fetchedRef = useRef(null);

  const getTimeRangeDates = () => {
    const now = new Date();
    return timeRange === "week"
      ? { start: startOfWeek(now), end: now }
      : { start: subMonths(now, 1), end: now };
  };

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [ticketResponse, usersResponse] = await Promise.all([
        fetchItAdminTickets(token),
        fetchItAdminUsersSummary(token),
      ]);
      const rawTickets = ticketResponse?.tickets ?? ticketResponse?.data?.tickets ?? [];
      setTickets(Array.isArray(rawTickets) ? rawTickets : []);
      setUserSummary({
        total: Number(
          usersResponse?.total ?? usersResponse?.users?.length ?? 0
        ),
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
      setTickets([]);
      setUserSummary({ total: 0 });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      fetchedRef.current = null;
      return;
    }
    if (fetchedRef.current === token) return;
    fetchedRef.current = token;
    loadDashboard();
  }, [token, loadDashboard]);

  const prepareTicketTrendData = () => {
    const { start, end } = getTimeRangeDates();
    let labels = [];
    let dataMap = {};

    if (timeRange === "week") {
      const days = eachDayOfInterval({ start, end });
      labels = days.map((d) => format(d, "EEE d"));
      labels.forEach((l) => (dataMap[l] = 0));
      tickets.forEach((t) => {
        const d = new Date(t.created_at);
        if (d >= start && d <= end) {
          const key = format(d, "EEE d");
          if (key in dataMap) dataMap[key]++;
        }
      });
    } else {
      const weeks = eachWeekOfInterval({ start, end });
      labels = weeks.map((ws, i) => `Wk ${i + 1} (${format(ws, "d MMM")})`);
      labels.forEach((l) => (dataMap[l] = 0));
      tickets.forEach((t) => {
        const d = new Date(t.created_at);
        if (d >= start && d <= end) {
          const idx = weeks.findIndex((ws) => {
            const we = new Date(ws);
            we.setDate(we.getDate() + 6);
            return d >= ws && d <= we;
          });
          if (idx !== -1) dataMap[labels[idx]]++;
        }
      });
    }

    return {
      labels,
      datasets: [
        {
          label: "Tickets Raised",
          data: labels.map((l) => dataMap[l] || 0),
          backgroundColor: "rgba(59,130,246,0.08)",
          borderColor: C.blue,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: C.blue,
          pointBorderColor: C.white,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const prepareStatusData = () => {
    const counts = {};
    tickets.forEach((t) => {
      const s = (t.status || "Unknown").trim();
      counts[s] = (counts[s] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([s]) => s);
    const data = entries.map(([, v]) => v);
    const bgColors = entries.map(
      ([s], i) =>
        STATUS_COLOR_MAP[s.toLowerCase()] ||
        FALLBACK_COLORS[i % FALLBACK_COLORS.length]
    );
    return {
      labels,
      datasets: [
        {
          data,
          label: "Tickets",
          backgroundColor: bgColors,
          borderColor: C.white,
          borderWidth: 2,
          hoverOffset: 12,
        },
      ],
    };
  };

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(
    (t) => t.status?.toLowerCase() === "open"
  ).length;
  const resolvedTickets = tickets.filter((t) =>
    ["resolved", "closed"].includes(t.status?.toLowerCase())
  ).length;

  if (loading) {
    return (
      <div className="ca-loading">
        <div className="ca-spinner" />
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="ca-page">
      <CustomerAdminNavbar />

      <main className="ca-main">

        {/* Page Header */}
        <div className="ca-page-header">
          <div>
            <h1 className="ca-page-title">IT Admin Dashboard</h1>
            <p className="ca-page-sub">
              Company-level ticket visibility and trends.
            </p>
          </div>
          <div className="ca-range-tabs">
            {["week", "month"].map((r) => (
              <button
                key={r}
                className={`ca-range-tab${timeRange === r ? " active" : ""}`}
                onClick={() => setTimeRange(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13.5,
            }}
          >
            {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="ca-stats-grid">
          <div className="ca-stat-card">
            <div className="ca-stat-header">
              <span className="ca-stat-label">Total Users</span>
              <div className="ca-stat-icon green">
                <Users size={16} />
              </div>
            </div>
            <div className="ca-stat-value">{userSummary.total}</div>
          </div>

          <div className="ca-stat-card">
            <div className="ca-stat-header">
              <span className="ca-stat-label">Total Tickets Raised</span>
              <div className="ca-stat-icon blue">
                <TicketCheck size={16} />
              </div>
            </div>
            <div className="ca-stat-value">{totalTickets}</div>
          </div>

          <div className="ca-stat-card">
            <div className="ca-stat-header">
              <span className="ca-stat-label">Open Tickets</span>
              <div className="ca-stat-icon amber">
                <Clock size={16} />
              </div>
            </div>
            <div className="ca-stat-value">{openTickets}</div>
            <div className="ca-stat-meta">
              <span className="ca-badge down">Needs attention</span>
            </div>
          </div>

          <div className="ca-stat-card">
            <div className="ca-stat-header">
              <span className="ca-stat-label">Resolved / Closed</span>
              <div className="ca-stat-icon green">
                <Activity size={16} />
              </div>
            </div>
            <div className="ca-stat-value">{resolvedTickets}</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="ca-charts-row">
          <div className="ca-card">
            <div className="ca-card-title">Tickets Raised Over Time</div>
            <div className="ca-card-sub">
              Daily ticket submissions{" "}
              {timeRange === "week" ? "this week" : "this month"}
            </div>
            <div className="ca-chart-wrap">
              {tickets.length > 0 ? (
                <Line
                  data={prepareTicketTrendData()}
                  options={makeLineOptions()}
                />
              ) : (
                <div className="ca-chart-empty">
                  <TicketCheck size={18} /> No ticket data available
                </div>
              )}
            </div>
          </div>

          <div className="ca-card">
            <div className="ca-card-title">Ticket Status Breakdown</div>
            <div className="ca-card-sub">
              Distribution across Open, In Progress, Resolved, Closed...
            </div>
            <div className="ca-chart-wrap">
              {tickets.length > 0 ? (
                <Doughnut
                  data={prepareStatusData()}
                  options={makeDoughnutOptions()}
                />
              ) : (
                <div className="ca-chart-empty">
                  <Activity size={18} /> No status data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tickets Table */}
        <div className="ca-table-card">
          <div className="ca-table-header">
            <div className="ca-table-header-text">
              <div className="ca-card-title">
                Recent Tickets{" "}
                <span>
                  ({timeRange === "week" ? "This Week" : "This Month"})
                </span>
              </div>
              <div className="ca-card-sub" style={{ marginBottom: 0 }}>
                Latest submissions across your organisation
              </div>
            </div>
            <div className="ca-table-actions">
              <button
                className="ca-btn-ghost"
                onClick={() => router.push("/customer-admin/tickets")}
              >
                View All
              </button>
            </div>
          </div>

          <div className="ca-table-scroll">
            <table className="ca-data-table">
              <thead>
                <tr>
                  {["User", "Subject", "Status", "Priority", "Raised"].map(
                    (h) => (
                      <th key={h}>{h}</th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {[...tickets]
                  .sort(
                    (a, b) =>
                      new Date(b.created_at) - new Date(a.created_at)
                  )
                  .slice(0, 8)
                  .map((ticket, idx) => {
                    const slug = toSlug(ticket.status || "open");
                    const priSlug = toSlug(ticket.priority || "medium");
                    const userName =
                      ticket.raised_by_name ||
                      ticket.user_name ||
                      ticket.userName ||
                      ticket.created_by ||
                      "Unknown";
                    const userEmail =
                      ticket.raised_by_email ||
                      ticket.user_email ||
                      ticket.email ||
                      "";
                    return (
                      <tr key={ticket.id || idx}>
                        <td>
                          <div className="ca-user-cell">
                            <div
                              className={`ca-user-avatar ${
                                AVATAR_VARS[idx % AVATAR_VARS.length]
                              }`}
                            >
                              {getInitials(userName)}
                            </div>
                            <div>
                              <div className="ca-user-name">{userName}</div>
                              <div className="ca-user-email">{userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="muted">
                          {ticket.subject || ticket.title || "-"}
                        </td>
                        <td>
                          <span className={`ca-status-chip ${slug}`}>
                            <span className={`ca-status-dot ${slug}`} />
                            {ticket.status || "Open"}
                          </span>
                        </td>
                        <td>
                          <span className={`ca-priority-chip ${priSlug}`}>
                            {ticket.priority || "Medium"}
                          </span>
                        </td>
                        <td className="date">
                          {ticket.created_at
                            ? format(new Date(ticket.created_at), "MMM d, yyyy")
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {tickets.length === 0 && (
              <div className="ca-table-empty">
                <UserX size={28} />
                No tickets found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}