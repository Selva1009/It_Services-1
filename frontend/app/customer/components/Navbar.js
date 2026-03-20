"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, User, LogOut, Calendar, Menu, X, Bell, ChevronDown, Ticket } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/services/notificationsService";
import "./customerNavbar.css";

const Navbar = ({
  setSearchQuery,
  disableSearch,
  onGoServices,
  onGoTickets,
}) => {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();
  const { auth, clearAuth } = useAuth();

  useEffect(() => {
    ["/SignIn", "/customer/products", "/customer/CustomerProfile"].forEach((path) => router.prefetch(path));
  }, [router]);

  const customerUser = auth.customerUser;
  const customerDisplayName = useMemo(
    () =>
      customerUser?.name ||
      customerUser?.personName ||
      customerUser?.company_name ||
      customerUser?.companyName ||
      customerUser?.email ||
      null,
    [customerUser]
  );

  const initials = useMemo(() => {
    const name = customerDisplayName || "";
    if (!name) return "CU";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }, [customerDisplayName]);

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

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const loadNotifications = useCallback(async () => {
    try {
      const token = auth?.authToken;
      if (!token) return;
      const data = await fetchNotifications({ token, limit: 50 });
      const list = data?.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }, [auth?.authToken]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

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
      console.error("Failed to mark all notifications", err);
    }
  };

  return (
    <>
      <nav className="cu-nav">
        <div className="cu-nav-left">
          <Link href="/customer/products" className="cu-logo">
            <span className="cu-logo-text">L1-L3</span>
          </Link>

          {!disableSearch && (
            <div className="cu-search-wrap">
              <Search size={16} className="cu-search-icon" />
              <input
                type="text"
                placeholder="Search support categories, issues, levels..."
                className="cu-search-input"
                value={search}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearch(value);
                  if (setSearchQuery) setSearchQuery(value);
                }}
              />
              {search ? (
                <button
                  type="button"
                  className="cu-clear-btn"
                  onClick={() => {
                    setSearch("");
                    if (setSearchQuery) setSearchQuery("");
                  }}
                >
                  Clear
                </button>
              ) : null}
            </div>
          )}
        </div>

        <div className="cu-nav-right">
          <div className="cu-quick-actions">
            <button className="cu-action-btn" onClick={onGoServices}>
              Raise Ticket
            </button>
            <button className="cu-action-btn ghost" onClick={onGoTickets}>
              <Ticket size={14} />
              My Tickets
            </button>
          </div>

          <div className="cu-nav-date">
            <Calendar size={13} />
            {currentDate}
          </div>

          <button className="cu-nav-icon-btn" aria-label="Notifications" onClick={() => setNotificationOpen((prev) => !prev)}>
            <Bell size={16} />
            {unreadCount > 0 ? (
              <span className="cu-nav-bell-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
            ) : (
              <div className="cu-nav-bell-dot" />
            )}
          </button>

          <div className={`cu-nav-profile${dropdownOpen ? " open" : ""}`} onClick={() => setDropdownOpen((o) => !o)}>
            <div className="cu-nav-avatar">{initials}</div>
            <div className="cu-nav-profile-info">
              {customerUser ? (
                <>
                  <p className="cu-nav-profile-name">{customerDisplayName || auth.userName}</p>
                  <p className="cu-nav-profile-role">Customer User</p>
                </>
              ) : (
                <span className="cu-nav-profile-name">Loading...</span>
              )}
            </div>
            <ChevronDown size={14} className="cu-nav-chevron" />

            {dropdownOpen && (
              <div className="cu-dropdown">
                <Link href="/customer/CustomerProfile" className="cu-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <User size={15} />
                  My Profile
                </Link>
                <div className="cu-dropdown-divider" />
                <button className="cu-dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <nav className="cu-nav-mobile">
        <div className="cu-nav-mobile-brand">
          <div className="cu-nav-mobile-logo">CU</div>
          <span className="cu-nav-mobile-title">Customer</span>
        </div>

        <button className="cu-nav-mobile-menu-btn" onClick={() => setMobileMenuOpen((o) => !o)} aria-label="Toggle menu">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileMenuOpen && (
          <div className="cu-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="cu-mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="cu-mobile-drawer-profile">
                <div className="cu-mobile-drawer-avatar">{initials}</div>
                <div>
                  <div className="cu-mobile-drawer-name">{customerDisplayName || "Customer User"}</div>
                  <div className="cu-mobile-drawer-role">Customer User</div>
                </div>
              </div>

              {!disableSearch && (
                <div className="cu-mobile-search">
                  <Search size={16} className="cu-search-icon" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearch(value);
                      if (setSearchQuery) setSearchQuery(value);
                    }}
                    placeholder="Search support services"
                    className="cu-mobile-search-input"
                  />
                </div>
              )}

              <div className="cu-mobile-nav-links">
                <button className="cu-mobile-nav-link" onClick={() => { setMobileMenuOpen(false); onGoServices?.(); }}>
                  Raise Ticket
                </button>
                <button className="cu-mobile-nav-link" onClick={() => { setMobileMenuOpen(false); onGoTickets?.(); }}>
                  My Tickets
                </button>
                <Link href="/customer/CustomerProfile" className="cu-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  My Profile
                </Link>
              </div>

              <div className="cu-mobile-drawer-footer">
                <button className="cu-mobile-nav-link danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {notificationOpen && (
        <>
          <div className="cu-notif-overlay" onClick={() => setNotificationOpen(false)} />
          <aside className="cu-notif-sidebar">
            <div className="cu-notif-header">
              <h3>Notifications</h3>
              <button className="cu-notif-close" onClick={() => setNotificationOpen(false)}>x</button>
            </div>

            <div className="cu-notif-controls">
              <select value={notifFilter} onChange={(e) => setNotifFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <button onClick={handleMarkAllRead}>Mark all as read</button>
            </div>

            <div className="cu-notif-list">
              {filteredNotifications.length === 0 ? (
                <p className="cu-notif-empty">No notifications found.</p>
              ) : (
                filteredNotifications.map((item) => (
                  <div key={item.id} className={`cu-notif-item${item.is_read ? "" : " unread"}`}>
                    <div className="cu-notif-message">{item.message}</div>
                    <div className="cu-notif-meta">
                      <span>{item.ticket_number || "-"}</span>
                      <span>{new Date(item.created_at).toLocaleString("en-IN")}</span>
                    </div>
                    {!item.is_read ? (
                      <button onClick={() => handleMarkRead(item.id)} className="cu-notif-read-btn">
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
    </>
  );
};

export default Navbar;
