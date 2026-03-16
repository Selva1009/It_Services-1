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
  UserRoundPen
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";

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

        {/* RIGHT: Date & Profile */}
        <div className="flex items-center space-x-6">
          {/* Date */}
          <div className="hidden sm:flex items-center">
            <Calendar className="text-black-900" />
            <span className="ml-2">{currentDate}</span>
          </div>

          <div className="h-10 w-[1px] bg-gray-300" />

          {/* Profile Dropdown */}
          <div className="relative">
            <div
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <User size={32} className="text-gray-800" />
              <div className="hidden sm:block">
                {loading ? (
                  <span className="text-sm">Loading...</span>
                ) : (
                  <>
                    <p className="text-[14px] font-medium">
                      {customerName}
                    </p>
                    <p className="text-[#999999] text-[12px] capitalize">
                      {customerRole?.replace(/_/g, " ")}
                    </p>
                  </>
                )}
              </div>
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

      {/* Mobile Navbar */}
      <nav className="sm:hidden fixed top-0 left-0 w-full h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg shadow-md bg-gradient-to-br from-blue-600 to-indigo-500 p-1">
            <div className="w-full h-full bg-white rounded-lg flex items-center justify-center border border-gray-300 shadow-inner">
              <img
                src="/Logo.png"
                alt="M-Place Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
          </div>
          <span className="font-medium text-sm">Customer Admin</span>
        </div>

        <button
          className="ca-nav-mobile-menu-btn"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Slide Menu */}
        {mobileMenuOpen && (
          <div className="ca-mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="ca-mobile-drawer" onClick={(e) => e.stopPropagation()}>

              {/* Profile strip */}
              <div className="ca-mobile-drawer-profile">
                <div className="ca-mobile-drawer-avatar">{initials}</div>
                <div>
                  <p className="font-medium">
                    {customerName || "Admin"}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {customerRole?.replace(/_/g, " ") || "IT Admin"}
                  </p>
                </div>
              </div>

              {/* Nav Links */}
              <div className="p-4 space-y-2">
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

              {/* Bottom Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                <div className="space-y-2">
                  <Link
                    href="/customer-admin/customerAdminProfile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserRoundPen size={20} />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-100 text-red-600 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </nav>
    </>
  );
}