"use client";

import Link from "next/link";
import { Linkedin } from "lucide-react";
import "./landingPage.css";

export default function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-grid">

        {/* Brand */}
        <div className="lp-footer-brand">
          <div className="lp-footer-logo-shell">
            <div className="lp-footer-logo-core">
              <img src="/Logo.png" alt="MPlace Logo" className="lp-footer-logo" />
            </div>
          </div>
          <p>
            Connecting businesses with trust and transparency.
            Empowering procurement and IT support workflows across India.
          </p>
        </div>

        {/* Legal */}
        <div className="lp-footer-legal">
          <h4>Legal & Policies</h4>
          <ul>
            <li>
              <Link href="/policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/legal">Legal Disclaimer</Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="lp-footer-social">
          <h4>Stay Connected</h4>
          <p>Follow us on LinkedIn for updates, insights, and more.</p>
          <a
            href="https://www.linkedin.com/company/teckost-it-services-pvt-ltd/posts/?feedView=all&viewAsMember=true"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin size={22} />
          </a>
        </div>

      </div>

      <div className="lp-footer-bottom">
        <span>© {new Date().getFullYear()} MPlace. All Rights Reserved.</span>
        <span>Teckost IT Services Pvt. Ltd.</span>
      </div>
    </footer>
  );
}