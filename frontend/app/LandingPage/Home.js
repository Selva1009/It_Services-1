import React from "react";

const features = [
  {
    title: "Hardware Support",
    description:
      "Troubleshooting and diagnostics for desktops, laptops, printers, monitors, and peripherals.",
  },
  {
    title: "OS Support",
    description:
      "Complete OS troubleshooting, installation, configuration, updates, and performance optimization.",
  },
  {
    title: "Networking Support",
    description:
      "WiFi, LAN, VPN, proxy configuration, and slow internet troubleshooting.",
  },
  {
    title: "AV Conferencing Support",
    description:
      "Camera/mic setup, conference system troubleshooting, meeting connectivity support.",
  },
  {
    title: "Antivirus & Malware Support",
    description:
      "Malware detection & removal, endpoint protection, and antivirus configuration.",
  },
  {
    title: "Backup & Data Protection",
    description:
      "Backup setup, recovery assistance, and data protection troubleshooting.",
  },
];

export default function Home() {
  return (
    <div className="lp-root">
      {/* HERO SECTION */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <h1>Smart IT Support Platform for Modern Workplaces</h1>
          <p>
            Resolve IT issues faster with structured support, intelligent ticketing,
            and expert escalation across hardware, networking, security, and
            infrastructure.
          </p>
          <ul className="lp-hero-bullets">
            <li>Faster resolution</li>
            <li>Transparent ticket tracking</li>
            <li>L1–L2–L3 structured escalation</li>
            <li>On-Demand Support or AMC</li>
          </ul>
          <div className="lp-hero-buttons">
            <a href="#ContactSection">Raise a Support Ticket</a>
            <a href="#plans">View Support Plans</a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="lp-features">
        <div className="lp-features-head">
          <h2>One Platform for All IT Support Needs</h2>
          <p>
            MPACE provides a centralized platform where businesses can raise support
            requests, track issues, and resolve technical problems quickly.
          </p>
        </div>

        <div className="lp-features-grid">
          {features.map((f) => (
            <div key={f.title} className="lp-feature-card">
              <div className="lp-feature-icon">✔</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      {/* <section className="lp-cta">
        <h2>Experience Reliable IT Support for Your Business</h2>
        <div className="lp-cta-buttons">
          <a href="#ContactSection">Raise a Support Ticket</a>
          <a href="#ContactSection">Request AMC Proposal</a>
        </div>
      </section> */}
    </div>
  );
}