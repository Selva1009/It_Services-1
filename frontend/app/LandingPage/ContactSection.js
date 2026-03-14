"use client";

import { API_BASE_URL } from "@/lib/api/config";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, User, MessageSquare, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import "./landingPage.css";

const contactInfo = [
  {
    icon: Mail,
    label: "Email Us",
    value: "info@teckost.com",
    href: "mailto:info@teckost.com",
    cta: "Send an email",
    color: "blue",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "(044) 477-03399",
    href: "tel:+04447703399",
    cta: "Call now",
    color: "green",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "53, North Boag Road, Chennai 600017",
    href: "https://maps.google.com",
    cta: "Get directions",
    color: "indigo",
    target: "_blank",
  },
];

export default function ContactSection() {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/support/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to send message.");
      Swal.fire({ title: "Message Sent", text: "We will get back to you within 24 hours.", icon: "success" });
      reset();

    } catch (error) {
      Swal.fire({ icon: "error", title: "Request Failed", text: error.message || "Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ContactSection" className="lp-contact">
      {/* Background decoration */}
      <div className="lp-contact-bg-shape" />

      <div className="lp-contact-container">

        {/* Header */}
        <div className="lp-contact-head">
          <span className="lp-section-label">Contact Us</span>
          <h2>Let's Start a Conversation</h2>
          <p>Have questions or want to discuss a project? Our team is ready to help.</p>
        </div>

        <div className="lp-contact-body">

          {/* LEFT — info panel */}
          <div className="lp-contact-info-panel">

            <div className="lp-cip-header">
              <h3>Get in Touch</h3>
              <p>Reach us through any of these channels and we'll respond within 24 hours.</p>
            </div>

            <div className="lp-cip-items">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.target || "_self"}
                    rel="noopener noreferrer"
                    className={`lp-cip-item lp-cip-item--${item.color}`}
                  >
                    <span className="lp-cip-icon">
                      <Icon size={19} />
                    </span>
                    <div className="lp-cip-text">
                      <span className="lp-cip-label">{item.label}</span>
                      <span className="lp-cip-value">{item.value}</span>
                      <span className="lp-cip-cta">{item.cta} <ArrowRight size={12} /></span>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Decorative tag strip */}
            <div className="lp-cip-footer">
              <span>⚡ Quick response</span>
              <span>🛡 Confidential</span>
              <span>🌐 Remote support</span>
            </div>

          </div>

          {/* RIGHT — form panel */}
          <div className="lp-contact-form-panel">

            <div className="lp-cfp-header">
              <h3>Send us a Message</h3>
              <p>Fill in the details and we'll get back to you shortly.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="lp-cfp-form">

              {/* Name */}
              <div className={`lp-cfp-field ${focusedField === "name" ? "focused" : ""} ${errors.name ? "error" : ""}`}>
                <label htmlFor="cf-name">
                  <User size={14} />
                  Your Name
                </label>
                <input
                  id="cf-name"
                  type="text"
                  placeholder="John Doe"
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <span className="lp-cfp-err">{errors.name.message}</span>}
              </div>

              {/* Email */}
              <div className={`lp-cfp-field ${focusedField === "email" ? "focused" : ""} ${errors.email ? "error" : ""}`}>
                <label htmlFor="cf-email">
                  <Mail size={14} />
                  Email Address
                </label>
                <input
                  id="cf-email"
                  type="email"
                  placeholder="you@company.com"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" },
                  })}
                />
                {errors.email && <span className="lp-cfp-err">{errors.email.message}</span>}
              </div>

              {/* Message */}
              <div className={`lp-cfp-field lp-cfp-field--textarea ${focusedField === "comment" ? "focused" : ""} ${errors.comment ? "error" : ""}`}>
                <label htmlFor="cf-comment">
                  <MessageSquare size={14} />
                  Your Message
                </label>
                <textarea
                  id="cf-comment"
                  rows={5}
                  placeholder="Describe your issue or question..."
                  onFocus={() => setFocusedField("comment")}
                  onBlur={() => setFocusedField(null)}
                  {...register("comment", {
                    required: "Message is required",
                    minLength: { value: 10, message: "Message must be at least 10 characters" },
                  })}
                />
                {errors.comment && <span className="lp-cfp-err">{errors.comment.message}</span>}
              </div>

              <button type="submit" className="lp-cfp-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="lp-cfp-spinner" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Message
                  </>
                )}
              </button>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
}