"use client";

import { API_BASE_URL } from "@/lib/api/config";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, subMonths, startOfWeek } from "date-fns";
import {
  Users, Activity, UserX, UserPlus, Edit,
  Bell, PieChart, Plus, Clock, ShoppingCart,
} from "lucide-react";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import Swal from "sweetalert2";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, ArcElement, Tooltip, Legend, PointElement, LineElement, Filler,
} from "chart.js";
import { useAuth } from "@/app/contexts/AuthContext";
import "./customerAdminDashboard.css";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, ArcElement,
  Tooltip, Legend, PointElement, LineElement, Filler
);

// ─── Chart colours ────────────────────────────────────────────────────────────
const C = {
  em:      "#10b981",
  emLight: "#d1fae5",
  border:  "#e2e8f0",
  text:    "#0f172a",
  text2:   "#475569",
  text3:   "#94a3b8",
  white:   "#ffffff",
};

const DONUT_COLORS    = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
const AVATAR_VARIANTS = ["v0", "v1", "v2", "v3", "v4"];

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
      callbacks: { label: (ctx) => ` ${ctx.parsed.y} new users` },
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
const CustomerAdminDashboard = () => {
  const NOTIFICATION_LIMIT = 200;
  const router = useRouter();
  const { auth } = useAuth();

  const [users,          setUsers]          = useState([]);
  const [filteredUsers,  setFilteredUsers]  = useState([]);
  const [notifications,  setNotifications]  = useState([]);
  const [adminID,        setAdminID]        = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [timeRange,      setTimeRange]      = useState("week");
  const [recentActivity, setRecentActivity] = useState([]);
  const [notificationStats, setNotificationStats] = useState({ total: 0, unread: 0, read: 0 });

  // ── Date helpers ──────────────────────────────────────────────────────────
  const getTimeRangeDates = () => {
    const now = new Date();
    return timeRange === "week"
      ? { start: startOfWeek(now), end: now }
      : { start: subMonths(now, 1), end: now };
  };

  const filterUsersByTimeRange = (list) => {
    const { start } = getTimeRangeDates();
    return list.filter((u) => u.createdAt && new Date(u.createdAt) >= start);
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
  const prepareChartData = (list) => {
    const { start, end } = getTimeRangeDates();
    const labels  = getDayLabels();
    const dataMap = Object.fromEntries(labels.map((l) => [l, 0]));
    list.forEach((u) => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      if (d < start || d > end) return;
      const label = timeRange === "week"
        ? format(d, "EEE")
        : labels[Math.min(Math.floor((d - start) / (7 * 864e5)), labels.length - 1)];
      dataMap[label] = (dataMap[label] || 0) + 1;
    });
    return {
      labels,
      datasets: [{
        label: "New Users", data: labels.map((l) => dataMap[l]),
        backgroundColor: "rgba(16,185,129,0.08)", borderColor: C.em,
        borderWidth: 2, tension: 0.4, fill: true,
        pointBackgroundColor: C.em, pointBorderColor: C.white,
        pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
      }],
    };
  };

  const prepareNotificationChartData = () => {
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

  const prepareProductDistributionData = () => {
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
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/admin`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ adminID, limit: NOTIFICATION_LIMIT }),
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data   = await res.json();
      const unread = data.notifications.filter((n) => n.status === "unread").length;
      setNotifications(data.notifications);
      setNotificationStats({ total: data.notifications.length, unread, read: data.notifications.length - unread });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    try {
      const storedCustomer = sessionStorage.getItem("customer");
      const customerData   = storedCustomer ? JSON.parse(storedCustomer) : auth.customer;
      if (customerData?.id) setAdminID(customerData.id);
    } catch (err) {
      console.error("Invalid customer data:", err);
    }
  }, [auth.customer]);

  // useEffect(() => {
  //   if (!adminID) return;
  //   fetchUsers();
  //   fetchNewUserSummary();
  //   fetchRecentActivity();
  //   fetchNotifications();
  // }, [adminID]);

  useEffect(() => {
    if (users.length > 0) setFilteredUsers(filterUsersByTimeRange(users));
  }, [timeRange, users]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="vd-page">
      <CustomerAdminNavbar />

      <main className="vd-main">

        {/* ── Page Header ── */}
        <div className="vd-page-header">
          <div>
            <h1 className="vd-page-title">Customer Dashboard</h1>
            <p className="vd-page-sub">Welcome back — here's what's happening with your business.</p>
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
            <div className="vd-stat-value">{users.length}</div>
            <div className="vd-stat-meta"><span className="vd-badge up">↑ 12%</span>&nbsp;vs last period</div>
          </div>

          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Active Users</span>
              <div className="vd-stat-icon blue"><Activity size={16} /></div>
            </div>
            <div className="vd-stat-value">{users.filter((u) => u.status === "Active").length}</div>
            <div className="vd-stat-meta"><span className="vd-badge up">↑ 8%</span>&nbsp;vs last period</div>
          </div>

          <div className="vd-stat-card">
            <div className="vd-stat-header">
              <span className="vd-stat-label">Inactive Users</span>
              <div className="vd-stat-icon red"><UserX size={16} /></div>
            </div>
            <div className="vd-stat-value">{users.filter((u) => u.status === "Inactive").length}</div>
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
            <div className="vd-card-title">User Growth</div>
            <div className="vd-card-sub">New registrations {timeRange === "week" ? "this week" : "this month"}</div>
            <div className="vd-chart-wrap">
              {users.length > 0 ? (
                <Line data={prepareChartData(users)} options={makeLineOptions()} />
              ) : (
                <div className="vd-chart-empty"><Clock size={18} /> Loading user data…</div>
              )}
            </div>
          </div>

          <div className="vd-card">
            <div className="vd-card-title">Order Activity</div>
            <div className="vd-card-sub">Daily order volume {timeRange === "week" ? "this week" : "this month"}</div>
            <div className="vd-chart-wrap">
              {notifications.length > 0 ? (
                <Bar data={prepareNotificationChartData()} options={makeBarOptions()} />
              ) : (
                <div className="vd-chart-empty"><Bell size={18} /> Loading order data…</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="vd-bottom-row">
          <div className="vd-card">
            <div className="vd-card-title">Top Products</div>
            <div className="vd-card-sub">By quantity ordered</div>
            <div className="vd-chart-wrap">
              {notifications.length > 0 ? (
                <Doughnut data={prepareProductDistributionData()} options={makeDoughnutOptions()} />
              ) : (
                <div className="vd-chart-empty"><PieChart size={18} /> Loading product data…</div>
              )}
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
                recentActivity.slice(0, 5).map((act) => (
                  <div key={act.id} className="vd-activity-item">
                    <div className={`vd-activity-icon ${act.updated_at ? "update" : "create"}`}>
                      {act.updated_at ? <Edit size={13} /> : <UserPlus size={13} />}
                    </div>
                    <div className="vd-activity-body">
                      <p className="vd-activity-text">
                        <strong>{act.personName}</strong> from{" "}
                        <span className="vd-activity-company">{act.companyName}</span>
                      </p>
                      <p className="vd-activity-time">
                        {format(new Date(act.activity_time), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <span className={`vd-activity-tag ${act.updated_at ? "updated" : "created"}`}>
                      {act.updated_at ? "Updated" : "Created"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── User Table ── */}
        <div className="vd-table-card">
          <div className="vd-table-header">
            <div className="vd-table-header-text">
              <div className="vd-card-title">
                User Management{" "}
                <span>({timeRange === "week" ? "This Week" : "This Month"})</span>
              </div>
              <div className="vd-card-sub" style={{ marginBottom: 0 }}>Recent registrations</div>
            </div>
            <div className="vd-table-actions">
              <button className="vd-btn-primary" onClick={() => router.push("/customer-admin/add-user")}>
                <Plus size={13} /> Add User
              </button>
              <button className="vd-btn-ghost" onClick={() => router.push("/customer-admin/user-profile")}>
                View All
              </button>
            </div>
          </div>

          <div className="vd-table-scroll">
            <table className="vd-data-table">
              <thead>
                <tr>
                  {["User", "Company", "Status", "Joined"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 5)
                  .map((user, idx) => (
                    <tr key={user.id}>
                      <td>
                        <div className="vd-user-cell">
                          <div className={`vd-user-avatar ${AVATAR_VARIANTS[idx % AVATAR_VARIANTS.length]}`}>
                            {getInitials(user.personName)}
                          </div>
                          <div>
                            <div className="vd-user-name">{user.personName}</div>
                            <div className="vd-user-email">{user.Email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{user.companyName || "N/A"}</td>
                      <td>
                        <span className={`vd-status-chip ${user.status === "Active" ? "active" : "inactive"}`}>
                          <span className={`vd-status-dot ${user.status === "Active" ? "active" : "inactive"}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="date">
                        {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="vd-table-empty">
                <UserX size={28} />
                No users found for this time period
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default CustomerAdminDashboard;