"use client";

import { API_BASE_URL } from "@/lib/api/config";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";
import "./VendorAdminNavbar.css";

const PROFILE_SYNC_TTL_MS = 5 * 60 * 1000;
const NOTIFICATION_LIMIT  = 50;

export default function Navbar() {
  const { auth, getAuthToken: getAuthTokenFromContext, setVendor: setAuthVendor } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const [vendor,         setVendor]         = useState(auth.vendor || null);
  const [loading,        setLoading]        = useState(true);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [vendorAdminID,  setVendorAdminID]  = useState(null);

  const getAuthToken = () =>
    getAuthTokenFromContext() || sessionStorage.getItem("token");

  const vendorDisplayName =
    vendor?.personName    ||
    vendor?.name          ||
    vendor?.companyName   ||
    vendor?.company_name  ||
    vendor?.vendor_name   ||
    vendor?.email         ||
    null;

  // ── Load vendor profile ───────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadVendor = async () => {
      setLoading(true);
      try {
        const storedVendor = sessionStorage.getItem("vendor");
        const vendorData   = storedVendor ? JSON.parse(storedVendor) : auth.vendor;

        if (vendorData && isMounted) {
          setVendor(vendorData);
          setVendorAdminID(vendorData.id);
        }

        const lastSync   = Number(sessionStorage.getItem("vendorProfileLastSync") || 0);
        const shouldSync = !vendorData || Date.now() - lastSync > PROFILE_SYNC_TTL_MS;

        if (shouldSync) {
          const token = getAuthToken();
          if (token) {
            const res = await fetch(`${API_BASE_URL}/api/vendors/profile`, {
              cache:   "no-store",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const payload = await res.json();
              const latest  = payload.vendor || payload.profile || payload.data || payload;
              if (isMounted) {
                setVendor(latest);
                setVendorAdminID(latest.id);
                setAuthVendor(latest);
                sessionStorage.setItem("vendor", JSON.stringify(latest));
                sessionStorage.setItem("vendorProfileLastSync", String(Date.now()));
              }
            }
          }
        }
      } catch (err) {
        console.error("[VendorNavbar] load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadVendor();
    return () => { isMounted = false; };
  }, []);

  // ── Notification unread count ─────────────────────────────────────────────
  useEffect(() => {
    if (!vendorAdminID) return;

    const fetchUnread = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications/vendor-admin`, {
          method:  "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:  `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ vendorAdminID, limit: NOTIFICATION_LIMIT }),
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.notifications.filter((n) => n.status === "unread").length);
        }
      } catch (err) {
        console.error("Notifications fetch failed:", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [vendorAdminID]);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e) => {
      if (!e.target.closest(".va-nav-profile")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropdownOpen]);

  const isActive = (path) => pathname === path;

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    Swal.fire({
      title:              "Are you sure want to logout?",
      imageUrl:           "/logout.gif",
      imageWidth:         127,
      imageHeight:        151,
      imageAlt:           "Logout",
      showCancelButton:   true,
      reverseButtons:     true,
      confirmButtonColor: "#10b981",
      cancelButtonColor:  "#94a3b8",
      confirmButtonText:  "<b>Yes</b>",
      cancelButtonText:   "<b>Cancel</b>",
      customClass:        { popup: "rounded-alert" },
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        router.push("/SignIn");
      }
    });
  };

  const menuItems = [
    { href: "/vendor-admin",              icon: <LayoutDashboard size={16} />, label: "Dashboard"     },
    { href: "/vendor-admin/addUser",      icon: <UserPlus        size={16} />, label: "Add User"      },
    { href: "/vendor-admin/usersprofile", icon: <Users           size={16} />, label: "User Profiles" },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const firstName   = vendor?.firstName || vendor?.first_name || "";
  const lastName    = vendor?.lastName  || vendor?.last_name  || "";
  const profileName = [firstName, lastName].filter(Boolean).join(" ").trim() || vendorDisplayName || "";
  const initials    = profileName
    ? profileName.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
    : "VA";

  return (
    <>
      {/* ════════════════ DESKTOP NAVBAR ════════════════ */}
      <nav className="va-nav">

        <div className="va-nav-left">
          <Link href="/vendor-admin" className="va-logo">
            <div className="va-logo-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10.5H12"       stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="va-logo-text">M-Place</span>
          </Link>

          <div className="va-nav-divider" />

          <nav className="va-nav-links">
            {menuItems.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`va-nav-link${isActive(item.href) ? " active" : ""}`}
              >
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

          <button
            className="va-nav-icon-btn"
            aria-label="Notifications"
            onClick={() => router.push("/vendor-admin/AdminNotification")}
          >
            <Bell size={16} />
            {unreadCount > 0
              ? <span className="va-nav-bell-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
              : <div className="va-nav-bell-dot" />
            }
          </button>

          <div
            className={`va-nav-profile${dropdownOpen ? " open" : ""}`}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <div className="va-nav-avatar">{initials}</div>

            <div className="va-nav-profile-info">
              {loading ? (
                <span className="va-nav-profile-name">Loading…</span>
              ) : (
                <>
                  <span className="va-nav-profile-name">{profileName || "Vendor Admin"}</span>
                  <span className="va-nav-profile-role">Vendor Admin</span>
                </>
              )}
            </div>

            <ChevronDown size={14} className="va-nav-chevron" />

            {dropdownOpen && (
              <div className="va-dropdown">
                <Link
                  href="/vendor-admin/myProfile"
                  className="va-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
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

      {/* ════════════════ MOBILE NAVBAR ════════════════ */}
      <nav className="va-nav-mobile">
        <div className="va-nav-mobile-brand">
          <div className="va-nav-mobile-logo">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5H12"       stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="va-nav-mobile-title">Vendor Admin</span>
        </div>

        <button
          className="va-nav-mobile-menu-btn"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileMenuOpen && (
          <div className="va-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="va-mobile-drawer" onClick={(e) => e.stopPropagation()}>

              <div className="va-mobile-drawer-profile">
                <div className="va-mobile-drawer-avatar">{initials}</div>
                <div>
                  <div className="va-mobile-drawer-name">{profileName || "Vendor Admin"}</div>
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
                <Link
                  href="/vendor-admin/myProfile"
                  className="va-mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserRoundPen size={17} />
                  My Profile
                </Link>
                <button
                  className="va-mobile-nav-link"
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