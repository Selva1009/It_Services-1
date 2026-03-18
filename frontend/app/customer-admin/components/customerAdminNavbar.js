"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserPlus,
  User,
  LayoutDashboard,
  LogOut,
  Calendar,
  Menu,
  X,
  ChevronDown,
  UserRoundPen,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  fetchCustomerAdminNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/services/notificationsService";
import "./customerAdminNavbar.css"
export default function CustomerAdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    [
      "/SignIn",
      "/customer-admin/customerAdminDashboard",
      "/customer-admin/add-user",
      "/customer-admin/user-profile",
      "/customer-admin/customerAdminProfile",
    ].forEach((path) => router.prefetch(path));
  }, []);
  const { auth, clearAuth } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
   
  const customerName = useMemo(
    () =>
      auth.customer?.name ||
      auth.customer?.firstName ||
      auth.customer?.first_name ||
      auth.customer?.vendor_name ||
      auth.customer?.email ||
      null,
    [auth.customer]
  );

  const customerRole = auth.role || auth.customer?.role || null;

  const isActive = (path) => pathname === path;

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure want to logout?",
      imageUrl: "/logout.gif",
      imageWidth: 127,
      imageHeight: 151,
      imageAlt: "Logout Image",
      showCancelButton: true,
      confirmButtonColor: "#1a56db",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "<b>Yes</b>",
      cancelButtonText: "<b>Cancel</b>",
      customClass: {
        confirmButton: "swal-button",
        cancelButton: "swal-button",
        popup: "rounded-alert",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        clearAuth();
        router.push("/SignIn");
      }
    });
  };

  const menuItems = [
    {
      href: "/customer-admin/customerAdminDashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
    },
    {
      href: "/customer-admin/add-user",
      icon: <UserPlus className="h-5 w-5" />,
      label: "Add User",
    },
    {
      href: "/customer-admin/user-profile",
      icon: <Users className="h-5 w-5" />,
      label: "User Profiles",
    },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const fetchNotifications = async () => {
    try {
      const token = auth?.authToken;
      if (!token) return;

      const data = await fetchCustomerAdminNotifications({ token, limit: 50 });
      const list = data?.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [auth?.authToken]);

  const filteredNotifications = useMemo(() => {
    if (notifFilter === "all") return notifications;
    return notifications.filter((n) => (notifFilter === "read" ? Boolean(n.is_read) : !n.is_read));
  }, [notifFilter, notifications]);

  const handleMarkRead = async (id) => {
    try {
      const token = auth?.authToken;
      if (!token || !id) return;
      await markNotificationRead(id, token);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = auth?.authToken;
      if (!token) return;
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

   

 // Replace with
const initials = useMemo(() => {
  const name = customerName || "";
  if (!name) return "VA";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}, [customerName]) ;


  return (
    <>
      {/* ════════════════ DESKTOP NAVBAR ════════════════ */}
      <nav className="ca-nav">

        {/* Left: logo + divider + links */}
        <div className="ca-nav-left">
          <Link href="/customer-admin/customerAdminDashboard" className="ca-logo">
           
            <span className="ca-logo-text">L1-L3</span>
          </Link>

          <div className="ca-nav-divider" />

          <nav className="ca-nav-links">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`ca-nav-link${isActive(item.href) ? " active" : ""}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: date · profile */}
        <div className="ca-nav-right">

          <div className="ca-nav-date">
            <Calendar size={13} />
            {currentDate}
          </div>

          <button
            className="ca-nav-icon-btn"
            aria-label="Notifications"
            onClick={() => setNotificationOpen((prev) => !prev)}
          >
            <Bell size={16} />
            {unreadCount > 0 ? (
              <span className="ca-nav-bell-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
            ) : (
              <div className="ca-nav-bell-dot" />
            )}
          </button>

          <div
            className={`ca-nav-profile${dropdownOpen ? " open" : ""}`}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <div className="ca-nav-avatar">{initials}</div>

            <div className="ca-nav-profile-info">
             { customerName ? (
                  <>
                    <p className="text-[14px] font-medium">{ customerName }</p>
                    <p className="text-[#999999] text-[12px]">{customerRole?.replace(/_/g, " ").toUpperCase() || "IT Admin"}</p>
                  </>
                ) : (
                  <span className="text-sm">Loading...</span>
                ) }
           
            </div>

            <ChevronDown size={14} className="ca-nav-chevron" />

            {dropdownOpen && (
              <div className="ca-dropdown">
                <Link
                  href="/customer-admin/customerAdminProfile"
                  className="ca-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={15} />
                  My Profile
                </Link>
                <div className="ca-dropdown-divider" />
                <button className="ca-dropdown-item danger" onClick={handleLogout}>
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
          <div className="ca-notif-overlay" onClick={() => setNotificationOpen(false)} />
          <aside className="ca-notif-sidebar">
            <div className="ca-notif-header">
              <h3>Notifications</h3>
              <button className="ca-notif-close" onClick={() => setNotificationOpen(false)}>×</button>
            </div>

            <div className="ca-notif-controls">
              <select value={notifFilter} onChange={(e) => setNotifFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <button onClick={handleMarkAllRead}>Mark all as read</button>
            </div>

            <div className="ca-notif-list">
              {filteredNotifications.length === 0 ? (
                <p className="ca-notif-empty">No notifications found.</p>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`ca-notif-item${item.is_read ? "" : " unread"}`}
                  >
                    <div className="ca-notif-message">{item.message}</div>
                    <div className="ca-notif-meta">
                      <span>{item.ticket_number || "-"}</span>
                      <span>{new Date(item.created_at).toLocaleString("en-IN")}</span>
                    </div>
                    {!item.is_read ? (
                      <button className="ca-notif-read-btn" onClick={() => handleMarkRead(item.id)}>
                        Mark as Read
                      </button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}

      {/* ════════════════ MOBILE NAVBAR ════════════════ */}
      <nav className="ca-nav-mobile">
        <div className="ca-nav-mobile-brand">
          <div className="ca-nav-mobile-logo">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 10.5H12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="ca-nav-mobile-title">IT Admin</span>
        </div>

        <button
          className="ca-nav-mobile-menu-btn"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileMenuOpen && (
          <div className="ca-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="ca-mobile-drawer" onClick={(e) => e.stopPropagation()}>

              <div className="ca-mobile-drawer-profile">
                <div className="ca-mobile-drawer-avatar">{initials}</div>
                <div>
                  <div className="ca-mobile-drawer-name">{customerName || "Customer Admin"}</div>
                  <div className="ca-mobile-drawer-role">
                    {customerRole?.replace(/_/g, " ") || "IT Admin"}
                  </div>
                </div>
              </div>

              <div className="ca-mobile-nav-links">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ca-mobile-nav-link${isActive(item.href) ? " active" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="ca-mobile-drawer-footer">
                <Link
                  href="/customer-admin/customerAdminProfile"
                  className="ca-mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserRoundPen size={17} />
                  My Profile
                </Link>
                <button
                  className="ca-mobile-nav-link"
                  style={{ color: "var(--red)" }}
                  onClick={handleLogout}
                >
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
