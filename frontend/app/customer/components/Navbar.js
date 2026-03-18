"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  LogOut,
  Calendar,
  Menu,
  X,
  Bell,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/services/notificationsService";

const Navbar = ({
  setSearchQuery,
  setCategoryFilter,
  disableSearch,
}) => {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  useEffect(() => {
    ["/SignIn", "/customer/products", "/customer/CustomerProfile"].forEach((path) => router.prefetch(path));
  }, []);
  const { auth, clearAuth } = useAuth();

  const customerUser = auth.customerUser;
  const customerDisplayName = useMemo(
    () =>
      customerUser?.name ||
      customerUser?.personName ||
      customerUser?.company_name ||
      customerUser?.companyName ||
      customerUser?.email ||
      null,
    [customerUser]
  );

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

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const loadNotifications = async () => {
    try {
      const token = auth?.authToken;
      if (!token) return;
      const data = await fetchNotifications({ token, limit: 50 });
      const list = data?.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [auth?.authToken]);

  const filteredNotifications = useMemo(() => {
    if (notifFilter === "all") return notifications;
    return notifications.filter((n) => (notifFilter === "read" ? Boolean(n.is_read) : !n.is_read));
  }, [notifFilter, notifications]);

  const handleMarkRead = async (id) => {
    try {
      const token = auth?.authToken;
      if (!token || !id) return;
      await markNotificationRead(id, token);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = auth?.authToken;
      if (!token) return;
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications", err);
    }
  };

  return (
    <>
      {/* Desktop Navbar */ }
      <nav className="hidden sm:flex fixed top-0 left-0 w-full bg-white shadow-md p-4 h-20 items-center justify-between z-50">
        {/* Left Section - Logo */ }
        <div className="flex items-center space-x-4">
          <Link href="/customer/products" >
            <div className="cursor-pointer w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-blue-600 to-indigo-500 p-1">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center border border-gray-300 shadow-inner">
                <img
                  src="/Logo.png"
                  alt="M-Place Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
          </Link>
        </div>

        {/* Middle Section - Search and Filters */ }
        <div className="flex items-center flex-1 mx-8">
          {/* Search Bar */ }
          { !disableSearch && (
            <div className="flex items-center w-full max-w-md p-2 border-2 hover:border-blue-500 rounded-lg">
              <Search className="text-gray-500 mr-2" size={ 24 } />
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full bg-transparent outline-none text-sm"
                value={ search }
                onChange={ (e) => {
                  setSearch(e.target.value);
                  setSearchQuery && setSearchQuery(e.target.value);
                } }
              />
            </div>
          ) }

        </div>

        {/* Right Section - Profile, Date, Cart */ }
        <div className="flex items-center space-x-4">
          {/* Date Section */ }
          <div className="flex items-center">
            <Calendar className="text-black" />
            <span className="ml-2">{ currentDate }</span>
          </div>

          {/* Divider */ }
          <div className="w-[1px] h-10 bg-gray-200"></div>

          <button
            className="relative p-2 rounded-md hover:bg-gray-100"
            onClick={() => setNotificationOpen((prev) => !prev)}
            aria-label="Notifications"
          >
            <Bell className="text-black" size={22} />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>

          {/* User Profile Section */ }
          <div className="flex relative space-x-2">
            <button onClick={ () => setDropdownOpen(!dropdownOpen) }>
              <User className="cursor-pointer text-black" size={ 32 } />
            </button>
            { dropdownOpen && (
              <div className="absolute right-[-2] left-[-4] top-full mt-4 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                <ul className="py-2 text-sm text-gray-700 font-medium">
                  <li>
                    <Link
                      href="/customer/CustomerProfile"
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
            <div className="mt-1">
              { customerUser && (
                <span className="text-sm">
                  { auth.userName }
                  <p className="text-[#999999] text-[12px] -mt-1">
                    Customer User
                  </p>
                </span>
              ) }
            </div>
          </div>

          {/* Cart removed */ }
        </div>
      </nav>

      {/* Mobile Navbar */ }
      <nav className="sm:hidden fixed top-0 left-0 w-full bg-white shadow-md p-4 h-16 flex items-center justify-between z-50">
        {/* Left Section - Logo */ }
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg shadow-md bg-gradient-to-br from-blue-600 to-indigo-500 p-1">
            <div className="w-full h-full bg-white rounded-lg flex items-center justify-center border border-gray-300 shadow-inner">
              <img
                src="/Logo.png"
                alt="M-Place Logo"
                className="w-7 h-7 object-contain"
              />
            </div>
          </div>
          <span className="font-medium text-sm">Customer</span>
        </div>

        {/* Right Section - Menu Button */ }
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */ }
          <button
            onClick={ () => setMobileMenuOpen(!mobileMenuOpen) }
            className="p-2 rounded-md hover:bg-gray-100"
          >
            { mobileMenuOpen ? <X size={ 24 } /> : <Menu size={ 24 } /> }
          </button>
        </div>
      </nav>

      {/* Mobile Menu */ }
      { mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40 mt-16 backdrop-blur-sm"
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
                  { customerDisplayName || "Customer User" }
                </p>
                <p className="text-sm text-gray-500">Customer User</p>
              </div>
            </div>

            {/* Navigation Links */ }
            <div className="p-4 space-y-2">
              <Link
                href="/customer/CustomerProfile"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 w-full text-left"
                onClick={ () => setMobileMenuOpen(false) }
              >
                <User size={ 20 } />
                <span>My Profile</span>
              </Link>

              {/* Cart and PO tracking removed */ }
            </div>



            {/* Bottom Section */ }
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
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
      ) }

      {notificationOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setNotificationOpen(false)}
          />
          <aside className="fixed top-0 right-0 w-full sm:w-[360px] h-full bg-white z-50 border-l shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-base font-semibold">Notifications</h3>
              <button onClick={() => setNotificationOpen(false)} className="text-xl leading-none">×</button>
            </div>
            <div className="flex items-center gap-2 p-3 border-b">
              <select
                className="flex-1 border rounded-md px-2 py-2 text-sm"
                value={notifFilter}
                onChange={(e) => setNotifFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold px-3 py-2 rounded-md border bg-gray-50"
              >
                Mark all as read
              </button>
            </div>

            <div className="overflow-y-auto p-3 space-y-2">
              {filteredNotifications.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No notifications found.</p>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3 ${item.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"}`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{item.message}</p>
                    <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                      <span>{item.ticket_number || "-"}</span>
                      <span>{new Date(item.created_at).toLocaleString("en-IN")}</span>
                    </div>
                    {!item.is_read ? (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="mt-2 text-[11px] px-2 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200"
                      >
                        Mark as Read
                      </button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
