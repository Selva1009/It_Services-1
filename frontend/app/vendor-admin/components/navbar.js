"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState,useEffect } from "react";
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

export default function Navbar() {
  const { auth, clearAuth } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();


useEffect(() => {
  ["/SignIn", "/vendor-admin", "/vendor-admin/addUser", "/vendor-admin/usersprofile", "/vendor-admin/myProfile"]
    .forEach((path) => router.prefetch(path));
}, []);
  const vendorDisplayName = useMemo(
    () =>
      auth.vendor?.personName ||
      auth.vendor?.name ||
      auth.vendor?.companyName ||
      auth.vendor?.company_name ||
      auth.vendor?.vendor_name ||
      auth.vendor?.email ||
      null,
    [auth.vendor]
  );

  // Notifications intentionally handled elsewhere to avoid redundant polling.

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
        clearAuth();
        router.push("/SignIn");
      }
    });
  };

  if (!auth.vendor) return null;

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

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
                { vendorDisplayName ? (
                  <>
                    <p className="text-[14px] font-medium">{ vendorDisplayName }</p>
                    <p className="text-[#999999] text-[12px]">Vendor Admin</p>
                  </>
                ) : (
                  <span className="text-sm">Loading...</span>
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
                    { vendorDisplayName || `${auth.vendor?.firstName || ""} ${auth.vendor?.lastName || ""}`.trim() || "Vendor Admin" }
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
