import React from "react";

const servicesData = [
  {
    title: "Platform for Seamless Connections",
    description:
      "MPlace serves as a platform connecting customers and suppliers without any monetary benefits. If clients opt for our services to facilitate purchase order processing and supplier follow-ups for deliveries, a service fee applies.",
  },
  {
    title: "Direct Transactions with Transparency",
    description:
      "Customers place orders and make payments directly to suppliers, with no contractual obligation to our company. We do not engage in trading or add margins to generate revenue.",
  },
  {
    title: "Ensuring Trust and Credibility",
    description:
      "To ensure trust and credibility, we conduct due diligence on both customers and suppliers during onboarding, requiring a nominal registration fee of INR 1,000 for validation.",
  },
];

const Services = () => {
  return (
    <section className="lp-services" id="services">
      <div className="lp-services-head">
        <h1>Our Services</h1>
        <p>
          Connecting customers and suppliers with trust, efficiency, and reliable
          onboarding.
        </p>
      </div>

      <div className="lp-services-grid">
        {servicesData.map((service) => (
          <article key={service.title} className="lp-service-card">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>

      <div className="lp-services-cta">
        <h3>Ready to Get Started?</h3>
        <p>
          Let us guide you through the process and help you build a lasting
          business relationship.
        </p>
        <a href="#ContactSection">Contact Us Now</a>
      </div>
    </section>
  );
};

export default Services;
