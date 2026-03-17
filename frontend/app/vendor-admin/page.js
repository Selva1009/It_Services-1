"use client";

import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, subMonths, startOfWeek } from "date-fns";
import Swal from "sweetalert2";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Users, Activity, UserX, UserPlus, Edit,
  Bell, Package, ShoppingCart, Clock, Plus,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, Title, Filler,
} from "chart.js";
import "./VendorAdminDashboard.css";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Title, Filler
);

// ─── Chart colours ────────────────────────────────────────────────────────────
const C = {
  em:         "#10b981",
  emLight:    "#d1fae5",
  border:     "#e2e8f0",
  text:       "#0f172a",
  text2:      "#475569",
  text3:      "#94a3b8",
  white:      "#ffffff",
  amber:      "#f59e0b",
  amberLight: "#fef3c7",
  blue:       "#3b82f6",
  blueLight:  "#dbeafe",
};

const DONUT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
const AVATAR_VARS  = ["v0", "v1", "v2", "v3", "v4"];

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

// ─── Chart option factories ───────────────────────────────────────────────────
const makeLineOptions = () => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, title: { display: false },
    tooltip: {
      backgroundColor: C.white, titleColor: C.text, bodyColor: C.text2,
      borderColor: C.border, borderWidth: 1, cornerRadius: 8, displayColors: false,
      callbacks: { label: (ctx) => ` ${ctx.parsed.y} new vendors` },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: C.text3, font: { size: 11 } } },
    y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: C.text3, stepSize: 1, font: { size: 11 } } },
  },
});

const makeBarOptions = () => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, title: { display: false },
    tooltip: {
      backgroundColor: C.white, titleColor: C.text, bodyColor: C.text2,
      borderColor: C.border, borderWidth: 1, cornerRadius: 8,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: C.text3, font: { size: 11 } } },
    y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" }, ticks: { color: C.text3, font: { size: 11 } } },
  },
});

const makeDoughnutOptions = () => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: { color: C.text, font: { size: 12 }, padding: 16, usePointStyle: true, pointStyle: "circle" },
    },
    title: { display: false },
    tooltip: {
      backgroundColor: C.white, titleColor: C.text, bodyColor: C.text2,
      borderColor: C.border, borderWidth: 1, cornerRadius: 8,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return `${ctx.label}: ${ctx.raw} (${Math.round((ctx.raw / total) * 100)}%)`;
        },
      },
    },
  },
  cutout: "65%", borderRadius: 6,
});

// ─── Main component ───────────────────────────────────────────────────────────
const VendorDashboard = () => {
  const NOTIFICATION_LIMIT = 200;
  const router = useRouter();
  const { auth, getAuthToken: getAuthTokenFromContext } = useAuth();

  const [vendors,           setVendors]           = useState([]);
  const [notifications,     setNotifications]     = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [vendorID,          setVendorID]          = useState(null);
  const [timeRange,         setTimeRange]         = useState("week");
  const [recentActivity,    setRecentActivity]    = useState([]);
  const [notificationStats, setNotificationStats] = useState({ total: 0, unread: 0, read: 0 });

  const getAuthToken = () =>
    localStorage.getItem("token")     ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("userToken") ||
    sessionStorage.getItem("token");

  // ── Date helpers ──────────────────────────────────────────────────────────
  const getTimeRangeDates = () => {
    const now = new Date();
    return timeRange === "week"
      ? { start: startOfWeek(now), end: now }
      : { start: subMonths(now, 1), end: now };
  };

  const filterVendorsByTimeRange = (list) => {
    const { start } = getTimeRangeDates();
    return list.filter((v) => v.createdAt && new Date(v.createdAt) >= start);
  };

  const getDayLabels = () => {
    const { start, end } = getTimeRangeDates();
    const labels = [];
    if (timeRange === "week") {
      const cur = new Date(start);
      while (cur <= end) { labels.push(format(cur, "EEE")); cur.setDate(cur.getDate() + 1); }
    } else {
      const ws = new Date(start);
      while (ws <= end) {
        const we = new Date(ws); we.setDate(we.getDate() + 6);
        if (we > end) we.setTime(end.getTime());
        labels.push(`Week ${format(ws, "d")}-${format(we, "d MMM")}`);
        ws.setDate(ws.getDate() + 7);
      }
    }
    return labels;
  };

  // ── Chart data builders ───────────────────────────────────────────────────
  const prepareGrowthData = (list) => {
    const { start, end } = getTimeRangeDates();
    const labels  = getDayLabels();
    const dataMap = Object.fromEntries(labels.map((l) => [l, 0]));
    list.forEach((v) => {
      if (!v.createdAt) return;
      const d = new Date(v.createdAt);
      if (d < start || d > end) return;
      const label = timeRange === "week"
        ? format(d, "EEE")
        : labels[Math.min(Math.floor((d - start) / (7 * 864e5)), labels.length - 1)];
      dataMap[label] = (dataMap[label] || 0) + 1;
    });
    return {
      labels,
      datasets: [{
        label: "New Vendors", data: labels.map((l) => dataMap[l]),
        backgroundColor: "rgba(16,185,129,0.08)", borderColor: C.em,
        borderWidth: 2, tension: 0.4, fill: true,
        pointBackgroundColor: C.em, pointBorderColor: C.white,
        pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
      }],
    };
  };

  const prepareNotificationData = () => {
    const now  = new Date();
    const days = timeRange === "week" ? 7 : 30;
    const labels = [], data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      labels.push(format(d, "MMM d"));
      data.push(notifications.filter((n) => {
        const nd = new Date(n.created_at);
        return nd.getDate() === d.getDate() && nd.getMonth() === d.getMonth() && nd.getFullYear() === d.getFullYear();
      }).length);
    }
    return {
      labels,
      datasets: [{
        label: "Orders", data,
        backgroundColor: C.emLight, hoverBackgroundColor: C.em,
        borderRadius: 5, borderWidth: 0,
      }],
    };
  };

  const prepareProductData = () => {
    const counts = {};
    notifications.forEach((n) => {
      if (!n.productName) return;
      const qty = typeof n.quantity === "string"
        ? parseInt(n.quantity.replace(/[^\d]/g, ""), 10)
        : n.quantity || 1;
      counts[n.productName] = (counts[n.productName] || 0) + qty;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      labels: sorted.map((p) => p[0]),
      datasets: [{
        label: "Total Quantity Ordered", data: sorted.map((p) => p[1]),
        backgroundColor: DONUT_COLORS, borderColor: C.white, borderWidth: 2, hoverOffset: 12,
      }],
    };
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchNotifications = async (vid) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/vendor-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ vendorAdminID: vid, limit: NOTIFICATION_LIMIT }),
      });
      if (!res.ok) throw new Error("Failed");
      const data   = await res.json();
      const unread = data.notifications.filter((n) => n.status === "unread").length;
      setNotifications(data.notifications);
      setNotificationStats({ total: data.notifications.length, unread, read: data.notifications.length - unread });
    } catch (err) {
      console.error("Notifications error:", err);
    }
  };

  const buildRecentActivity = (list) => {
    const acts = [];
    list.forEach((v) => {
      acts.push({ type: "created", name: v.personName || "—", company: v.companyName || "—", date: v.createdAt, id: v.id });
      if (v.updated_at && new Date(v.updated_at).getTime() !== new Date(v.createdAt).getTime()) {
        acts.push({ type: "updated", name: v.personName || "—", company: v.companyName || "—", date: v.updated_at, id: v.id });
      }
    });
    return acts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  };

  useEffect(() => {
    const resolvedVendorId = auth.vendor?.id || auth.vendorId || auth.userId;
    if (resolvedVendorId) {
      setVendorID(resolvedVendorId);
      return;
    }
    setLoading(false);
    router.replace("/SignIn");
  }, [auth.vendor, auth.vendorId, auth.userId, router]);

  useEffect(() => {
    if (!vendorID) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/vendor-users/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vendorId: vendorID }),
        });
        const data = await res.json();
        setVendors(data);
        setRecentActivity(buildRecentActivity(data));
        await fetchNotifications(vendorID);
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

  const filteredVendors = filterVendorsByTimeRange(vendors);
  const activeVendors   = vendors.filter((v) => v.status === "Active").length;
  const inactiveVendors = vendors.filter((v) => v.status !== "Active").length;

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
              <span className="vd-stat-label">Total Vendors</span>
              <div className="vd-stat-icon green"><Users size={16} /></div>
            </div>
            <div className="vd-stat-value">{vendors.length}</div>
            <div className="vd-stat-meta"><span className="vd-badge up">↑ 12%</span>&nbsp;vs last period</div>
          </div>

          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Active Vendors</span>
              <div className="vd-stat-icon blue"><Activity size={16} /></div>
            </div>
            <div className="vd-stat-value">{activeVendors}</div>
            <div className="vd-stat-meta"><span className="vd-badge up">↑ 8%</span>&nbsp;vs last period</div>
          </div>

          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Inactive Vendors</span>
              <div className="vd-stat-icon red"><UserX size={16} /></div>
            </div>
            <div className="vd-stat-value">{inactiveVendors}</div>
            <div className="vd-stat-meta"><span className="vd-badge down">↑ 3%</span>&nbsp;vs last period</div>
          </div>

          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Total Orders</span>
              <div className="vd-stat-icon amber"><ShoppingCart size={16} /></div>
            </div>
            <div className="vd-stat-value">{notificationStats.total}</div>
            <div className="vd-stat-meta"><span className="vd-badge up">↑ 21%</span>&nbsp;vs last period</div>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="vd-charts-row">
          <div className="vd-card">
            <div className="vd-card-title">Vendor Growth</div>
            <div className="vd-card-sub">New registrations {timeRange === "week" ? "this week" : "this month"}</div>
            <div className="vd-chart-wrap">
              {vendors.length > 0
                ? <Line data={prepareGrowthData(vendors)} options={makeLineOptions()} />
                : <div className="vd-chart-empty"><Clock size={18} /> Loading vendor data…</div>}
            </div>
          </div>

          <div className="vd-card">
            <div className="vd-card-title">Order Activity</div>
            <div className="vd-card-sub">Daily order volume {timeRange === "week" ? "this week" : "this month"}</div>
            <div className="vd-chart-wrap">
              {notifications.length > 0
                ? <Bar data={prepareNotificationData()} options={makeBarOptions()} />
                : <div className="vd-chart-empty"><Bell size={18} /> Loading order data…</div>}
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="vd-bottom-row">
          <div className="vd-card">
            <div className="vd-card-title">Top Products</div>
            <div className="vd-card-sub">By quantity ordered</div>
            <div className="vd-chart-wrap">
              {notifications.length > 0
                ? <Doughnut data={prepareProductData()} options={makeDoughnutOptions()} />
                : <div className="vd-chart-empty"><Package size={18} /> Loading product data…</div>}
            </div>
          </div>

          <div className="vd-card">
            <div className="vd-card-title" style={{ marginBottom: 16 }}>Recent Activity</div>
            <div className="vd-activity-list">
              {recentActivity.length === 0 ? (
                <div className="vd-activity-empty">
                  <Activity size={28} />
                  No recent activity
                </div>
              ) : (
                recentActivity.map((act, i) => (
                  <div key={`${act.id}-${i}`} className="vd-activity-item">
                    <div className={`vd-activity-icon ${act.type === "created" ? "create" : "update"}`}>
                      {act.type === "created" ? <UserPlus size={13} /> : <Edit size={13} />}
                    </div>
                    <div className="vd-activity-body">
                      <p className="vd-activity-text">
                        <strong>{act.name}</strong> from{" "}
                        <span className="vd-activity-company">{act.company}</span>
                      </p>
                      <p className="vd-activity-time">
                        {format(new Date(act.date), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <span className={`vd-activity-tag ${act.type === "created" ? "created" : "updated"}`}>
                      {act.type === "created" ? "Created" : "Updated"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Vendor Table ── */}
        <div className="vd-table-card">
          <div className="vd-table-header">
            <div className="vd-table-header-text">
              <div className="vd-card-title">
                Vendor Management{" "}
                <span>({timeRange === "week" ? "This Week" : "This Month"})</span>
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
                {filteredVendors
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

            {filteredVendors.length === 0 && (
              <div className="vd-table-empty">
                <UserX size={28} />
                No vendors found for this time period
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default VendorDashboard;