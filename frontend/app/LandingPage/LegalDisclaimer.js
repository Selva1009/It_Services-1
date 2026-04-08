import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./landingPage.css";

const sections = [
  {
    title: "General Information",
    body: "MPlace is a digital platform that connects customers and suppliers. We facilitate interaction, but we do not participate in monetary transactions, price adjustments, or revenue generation through product exchanges between customers and suppliers.",
  },
  {
    title: "Scope of Services",
    body: "MPlace provides customers with the ability to engage directly with suppliers for placing orders and making payments. Additionally, we offer services like purchase order processing and follow-ups for deliveries. These services are available for a fee and are intended to provide added convenience. MPlace assumes no liability for transactions conducted directly between customers and suppliers outside our service scope.",
  },
  {
    title: "No Commercial Intermediation",
    body: "MPlace does not serve as an intermediary in financial transactions or contractual obligations between customers and suppliers. All financial arrangements, including payments, delivery, and product-related obligations, are solely between the involved parties. MPlace is not liable for product quality, pricing issues, delivery delays, or any disputes arising from these transactions.",
  },
  {
    title: "Due Diligence & Registration",
    body: "MPlace performs due diligence on both customers and suppliers during the onboarding process to maintain trust and transparency. A nominal, non-refundable registration fee of ₹1,000 is charged to cover verification costs. This fee is not an endorsement or guarantee of the future conduct of transactions between the parties.",
  },
  {
    title: "Limitation of Liability",
    body: "MPlace shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our platform. This includes financial loss, disputes with suppliers, non-fulfillment of orders, delivery delays, or product quality issues. It is the responsibility of users to perform their own due diligence before entering any transaction.",
  },
  {
    title: "Amendments",
    body: "MPlace reserves the right to modify, amend, or update this disclaimer at any time, without prior notice. Users are advised to review this document periodically to stay informed of any changes. Continued use of the platform after modifications constitute acceptance of the updated terms.",
  },
];

const LegalDisclaimer = () => {
  return (
    <div className="lp-legal-page" id="LegalDisclaimer">
      <Navbar />

      <main className="lp-legal-main">
        <div className="lp-legal-header">
          <span className="lp-section-label">Legal</span>
          <h1>Legal Disclaimer</h1>
          <p>Please read this disclaimer carefully before using MPlace.</p>
        </div>

        {sections.map((sec) => (
          <div key={sec.title} className="lp-legal-section">
            <h2>{sec.title}</h2>
            <p>{sec.body}</p>
          </div>
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default LegalDisclaimer;