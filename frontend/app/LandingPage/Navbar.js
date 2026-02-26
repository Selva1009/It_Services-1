"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, User, Store, Check, ArrowRight, Home, Settings, Mail } from "lucide-react";
import { RiMenuUnfold2Fill } from "react-icons/ri";

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
        <div className="lp-modal-overlay" onClick={closeSignupCard}>
          <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeSignupCard} className="lp-modal-close">
              <X size={16} />
            </button>

            <div className="lp-modal-head">
              <h2>Welcome!</h2>
              <p>Choose how you&apos;d like to join us</p>
            </div>

            <div className="lp-role-grid">
              <button
                className={`lp-role-card ${selectedRole === "Customer" ? "selected" : ""}`}
                onClick={() => setSelectedRole("Customer")}
              >
                <span className="lp-role-icon">
                  <User size={20} />
                </span>
                <span className="lp-role-copy">
                  <strong>IT User Admin</strong>
                  <small>Discover products tailored for you</small>
                </span>
                <span className="lp-check-wrap">
                  {selectedRole === "Customer" && <Check size={12} />}
                </span>
              </button>

              <button
                className={`lp-role-card ${selectedRole === "Vendor" ? "selected" : ""}`}
                onClick={() => setSelectedRole("Vendor")}
              >
                <span className="lp-role-icon">
                  <Store size={20} />
                </span>
                <span className="lp-role-copy">
                  <strong>Vendor Engineer Admin</strong>
                  <small>Grow your business with our marketplace</small>
                </span>
                <span className="lp-check-wrap">
                  {selectedRole === "Vendor" && <Check size={12} />}
                </span>
              </button>
            </div>

            <button
              className={`lp-continue-btn ${selectedRole ? "ready" : ""}`}
              disabled={!selectedRole}
              onClick={handleContinue}
            >
              Continue as {selectedRole || "..."} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
