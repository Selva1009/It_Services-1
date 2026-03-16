"use client";
import { API_BASE_URL } from "@/lib/api/config";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, UserPlus, Users,
  Bell, User, LogOut, Calendar,
  Menu, X, ChevronDown, UserRoundPen,
} from "lucide-react";
import Swal from "sweetalert2";
import "./CustomerAdminNavbar.css";

const PROFILE_SYNC_TTL_MS = 5 * 60 * 1000;

const getInitials = (first = "", last = "") =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

export default function CustomerAdminNavbar() {
  const pathname  = usePathname();
  const router    = useRouter();

  const [customer,        setCustomer]        = useState(null);
  const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  const getAuthToken = () =>
    localStorage.getItem("token")      ||
    localStorage.getItem("authToken")  ||
    localStorage.getItem("userToken")  ||
    sessionStorage.getItem("token");

  // ── Load profile from API using token ────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const loadCustomer = async () => {
      setLoading(true);
      setError("");

      // No customer object in localStorage — fetch purely from API via token
      const token =
        localStorage.getItem("token")     ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("userToken") ||
        sessionStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/user-admin/profile`, {
          cache:   "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const payload = await res.json();
          const latest  = payload.profile || payload.customer || payload.data || payload;
          if (process.env.NODE_ENV === "development") {
            console.log("[Navbar] API response keys:", Object.keys(latest));
            console.log("[Navbar] API response:", latest);
          }
          if (isMounted) setCustomer(latest);
        } else {
          console.error("[Navbar] Profile API returned:", res.status);
        }
      } catch (fetchErr) {
        console.error("Profile fetch failed:", fetchErr);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadCustomer();

    return () => { isMounted = false; };
  }, []);

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
      title:             "Are you sure want to logout?",
      imageUrl:          "/logout.gif",
      imageWidth:        127,
      imageHeight:       151,
      imageAlt:          "Logout",
      showCancelButton:  true,
      confirmButtonColor:"#3085D6",
      cancelButtonColor: "#3085D6",
      confirmButtonText: "<b>Yes</b>",
      cancelButtonText:  "<b>Cancel</b>",
      customClass:       { popup: "rounded-alert" },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
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

  // Resolve name from all possible key formats
  // DEBUG: remove this log once name shows correctly
  if (customer && process.env.NODE_ENV === "development") {
    console.log("[Navbar] customer keys:", Object.keys(customer));
    console.log("[Navbar] customer values:", customer);
  }

  // API returns first_name / last_name (snake_case)
  const firstName = customer?.first_name || customer?.firstName || "";
  const lastName  = customer?.last_name  || customer?.lastName  || "";
  const profileName = [firstName, lastName].filter(Boolean).join(" ").trim() || "";
  const initials = profileName
    ? profileName.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
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
                <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 10.5H12"       stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
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

        {/* Right: date · bell · profile */}
        <div className="ca-nav-right">

          {/* Date pill */}
          <div className="ca-nav-date">
            <Calendar size={13} />
            {currentDate}
          </div>

          {/* Bell */}
          <button className="ca-nav-icon-btn" aria-label="Notifications">
            <Bell size={16} />
            <div className="ca-nav-bell-dot" />
          </button>

          {/* Profile dropdown */}
          <div
            className={`ca-nav-profile${dropdownOpen ? " open" : ""}`}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <div className="ca-nav-avatar">{initials}</div>

            <div className="ca-nav-profile-info">
              {loading && <span className="ca-nav-profile-name">Loading…</span>}
              {error   && <span className="ca-nav-profile-name" style={{ color: "var(--red)" }}>{error}</span>}
              {!loading && !error && (
                <>
                  <span className="ca-nav-profile-name">{profileName || "Customer Admin"}</span>
                  <span className="ca-nav-profile-role">Customer Admin</span>
                </>
              )}
            </div>

            <ChevronDown size={14} className="ca-nav-chevron" />

            {/* Dropdown menu */}
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
              <path d="M4 15L9 4L14 15" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5H12"       stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
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

        {/* Slide-in drawer */}
        {mobileMenuOpen && (
          <div className="ca-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="ca-mobile-drawer" onClick={(e) => e.stopPropagation()}>

              {/* Profile strip */}
              <div className="ca-mobile-drawer-profile">
                <div className="ca-mobile-drawer-avatar">{initials}</div>
                <div>
                  <div className="ca-mobile-drawer-name">{profileName || "Customer Admin"}</div>
                  <div className="ca-mobile-drawer-role">Customer Admin</div>
                </div>
              </div>

              {/* Nav links */}
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

              {/* Footer */}
              <div className="ca-mobile-drawer-footer">
                <Link
                  href="/customer-admin/customerAdminProfile"
                  className="ca-mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserRoundPen size={17} />
                  My Profile
                </Link>
                <button className="ca-mobile-nav-link" style={{ color: "var(--red)" }} onClick={handleLogout}>
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