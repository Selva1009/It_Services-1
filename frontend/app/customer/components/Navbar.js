"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, User, LogOut, Calendar, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api/config";
import { CUSTOMER_USER_UPDATED_EVENT } from "@/lib/events";
import { useAuth } from "@/app/contexts/AuthContext";
import "./customerNavbar.css";

const PROFILE_SYNC_TTL_MS = 5 * 60 * 1000;

const Navbar = ({ setSearchQuery, setCategoryFilter, disableSearch }) => {
  const [search,         setSearch]         = useState("");
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerUser,   setCustomerUser]   = useState(null);
  const router = useRouter();
  const { auth, getAuthToken: getAuthTokenFromContext, setCustomerUser: setAuthCustomerUser } = useAuth();

  const getAuthToken = useCallback(
    () => getAuthTokenFromContext() || sessionStorage.getItem("token"),
    [getAuthTokenFromContext]
  );

  const name = auth?.userName;

  const readCustomerUser = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (auth.customerUser) return auth.customerUser;
    const stored = sessionStorage.getItem("customerUser");
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
  }, [auth.customerUser]);

  const syncCustomerState = useCallback(() => {
    setCustomerUser(readCustomerUser());
  }, [readCustomerUser]);

  const customerDisplayName =
    customerUser?.name       ||
    customerUser?.personName ||
    customerUser?.companyName ||
    customerUser?.email      ||
    null;

  const initials = customerDisplayName
    ? customerDisplayName.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
    : "CU";

  // ── Sync on mount & events ──────────────────────────────────────────────
  useEffect(() => {
    syncCustomerState();
    const onStorage    = () => syncCustomerState();
    const onUpdated    = () => syncCustomerState();
    const onVisibility = () => { if (document.visibilityState === "visible") syncCustomerState(); };

    window.addEventListener("storage",                   onStorage);
    window.addEventListener(CUSTOMER_USER_UPDATED_EVENT, onUpdated);
    document.addEventListener("visibilitychange",        onVisibility);
    return () => {
      window.removeEventListener("storage",                   onStorage);
      window.removeEventListener(CUSTOMER_USER_UPDATED_EVENT, onUpdated);
      document.removeEventListener("visibilitychange",        onVisibility);
    };
  }, [syncCustomerState]);

  // ── Profile sync ────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      const current = readCustomerUser();
      if (!current?.id) return;
      const lastSync   = Number(sessionStorage.getItem("customerUserProfileLastSync") || 0);
      if (Date.now() - lastSync <= PROFILE_SYNC_TTL_MS) return;
      try {
        const token = getAuthToken();
        const res   = await fetch(`${API_BASE_URL}/api/customer-users/profile`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok || !isMounted) return;
        const latest = await res.json();
        const merged = { ...current, ...latest };
        setCustomerUser(merged);
        setAuthCustomerUser(merged);
        sessionStorage.setItem("customerUser",                  JSON.stringify(merged));
        sessionStorage.setItem("customerUserProfileLastSync",   String(Date.now()));
      } catch (err) {
        console.error("Profile sync failed:", err);
      }
    };
    void fetchLatest();
    return () => { isMounted = false; };
  }, [getAuthToken, readCustomerUser]);

  // ── Close dropdown on outside click ────────────────────────────────────
  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e) => { if (!e.target.closest(".cu-nav-profile")) setDropdownOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropdownOpen]);

  // ── Logout ──────────────────────────────────────────────────────────────
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
        window.dispatchEvent(new Event(CUSTOMER_USER_UPDATED_EVENT));
        router.push("/SignIn");
      }
    });
  };

  const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <>
      {/* ════════════════ DESKTOP NAVBAR ════════════════ */}
      <nav className="cu-nav">

        {/* Left: logo + divider + search */}
        <div className="cu-nav-left">
          <Link href="/customer/products" className="cu-logo">
            <div className="cu-logo-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10.5H12"       stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="cu-logo-text">M-Place</span>
          </Link>

          <div className="cu-nav-divider" />

          {!disableSearch && (
            <div className="cu-search-wrap">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search for products..."
                className="cu-search-input"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSearchQuery?.(e.target.value);
                }}
              />
            </div>
          )}
        </div>

        {/* Right: date · profile */}
        <div className="cu-nav-right">

          <div className="cu-nav-date">
            <Calendar size={13} />
            {currentDate}
          </div>

          <div
            className={`cu-nav-profile${dropdownOpen ? " open" : ""}`}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <div className="cu-nav-avatar">{initials}</div>

            <div className="cu-nav-profile-info">
              <span className="cu-nav-profile-name">{name || customerDisplayName || "Customer"}</span>
              <span className="cu-nav-profile-role">Customer User</span>
            </div>

            <ChevronDown size={14} className="cu-nav-chevron" />

            {dropdownOpen && (
              <div className="cu-dropdown">
                <Link
                  href="/customer/CustomerProfile"
                  className="cu-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
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

      {/* ════════════════ MOBILE NAVBAR ════════════════ */}
      <nav className="cu-nav-mobile">
        <div className="cu-nav-mobile-brand">
          <div className="cu-nav-mobile-logo">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5H12"       stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="cu-nav-mobile-title">M-Place</span>
        </div>

        <button
          className="cu-nav-mobile-menu-btn"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {mobileMenuOpen && (
          <div className="cu-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="cu-mobile-drawer" onClick={(e) => e.stopPropagation()}>

              <div className="cu-mobile-drawer-profile">
                <div className="cu-mobile-drawer-avatar">{initials}</div>
                <div>
                  <div className="cu-mobile-drawer-name">{name || customerDisplayName || "Customer"}</div>
                  <div className="cu-mobile-drawer-role">Customer User</div>
                </div>
              </div>

              <div className="cu-mobile-nav-links">
                <Link
                  href="/customer/CustomerProfile"
                  className="cu-mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={17} />
                  My Profile
                </Link>
              </div>

              <div className="cu-mobile-drawer-footer">
                <button className="cu-mobile-nav-link danger" onClick={handleLogout}>
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
};

export default Navbar;