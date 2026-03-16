"use client";
import { API_BASE_URL } from "@/lib/api/config";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, subMonths, startOfWeek } from "date-fns";
import {
  Users,
  CheckCircle,
  XCircle,
  Activity,
  UserPlus,
  UserX,
  Plus,
  Edit,
  Bell,
  BarChart2,
  PieChart,
  TrendingUp,
  Search,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import Swal from "sweetalert2";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, ArcElement, Tooltip, Legend, PointElement, LineElement, Filler,
} from "chart.js";
import { useAuth } from "@/app/contexts/AuthContext";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, ArcElement,
  Tooltip, Legend, PointElement, LineElement, Filler
);

// ─── Chart colours ────────────────────────────────────────────────────────────
const C = {
  em:          "#10b981",
  emLight:     "#d1fae5",
  border:      "#e2e8f0",
  text:        "#0f172a",
  text2:       "#475569",
  text3:       "#94a3b8",
  white:       "#ffffff",
};

const DONUT_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];
const AVATAR_VARIANTS = ["v0", "v1", "v2", "v3", "v4"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

// ─── Chart option factories ───────────────────────────────────────────────────
const makeLineOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title:  { display: false },
    tooltip: {
      backgroundColor: C.white,
      titleColor:      C.text,
      bodyColor:       C.text2,
      borderColor:     C.border,
      borderWidth:     1,
      cornerRadius:    8,
      displayColors:   false,
      callbacks: { label: (ctx) => ` ${ctx.parsed.y} new users` },
    },
  },
  scales: {
    x: {
      grid:  { display: false },
      ticks: { color: C.text3, font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid:  { color: "rgba(0,0,0,0.05)", drawBorder: false },
      ticks: { color: C.text3, stepSize: 1, font: { size: 11 } },
    },
  },
});

const makeBarOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title:  { display: false },
    tooltip: {
      backgroundColor: C.white,
      titleColor:      C.text,
      bodyColor:       C.text2,
      borderColor:     C.border,
      borderWidth:     1,
      cornerRadius:    8,
    },
  },
  scales: {
    x: {
      grid:  { display: false },
      ticks: { color: C.text3, font: { size: 11 } },
    },
    y: {
      beginAtZero: true,
      grid:  { color: "rgba(0,0,0,0.05)" },
      ticks: { color: C.text3, font: { size: 11 } },
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
        color:         C.text,
        font:          { size: 12 },
        padding:       16,
        usePointStyle: true,
        pointStyle:    "circle",
      },
    },
    title: { display: false },
    tooltip: {
      backgroundColor: C.white,
      titleColor:      C.text,
      bodyColor:       C.text2,
      borderColor:     C.border,
      borderWidth:     1,
      cornerRadius:    8,
      callbacks: {
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          return `${ctx.label}: ${ctx.raw} (${Math.round((ctx.raw / total) * 100)}%)`;
        },
      },
    },
  },
  cutout:       "65%",
  borderRadius: 6,
});

// ─── Main component ───────────────────────────────────────────────────────────
const CustomerAdminDashboard = () => {
  const NOTIFICATION_LIMIT = 200;
  const router = useRouter();
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminID, setAdminID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({ week: 0, month: 0 });
  const [darkMode, setDarkMode] = useState(false);

  const [users,             setUsers]             = useState([]);
  const [filteredUsers,     setFilteredUsers]     = useState([]);
  const [notifications,     setNotifications]     = useState([]);
  const [adminID,           setAdminID]           = useState(null);
  const [loading,           setLoading]           = useState(false);
  const [timeRange,         setTimeRange]         = useState("week");
  const [recentActivity,    setRecentActivity]    = useState([]);
  const [stats,             setStats]             = useState({ week: 0, month: 0 });
  const [notificationStats, setNotificationStats] = useState({ total: 0, unread: 0, read: 0 });

  // ── Date helpers ────────────────────────────────────────────────────────────
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
      while (cur <= end) {
        labels.push(format(cur, "EEE"));
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      const ws = new Date(start);
      while (ws <= end) {
        const we = new Date(ws);
        we.setDate(we.getDate() + 6);
        if (we > end) we.setTime(end.getTime());
        labels.push(`Week ${format(ws, "d")}-${format(we, "d MMM")}`);
        ws.setDate(ws.getDate() + 7);
      }
    }
    return labels;
  };

  // ── Chart data builders ─────────────────────────────────────────────────────
  const prepareChartData = (list) => {
    const { start, end } = getTimeRangeDates();
    const labels  = getDayLabels();
    const dataMap = Object.fromEntries(labels.map((l) => [l, 0]));

    list.forEach((u) => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      if (d < start || d > end) return;
      const label =
        timeRange === "week"
          ? format(d, "EEE")
          : labels[Math.min(Math.floor((d - start) / (7 * 864e5)), labels.length - 1)];
      dataMap[label] = (dataMap[label] || 0) + 1;
    });

    return {
      labels,
      datasets: [{
        label:                "New Users",
        data:                 labels.map((l) => dataMap[l]),
        backgroundColor:      "rgba(16,185,129,0.08)",
        borderColor:          C.em,
        borderWidth:          2,
        tension:              0.4,
        fill:                 true,
        pointBackgroundColor: C.em,
        pointBorderColor:     C.white,
        pointBorderWidth:     2,
        pointRadius:          4,
        pointHoverRadius:     6,
      }],
    };
  };

  const prepareNotificationChartData = () => {
    const now  = new Date();
    const days = timeRange === "week" ? 7 : 30;
    const labels = [], data = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      labels.push(format(d, "MMM d"));
      data.push(
        notifications.filter((n) => {
          const nd = new Date(n.created_at);
          return (
            nd.getDate()     === d.getDate()     &&
            nd.getMonth()    === d.getMonth()    &&
            nd.getFullYear() === d.getFullYear()
          );
        }).length
      );
    }

    return {
      labels,
      datasets: [{
        label:                "Orders",
        data,
        backgroundColor:      C.emLight,
        hoverBackgroundColor: C.em,
        borderRadius:         5,
        borderWidth:          0,
      }],
    };
  };

  const prepareProductDistributionData = () => {
    const counts = {};
    notifications.forEach((n) => {
      if (!n.productName) return;
      const qty =
        typeof n.quantity === "string"
          ? parseInt(n.quantity.replace(/[^\d]/g, ""), 10)
          : n.quantity || 1;
      counts[n.productName] = (counts[n.productName] || 0) + qty;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      labels: sorted.map((p) => p[0]),
      datasets: [{
        label:           "Total Quantity Ordered",
        data:            sorted.map((p) => p[1]),
        backgroundColor: DONUT_COLORS,
        borderColor:     C.white,
        borderWidth:     2,
        hoverOffset:     12,
      }],
    };
  };

  // ── Data fetching ───────────────────────────────────────────────────────────
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

    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const storedCustomer = sessionStorage.getItem("customer");
    try {
      const customerData = storedCustomer ? JSON.parse(storedCustomer) : auth.customer;
      if (customerData?.id) {
        setAdminID(customerData.id);
      }
    } catch (err) {
      console.error("Invalid customer data:", err);
    }
  }, []);

  // useEffect(() => {
  //   if (!adminID) return;

  //   const fetchUsers = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch(
  //         `${API_BASE_URL}/api/customer-users/user-profile`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ adminID }),
  //         }
  //       );

  //       if (!response.ok) throw new Error("Failed to fetch users");
  //       const data = await response.json();
  //       setUsers(data);
  //       setFilteredUsers(filterUsersByTimeRange(data));
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //       Swal.fire("Error", "Failed to load users", "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const fetchNewUserSummary = async () => {
  //     try {
  //       const response = await fetch(
  //         `${API_BASE_URL}/api/customer-users/new-users-summary?adminID=${adminID}`
  //       );
  //       const data = await response.json();
  //       setStats(data);
  //     } catch (error) {
  //       console.error("Error fetching activity:", error);
  //     }
  //   };

  //   const fetchRecentActivity = async () => {
  //     try {
  //       const response = await fetch(
  //         `${API_BASE_URL}/api/customer-users/recent-activity?adminID=${adminID}`
  //       );
  //       const data = await response.json();
  //       setRecentActivity(data);
  //     } catch (error) {
  //       console.error("Error fetching activity:", error);
  //     }
  //   };

  //   fetchUsers();
  //   fetchNewUserSummary();
  //   fetchRecentActivity();
  //   fetchNotifications();
  // }, [adminID]);

  useEffect(() => {
    if (users.length > 0) setFilteredUsers(filterUsersByTimeRange(users));
  }, [timeRange, users]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard">
      <CustomerAdminNavbar />

      <main className="dashboard-main">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-sub">Welcome back — here's what's happening with your business.</p>
          </div>
          <div className="range-tabs">
            {["week", "month"].map((r) => (
              <button
                key={r}
                className={`range-tab${timeRange === r ? " active" : ""}`}
                onClick={() => setTimeRange(r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */ }
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={ users.length }
            icon={ <Users /> }

          />
          <StatCard
            title="Active Users"
            value={ users.filter((u) => u.status === "Active").length }
            icon={ <Activity /> }

          />
          <StatCard
            title="Inactive Users"
            value={ users.filter((u) => u.status === "Inactive").length }
            icon={ <UserX /> }

          />
        </div>

        {/* Charts Section */ }
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */ }
          <div
            className={ `rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
              }` }
          >
            <div className="h-64">
              { users.length > 0 ? (
                <Line
                  data={ prepareChartData(users) }
                  options={ lineChartOptions }
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Clock
                    className={ `h-8 w-8 ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  />
                  <p
                    className={ `ml-2 ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  >
                    Loading user data...
                  </p>
                </div>
              ) }
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Active Users</span>
              <div className="stat-icon blue"><Activity size={16} /></div>
            </div>
            <div className="stat-value">{users.filter((u) => u.status === "Active").length}</div>
            <div className="stat-meta">
              <span className="badge up">↑ 8%</span>&nbsp;vs last period
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Inactive Users</span>
              <div className="stat-icon red"><UserX size={16} /></div>
            </div>
            <div className="stat-value">{users.filter((u) => u.status === "Inactive").length}</div>
            <div className="stat-meta">
              <span className="badge down">↑ 3%</span>&nbsp;vs last period
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Total Orders</span>
              <div className="stat-icon amber"><ShoppingCart size={16} /></div>
            </div>
            <div className="stat-value">{notificationStats.total}</div>
            <div className="stat-meta">
              <span className="badge up">↑ 21%</span>&nbsp;vs last period
            </div>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="charts-row">
          <div className="card">
            <div className="card-title">User Growth</div>
            <div className="card-sub">
              New registrations {timeRange === "week" ? "this week" : "this month"}
            </div>
            <div className="chart-wrap">
              {users.length > 0 ? (
                <Line data={prepareChartData(users)} options={makeLineOptions()} />
              ) : (
                <div className="chart-empty">
                  <Clock size={18} /> Loading user data…
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Order Activity</div>
            <div className="card-sub">
              Daily order volume {timeRange === "week" ? "this week" : "this month"}
            </div>
            <div className="chart-wrap">
              {notifications.length > 0 ? (
                <Bar data={prepareNotificationChartData()} options={makeBarOptions()} />
              ) : (
                <div className="chart-empty">
                  <Bell size={18} /> Loading order data…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Row ── */}
        <div className="bottom-row">
          {/* Donut */}
          <div className="card">
            <div className="card-title">Top Products</div>
            <div className="card-sub">By quantity ordered</div>
            <div className="chart-wrap">
              {notifications.length > 0 ? (
                <Doughnut data={prepareProductDistributionData()} options={makeDoughnutOptions()} />
              ) : (
                <div className="chart-empty">
                  <PieChart size={18} /> Loading product data…
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Recent Activity</div>
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <div className="activity-empty">
                  <Activity size={28} />
                  No recent activity
                </div>
              ) : (
                recentActivity.slice(0, 5).map((act) => (
                  <div key={act.id} className="activity-item">
                    <div className={`activity-icon ${act.updated_at ? "update" : "create"}`}>
                      {act.updated_at ? <Edit size={13} /> : <UserPlus size={13} />}
                    </div>
                    <div className="activity-body">
                      <p className="activity-text">
                        <strong>{act.personName}</strong> from{" "}
                        <span className="activity-company">{act.companyName}</span>
                      </p>
                      <p className="activity-time">
                        {format(new Date(act.activity_time), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <span className={`activity-tag ${act.updated_at ? "updated" : "created"}`}>
                      {act.updated_at ? "Updated" : "Created"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── User Table ── */}
        <div className="table-card">
          <div className="table-header">
            <div className="table-header-text">
              <div className="card-title">
                User Management{" "}
                <span>({timeRange === "week" ? "This Week" : "This Month"})</span>
              </div>
              <div className="card-sub" style={{ marginBottom: 0 }}>Recent registrations</div>
            </div>
            <div className="table-actions">
              <button
                className="btn-primary"
                onClick={() => router.push("/customer-admin/add-user")}
              >
                <Plus size={13} /> Add User
              </button>
              <button
                className="btn-ghost"
                onClick={() => router.push("/customer-admin/user-profile")}
              >
                View All
              </button>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
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
                        <div className="user-cell">
                          <div className={`user-avatar ${AVATAR_VARIANTS[idx % AVATAR_VARIANTS.length]}`}>
                            {getInitials(user.personName)}
                          </div>
                          <div>
                            <div className="user-name">{user.personName}</div>
                            <div className="user-email">{user.Email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{user.companyName || "N/A"}</td>
                      <td>
                        <span className={`status-chip ${user.status === "Active" ? "active" : "inactive"}`}>
                          <span className={`status-dot ${user.status === "Active" ? "active" : "inactive"}`} />
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
              <div className="table-empty">
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