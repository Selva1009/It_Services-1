"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { format, subWeeks, subMonths, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import Navbar from "./components/navbar";
import {
  CheckCircle,
  XCircle,
  Building2,
  User,
  ChevronRight,
  Clock,
  TrendingUp,
  Edit,
  Bell,
  Package,
  Plus,
  Activity,
  Users,
  UserPlus,
  UserX,
  Sun,
  Moon
} from "lucide-react";
const Line = React.lazy(() => import("react-chartjs-2").then((mod) => ({ default: mod.Line })));
const Bar = React.lazy(() => import("react-chartjs-2").then((mod) => ({ default: mod.Bar })));
const Doughnut = React.lazy(() => import("react-chartjs-2").then((mod) => ({ default: mod.Doughnut })));
import { useAuth } from "@/app/contexts/AuthContext";
import { fetchVendorUsers } from "@/app/services/vendorAdminService";
import { fetchVendorAdminNotifications } from "@/app/services/notificationsService";
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
  Filler
} from "chart.js";

// Register ChartJS components
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

const StatCard = ({ title, value, icon, darkMode }) => {
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

const VendorDashboard = () => {
  const NOTIFICATION_LIMIT = 200;
  const router = useRouter();
  useEffect(() => {
    ["/SignIn", "/vendor-admin/addUser", "/vendor-admin/usersprofile"].forEach((path) => router.prefetch(path));
  }, []);
  const { auth, getAuthToken: getAuthTokenFromContext } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorID, setVendorID] = useState(null);
  const [timeRange, setTimeRange] = useState("week");
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({ week: 0, month: 0 });
  const [darkMode, setDarkMode] = useState(false);

  // Color palettes for both themes
  const colors = {
    dark: {
      primary: "#FF0000",
      secondary: "#282828",
      accent: "#3EA6FF",
      background: "#0F0F0F",
      card: "#212121",
      text: "#FFFFFF",
      textSecondary: "#AAAAAA",
      success: "#00C853",
      warning: "#FFAB00",
      danger: "#FF1744",
      border: "#333333",
    },
    light: {
      primary: "#FF0000",
      secondary: "#F8F9FA",
      accent: "#1A73E8",
      background: "#FFFFFF",
      card: "#FFFFFF",
      text: "#202124",
      textSecondary: "#5F6368",
      success: "#34A853",
      warning: "#FBBC05",
      danger: "#EA4335",
      border: "#DADCE0",
    },
  };

  const currentColors = darkMode ? colors.dark : colors.light;

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

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

  // Fetch notifications data
  const fetchNotifications = async () => {
    try {
      if (!vendorID) return;
      const token = getAuthTokenFromContext();
      if (!token) return;
      const data = await fetchVendorAdminNotifications({
        token,
        vendorAdminId: vendorID,
        limit: NOTIFICATION_LIMIT,
      });

      setNotifications(data.notifications);


    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const filterVendorsByTimeRange = (vendors) => {
    const { start } = getTimeRangeDates();
    return vendors.filter(vendor => {
      if (!vendor.createdAt) return false;
      const vendorDate = new Date(vendor.createdAt);
      return vendorDate >= start;
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

        labels.push(`Week ${format(weekStart, "d")}-${format(weekEnd, "d MMM")}`);
        weekStart.setDate(weekStart.getDate() + 7);
      }
    }
    return labels;
  };

  const prepareVendorGrowthData = (vendors) => {
    const { start, end } = getTimeRangeDates();
    const labels = getDayLabels();
    const dataMap = {};

    labels.forEach(label => {
      dataMap[label] = 0;
    });

    vendors.forEach(vendor => {
      if (vendor.createdAt) {
        const vendorDate = new Date(vendor.createdAt);
        if (vendorDate >= start && vendorDate <= end) {
          let label;
          if (timeRange === "week") {
            label = format(vendorDate, "EEE");
          } else {
            const weekNumber = Math.floor((vendorDate - start) / (7 * 24 * 60 * 60 * 1000));
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
          label: "New Vendors",
          data: labels.map(label => dataMap[label]),
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

      const count = notifications.filter(n => {
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
        "rgba(255, 0, 0, 0.7)",
        "rgba(62, 166, 255, 0.7)",
        "rgba(255, 204, 0, 0.75)",
        "rgba(29, 185, 84, 0.7)",
        "rgba(255, 102, 0, 0.95)",
      ]
      : [
        "rgba(234, 67, 53, 0.7)",
        "rgba(66, 133, 244, 0.7)",
        "rgba(251, 189, 5, 0.8)",
        "rgba(52, 168, 83, 0.7)",
        "rgba(255, 102, 0, 0.95)",
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

  const prepareRecentActivity = (vendors) => {
    const activities = [];

    vendors.forEach(vendor => {
      // Always include creation activity
      activities.push({
        type: 'created',
        name: vendor.personName || "No contact",
        company: vendor.companyName || "Unknown Vendor",
        date: vendor.createdAt,
        status: vendor.status,
        id: vendor.id
      });

      // Check if there was an update (updated_at is different from createdAt)
      if (vendor.updated_at && new Date(vendor.updated_at).getTime() !== new Date(vendor.createdAt).getTime()) {
        activities.push({
          type: 'updated',
          name: vendor.personName || "No contact",
          company: vendor.companyName || "Unknown Vendor",
          date: vendor.updated_at,
          status: vendor.status,
          id: vendor.id
        });
      }
    });

    // Sort by date descending and limit to 5 most recent
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
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
    const fetchVendors = async () => {
      if (!vendorID) return;
      try {
        setLoading(true);
        const data = await fetchVendorUsers(vendorID);
        setVendors(data);

        // Calculate stats
        const weeklyVendors = filterVendorsByTimeRange(data, "week");
        const monthlyVendors = filterVendorsByTimeRange(data, "month");

        setStats({
          week: weeklyVendors.length,
          month: monthlyVendors.length
        });

        // Prepare recent activity
        setRecentActivity(prepareRecentActivity(data));

        // Fetch notifications only (removed products fetch)
        await fetchNotifications();

      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [vendorID]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "📈 Vendor Growth Trend",
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
            return ` ${context.parsed.y} new vendors`;
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
        text: "Top Ordered Products",
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

      },
    },
    cutout: "65%",
    borderRadius: 8,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredVendors = filterVendorsByTimeRange(vendors);
  const activeVendors = vendors.filter(v => v.status === "Active").length;
  const inactiveVendors = vendors.filter(v => v.status !== "Active").length;

  return (
    <div className={ `min-h-screen ${darkMode ? "bg-black" : "bg-gray-50"} transition-colors duration-200` }>
      <Navbar darkMode={ darkMode } />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section with Theme Toggle */ }
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className={ `text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}` }>
              Vendor Dashboard
            </h1>
            <p className={ `mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}` }>
              Welcome back! Here&apos;s what&apos;s happening with your vendors.
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
            title="Total Vendors"
            value={ vendors.length }
            icon={ <Users /> }
            darkMode={ darkMode }
          />
          <StatCard
            title="Active Vendors"
            value={ activeVendors }
            icon={ <Activity /> }
            darkMode={ darkMode }
          />
          <StatCard
            title="Inactive Vendors"
            value={ inactiveVendors }
            icon={ <UserX /> }
            darkMode={ darkMode }
          />
        </div>

        {/* Charts Section */ }
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Vendor Growth Chart */ }
          <div className={ `rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"}` }>
            <div className="h-64">
              { vendors.length > 0 ? (
                <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
                  <Line
                    data={ prepareVendorGrowthData(vendors) }
                    options={ lineChartOptions }
                  />
                </Suspense>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Clock
                    className={ `h-8 w-8 ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  />
                  <p
                    className={ `ml-2 ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  >
                    Loading vendor data...
                  </p>
                </div>
              ) }
            </div>
          </div>

          {/* Notification Chart */ }
          <div className={ `rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"}` }>
            <div className="h-64">
              { notifications.length > 0 ? (
                <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
                  <Bar
                    data={ prepareNotificationChartData() }
                    options={ barChartOptions }
                  />
                </Suspense>
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
          <div className={ `rounded-xl p-6 ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"}` }>
            <div className="h-64">
              { notifications.length > 0 ? (
                <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
                  <Doughnut
                    data={ prepareProductDistributionData() }
                    options={ doughnutChartOptions }
                  />
                </Suspense>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package
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
          <div className={ `rounded-xl overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white border border-gray-200"}` }>
            <div className="p-6">
              <h2 className={ `text-xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}` }>
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
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <div
                      key={ `activity-${index}` }
                      className={ `flex items-start pb-4 ${darkMode
                          ? "border-b border-gray-700"
                          : "border-b border-gray-200"
                        } last:border-0` }
                    >
                      <div
                        className={ `p-2 rounded-lg mr-3 ${darkMode ? "bg-blue-900 bg-opacity-30" : "bg-blue-100"
                          }` }
                      >
                        { activity.type === 'created' ? (
                          <UserPlus
                            className={ `h-4 w-4 ${darkMode ? "text-blue-400" : "text-blue-600"}` }
                          />
                        ) : (
                          <Edit
                            className={ `h-4 w-4 ${darkMode ? "text-amber-400" : "text-amber-500"}` }
                          />
                        ) }
                      </div>
                      <div className="flex-1">
                        <p
                          className={ `text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"
                            }` }
                        >
                          <span className="font-semibold">{ activity.name }</span> from{ " " }
                          <span
                            className={ darkMode ? "text-blue-400" : "text-blue-600" }
                          >
                            { activity.company }
                          </span>
                        </p>
                        <p
                          className={ `text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"
                            }` }
                        >
                          { format(new Date(activity.date), "MMM d, h:mm a") }
                        </p>
                      </div>
                      <span
                        className={ `text-xs px-2 py-1 rounded-full ${darkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-100 text-gray-600"
                          }` }
                      >
                        { activity.type === 'created' ? 'Created' : 'Updated' }
                      </span>
                    </div>
                  ))
                ) }
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Management Table */ }
        <div className={ `rounded-xl shadow-sm overflow-hidden ${darkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
          }` }>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={ `text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}` }>
                Vendor Management (
                { timeRange === "week" ? "This Week" : "This Month" })
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={ () => router.push("/vendor-admin/addUser") }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Vendor
                </button>
                <button
                  onClick={ () => router.push("/vendor-admin/usersprofile") }
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
              <table className={ `min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}` }>
                <thead className={ darkMode ? "bg-gray-700" : "bg-gray-50" }>
                  <tr>
                    { ["Vendor", "Company", "Status", "Registered"].map((head) => (
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
                <tbody className={ `divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}` }>
                  { filteredVendors
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
                    .map((vendor) => (
                      <tr key={ vendor.id || vendor.Email } className={ darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50" }>
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
                                { vendor.personName?.charAt(0) || "V" }
                              </span>
                            </div>
                            <div className="ml-4">
                              <div
                                className={ `text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"
                                  }` }
                              >
                                { vendor.personName }
                              </div>
                              <div
                                className={ `text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                                  }` }
                              >
                                { vendor.Email }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={ `text-sm ${darkMode ? "text-white" : "text-gray-900"
                              }` }
                          >
                            { vendor.companyName || "N/A" }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={ `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vendor.status === "Active"
                                ? darkMode
                                  ? "bg-green-900 text-green-300"
                                  : "bg-green-100 text-green-800"
                                : darkMode
                                  ? "bg-red-900 text-red-300"
                                  : "bg-red-100 text-red-800"
                              }` }
                          >
                            { vendor.status === "Active" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            ) }
                            { vendor.status }
                          </span>
                        </td>
                        <td
                          className={ `px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                            }` }
                        >
                          { vendor.createdAt
                            ? format(new Date(vendor.createdAt), "MMM d, yyyy")
                            : "N/A" }
                        </td>
                      </tr>
                    )) }
                </tbody>
              </table>
              { filteredVendors.length === 0 && (
                <div className="text-center py-8">
                  <UserX
                    className={ `h-10 w-10 mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}` }
                  />
                  <p className={ darkMode ? "text-gray-400" : "text-gray-500" }>
                    No vendors found for this time period
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

export default VendorDashboard;


