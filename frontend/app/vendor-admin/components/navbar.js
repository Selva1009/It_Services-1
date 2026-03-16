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
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";

const getInitials = (first = "", last = "") =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "VA";

export default function Navbar() {
  const NOTIFICATION_LIMIT = 50;
  const { auth, getAuthToken: getAuthTokenFromContext, setVendor: setAuthVendor } = useAuth();
  const [vendor, setVendor] = useState(auth.vendor || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [vendorAdminID, setVendorAdminID] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const getAuthToken = () =>
    getAuthTokenFromContext() ||
    sessionStorage.getItem("token");

  const NOTIFICATION_LIMIT = 50;

  const vendorDisplayName =
    vendor?.personName ||
    vendor?.name ||
    vendor?.companyName ||
    vendor?.company_name ||
    vendor?.vendor_name ||
    vendor?.email ||
    null;

  useEffect(() => {
    let isMounted = true;

    const loadVendor = async () => {
      setLoading(true);

      // Show cached data immediately
      const raw = localStorage.getItem("vendor");
      if (raw) {
        try {
          const cached = JSON.parse(raw);
          if (isMounted) {
            setVendor(cached);
            setVendorAdminID(cached.id || cached._id);
          }
        } catch (_) {}
      }

      // Always fetch fresh from API
      const token = getAuthToken();
      if (!token) { setLoading(false); return; }

      try {
        const storedVendor = sessionStorage.getItem("vendor");
        const vendorData = storedVendor ? JSON.parse(storedVendor) : auth.vendor;
        if (!vendorData) {
          return;
        }
        if (isMounted) {
          setVendor(vendorData);
          setVendorAdminID(vendorData.id);
        }

        if (!vendorData?.id) {
          return;
        }

        const lastSync = Number(sessionStorage.getItem("vendorProfileLastSync") || 0);
        const shouldSync = Date.now() - lastSync > PROFILE_SYNC_TTL_MS;

        if (shouldSync) {
          try {
            const authToken = getAuthToken();
            const response = await fetch(
              `${API_BASE_URL}/api/vendors/profile`,
              {
                cache: "no-store",
                headers: authToken
                  ? { Authorization: `Bearer ${authToken}` }
                  : undefined,
              }
            );

            if (response.ok) {
              const payload = await response.json();
              const latestVendor = payload.vendor || payload;
              if (isMounted) {
                setVendor(latestVendor);
                setVendorAdminID(latestVendor.id);
                setAuthVendor(latestVendor);
                sessionStorage.setItem("vendor", JSON.stringify(latestVendor));
                sessionStorage.setItem("vendorProfileLastSync", String(Date.now()));
              }
            }
            if (isMounted) {
              setVendor(latest);
              setVendorAdminID(latest.id || latest._id);
              localStorage.setItem("vendor", JSON.stringify(latest));
            }
            fetched = true;
            break;
          }
        } catch (_) {}
      }

      if (!fetched) {
        console.error("[VendorNavbar] All profile endpoints failed");
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

  const fetchNotifications = async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/vendor-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken() || sessionStorage.getItem("vendorToken") || ""}`,
          },
          body: JSON.stringify({ vendorAdminID, limit: NOTIFICATION_LIMIT }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(
        data.notifications.filter((n) => n.status === "unread").length
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (!vendorAdminID) return;

    const fetchUnread = async () => {
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
      title:             "Are you sure want to logout?",
      imageUrl:          "/logout.gif",
      imageWidth:        127,
      imageHeight:       151,
      imageAlt:          "Logout",
      showCancelButton:  true,
      confirmButtonColor:"#10b981",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "<b>Yes</b>",
      cancelButtonText:  "<b>Cancel</b>",
      customClass:       { popup: "rounded-alert" },
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        router.push("/SignIn");
      }
    });
  };

  const menuItems = [
    { href: "/vendor-admin",                   icon: <LayoutDashboard size={16} />, label: "Dashboard"    },
    { href: "/vendor-admin/addUser",           icon: <UserPlus         size={16} />, label: "Add User"     },
    { href: "/vendor-admin/usersprofile",      icon: <Users            size={16} />, label: "User Profiles"},
  ];

  const currentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Resolve name — API may return firstName/first_name
  const firstName = vendor?.firstName || vendor?.first_name || vendor?.FirstName || "";
  const lastName  = vendor?.lastName  || vendor?.last_name  || vendor?.LastName  || "";
  const profileName = [firstName, lastName].filter(Boolean).join(" ").trim() || vendor?.name || "";
  const initials    = profileName
    ? profileName.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
    : "VA";

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ════════════════ DESKTOP NAVBAR ════════════════ */}
      <nav className="va-nav">

        {/* Left: logo + divider + links */}
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

          {/* Center: Nav Items (Desktop) */ }
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-700">
            <Link
              href="/vendor-admin"
              className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-300 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/vendor-admin/addUser"
              className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-300 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Link>
            <Link
              href="/vendor-admin/usersprofile"
              className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-300 transition-colors"
            >
              <Users className="w-4 h-4" />
              Users Profiles
            </Link>
          </div>
        </div>

        {/* Right: date · bell · profile */}
        <div className="va-nav-right">

          {/* Vendor Admin Name & Dropdown */ }
          <div className="relative">
            <div
              className="group flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-300 transition-colors cursor-pointer"
              onClick={ () => setDropdownOpen(!dropdownOpen) }
            >
              <User
                size={ 32 }
                className="text-gray-800 group-hover:text-blue-700 transition-colors"
              />
              <div className="hidden sm:block text-[14px]">
                { loading && <span>Loading...</span> }
                { error && <span className="text-red-500">{ error }</span> }
                { vendor && (
                  <span>
                    { vendorDisplayName || `${vendor.firstName || ""} ${vendor.lastName || ""}`.trim() || "Vendor Admin" }
                    <br />
                    <p className="text-[#999999] text-[12px]">Vendor Admin</p>
                  </span>
                ) }
              </div>
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
                  <p className="font-medium">
                    { vendorDisplayName || `${vendor.firstName || ""} ${vendor.lastName || ""}`.trim() || "Vendor Admin" }
                  </p>
                  <p className="text-sm text-gray-500">Vendor Admin</p>
                </div>
              </div>

              {/* Navigation Links */ }
              <div className="p-4 space-y-2">
                <Link
                  href="/vendor-admin"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                  onClick={ () => setMobileMenuOpen(false) }
                >
                  <LayoutDashboard size={ 20 } />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/vendor-admin/addUser"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                  onClick={ () => setMobileMenuOpen(false) }
                >
                  <UserPlus size={ 20 } />
                  <span>Add User</span>
                </Link>
                <Link
                  href="/vendor-admin/usersprofile"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                  onClick={ () => setMobileMenuOpen(false) }
                >
                  <Users size={ 20 } />
                  <span>Users Profiles</span>
                </Link>
              </div>

              {/* Bottom Section */ }
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                <div className="space-y-2">
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