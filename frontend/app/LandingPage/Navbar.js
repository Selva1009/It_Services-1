"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  X,
  User,
  Store,
  Check,
  ArrowRight,
  Home,
  Settings,
  Mail,
} from "lucide-react";
import { RiMenuUnfold2Fill } from "react-icons/ri";

export default function Navbar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSignupCardOpen, setSignupCardOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeLink, setActiveLink] = useState("");
  const router = useRouter();

  const handleLinkClick = (link) => {
    setActiveLink(link);
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const openSignupCard = () => setSignupCardOpen(true);
  const closeSignupCard = () => {
    setSignupCardOpen(false);
    setSelectedRole(null);
  };

  const handleContinue = () => {
    if (selectedRole === "Customer") {
      router.push("/customer-signup");
    } else if (selectedRole === "Vendor") {
      router.push("/vendor-signup");
    }
  };
  const navItems =
  [
    {
      name: "Home",
      icon: <Home className="h-4 w-4 sm:h-5 sm:w-5" />,
    },
    {
      name: "services",
      icon: <Settings className="h-4 w-4 sm:h-5 sm:w-5" />,
    },
    {
      name: "ContactSection",
      icon: <Mail className="h-4 w-4 sm:h-5 sm:w-5" />,
    },
  ]

  return (
    <>
      <div className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-16 2xl:px-20">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white rounded-[9px] sm:rounded-[11px] flex items-center justify-center border border-gray-200/80">
                  <img
                    src="/Logo.png"
                    alt="M-Place Logo"
                    className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain"
                  />
                </div>
              </div>
            </div>
            {/* Desktop Navigation */}
           
            <div className="hidden sm:flex items-center space-x-4 md:space-x-6 lg:space-x-8"> 
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.name === "Home" ? "/" : `/#${item.name}`}
                  className={`flex items-center gap-1 text-sm md:text-[14px] lg:text-[14px] xl:text-[14px] font-medium hover:text-blue-600 hover:border-b-2 ${
                    activeLink === item.name ? "border-b-2 border-blue-600" : ""
                  }`}
                  onClick={() => handleLinkClick(item.name)}
                >
                  <span className="hidden sm:inline-block">{item.icon}</span>
                  {item.name === "Home"
                    ? "Home"
                    : item.name === "services"
                    ? "Services"
                    : "Contact Us"}
                </Link>
              ))}
              <button
                className="rounded-full text-xs md:text-sm px-4 py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-80 transition duration-300"
                onClick={openSignupCard}
              >
                SIGN UP
              </button>
              <Link href="/SignIn">
                <button className="rounded-full text-xs md:text-sm px-4 py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-80 transition duration-300">
                  SIGN IN
                </button>
              </Link>
            </div>
            {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <RiMenuUnfold2Fill className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <div className="sm:hidden fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar Container */}
            <div className="absolute right-0 top-0 h-full w-64 sm:w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 sm:p-5 space-y-3">
                {[
                  {
                    name: "Home",
                    icon: <Home className="h-4 w-4 sm:h-5 sm:w-5" />,
                  },
                  {
                    name: "services",
                    icon: <Settings className="h-4 w-4 sm:h-5 sm:w-5" />,
                  },
                  {
                    name: "ContactSection",
                    icon: <Mail className="h-4 w-4 sm:h-5 sm:w-5" />,
                  },
                ].map(({ name, icon }) => (
                  <Link
                    key={name}
                    href={name === "Home" ? "/" : `/#${name}`}
                    className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg transition-colors ${
                      activeLink === name
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handleLinkClick(name)}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center ${
                        activeLink === name ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {icon}
                    </div>
                    <span className="font-medium text-sm sm:text-base">
                      {name === "Home"
                        ? "Home"
                        : name === "services"
                        ? "Services"
                        : "Contact"}
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Auth Buttons */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 border-t border-gray-100 bg-white">
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={() => {
                      openSignupCard();
                      setSidebarOpen(false);
                    }}
                    className="w-full justify-center rounded-lg sm:rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm hover:opacity-80 transition duration-300"
                  >
                    Sign Up
                  </button>
                  <Link href="/SignIn" className="block w-full">
                    <button
                      className="w-full justify-center rounded-lg sm:rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm hover:opacity-80 transition duration-300"
                      onClick={() => setSidebarOpen(false)}
                    >
                      Sign In
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Selection Modal */}
      {isSignupCardOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-4 backdrop-blur-sm">
          <div
            className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl w-full max-w-xs sm:max-w-sm md:max-w-md overflow-hidden shadow-2xl relative animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating Close Button */}
            <button
              onClick={closeSignupCard}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>

            {/* Glossy Header */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10"></div>
              <div className="relative p-6 sm:p-7 md:p-8 text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Welcome!
                </h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-500">
                  Choose how you&apos;d like to join us
                </p>
              </div>
            </div>

            {/* 3D Card Selection */}
            <div className="px-5 sm:px-6 md:px-8 pb-6 sm:pb-7 md:pb-8">
              <div className="grid gap-4 sm:gap-5 md:gap-6 mt-2 sm:mt-3 md:mt-4">
                {/* Customer Card */}
                <div
                  className={`relative p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 cursor-pointer group overflow-hidden ${
                    selectedRole === "Customer"
                      ? "ring-2 ring-blue-500 bg-white shadow-lg"
                      : "bg-gray-50 hover:shadow-md border border-gray-100"
                  }`}
                  onClick={() => setSelectedRole("Customer")}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div
                      className={`p-2 sm:p-3 rounded-lg ${
                        selectedRole === "Customer"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-600 group-hover:bg-blue-50"
                      }`}
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base md:text-[1.05rem] text-gray-900">
                        IT User Admin
                      </h3>
                      <p className="text-xs sm:text-sm md:text-sm text-gray-500 mt-0.5 sm:mt-1">
                        Discover amazing products tailored for you
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === "Customer"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 group-hover:border-blue-300"
                      }`}
                    >
                      {selectedRole === "Customer" && (
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      )}
                    </div>
                  </div>
                  {selectedRole === "Customer" && (
                    <div className="absolute inset-0 -z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-60"></div>
                    </div>
                  )}
                </div>

                {/* Vendor Card */}
                <div
                  className={`relative p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 cursor-pointer group overflow-hidden ${
                    selectedRole === "Vendor"
                      ? "ring-2 ring-indigo-500 bg-white shadow-lg"
                      : "bg-gray-50 hover:shadow-md border border-gray-100"
                  }`}
                  onClick={() => setSelectedRole("Vendor")}
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div
                      className={`p-2 sm:p-3 rounded-lg ${
                        selectedRole === "Vendor"
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-200 text-gray-600 group-hover:bg-indigo-50"
                      }`}
                    >
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base md:text-[1.05rem] text-gray-900">
                        Vendor Engineer Admin
                      </h3>
                      <p className="text-xs sm:text-sm md:text-sm text-gray-500 mt-0.5 sm:mt-1">
                        Grow your business with our marketplace
                      </p>
                    </div>
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedRole === "Vendor"
                          ? "border-indigo-500 bg-indigo-500"
                          : "border-gray-300 group-hover:border-indigo-300"
                      }`}
                    >
                      {selectedRole === "Vendor" && (
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      )}
                    </div>
                  </div>
                  {selectedRole === "Vendor" && (
                    <div className="absolute inset-0 -z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-60"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Animated Continue Button */}
              <button
                className={`w-full mt-6 sm:mt-7 md:mt-8 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl md:rounded-2xl font-medium text-white transition-all duration-300 flex items-center justify-center ${
                  selectedRole
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
                disabled={!selectedRole}
                onClick={handleContinue}
              >
                <span className="flex items-center text-xs sm:text-sm md:text-base">
                  Continue as {selectedRole || "..."}
                  <ArrowRight
                    className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-1 sm:ml-2 transition-all ${
                      selectedRole ? "group-hover:translate-x-1" : ""
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}