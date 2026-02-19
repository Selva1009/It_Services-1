"use client";
import { API_BASE_URL } from "@/lib/api/config";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, subDays, subMonths, startOfWeek, endOfWeek } from "date-fns";
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
  ShoppingCart,
  Search,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import Swal from "sweetalert2";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

const CustomerAdminDashboard = () => {
  const NOTIFICATION_LIMIT = 200;
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminID, setAdminID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("week");
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({ week: 0, month: 0 });
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
  });
  const [darkMode, setDarkMode] = useState(false);

  // Color palettes for both themes
  const colors = {
    dark: {
      primary: "#FF0000", // YouTube Red
      secondary: "#282828", // Dark Gray
      accent: "#3EA6FF", // YouTube Blue
      background: "#0F0F0F", // Dark Background
      card: "#212121", // Card Background
      text: "#FFFFFF", // White Text
      textSecondary: "#AAAAAA", // Gray Text
      success: "#00C853", // Green
      warning: "#FFAB00", // Amber
      danger: "#FF1744", // Red
      border: "#333333",
    },
    light: {
      primary: "#FF0000", // YouTube Red
      secondary: "#F8F9FA", // Light Gray
      accent: "#1A73E8", // Google Blue
      background: "#FFFFFF", // White Background
      card: "#FFFFFF", // Card Background
      text: "#202124", // Dark Text
      textSecondary: "#5F6368", // Gray Text
      success: "#34A853", // Green
      warning: "#FBBC05", // Amber
      danger: "#EA4335", // Red
      border: "#DADCE0",
    },
  };

  const currentColors = darkMode ? colors.dark : colors.light;

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Chart data preparation functions (same as before)
  const getTimeRangeDates = () => {
    const now = new Date();
    if (timeRange === "week") {
      return {
        start: startOfWeek(now),
        end: now,
      };
    } else {
      return {
        start: subMonths(now, 1),
        end: now,
      };
    }
  };

  const filterUsersByTimeRange = (users) => {
    const { start } = getTimeRangeDates();
    return users.filter((user) => {
      if (!user.createdAt) return false;
      const userDate = new Date(user.createdAt);
      return userDate >= start;
    });
  };

  const getDayLabels = () => {
    const { start, end } = getTimeRangeDates();
    const labels = [];
    let current = new Date(start);

    if (timeRange === "week") {
      while (current <= end) {
        labels.push(format(current, "EEE"));
        current = new Date(current.setDate(current.getDate() + 1));
      }
    } else {
      const weekStart = new Date(start);
      while (weekStart <= end) {
        let weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > end) weekEnd = new Date(end);

        labels.push(
          `Week ${format(weekStart, "d")}-${format(weekEnd, "d MMM")}`
        );
        weekStart.setDate(weekStart.getDate() + 7);
      }
    }
    return labels;
  };

  const prepareChartData = (users) => {
    const { start, end } = getTimeRangeDates();
    const labels = getDayLabels();
    const dataMap = {};

    labels.forEach((label) => {
      dataMap[label] = 0;
    });

    users.forEach((user) => {
      if (user.createdAt) {
        const userDate = new Date(user.createdAt);
        if (userDate >= start && userDate <= end) {
          let label;
          if (timeRange === "week") {
            label = format(userDate, "EEE");
          } else {
            const weekNumber = Math.floor(
              (userDate - start) / (7 * 24 * 60 * 60 * 1000)
            );
            label = labels[Math.min(weekNumber, labels.length - 1)];
          }
          dataMap[label] = (dataMap[label] || 0) + 1;
        }
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "New Users",
          data: labels.map((label) => dataMap[label]),
          backgroundColor: darkMode
            ? "rgba(62, 166, 255, 0.2)"
            : "rgba(26, 115, 232, 0.2)",
          borderColor: currentColors.accent,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: currentColors.primary,
          pointBorderColor: currentColors.card,
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  };

  const prepareNotificationChartData = () => {
    const now = new Date();
    const days = timeRange === "week" ? 7 : 30;
    const labels = [];
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(format(date, "MMM d"));

      const count = notifications.filter((n) => {
        const notificationDate = new Date(n.created_at);
        return (
          notificationDate.getDate() === date.getDate() &&
          notificationDate.getMonth() === date.getMonth() &&
          notificationDate.getFullYear() === date.getFullYear()
        );
      }).length;

      data.push(count);
    }

    return {
      labels,
      datasets: [
        {
          label: "Notifications",
          data,
          backgroundColor: labels.map((_, i) =>
            darkMode
              ? `hsl(${i * (360 / labels.length)}, 70%, 50%)`
              : `hsl(${i * (360 / labels.length)}, 80%, 60%)`
          ),
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    };
  };

  const prepareProductDistributionData = () => {
    const productCounts = {};
    notifications.forEach((n) => {
      if (n.productName) {
        const qty = typeof n.quantity === 'string'
          ? parseInt(n.quantity.replace(/[^\d]/g, '')) // extract only digits
          : (n.quantity || 1); // fallback in case it's already a number or undefined

        productCounts[n.productName] = (productCounts[n.productName] || 0) + qty;
      }
    });

    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const backgroundColors = darkMode
      ? [
        "rgba(255, 0, 0, 0.7)", // Red
        "rgba(62, 166, 255, 0.7)", // Blue
        "rgba(255, 204, 0, 0.75)", // Yellow
        "rgba(29, 185, 84, 0.7)", // Green
        "rgba(255, 102, 0, 0.95)", // Orange
      ]
      : [
        "rgba(234, 67, 53, 0.7)", // Red
        "rgba(66, 133, 244, 0.7)", // Blue
        "rgba(251, 189, 5, 0.8)", // Yellow
        "rgba(52, 168, 83, 0.7)", // Green
        "rgba(255, 102, 0, 0.95)", // Orange
      ];

    return {
      labels: sortedProducts.map((p) => p[0]),
      datasets: [
        {
          label: "Total Quantity Ordered",
          data: sortedProducts.map((p) => p[1]),
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) =>
            color.replace("0.7", "1")
          ),
          borderWidth: 1,
          hoverOffset: 20,
        },
      ],
    };
  };

  // Chart options with theme support
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "📈 User Growth Trend",
        color: currentColors.text,
        font: {
          size: 16,
          weight: "bold",
          family: "'Roboto', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: currentColors.card,
        titleColor: currentColors.text,
        bodyColor: currentColors.textSecondary,
        borderColor: currentColors.accent,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return ` ${context.parsed.y} new users`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: currentColors.textSecondary,
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: currentColors.textSecondary,
          stepSize: 1,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      title: {
        ...lineChartOptions.plugins.title,
        text: "📊 Notification Activity",
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: currentColors.text,
          font: {
            size: 12,
            family: "'Roboto', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      title: {
        display: true,
        text: " Top Ordered Products",
        color: currentColors.text,
        font: {
          size: 16,
          weight: "bold",
          family: "'Roboto', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: currentColors.card,
        titleColor: currentColors.text,
        bodyColor: currentColors.textSecondary,
        borderColor: currentColors.accent,
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "65%",
    borderRadius: 8,
  };

  // StatCard component with theme support
  const StatCard = ({ title, value, icon, trend, percentage }) => {
    return (
      <div
        className={ `p-5 rounded-xl shadow-sm transition-all hover:scale-[1.02] ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
          }` }
      >
        <div className="flex justify-between">
          <div>
            <p
              className={ `text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"
                }` }
            >
              { title }
            </p>
            <p
              className={ `text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"
                }` }
            >
              { value }
            </p>

          </div>
          <div
            className={ `h-12 w-12 rounded-full flex items-center justify-center ${darkMode ? "bg-black bg-opacity-20" : "bg-gray-100"
              }` }
          >
            { React.cloneElement(icon, {
              className: "h-6 w-6",
              style: { color: darkMode ? "#FFFFFF" : "#5F6368" },
            }) }
          </div>
        </div>
      </div>
    );
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminID, limit: NOTIFICATION_LIMIT }),
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data.notifications);

      const unreadCount = data.notifications.filter(
        (n) => n.status === "unread"
      ).length;
      setNotificationStats({
        total: data.notifications.length,
        unread: unreadCount,
        read: data.notifications.length - unreadCount,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    const storedCustomer = localStorage.getItem("customer");
    if (storedCustomer) {
      try {
        const customerData = JSON.parse(storedCustomer);
        setAdminID(customerData.id);
      } catch (err) {
        console.error("Invalid customer data:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!adminID) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/customer-users/user-profile`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminID }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(filterUsersByTimeRange(data));
      } catch (error) {
        console.error("Error fetching users:", error);
        Swal.fire("Error", "Failed to load users", "error");
      } finally {
        setLoading(false);
      }
    };

    const fetchNewUserSummary = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/customer-users/new-users-summary?adminID=${adminID}`
        );
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching activity:", error);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/customer-users/recent-activity?adminID=${adminID}`
        );
        const data = await response.json();
        setRecentActivity(data);
      } catch (error) {
        console.error("Error fetching activity:", error);
      }
    };

    fetchUsers();
    fetchNewUserSummary();
    fetchRecentActivity();
    fetchNotifications();
  }, [adminID]);

  useEffect(() => {
    if (users.length > 0) {
      setFilteredUsers(filterUsersByTimeRange(users));
    }
  }, [timeRange, users]);

  return (
    <div
      className={ `min-h-screen ${darkMode ? "bg-black" : "bg-gray-50"
        } transition-colors duration-200` }
    >
      <CustomerAdminNavbar darkMode={ darkMode } />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section with Theme Toggle */ }
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1
              className={ `text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"
                }` }
            >
              Dashboard Overview
            </h1>
            <p
              className={ `mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}` }
            >
              Welcome back! Here&apos;s what&apos;s happening with your business.
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0 items-center">
            <button
              onClick={ toggleTheme }
              className={ `p-2 rounded-full ${darkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-200 hover:bg-gray-300"
                } transition-colors` }
              aria-label="Toggle theme"
            >
              { darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              ) }
            </button>
            { ["week", "month"].map((range) => (
              <button
                key={ range }
                onClick={ () => setTimeRange(range) }
                className={ `px-4 py-2 text-sm font-medium rounded-lg transition-all ${timeRange === range
                    ? "bg-blue-700 text-white shadow-md"
                    : darkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }` }
              >
                { range.charAt(0).toUpperCase() + range.slice(1) }
              </button>
            )) }
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
          <StatCard
            title="Total Orders"
            value={ notificationStats.total }
            icon={ <ShoppingCart /> }

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

          {/* Notification Chart */ }
          <div
            className={ `rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
              }` }
          >
            <div className="h-64">
              { notifications.length > 0 ? (
                <Bar
                  data={ prepareNotificationChartData() }
                  options={ barChartOptions }
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Bell
                    className={ `h-8 w-8 ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  />
                  <p
                    className={ `ml-2 ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  >
                    Loading notifications...
                  </p>
                </div>
              ) }
            </div>
          </div>
        </div>

        {/* Bottom Section */ }
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Product Distribution */ }
          <div
            className={ `rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
              }` }
          >
            <div className="h-64">
              { notifications.length > 0 ? (
                <Doughnut
                  data={ prepareProductDistributionData() }
                  options={ doughnutChartOptions }
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PieChart
                    className={ `h-8 w-8 ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  />
                  <p
                    className={ `ml-2 ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  >
                    Loading product data...
                  </p>
                </div>
              ) }
            </div>
          </div>

          {/* Recent Activity */ }

          <div
            className={ `rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"
              }` }
          >
            <div className="p-6">
              <h2
                className={ `text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"
                  }` }
              >
                Recent Activity
              </h2>
              <div className="space-y-4">
                { recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity
                      className={ `h-10 w-10 mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                    />
                    <p className={ darkMode ? "text-gray-400" : "text-gray-500" }>
                      No recent activity
                    </p>
                  </div>
                ) : (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div
                      key={ activity.id }
                      className={ `flex items-start pb-4 ${darkMode
                          ? "border-b border-gray-700"
                          : "border-b border-gray-200"
                        } last:border-0` }
                    >
                      <div
                        className={ `p-2 rounded-lg mr-3 ${darkMode ? "bg-blue-900 bg-opacity-30" : "bg-blue-100"
                          }` }
                      >
                        { activity.updated_at ? (
                          <Edit
                            className={ `h-4 w-4 ${darkMode ? "text-amber-400" : "text-amber-500"}` }
                          />
                        ) : (
                          <UserPlus
                            className={ `h-4 w-4 ${darkMode ? "text-blue-400" : "text-blue-600"}` }
                          />
                        ) }
                      </div>
                      <div className="flex-1">
                        <p
                          className={ `text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"
                            }` }
                        >
                          <span className="font-semibold">
                            { activity.personName }
                          </span>{ " " }
                          from{ " " }
                          <span
                            className={ darkMode ? "text-blue-400" : "text-blue-600" }
                          >
                            { activity.companyName }
                          </span>
                        </p>
                        <p
                          className={ `text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"
                            }` }
                        >
                          { format(
                            new Date(activity.activity_time),
                            "MMM d, h:mm a"
                          ) }
                        </p>
                      </div>
                      <span
                        className={ `text-xs px-2 py-1 rounded-full ${darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                          }` }
                      >
                        { activity.updated_at ? "Updated" : "Created" }
                      </span>
                    </div>
                  ))
                ) }
              </div>
            </div>
          </div>
        </div>

        {/* User Management Table */ }
        <div
          className={ `rounded-xl shadow-sm overflow-hidden ${darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
            }` }
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2
                className={ `text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"
                  }` }
              >
                User Management (
                { timeRange === "week" ? "This Week" : "This Month" })
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={ () => router.push("/customer-admin/add-user") }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add User
                </button>
                <button
                  onClick={ () => router.push("/customer-admin/user-profile") }
                  className={ `px-4 py-2 text-sm font-medium rounded-lg transition ${darkMode
                      ? "border border-gray-600 hover:bg-gray-700 text-gray-300"
                      : "border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }` }
                >
                  View All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table
                className={ `min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"
                  }` }
              >
                <thead className={ darkMode ? "bg-gray-700" : "bg-gray-50" }>
                  <tr>
                    { ["User", "Company", "Status", "Joined"].map((head) => (
                      <th
                        key={ head }
                        className={ `px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"
                          }` }
                      >
                        { head }
                      </th>
                    )) }
                  </tr>
                </thead>
                <tbody
                  className={ `divide-y ${darkMode
                      ? "divide-gray-700 bg-gray-800"
                      : "divide-gray-200 bg-white"
                    }` }
                >
                  { filteredUsers
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .slice(0, 5)
                    .map((user) => (
                      <tr
                        key={ user.id }
                        className={
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={ `flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${darkMode
                                  ? "bg-blue-900 bg-opacity-30"
                                  : "bg-blue-100"
                                }` }
                            >
                              <span
                                className={ `font-medium ${darkMode ? "text-blue-400" : "text-blue-600"}` }
                              >
                                { user.personName?.charAt(0) || "U" }
                              </span>
                            </div>
                            <div className="ml-4">
                              <div
                                className={ `text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"
                                  }` }
                              >
                                { user.personName }
                              </div>
                              <div
                                className={ `text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                                  }` }
                              >
                                { user.Email }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={ `text-sm ${darkMode ? "text-white" : "text-gray-900"
                              }` }
                          >
                            { user.companyName || "N/A" }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={ `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "Active"
                                ? darkMode
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-800"
                                : darkMode
                                  ? "bg-red-900 text-red-300"
                                  : "bg-red-100 text-red-800"
                              }` }
                          >
                            { user.status === "Active" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            ) }
                            { user.status }
                          </span>
                        </td>
                        <td
                          className={ `px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                            }` }
                        >
                          { user.createdAt
                            ? format(new Date(user.createdAt), "MMM d, yyyy")
                            : "N/A" }
                        </td>
                      </tr>
                    )) }
                </tbody>
              </table>
              { filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <UserX
                    className={ `h-10 w-10 mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  />
                  <p className={ darkMode ? "text-gray-400" : "text-gray-500" }>
                    No users found for this time period
                  </p>
                </div>
              ) }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAdminDashboard;


