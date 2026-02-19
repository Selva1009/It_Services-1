"use client";
import { API_BASE_URL } from "@/lib/api/config";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Activity,
  Bell,
  User,
  LayoutDashboard,
  LogOut,
  Calendar,
  Menu,
  X,
  Clipboard,
  UserRoundPen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

export default function CustomerAdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const getAuthToken = () => localStorage.getItem("token") || sessionStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const loadCustomer = async () => {
      setLoading(true);
      setError("");

      const customerData = localStorage.getItem("customer");
      if (!customerData) {
        setLoading(false);
        return;
      }

      try {
        const parsedCustomer = JSON.parse(customerData);
        if (isMounted) {
          setCustomer(parsedCustomer);
        }

        if (!parsedCustomer?.id) {
          setLoading(false);
          return;
        }

        try {
          const authToken = getAuthToken();
          const response = await fetch(
            `${API_BASE_URL}/api/customers/profile`,
            {
              cache: "no-store",
              headers: authToken
                ? { Authorization: `Bearer ${authToken}` }
                : undefined,
            }
          );

          if (response.ok) {
            const payload = await response.json();
            const latestCustomer = payload.customer || payload;
            if (isMounted) {
              setCustomer(latestCustomer);
              localStorage.setItem("customer", JSON.stringify(latestCustomer));
            }
          }
        } catch (fetchError) {
          console.error("Failed to fetch latest customer admin details:", fetchError);
        }
      } catch (parseError) {
        console.error("Invalid customer data in localStorage:", parseError);
        setError("Failed to load customer profile");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCustomer();

    const handleStorage = () => {
      void loadCustomer();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isActive = (path) => pathname === path;

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
    {
      href: "/customer-admin/AdminNotifications",
      icon: <Bell className="h-5 w-5" />,
      label: "Orders",
    },
    {
      href: "/customer-admin/PoAutomation",
      icon: <Clipboard className="h-5 w-5" />,
      label: "PO Automation",
    },
  ];

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden sm:flex sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur h-20 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl shadow-lg bg-gradient-to-br from-blue-600 to-indigo-500 p-1">
            <div className="w-full h-full bg-white rounded-xl flex items-center justify-center border border-gray-300 shadow-inner">
              <img
                src="/Logo.png"
                alt="M-Place Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 text-sm hover:bg-blue-50 hover:text-blue-700 hover:border hover:border-blue-300 transition-colors"
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT: Date & Customer Admin Profile */}
        <div className="flex items-center space-x-6">
          {/* Date */}
          <div className="hidden sm:flex items-center">
            <Calendar className="text-black-900" />
            <span className="ml-2">{currentDate}</span>
          </div>

          <div className="h-10 w-[1px] bg-gray-300"></div>

          {/* Customer Admin Dropdown */}
          <div className="relative">
            <div
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <User size={32} className="text-gray-800" />
              <div className="hidden sm:block text-[16px]">
                {loading && <span>Loading...</span>}
                {error && <span className="text-red-500">{error}</span>}
                {customer && (
                  <span>
                    <span className="text-[14px]">
                      {customer.firstName} {customer.lastName}
                    </span>
                    <br />
                    <p className="text-[#999999] text-[12px]">Customer Admin</p>
                  </span>
                )}
              </div>
            </div>

            {dropdownOpen && (
              <div className="absolute top-[80px] left-[-4px] mt-[-12px] w-56 bg-white shadow-xl rounded-xl z-50 border border-gray-200">
                <ul className="py-2 text-sm text-gray-700 font-medium">
                  <li>
                    <Link
                      href="/customer-admin/customerAdminProfile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                    >
                      <User size={20} className="text-gray-600" />
                      <span>My Profile</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut size={20} className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="sm:hidden fixed top-0 left-0 w-full h-16 bg-white border-b shadow-sm flex items-center justify-between px-4 z-50">
        {/* Left: Brand Name and Mobile Menu Button */}
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

        {/* Right: Menu Button */}
        <button
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 mt-16 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Profile Info */}
              <div className="flex items-center gap-4 p-4 border-b">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={24} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {customer?.firstName} {customer?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Customer Admin</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isActive(item.href) ? "bg-gray-100" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Bottom Section */}
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
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
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
