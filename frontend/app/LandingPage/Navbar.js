"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, User, Store, Check, ArrowRight, Home, Settings, Mail } from "lucide-react";
import { RiMenuUnfold2Fill } from "react-icons/ri";
import "./landingPage.css";

const NAV_ITEMS = [
  { name: "Home", href: "/", icon: Home, label: "Home" },
  { name: "services", href: "/#services", icon: Settings, label: "Services" },
  { name: "ContactSection", href: "/#ContactSection", icon: Mail, label: "Contact Us" },
];

export default function Navbar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSignupCardOpen, setSignupCardOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeLink, setActiveLink] = useState("");
  const router = useRouter();

  // Preload key auth routes so modal/button navigation feels instant.
  useEffect(() => {
    router.prefetch("/customer-signup");
    router.prefetch("/vendor-signup");
    router.prefetch("/SignIn");
  }, [router]);

  const handleLinkClick = (link) => {
    setActiveLink(link);
    if (isSidebarOpen) setSidebarOpen(false);
  };

  const closeSignupCard = () => {
    setSignupCardOpen(false);
    setSelectedRole(null);
  };

  const handleContinue = () => {
    if (selectedRole === "Customer") router.push("/customer-signup");
    if (selectedRole === "Vendor") router.push("/vendor-signup");
  };

  return (
    <>
      <header className="lp-navbar">
        <div className="lp-navbar-inner">
          <div className="lp-logo-wrap">
            <div className="lp-logo-shell">
              <div className="lp-logo-core">
                <img src="/Logo.png" alt="M-Place Logo" className="lp-logo-image" />
              </div>
            </div>
          </div>

          <nav className="lp-desktop-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`lp-nav-link ${activeLink === item.name ? "active" : ""}`}
                  onClick={() => handleLinkClick(item.name)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button className="lp-primary-btn" onClick={() => setSignupCardOpen(true)}>
              SIGN UP
            </button>
            <Link href="/SignIn" className="lp-primary-btn lp-signin-link">
              SIGN IN
            </Link>
          </nav>

          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lp-mobile-toggle"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={20} /> : <RiMenuUnfold2Fill size={20} />}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="lp-sidebar-overlay">
            <div className="lp-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
            <aside className="lp-sidebar-panel">
              <div className="lp-sidebar-head">
                <button onClick={() => setSidebarOpen(false)} className="lp-close-btn">
                  <X size={18} />
                </button>
              </div>

              <nav className="lp-sidebar-nav">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`lp-sidebar-link ${activeLink === item.name ? "active" : ""}`}
                      onClick={() => handleLinkClick(item.name)}
                    >
                      <span className="lp-sidebar-icon">
                        <Icon size={16} />
                      </span>
                      <span>{item.label === "Contact Us" ? "Contact" : item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="lp-sidebar-actions">
                <button
                  onClick={() => {
                    setSignupCardOpen(true);
                    setSidebarOpen(false);
                  }}
                  className="lp-primary-btn full"
                >
                  Sign Up
                </button>
                <Link
                  href="/SignIn"
                  className="lp-primary-btn full lp-signin-link"
                  onClick={() => setSidebarOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            </aside>
          </div>
        )}
      </header>

      {isSignupCardOpen && (
        <div className="tile-modal-overlay" onClick={closeSignupCard}>
          <div className="tile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tile-modal-close" onClick={closeSignupCard}>
              <X size={18} />
            </button>

            <div className="tile-modal-header">
              <h2>Welcome to IT Service</h2>
              <p>Pick your role and enter your workspace</p>
            </div>

            <div className="tile-carousel">
              {/* IT User Tile */}
              <div
                className={`tile-card ${selectedRole === "Customer" ? "selected" : ""}`}
                onClick={() => setSelectedRole("Customer")}
              >
                <div className="tile-icon">
                  <User size={28} />
                </div>
                <h3>IT User Admin</h3>
                <p>Manage IT services, requests, and workflows easily.</p>
                {/* {selectedRole === "Customer" && (
                  <div className="tile-check">
                    <Check size={16} /> Selected
                  </div>
                )} */}
              </div>

              {/* Vendor Tile */}
              <div
                className={`tile-card ${selectedRole === "Vendor" ? "selected" : ""}`}
                onClick={() => setSelectedRole("Vendor")}
              >
                <div className="tile-icon">
                  <Store size={28} />
                </div>
                <h3>Vendor Engineer Admin</h3>
                <p>Manage clients, showcase expertise, and grow business.</p>
                {/* {selectedRole === "Vendor" && (
                  <div className="tile-check">
                    <Check size={16} /> Selected
                  </div>
                )} */}
              </div>
            </div>

            <button
              className={`tile-continue-btn ${selectedRole ? "enabled" : ""}`}
              disabled={!selectedRole}
              onClick={handleContinue}
            >
              {selectedRole
                ? `Join as ${selectedRole === "Customer" ? "User" : "Vendor"}`
                : "Select a role to continue"}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
