"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Ticket,
  User,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";
import "./vendorNavbar.css";

export default function VendorNavbar({
  search,
  setSearch,
  unreadCount = 0,
  onToggleNotifications,
  onGoAvailable,
  onGoMyTickets,
}) {
  const router = useRouter();
  const { auth, clearAuth } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    ["/SignIn", "/vendorUser", "/vendorUser/myprofile"].forEach((path) => {
      router.prefetch(path);
    });
  }, [router]);

  const vendorUser = auth.vendorUser;
  const vendorDisplayName = useMemo(
    () =>
      vendorUser?.name ||
      vendorUser?.personName ||
      vendorUser?.company_name ||
      vendorUser?.companyName ||
      vendorUser?.email ||
      null,
    [vendorUser]
  );

  const initials = useMemo(() => {
    const name = vendorDisplayName || "";
    if (!name) return "VU";
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [vendorDisplayName]);

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    []
  );

  const closeMenus = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

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

  return (
    <>
      <nav className="vu-nav">
        <div className="vu-nav-left">
          <Link href="/vendorUser" className="vu-logo">
            <span className="vu-logo-text">L1-L3</span>
          </Link>

          <div className="vu-search-wrap">
            <Search size={16} className="vu-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ticket number or title..."
              className="vu-search-input"
            />
            {search ? (
              <button type="button" className="vu-clear-btn" onClick={() => setSearch("")}>
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="vu-nav-right">
          <div className="vu-quick-actions">
            <button type="button" className="vu-action-btn" onClick={onGoAvailable}>
              Available to Claim
            </button>
            <button type="button" className="vu-action-btn ghost" onClick={onGoMyTickets}>
              <Ticket size={14} />
              My Tickets
            </button>
          </div>

          <div className="vu-nav-date">
            <Calendar size={13} />
            {currentDate}
          </div>

          <button
            type="button"
            className="vu-nav-icon-btn"
            aria-label="Notifications"
            onClick={onToggleNotifications}
          >
            <Bell size={16} />
            {unreadCount > 0 ? (
              <span className="vu-nav-bell-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
            ) : (
              <div className="vu-nav-bell-dot" />
            )}
          </button>

          <div className={`vu-nav-profile${dropdownOpen ? " open" : ""}`}>
            <button
              type="button"
              className="vu-nav-profile-trigger"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <div className="vu-nav-avatar">{initials}</div>
              <div className="vu-nav-profile-info">
                {vendorUser ? (
                  <>
                    <p className="vu-nav-profile-name">{vendorDisplayName || auth.userName}</p>
                    <p className="vu-nav-profile-role">Vendor User</p>
                  </>
                ) : (
                  <span className="vu-nav-profile-name">Loading...</span>
                )}
              </div>
              <ChevronDown size={14} className="vu-nav-chevron" />
            </button>

            {dropdownOpen ? (
              <div className="vu-dropdown">
                <Link
                  href="/vendorUser/myprofile"
                  className="vu-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User size={15} />
                  My Profile
                </Link>
                <div className="vu-dropdown-divider" />
                <button type="button" className="vu-dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      <nav className="vu-nav-mobile">
        <div className="vu-nav-mobile-brand">
          <div className="vu-nav-mobile-logo">VU</div>
          <span className="vu-nav-mobile-title">Vendor</span>
        </div>

        <button
          type="button"
          className="vu-nav-mobile-menu-btn"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileMenuOpen ? (
          <div className="vu-mobile-overlay" onClick={closeMenus}>
            <div className="vu-mobile-drawer" onClick={(event) => event.stopPropagation()}>
              <div className="vu-mobile-drawer-profile">
                <div className="vu-mobile-drawer-avatar">{initials}</div>
                <div>
                  <div className="vu-mobile-drawer-name">{vendorDisplayName || "Vendor User"}</div>
                  <div className="vu-mobile-drawer-role">Vendor User</div>
                </div>
              </div>

              <div className="vu-mobile-search">
                <Search size={16} className="vu-search-icon" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tickets"
                  className="vu-mobile-search-input"
                />
              </div>

              <div className="vu-mobile-nav-links">
                <button
                  type="button"
                  className="vu-mobile-nav-link"
                  onClick={() => {
                    onGoAvailable?.();
                    closeMenus();
                  }}
                >
                  Available to Claim
                </button>
                <button
                  type="button"
                  className="vu-mobile-nav-link"
                  onClick={() => {
                    onGoMyTickets?.();
                    closeMenus();
                  }}
                >
                  My Tickets
                </button>
                <button
                  type="button"
                  className="vu-mobile-nav-link"
                  onClick={() => {
                    onToggleNotifications?.();
                    closeMenus();
                  }}
                >
                  Notifications
                </button>
                <Link href="/vendorUser/myprofile" className="vu-mobile-nav-link" onClick={closeMenus}>
                  My Profile
                </Link>
              </div>

              <div className="vu-mobile-drawer-footer">
                <button type="button" className="vu-mobile-nav-link danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </nav>
    </>
  );
}
