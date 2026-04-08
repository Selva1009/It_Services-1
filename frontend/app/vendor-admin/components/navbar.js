"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  User,
  LogOut,
  Calendar,
  LayoutDashboard,
  UserPlus,
  UserRoundPen,
  Menu,
  X,
  ChevronDown,
  Bell,
  Ticket,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  fetchVendorAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/services/notificationsService";
import "./vendorAdminNavbar.css";

const NOTIFICATION_LIMIT = 50;

const isHighPriorityNotification = (notification) => {
  const priority = String(notification?.priority || "").toLowerCase();
  const message = String(notification?.message || "").toLowerCase();
  return priority === "high" || priority === "critical" || message.includes("high priority");
};

const highPriorityCardStyle = {
  background:
    "linear-gradient(135deg, rgba(239, 68, 68, 0.08), transparent 35%), linear-gradient(180deg, #fff7f7 0%, #ffecec 100%)",
  borderColor: "#f87171",
  boxShadow: "0 10px 22px rgba(239, 68, 68, 0.08)",
};

const highPriorityBannerStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  marginBottom: "8px",
  padding: "4px 9px",
  borderRadius: "999px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const highPrioritySignalStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#ef4444",
  boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.14)",
};

const highPriorityMetaPillStyle = {
  border: "1px solid rgba(254, 202, 202, 0.9)",
};

const highPriorityReadButtonStyle = {
  borderColor: "#fecaca",
  background: "#fef2f2",
  color: "#b91c1c",
  position: "relative",
  zIndex: 1,
};

export default function Navbar() {
  const { auth, clearAuth, getAuthToken: getAuthTokenFromContext } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    ["/vendor-admin", "/vendor-admin/tickets", "/vendor-admin/addUser", "/vendor-admin/usersprofile", "/vendor-admin/myProfile"]
      .forEach((path) => router.prefetch(path));
  }, [router]);

  const vendorDisplayName = useMemo(
    () =>
      auth.vendor?.personName ||
      auth.vendor?.name ||
      auth.vendor?.contactPerson ||
      auth.vendor?.vendor_name ||
      auth.vendor?.email ||
      null,
    [auth.vendor]
  );

  const initials = useMemo(() => {
    const name = vendorDisplayName || "";
    if (!name) return "VA";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }, [vendorDisplayName]);

  const fetchNotifications = useCallback(async () => {
    const token = getAuthTokenFromContext();
    if (!token) return;

    try {
      const data = await fetchVendorAdminNotifications({ token, limit: NOTIFICATION_LIMIT });
      const list = data?.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Notifications fetch failed:", err);
    }
  }, [getAuthTokenFromContext]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (notifFilter === "all") return notifications;
    return notifications.filter((n) => (notifFilter === "read" ? Boolean(n.is_read) : !n.is_read));
  }, [notifFilter, notifications]);

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    Swal.fire({
      title: "Are you sure want to logout?",
      imageUrl: "/logout.gif",
      imageWidth: 127,
      imageHeight: 151,
      imageAlt: "Logout",
      showCancelButton: true,
      reverseButtons: false,
      confirmButtonColor: "#1a56db",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "<b>Yes</b>",
      cancelButtonText: "<b>Cancel</b>",
      customClass: { popup: "rounded-alert" },
    }).then((result) => {
      if (result.isConfirmed) {
        clearAuth();
        router.push("/SignIn");
      }
    });
  };

  const handleMarkRead = async (id) => {
    try {
      const token = getAuthTokenFromContext();
      if (!token) return;
      await markNotificationRead(id, token);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = getAuthTokenFromContext();
      if (!token) return;
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const toggleNotification = async () => {
    const next = !notificationOpen;
    setNotificationOpen(next);
    if (next) {
      await fetchNotifications();
    }
  };

  const menuItems = [
    { href: "/vendor-admin", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    
    { href: "/vendor-admin/addUser", icon: <UserPlus size={16} />, label: "Add User" },
    { href: "/vendor-admin/usersprofile", icon: <Users size={16} />, label: "User Profiles" },

    { href: "/vendor-admin/tickets", icon: <Ticket size={16} />, label: "Tickets" },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <>
      <nav className="va-nav">
        <div className="va-nav-left">
          <Link href="/vendor-admin" className="ca-logo">
            <span className="ca-logo-text">L1-L3</span>
          </Link>

          <div className="va-nav-divider" />

          <nav className="va-nav-links">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className={`va-nav-link${isActive(item.href) ? " active" : ""}`}>
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="va-nav-right">
          <div className="va-nav-date">
            <Calendar size={13} />
            {currentDate}
          </div>

          <button className="va-nav-icon-btn" aria-label="Notifications" onClick={toggleNotification}>
            <Bell size={16} />
            {unreadCount > 0 ? (
              <span className="va-nav-bell-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
            ) : (
              <div className="va-nav-bell-dot" />
            )}
          </button>

          <div className={`va-nav-profile${dropdownOpen ? " open" : ""}`} onClick={() => setDropdownOpen((o) => !o)}>
            <div className="va-nav-avatar">{initials}</div>

            <div className="va-nav-profile-info">
              {vendorDisplayName ? (
                <>
                  <p className="text-[14px] font-medium">{vendorDisplayName}</p>
                  <p className="text-[#999999] text-[12px]">Vendor Admin</p>
                </>
              ) : (
                <span className="text-sm">Loading...</span>
              )}
            </div>

            <ChevronDown size={14} className="va-nav-chevron" />

            {dropdownOpen && (
              <div className="va-dropdown">
                <Link href="/vendor-admin/myProfile" className="va-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <User size={15} />
                  My Profile
                </Link>
                <div className="va-dropdown-divider" />
                <button className="va-dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {notificationOpen && (
        <>
          <div className="va-notif-overlay" onClick={toggleNotification} />
          <aside className="va-notif-sidebar">
            <div className="va-notif-header">
              <h3>Notifications</h3>
              <button className="va-notif-close" onClick={toggleNotification}>×</button>
            </div>

            <div className="va-notif-controls">
              <select value={notifFilter} onChange={(e) => setNotifFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <button onClick={handleMarkAllRead}>Mark all as read</button>
            </div>

            <div className="va-notif-list">
              {filteredNotifications.length === 0 ? (
                <p className="va-notif-empty">No notifications found.</p>
              ) : (
                filteredNotifications.map((item) => {
                  const isHighPriority = isHighPriorityNotification(item);
                  return (
                  <div
                    key={item.id}
                    className={`va-notif-item${item.is_read ? "" : " unread"}${isHighPriority ? " high-priority" : ""}`}
                    style={isHighPriority ? highPriorityCardStyle : undefined}
                  >
                    {isHighPriority ? (
                      <div className="va-notif-priority-banner" style={highPriorityBannerStyle}>
                        <span className="va-notif-priority-signal" style={highPrioritySignalStyle} />
                        High Priority
                      </div>
                    ) : null}
                    <div className="va-notif-card-head">
                      <div className="va-notif-message" style={isHighPriority ? { color: "#0f172a", fontWeight: 700 } : undefined}>{item.message}</div>
                    </div>
                    <div className="va-notif-meta" style={isHighPriority ? { color: "#475569" } : undefined}>
                      <span className="va-notif-meta-pill" style={isHighPriority ? highPriorityMetaPillStyle : undefined}>{item.ticket_number || "-"}</span>
                      <span className="va-notif-meta-pill" style={isHighPriority ? highPriorityMetaPillStyle : undefined}>{new Date(item.created_at).toLocaleString("en-IN")}</span>
                    </div>
                    {!item.is_read ? (
                      <button onClick={() => handleMarkRead(item.id)} className="va-notif-read-btn" style={isHighPriority ? highPriorityReadButtonStyle : undefined}>
                        Mark as Read
                      </button>
                    ) : null}
                  </div>
                )})
              )}
            </div>
          </aside>
        </>
      )}

      <nav className="va-nav-mobile">
        <div className="va-nav-mobile-brand">
          <div className="va-nav-mobile-logo">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5H12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="va-nav-mobile-title">Vendor Admin</span>
        </div>

        <button className="va-nav-mobile-menu-btn" onClick={() => setMobileMenuOpen((o) => !o)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileMenuOpen && (
          <div className="va-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="va-mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="va-mobile-drawer-profile">
                <div className="va-mobile-drawer-avatar">{initials}</div>
                <div>
                  <div className="va-mobile-drawer-name">{vendorDisplayName || "Vendor Admin"}</div>
                  <div className="va-mobile-drawer-role">Vendor Admin</div>
                </div>
              </div>

              <div className="va-mobile-nav-links">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`va-mobile-nav-link${isActive(item.href) ? " active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="va-mobile-drawer-footer">
                <Link href="/vendor-admin/myProfile" className="va-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <UserRoundPen size={17} />
                  My Profile
                </Link>
                <button className="va-mobile-nav-link" style={{ color: "var(--red)" }} onClick={handleLogout}>
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
