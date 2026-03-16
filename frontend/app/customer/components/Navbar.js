"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  LogOut,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { API_BASE_URL } from "@/lib/api/config";
import {
  CUSTOMER_USER_UPDATED_EVENT,
} from "@/lib/events";
import { useAuth } from "@/app/contexts/AuthContext";

const PROFILE_SYNC_TTL_MS = 5 * 60 * 1000;

const Navbar = ({
  setSearchQuery,
  setCategoryFilter,
  disableSearch,
}) => {
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState(null);
  const router = useRouter();
  const { auth, getAuthToken: getAuthTokenFromContext, setCustomerUser: setAuthCustomerUser } = useAuth();
  console.log(auth,"auth")
  const getAuthToken = useCallback(
    () =>
      getAuthTokenFromContext() ||
      sessionStorage.getItem("token"),
    [getAuthTokenFromContext]
  );
  const name=auth?.userName
  const readCustomerUser = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (auth.customerUser) return auth.customerUser;

    const storedCustomerUser = sessionStorage.getItem("customerUser");
    if (!storedCustomerUser) return null;

    try {
      return JSON.parse(storedCustomerUser);
    } catch (error) {
      console.error("Failed to parse customer user from localStorage:", error);
      return null;
    }
  }, []);

  const syncCustomerState = useCallback(() => {
    const currentUser = readCustomerUser();
    setCustomerUser(currentUser);
  }, [readCustomerUser]);

  const customerDisplayName =
    customerUser?.name ||
    customerUser?.personName ||
    customerUser?.company_name ||
    customerUser?.companyName ||
    customerUser?.email ||
    null;

  useEffect(() => {
    syncCustomerState();

    const handleStorageChange = () => {
      syncCustomerState();
    };

    const handleCustomerUserUpdated = () => {
      syncCustomerState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncCustomerState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CUSTOMER_USER_UPDATED_EVENT, handleCustomerUserUpdated);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CUSTOMER_USER_UPDATED_EVENT, handleCustomerUserUpdated);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [readCustomerUser, syncCustomerState]);

  useEffect(() => {
    let isMounted = true;

    const fetchLatestCustomer = async () => {
      const currentUser = readCustomerUser();
      if (!currentUser?.id) return;
      const lastSync = Number(
        sessionStorage.getItem("customerUserProfileLastSync") || 0
      );
      const shouldSync = Date.now() - lastSync > PROFILE_SYNC_TTL_MS;
      if (!shouldSync) return;

      try {
        const authToken = getAuthToken();
        const response = await fetch(
          `${API_BASE_URL}/api/customer-users/profile`,
          {
            headers: authToken
              ? { Authorization: `Bearer ${authToken}` }
              : undefined,
          }
        );

        if (!response.ok) return;

        const latestUser = await response.json();
        const mergedUser = {
          ...currentUser,
          ...latestUser,
        };

        if (!isMounted) return;

        setCustomerUser(mergedUser);
        setAuthCustomerUser(mergedUser);
        sessionStorage.setItem("customerUser", JSON.stringify(mergedUser));
        sessionStorage.setItem(
          "customerUserProfileLastSync",
          String(Date.now())
        );
      } catch (error) {
        console.error("Failed to fetch latest customer profile for navbar:", error);
      }
    };

    void fetchLatestCustomer();

    return () => {
      isMounted = false;
    };
  }, [getAuthToken, readCustomerUser]);

  // Logout function
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
        sessionStorage.clear();
        window.dispatchEvent(new Event(CUSTOMER_USER_UPDATED_EVENT));
        router.push("/SignIn");
      }
    });
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

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
                  { name }
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
    </>
  );
};

export default Navbar;
