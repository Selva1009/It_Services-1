"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  User,
  BellRing,
  Calendar,
  UserRoundPen,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Footer from "../LandingPage/Footer";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  fetchVendorUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/services/notificationsService";

export default function DashboardLayout({ id, children }) {
  const NOTIFICATION_LIMIT = 50;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { auth, getAuthToken, setVendorUser: setAuthVendorUser, clearAuth } = useAuth();
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");

  const router = useRouter();
  useEffect(() => {
    ["/", "/vendorUser", "/vendorUser/myprofile"].forEach((path) => router.prefetch(path));
  }, []);

  const vendorUser = auth.vendorUser;
  const loading = !vendorUser;
  const vendorUserId = useMemo(
    () => id || auth.vendorUserId || auth.userId || vendorUser?.id || null,
    [id, auth.vendorUserId, auth.userId, vendorUser]
  );

  const vendorUserDisplayName = useMemo(
    () =>
      vendorUser?.name ||
      vendorUser?.personName ||
      vendorUser?.companyName ||
      vendorUser?.company_name ||
      vendorUser?.email ||
      null,
    [vendorUser]
  );

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const fetchNotifications = useCallback(async () => {
    if (!vendorUserId) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }

    try {
      const data = await fetchVendorUserNotifications({
        vendorUserId,
        limit: NOTIFICATION_LIMIT,
      });

      if (!data?.notifications) {
        return;
      }

      const formattedNotifications = data.notifications
        .map((notif) => ({
          ...notif,
          read: notif.status === "read",
          time: new Date(notif.created_at).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "Asia/Kolkata",
            hour12: true,
          }),
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setNotifications((prev) =>
        JSON.stringify(prev) === JSON.stringify(formattedNotifications)
          ? prev
          : formattedNotifications
      );
    } catch {
      // Ignore notification errors
    }
  }, [vendorUserId]);

  useEffect(() => {
    if (!vendorUserId) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [vendorUserId, fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((notif) =>
      filter === "read" ? notif.read : !notif.read
    );
  }, [filter, notifications]);

  const markAsRead = async (notifId) => {
    if (!notifId) {
      return;
    }

    try {
      await markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notifId
            ? { ...notif, status: "read", read: true }
            : notif
        )
      );
    } catch {
      // Ignore mark as read errors
    }
  };

  const markAllAsRead = async () => {
    if (!vendorUserId) {
      setError("Vendor user not found. Please log in again.");
      return;
    }

    try {
      await markAllNotificationsRead(vendorUserId);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          status: "read",
          read: true,
        }))
      );
    } catch {
      setError("An error occurred while marking notifications as read.");
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleNotification = () => {
    setNotificationOpen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "auto";
      return next;
    });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? "hidden" : "auto";
      return next;
    });
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
        router.push("/");
      }
    });
  };

  return (
    <div className="flex flex-col h-20 min-h-screen bg-gray-100" >
      {/* Desktop Header */ }
      <div className="hidden sm:flex bg-white shadow px-6 py-2 justify-between items-center border-b fixed top-0 left-0 right-0 z-10">
        {/* Left Section - Logo and Navigation */ }
        <div className="flex items-center space-x-6">
          {/* Logo */ }
          <Link href="/vendorUser" >
            <div className="cursor-pointer w-16 h-16 rounded-xl shadow-lg bg-gradient-to-br from-blue-600 to-indigo-500 p-1">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center border border-gray-300 shadow-inner">
                <img
                  src="/Logo.png"
                  alt="M-Place Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
          </Link>

          {/* Navigation Links removed for vendor user */ }
        </div>

        {/* Right Section - Calendar, Notification, User Profile */ }
        <div className="flex items-center space-x-6">
          {/* Date */ }
          <div className="flex items-center">
            <Calendar className="text-black-900" />
            <span className="ml-2">{ currentDate }</span>
          </div>
          <div className="w-[1px] h-10 bg-gray-200"></div>

          {/* Notifications */ }
          <div className="relative">
            <button
              className="relative cursor-pointer"
              onClick={ toggleNotification }
            >
              <BellRing className="text-black-900 mt-1 w-6 h-6" />
              { notifications.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  { notifications.length }
                </span>
              ) }
            </button>
          </div>

          {/* Divider */ }
          <div className="w-[1px] h-10 bg-gray-200"></div>

          {/* User Dropdown */ }
          <div
            className="relative flex items-center cursor-pointer"
            onClick={ toggleDropdown }
          >
            <User size={ 32 } className="text-black-900" />
            <div className="ml-2 text-[14px]">
              { loading && <span>Loading...</span> }
              { error && <span className="text-red-500">{ error }</span> }
              { vendorUser && <span>{ vendorUserDisplayName || "Vendor User" }</span> } <br />{ " " }
              <span className="text-[12px] text-[#999999]">Vendor User</span>
            </div>
          </div>

          { dropdownOpen && (
            <div className="absolute right-[-38] top-[80px] w-56 bg-white shadow-xl rounded-xl z-50 border border-gray-200">
              <ul className="py-2 text-sm text-gray-700 font-medium">
                <li
                  onClick={ () => {
                    router.push(`/vendorUser/myprofile`);
                    setDropdownOpen(false);
                  } }
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <UserRoundPen className="text-gray-600" size={ 20 } />
                  <span>My Profile</span>
                </li>
                <li
                  onClick={ handleLogout }
                  className="px-4 py-3 hover:bg-red-50 text-red-600 cursor-pointer flex items-center gap-3 transition-colors"
                >
                  <LogOut className="text-red-500" size={ 20 } />
                  <span>Logout</span>
                </li>
              </ul>
            </div>
          ) }
        </div>
      </div>

      {/* Mobile Header */ }
      <div className="sm:hidden fixed top-0 left-0 w-full h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 z-50">
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
          <span className="font-medium text-sm">Vendor User</span>
        </div>

        {/* Right: Menu Button */ }
        <button
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          onClick={ toggleMobileMenu }
        >
          { mobileMenuOpen ? <X size={ 24 } /> : <Menu size={ 24 } /> }
        </button>

        {/* Mobile Menu */ }
        { mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 mt-16 backdrop-blur-sm"
            onClick={ toggleMobileMenu }
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
                    { vendorUserDisplayName || "Vendor User" }
                  </p>
                  <p className="text-sm text-gray-500">Vendor User</p>
                </div>
              </div>

              {/* Navigation Links removed for vendor user */ }

              {/* Bottom Section */ }
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                <div className="space-y-2">
                  <button
                    onClick={ () => {
                      router.push(`/vendorUser/myprofile`);
                      toggleMobileMenu();
                    } }
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 w-full text-left"
                  >
                    <UserRoundPen size={ 20 } />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={ () => {
                      toggleMobileMenu();
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
      </div>

      {/* Notification Sidebar */ }
      { notificationOpen && (
        <div className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white shadow-lg p-4 border-l z-50 overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Notifications</h2>
            <X
              size={ 24 }
              className="cursor-pointer"
              onClick={ toggleNotification }
            />
          </div>

          <hr className="mb-4" />

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <select
                className="p-2 border rounded-md"
                value={ filter }
                onChange={ (e) => setFilter(e.target.value) }
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
            <button
              className="bg-[#06436B] text-white p-2 rounded-md"
              onClick={ markAllAsRead }
            >
              Mark all as read
            </button>
          </div>

          <hr className="mb-4" />

          { filteredNotifications.length === 0 ? (
            <p className="text-gray-500 text-center">No new notifications</p>
          ) : (
            <ul>
              { filteredNotifications.map((notif, index) => (
                <li
                  key={ notif.id || index }
                  className={ `p-3 mb-2 rounded-md cursor-pointer ${notif.read
                    ? "bg-gray-100 text-gray-600"
                    : "bg-gray-300 text-black"
                    }` }
                >
                  <div>
                    <p className="text-sm font-semibold">{ notif.message }</p>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    <div className="inline-block bg-[#EFF3F5] rounded-md">
                      { notif.time }
                    </div>
                  </div>
                  <div className="flex justify-between -mt-4">
                    <button
                      onClick={ (e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      } }
                      className="text-blue-500 text-sm ml-[230px]"
                    >
                      Mark as Read
                    </button>
                  </div>
                  <hr className="my-2" />
                </li>
              )) }
            </ul>
          ) }
        </div>
      ) }

      {/* Page Content */ }
      <div className="p-6 sm:p-8 bg-gray-50 flex-1 mt-16 sm:mt-20">
        { children }
      </div>
      <Footer />
    </div>
  );
}
