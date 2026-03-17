"use client";

import { API_BASE_URL } from "@/lib/api/config";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";
import "./customerAdminNavbar.css";

const PROFILE_SYNC_TTL_MS = 5 * 60 * 1000;

export default function CustomerAdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { auth, getAuthToken: getAuthTokenFromContext, setCustomer: setAuthCustomer, clearAuth } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const customerName =
    auth.customer?.name ||
    auth.customer?.firstName ||
    auth.customer?.first_name ||
    auth.customer?.companyName ||
    auth.customer?.company_name ||
    auth.customer?.vendor_name ||
    auth.customer?.email ||
    null;

  const customerRole = auth.role || auth.customer?.role || null;

  const getAuthToken = () =>
    getAuthTokenFromContext() || sessionStorage.getItem("token");

  // ── Sync profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const syncProfile = async () => {
      if (!auth.customer?.id) return;

      const lastSync = Number(sessionStorage.getItem("customerProfileLastSync") || 0);
      const shouldSync = Date.now() - lastSync > PROFILE_SYNC_TTL_MS;
      if (!shouldSync) return;

      setLoading(true);
      try {
        const authToken = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/user-admin/profile`, {
          cache: "no-store",
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        });

        if (response.ok && isMounted) {
          const payload = await response.json();
          const latestCustomer = payload.customer || payload;
          setAuthCustomer(latestCustomer);
          sessionStorage.setItem("customer", JSON.stringify(latestCustomer));
          sessionStorage.setItem("customerProfileLastSync", String(Date.now()));
        }
      } catch (err) {
        console.error("Failed to sync customer profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void syncProfile();
    return () => { isMounted = false; };
  }, [auth.customer?.id]);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e) => {
      if (!e.target.closest(".ca-nav-profile")) setDropdownOpen(false);
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
        clearAuth();
        router.push("/SignIn");
      }
    });
  };

  const menuItems = [
    { href: "/customer-admin/customerAdminDashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard"     },
    { href: "/customer-admin/add-user",               icon: <UserPlus         size={16} />, label: "Add User"      },
    { href: "/customer-admin/user-profile",           icon: <Users            size={16} />, label: "User Profiles" },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const initials = customerName
    ? customerName.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
    : "CA";

  return (
    <>
      {/* ════════════════ DESKTOP NAVBAR ════════════════ */}
      <nav className="ca-nav">

        {/* Left: logo + divider + links */}
        <div className="ca-nav-left">
          <Link href="/customer-admin/customerAdminDashboard" className="ca-logo">
            <div className="ca-logo-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 10.5H12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span className="ca-logo-text">M-Place</span>
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

          <div
            className={`ca-nav-profile${dropdownOpen ? " open" : ""}`}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <div className="ca-nav-avatar">{initials}</div>

            <div className="ca-nav-profile-info">
              {loading ? (
                <span className="ca-nav-profile-name">Loading…</span>
              ) : (
                <>
                  <span className="ca-nav-profile-name">{customerName || "Customer Admin"}</span>
                  <span className="ca-nav-profile-role">
                    {customerRole?.replace(/_/g, " ") || "Customer Admin"}
                  </span>
                </>
              )}
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

      {/* ════════════════ MOBILE NAVBAR ════════════════ */}
      <nav className="ca-nav-mobile">
        <div className="ca-nav-mobile-brand">
          <div className="ca-nav-mobile-logo">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 10.5H12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <span className="ca-nav-mobile-title">Customer Admin</span>
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
                    {customerRole?.replace(/_/g, " ") || "Customer Admin"}
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