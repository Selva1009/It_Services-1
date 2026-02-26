"use client";

import { API_BASE_URL } from "@/lib/api/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Users,
  List,
  BarChart,
  User,
  LogOut,
  Calendar,
  LayoutDashboard,
  UserPlus,
  UserRoundPen,
  Menu,
  Bell,
  Clipboard,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";

const PROFILE_SYNC_TTL_MS = 5 * 60 * 1000;

export default function Navbar() {
  const NOTIFICATION_LIMIT = 50;
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [vendorAdminID, setVendorAdminID] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  useEffect(() => {
    let isMounted = true;

    const loadVendor = async () => {
      setLoading(true);
      setError("");

      try {
        const storedVendor = localStorage.getItem("vendor");
        if (!storedVendor) {
          return;
        }

        const vendorData = JSON.parse(storedVendor);
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
                localStorage.setItem("vendor", JSON.stringify(latestVendor));
                sessionStorage.setItem("vendorProfileLastSync", String(Date.now()));
              }
            }
          } catch (fetchError) {
            console.error("Failed to fetch latest vendor details:", fetchError);
          }
        }
      } catch (err) {
        setError("Failed to load vendor details");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadVendor();

    const handleStorage = () => {
      void loadVendor();
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
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
            Authorization: `Bearer ${getAuthToken() || localStorage.getItem("vendorToken") || ""}`,
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
    fetchNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [vendorAdminID]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure want to logout?",
      imageUrl: "/logout.gif",
      imageWidth: 127,
      imageHeight: 151,
      imageAlt: "Logout Image",
      showCancelButton: true,
      confirmButtonColor: "#3085D6",
      cancelButtonColor: "#3085D6",
      confirmButtonText: "<b>Yes</b>",
      cancelButtonText: "<b>Cancel</b>",
      customClass: {
        confirmButton: "swal-button",
        cancelButton: "swal-button",
        popup: "rounded-alert",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        router.push("/SignIn");
      }
    });
  };

  if (!vendor) return null;

  return (
    <>
      {/* Desktop Navbar */ }
      <nav className="hidden sm:flex fixed top-0 left-0 w-full h-20 bg-white border-b shadow-sm items-center justify-between px-4 sm:px-6 z-50">
        {/* Left: Brand Name */ }
        <div className="flex items-center gap-4">
          <Link href="/vendor-admin" >
            <div className="cursor-pointer w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg bg-gradient-to-br from-blue-600 to-indigo-500 p-1">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center border border-gray-300 shadow-inner">
                <img
                  src="/Logo.png"
                  alt="M-Place Logo"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                />
              </div>
            </div>
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
            <Link
              href="/vendor-admin/products"
              className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-300 transition-colors"
            >
              <List className="w-4 h-4" />
              Vendor Product View
            </Link>
            <Link
              href="/vendor-admin/AdminNotification"
              className="relative flex items-center gap-2 p-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-300 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Orders</span>
            </Link>
            <Link
              href="/vendor-admin/PoTracking"
              className="relative flex items-center gap-2 p-2 rounded-md text-sm hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-300 transition-colors"
            >
              <Clipboard className="w-4 h-4" />
              <span>Po Tracking</span>
            </Link>
          </div>
        </div>

        {/* Right: Date, Notifications and Vendor Profile */ }
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Date (Desktop) */ }
          <div className="hidden sm:flex items-center gap-2">
            <Calendar className="text-black-900" />
            <span className="ml-2">{ currentDate }</span>
          </div>
          <div className="hidden sm:block h-10 w-[1px] bg-gray-300"></div>

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
                    { vendor.firstName } { vendor.lastName }
                    <br />
                    <p className="text-[#999999] text-[12px]">Vendor Admin</p>
                  </span>
                ) }
              </div>
            </div>

            {/* Dropdown Menu */ }
            { dropdownOpen && (
              <div className="absolute right-0 left-2 top-full mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                <ul className="py-2 text-sm text-gray-700 font-medium">
                  <li>
                    <Link
                      href="/vendor-admin/myProfile"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <User size={ 20 } className="text-gray-600" />
                      <span>My Profile</span>
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={ handleLogout }
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut size={ 20 } className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) }
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */ }
      <nav className="sm:hidden fixed top-0 left-0 w-full h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 z-50">
        {/* Left: Brand Name and Mobile Menu Button */ }
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

          <span className="font-medium text-sm">Vendor Admin</span>
        </div>

        {/* Right: Menu Button */ }
        <button
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          onClick={ () => setMobileMenuOpen(!mobileMenuOpen) }
        >
          { mobileMenuOpen ? <X size={ 24 } /> : <Menu size={ 24 } /> }
        </button>

        {/* Mobile Menu */ }
        { mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 mt-16 backdrop-blur-sm"
            onClick={ () => setMobileMenuOpen(false) }
          >
            <div
              className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl"
              onClick={ (e) => e.stopPropagation() }
            >
              {/* Profile Info */ }
              <div className="flex items-center gap-4 p-4 border-b">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={ 24 } className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">
                    { vendor.firstName } { vendor.lastName }
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
                <Link
                  href="/vendor-admin/products"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                  onClick={ () => setMobileMenuOpen(false) }
                >
                  <List size={ 20 } />
                  <span>Vendor Product View</span>
                </Link>
                <Link
                  href="/vendor-admin/AdminNotification"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                  onClick={ () => setMobileMenuOpen(false) }
                >
                  <Bell size={ 20 } />
                  <span>Orders</span>
                </Link>
                <Link
                  href="/vendor-admin/PoTracking"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                  onClick={ () => setMobileMenuOpen(false) }
                >
                  <Clipboard size={ 20 } />
                  <span>Po Tracking</span>
                </Link>
              </div>

              {/* Bottom Section */ }
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                <div className="space-y-2">
                  <Link
                    href="/vendor-admin/myProfile"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
                    onClick={ () => setMobileMenuOpen(false) }
                  >
                    <UserRoundPen size={ 20 } />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={ () => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    } }
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-100 text-red-600 w-full text-left"
                  >
                    <LogOut size={ 20 } />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) }
      </nav>
    </>
  );
}
