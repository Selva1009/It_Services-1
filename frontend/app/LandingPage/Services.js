import React from "react";
import { ArrowRight, CheckCircle2, Zap, Shield, Users } from "lucide-react";
import "./landingPage.css";

const servicesData = [
  {
    title: "Platform for Seamless Connections",
    description:
      "MPlace serves as a platform connecting customers and suppliers without any monetary benefits. If clients opt for our services to facilitate purchase order processing and supplier follow-ups for deliveries, a service fee applies.",
    tag: "Core Platform",
  },
  {
    title: "Direct Transactions with Transparency",
    description:
      "Customers place orders and make payments directly to suppliers, with no contractual obligation to our company. We do not engage in trading or add margins to generate revenue.",
    tag: "Transparency",
  },
  {
    title: "Ensuring Trust and Credibility",
    description:
      "To ensure trust and credibility, we conduct due diligence on both customers and suppliers during onboarding, requiring a nominal registration fee of INR 1,000 for validation.",
    tag: "Trust & Safety",
  },
];

const highlights = [
  { icon: Zap, label: "Fast Onboarding" },
  { icon: Shield, label: "Verified Suppliers" },
  { icon: Users, label: "Direct Connections" },
  { icon: CheckCircle2, label: "Zero Hidden Fees" },
];

const Services = () => {
  return (
    <section className="lp-services" id="services">
      <div className="lp-services-bg-circle" />

      <div className="lp-services-inner">

        {/* Left sticky text panel */}
        <div className="lp-services-left">
          <span className="lp-section-label">Our Services</span>
          <h2 className="lp-services-title">Connecting Businesses with Trust</h2>
          <p className="lp-services-sub">
            Connecting customers and suppliers with trust, efficiency, and
            reliable onboarding — no hidden charges, no middlemen.
          </p>

          <div className="lp-services-highlights">
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="lp-svc-highlight">
                <span className="lp-svc-highlight-icon"><Icon size={15} /></span>
                {label}
              </div>
            ))}
          </div>

          <a href="#ContactSection" className="lp-services-cta-btn">
            Get Started <ArrowRight size={16} />
          </a>
        </div>

        {/* Right cards */}
        <div className="lp-services-right">
          {servicesData.map((svc, idx) => (
            <div key={svc.title} className="lp-svc-card" style={{ "--svc-idx": idx }}>
              <div className="lp-svc-card-top">
                <span className="lp-svc-tag">{svc.tag}</span>
                <span className="lp-svc-step">0{idx + 1}</span>
              </div>
              <h3>{svc.title}</h3>
              <p>{svc.description}</p>
              <div className="lp-svc-card-foot">
                <span className="lp-svc-learn">Learn more →</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;