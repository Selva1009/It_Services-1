import React from "react";
import {
  Monitor,
  Cpu,
  Wifi,
  Video,
  ShieldCheck,
  HardDrive,
} from "lucide-react";
import "./landingPage.css";

const features = [
  {
    icon: Monitor,
    title: "Hardware Support",
    description:
      "Troubleshooting and diagnostics for desktops, laptops, printers, monitors, and peripherals.",
  },
  {
    icon: Cpu,
    title: "OS Support",
    description:
      "Complete OS troubleshooting, installation, configuration, updates, and performance optimization.",
  },
  {
    icon: Wifi,
    title: "Networking Support",
    description:
      "WiFi, LAN, VPN, proxy configuration, and slow internet troubleshooting.",
  },
  {
    icon: Video,
    title: "AV Conferencing Support",
    description:
      "Camera/mic setup, conference system troubleshooting, meeting connectivity support.",
  },
  {
    icon: ShieldCheck,
    title: "Antivirus & Malware Support",
    description:
      "Malware detection & removal, endpoint protection, and antivirus configuration.",
  },
  {
    icon: HardDrive,
    title: "Backup & Data Protection",
    description:
      "Backup setup, recovery assistance, and data protection troubleshooting.",
  },
];

export default function Home() {
  return (
    <div className="lp-root">
      
      {/* ── HERO ── */}
      <section className="lp-hero">
        
        {/* Decorative blobs */}
        <div className="lp-hero-blob lp-hero-blob--1" />
        <div className="lp-hero-blob lp-hero-blob--2" />
        <div className="lp-hero-blob lp-hero-blob--3" />

        <div className="lp-hero-content">

          {/* Left column */}
          <div className="lp-hero-left">
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot" />
              Enterprise IT Support Platform
            </div>

            <h1>
              Smart IT Support
              <br />
              for <span>Modern</span>
              <br />
              <span>Workplaces</span>
            </h1>

            <p>
              Resolve IT issues faster with structured support, intelligent
              ticketing, and expert escalation across hardware, networking,
              security, and infrastructure.
            </p>

            <div className="lp-hero-buttons">
              <a href="#ContactSection" className="lp-hero-btn-primary">
                Raise a Support Ticket
              </a>

              <a href="#plans" className="lp-hero-btn-ghost">
                View Support Plans
              </a>
            </div>

            <ul className="lp-hero-bullets">
              <li>Faster resolution</li>
              <li>Transparent ticket tracking</li>
              <li>L1–L2–L3 structured escalation</li>
              <li>On-Demand Support or AMC</li>
            </ul>
          </div>

          {/* Right column */}
          <div className="lp-hero-right">
            <div className="lp-hero-card">
              
              <div className="lp-hero-card-header">
                <span className="lp-hero-card-dot green" />
                <span className="lp-hero-card-dot yellow" />
                <span className="lp-hero-card-dot red" />
                <span className="lp-hero-card-title">
                  Live Support Dashboard
                </span>
              </div>

              <div className="lp-hero-stats-grid">
                <div className="lp-hero-stat-box">
                  <strong>99.8%</strong>
                  <span>Uptime SLA</span>
                </div>

                <div className="lp-hero-stat-box accent">
                  <strong>&lt; 2hr</strong>
                  <span>Avg Resolution</span>
                </div>

                <div className="lp-hero-stat-box">
                  <strong>500+</strong>
                  <span>Businesses</span>
                </div>

                <div className="lp-hero-stat-box teal">
                  <strong>L1–L3</strong>
                  <span>Escalation Tiers</span>
                </div>
              </div>

              <div className="lp-hero-ticket-list">
                {[
                  {
                    id: "#4821",
                    label: "VPN connectivity issue",
                    status: "Resolved",
                    color: "green",
                  },
                  {
                    id: "#4822",
                    label: "Laptop screen flickering",
                    status: "In Progress",
                    color: "yellow",
                  },
                  {
                    id: "#4823",
                    label: "Malware detected on endpoint",
                    status: "Escalated",
                    color: "red",
                  },
                ].map((t) => (
                  <div key={t.id} className="lp-hero-ticket">
                    <span className={`lp-ticket-dot ${t.color}`} />
                    <span className="lp-ticket-id">{t.id}</span>
                    <span className="lp-ticket-label">{t.label}</span>
                    <span className={`lp-ticket-status ${t.color}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">

        <div className="lp-features-head">
          <span className="lp-section-label">What We Offer</span>

          <h2>One Platform for All IT Support Needs</h2>

          <p>
            MPLACE provides a centralized platform where businesses can raise
            support requests, track issues, and resolve technical problems quickly.
          </p>
        </div>

        <div className="lp-features-grid">
          {features.map((f, idx) => {
            const Icon = f.icon;
            const num = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={f.title}
                className="lp-feature-card"
                style={{ "--card-index": idx }}
              >
                <div className="lp-fc-top">
                  <span className="lp-fc-num">{num}</span>

                  <div className="lp-fc-icon">
                    <Icon size={20} />
                  </div>
                </div>

                <h3>{f.title}</h3>
                <p>{f.description}</p>

                <div className="lp-fc-line"></div>
              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
}