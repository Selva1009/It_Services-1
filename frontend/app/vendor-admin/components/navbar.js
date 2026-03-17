"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
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
import { fetchVendorProfile } from "@/app/services/profileService";
import { fetchVendorAdminNotifications } from "@/app/services/notificationsService";
import "./VendorAdminNavbar.css";

const PROFILE_SYNC_TTL_MS = 5 * 60 * 1000;
const NOTIFICATION_LIMIT  = 50;

export default function Navbar() {
  const {
    auth,
    clearAuth,
    getAuthToken: getAuthTokenFromContext,
    setVendor: setAuthVendor,
  } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
useEffect(() => {
  ["/vendor-admin", "/vendor-admin/addUser", "/vendor-admin/usersprofile", "/vendor-admin/myProfile"]
    .forEach((path) => router.prefetch(path));
}, []);


  const [vendor,         setVendor]         = useState(auth.vendor || null);
  const [loading,        setLoading]        = useState(true);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [vendorAdminID,  setVendorAdminID]  = useState(null);
  const lastSyncRef = useRef(0);

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

  // ── Load vendor profile ───────────────────────────────────────────────────
  // useEffect(() => {
  //   let isMounted = true;

  //   const loadVendor = async () => {
  //     setLoading(true);
  //     try {
  //       const vendorData = auth.vendor || null;
  //       if (vendorData && isMounted) {
  //         setVendor(vendorData);
  //         setVendorAdminID(vendorData.id);
  //       }

  //       const shouldSync = !vendorData || Date.now() - lastSyncRef.current > PROFILE_SYNC_TTL_MS;
  //       const token = getAuthTokenFromContext();
  //       if (shouldSync && token) {
  //         const payload = await fetchVendorProfile(token);
  //         const latest  = payload?.vendor || payload?.profile || payload?.data || payload;
  //         if (latest && isMounted) {
  //           setVendor(latest);
  //           setVendorAdminID(latest.id);
  //           setAuthVendor(latest);
  //           lastSyncRef.current = Date.now();
  //         }
  //       }
  //     } catch (err) {
  //       console.error("[VendorNavbar] load error:", err);
  //     } finally {
  //       if (isMounted) setLoading(false);
  //     }
  //   };

  //   void loadVendor();
  //   return () => { isMounted = false; };
  // }, [auth.vendor, getAuthTokenFromContext, setAuthVendor]);

  // ── Notification unread count ─────────────────────────────────────────────
  useEffect(() => {
    if (!vendorAdminID) return;

    const fetchUnread = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const token = getAuthTokenFromContext();
        if (!token) return;
        const data = await fetchVendorAdminNotifications({
          token,
          vendorAdminId: vendorAdminID,
          limit: NOTIFICATION_LIMIT,
        });
        const list = data?.notifications || [];
        setUnreadCount(list.filter((n) => n.status === "unread").length);
      } catch (err) {
        console.error("Notifications fetch failed:", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [vendorAdminID, getAuthTokenFromContext]);

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
      reverseButtons:     false,
      confirmButtonColor: "#1a56db",
      cancelButtonColor:  "#ef4444",
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
    { href: "/vendor-admin",              icon: <LayoutDashboard size={16} />, label: "Dashboard"     },
    { href: "/vendor-admin/addUser",      icon: <UserPlus        size={16} />, label: "Add User"      },
    { href: "/vendor-admin/usersprofile", icon: <Users           size={16} />, label: "User Profiles" },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

 // Replace with
const initials = useMemo(() => {
  const name = vendorDisplayName || "";
  if (!name) return "VA";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}, [vendorDisplayName]) ;

  return (
    <>
      {/* ════════════════ DESKTOP NAVBAR ════════════════ */}
      <nav className="va-nav">

        <div className="va-nav-left">
         <Link href="/customer-admin/customerAdminDashboard" className="ca-logo">
           
            <span className="ca-logo-text">L1-L3</span>
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
             
                { vendorDisplayName ? (
                  <>
                    <p className="text-[14px] font-medium">{ vendorDisplayName }</p>
                    <p className="text-[#999999] text-[12px]">Vendor Admin</p>
                  </>
                ) : (
                  <span className="text-sm">Loading...</span>
                ) }
           
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
