import Home from "./Home";
import Navbar from "./Navbar";
import Services from "./Services";
import ContactSection from "./ContactSection";
import Footer from "./Footer";
import "./landingPage.css";

export default function LandingPage() {
  return (
    <div className="lp-root">
      <Navbar />
      <Home />
      <Services />
      <ContactSection />
      <Footer />
    </div>
  );
}
