"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, subMonths, startOfWeek, eachDayOfInterval, eachWeekOfInterval } from "date-fns";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Users, TicketCheck, Clock, Plus, Activity, UserX,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, Title, Filler,
} from "chart.js";
import { fetchVendorAdminUsers } from "../services/vendorAdminService";
import { getVendorTickets } from "@/services/ticketService";
import "./vendorAdminDashboard.css";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Title, Filler
);

// ─── Colours ──────────────────────────────────────────────────────────────────
const C = {
  border: "#e2e8f0", text: "#0f172a", text2: "#475569", text3: "#94a3b8",
  white: "#ffffff", blue: "#3b82f6",
};

// ticket.status → colour  (matches your real status values exactly)
const STATUS_COLOR_MAP = {
  "open": "#3b82f6",
  "in progress": "#8b5cf6",
  "resolved": "#10b981",
  "closed": "#06b6d4",
  "pending": "#f59e0b",
  "cancelled": "#ef4444",
};
const FALLBACK_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// ─── Chart option factories ───────────────────────────────────────────────────
const makeLineOptions = () => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: C.white, titleColor: C.text, bodyColor: C.text2,
      borderColor: C.border, borderWidth: 1, cornerRadius: 8, displayColors: false,
      callbacks: { label: (ctx) => ` ${ctx.parsed.y} ticket${ctx.parsed.y !== 1 ? "s" : ""}` },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: C.text3, font: { size: 11 } } },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { color: C.text3, stepSize: 1, font: { size: 11 }, precision: 0 },
    },
  },
});

const makeDoughnutOptions = () => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: { color: C.text, font: { size: 12 }, padding: 16, usePointStyle: true, pointStyle: "circle" },
    },
    tooltip: {
      backgroundColor: C.white, titleColor: C.text, bodyColor: C.text2,
      borderColor: C.border, borderWidth: 1, cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return ` ${ctx.label}: ${ctx.raw} (${Math.round((ctx.raw / total) * 100)}%)`;
        },
      },
    },
  },
  cutout: "65%", borderRadius: 6,
});

// ─── Main component ───────────────────────────────────────────────────────────
const VendorDashboard = () => {
  const router = useRouter();
  const { auth } = useAuth();
  const authToken = auth?.authToken
  // console.log(authToken)
  const [vendors, setVendors] = useState(0);
  const [tickets, setTickets] = useState([]);  // ticket[] from getVendorTickets()
  const [loading, setLoading] = useState(true);
  const [vendorID, setVendorID] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  console.log(tickets, "count")


  // ── Date helpers ──────────────────────────────────────────────────────────
  const getTimeRangeDates = () => {
    const now = new Date();
    return timeRange === "week"
      ? { start: startOfWeek(now), end: now }
      : { start: subMonths(now, 1), end: now };
  };

  // ── Ticket trend line chart
  //    Groups tickets by ticket.created_at into day/week buckets
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
            const we = new Date(ws); we.setDate(we.getDate() + 6);
            return d >= ws && d <= we;
          });
          if (idx !== -1) dataMap[labels[idx]]++;
        }
      });
    }

    return {
      labels,
      datasets: [{
        label: "Tickets Raised",
        data: labels.map((l) => dataMap[l] || 0),
        backgroundColor: "rgba(59,130,246,0.08)",
        borderColor: C.blue,
        borderWidth: 2, tension: 0.4, fill: true,
        pointBackgroundColor: C.blue, pointBorderColor: C.white,
        pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
      }],
    };
  };

  // ── Ticket status doughnut
  //    Groups by ticket.status  (e.g. "Open", "In Progress", "Resolved")
  const prepareTicketStatusData = () => {
    const counts = {};
    tickets.forEach((t) => {
      const s = (t.status || "Unknown").trim();
      counts[s] = (counts[s] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([s]) => s);
    const data = entries.map(([, v]) => v);
    const bgColors = entries.map(([s], i) =>
      STATUS_COLOR_MAP[s.toLowerCase()] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]
    );

    return {
      labels,
      datasets: [{
        data, label: "Tickets",
        backgroundColor: bgColors, borderColor: C.white,
        borderWidth: 2, hoverOffset: 12,
      }],
    };
  };

  // ── Auth resolution ────────────────────────────────────────────────────────
  useEffect(() => {
    const resolvedVendorId = auth.vendor?.id || auth.vendorId || auth.userId;
    if (resolvedVendorId) {
      setVendorID(resolvedVendorId);
    } else {
      setLoading(false);
      router.replace("/SignIn");
    }
  }, [auth.vendor, auth.vendorId, auth.userId, router]);

  // ── Data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!vendorID) return;
    const load = async () => {
      setLoading(true);
      try {


        // Users → fetchVendorUsers(vendorId)
        const userData = await fetchVendorAdminUsers(authToken);

        console.log(userData);

        setVendors(userData?.users || []);

        // Tickets → getVendorTickets() → { tickets: [...] }

        const ticketData = await getVendorTickets();
        console.log(ticketData)
        console.log(ticketData?.data)

        const tickeCount = ticketData?.data
        console.log(tickeCount);

        setTickets(tickeCount?.tickets || []);


      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vendorID]);

  if (loading) {
    return (
      <div className="vd-loading">
        <div className="vd-spinner" />
        Loading dashboard…
      </div>
    );
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalUsers = vendors.length;
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status?.toLowerCase() === "open").length;
  // "Resolved" + "Closed" both count as done
  const closedTickets = tickets.filter((t) =>
    ["closed", "resolved"].includes(t.status?.toLowerCase())
  ).length;

  const AVATAR_VARS = ["v0", "v1", "v2", "v3", "v4"];
  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  return (
    <div className="vd-page">
      <main className="vd-main">

        {/* ── Page Header ── */}
        <div className="vd-page-header">
          <div>
            <h1 className="vd-page-title">Vendor Dashboard</h1>
            <p className="vd-page-sub">Welcome back — here's what's happening with your vendors.</p>
          </div>
          <div className="vd-range-tabs">
            {["week", "month"].map((r) => (
              <button
                key={r}
                className={`vd-range-tab${timeRange === r ? " active" : ""}`}
                onClick={() => setTimeRange(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="vd-stats-grid">
          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Total Users</span>
              <div className="vd-stat-icon green"><Users size={16} /></div>
            </div>
            <div className="vd-stat-value">{totalUsers}</div>
            {/* <div className="vd-stat-meta"><span className="vd-badge up">↑ 12%</span>&nbsp;vs last period</div> */}
          </div>

          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Total Tickets Raised</span>
              <div className="vd-stat-icon blue"><TicketCheck size={16} /></div>
            </div>
            <div className="vd-stat-value">{totalTickets}</div>
            {/* <div className="vd-stat-meta"><span className="vd-badge up">↑ 5%</span>&nbsp;vs last period</div> */}
          </div>

          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Open Tickets</span>
              <div className="vd-stat-icon amber"><Clock size={16} /></div>
            </div>
            <div className="vd-stat-value">{openTickets}</div>
            <div className="vd-stat-meta"><span className="vd-badge down">Needs attention</span></div>
          </div>

          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Resolved / Closed</span>
              <div className="vd-stat-icon green"><Activity size={16} /></div>
            </div>
            <div className="vd-stat-value">{closedTickets}</div>
            {/* <div className="vd-stat-meta"><span className="vd-badge up">↑ 8%</span>&nbsp;vs last period</div> */}
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="vd-charts-row">

          {/* Line chart — ticket.created_at grouped by day or week */}
          <div className="vd-card">
            <div className="vd-card-title">Tickets Raised Over Time</div>
            <div className="vd-card-sub">
              Daily ticket submissions {timeRange === "week" ? "this week" : "this month"}
            </div>
            <div className="vd-chart-wrap">
              {tickets.length > 0
                ? <Line data={prepareTicketTrendData()} options={makeLineOptions()} />
                : <div className="vd-chart-empty"><TicketCheck size={18} /> No ticket data available</div>}
            </div>
          </div>

          {/* Doughnut chart — ticket.status (Open / In Progress / Resolved …) */}
          <div className="vd-card">
            <div className="vd-card-title">Ticket Status Breakdown</div>
            <div className="vd-card-sub">
              Distribution across Open, In Progress, Resolved, Closed…
            </div>
            <div className="vd-chart-wrap">
              {tickets.length > 0
                ? <Doughnut data={prepareTicketStatusData()} options={makeDoughnutOptions()} />
                : <div className="vd-chart-empty"><Activity size={18} /> No status data available</div>}
            </div>
          </div>

        </div>

        {/* ── Vendor Table ── */}
        <div className="vd-table-card">
          <div className="vd-table-header">
            <div className="vd-table-header-text">
              <div className="vd-card-title">
                Vendor Management <span>({timeRange === "week" ? "This Week" : "This Month"})</span>
              </div>
              <div className="vd-card-sub" style={{ marginBottom: 0 }}>Recent registrations</div>
            </div>
            <div className="vd-table-actions">
              <button className="vd-btn-primary" onClick={() => router.push("/vendor-admin/addUser")}>
                <Plus size={13} /> Add Vendor
              </button>
              <button className="vd-btn-ghost" onClick={() => router.push("/vendor-admin/usersprofile")}>
                View All
              </button>
            </div>
          </div>

          <div className="vd-table-scroll">
            <table className="vd-data-table">
              <thead>
                <tr>
                  {["Vendor", "Company", "Status", "Registered"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((vendor, idx) => (
                    <tr key={vendor.id || vendor.Email}>
                      <td>
                        <div className="vd-user-cell">
                          <div className={`vd-user-avatar ${AVATAR_VARS[idx % AVATAR_VARS.length]}`}>
                            {getInitials(vendor.personName)}
                          </div>
                          <div>
                            <div className="vd-user-name">{vendor.personName}</div>
                            <div className="vd-user-email">{vendor.Email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{vendor.companyName || "N/A"}</td>
                      <td>
                        <span className={`vd-status-chip ${vendor.status === "Active" ? "active" : "inactive"}`}>
                          <span className={`vd-status-dot ${vendor.status === "Active" ? "active" : "inactive"}`} />
                          {vendor.status}
                        </span>
                      </td>
                      <td className="date">
                        {vendor.createdAt ? format(new Date(vendor.createdAt), "MMM d, yyyy") : "N/A"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {vendors.length === 0 && (
              <div className="vd-table-empty">
                <UserX size={28} />
                No vendors found
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default VendorDashboard;