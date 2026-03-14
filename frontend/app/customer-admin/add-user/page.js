"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff,
  User, Mail, Phone, Briefcase,
  Lock, ArrowRight, CheckCircle2, UserPlus,
} from "lucide-react";
import "./customer-addUser.css";

const CustomerAddUserPage = () => {
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting]               = useState(false);
  const [submitted, setSubmitted]                     = useState(false);
  const [focused, setFocused]                         = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => router.push("/customer-admin");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const fields = [
    { name: "name",        label: "Full Name",     icon: User,      placeholder: "Enter full name",     type: "text",  col: 1 },
    { name: "mobile",      label: "Mobile",        icon: Phone,     placeholder: "Enter mobile number", type: "tel",   col: 1 },
    { name: "email",       label: "Email Address", icon: Mail,      placeholder: "Enter email address", type: "email", col: 2 },
    { name: "designation", label: "Designation",   icon: Briefcase, placeholder: "Enter designation",   type: "text",  col: 2 },
  ];

  const passwordFields = [
    { name: "password",        label: "Password",         show: showPassword,        toggle: () => setShowPassword((v) => !v) },
    { name: "confirmPassword", label: "Confirm Password", show: showConfirmPassword, toggle: () => setShowConfirmPassword((v) => !v) },
  ];

  const btnClass = [
    "cau-btn-submit",
    isSubmitting ? "loading"  : "",
    submitted    ? "success"  : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="cau-page">
      <div className="cau-card">

        {/* ── Header ── */}
        <div className="cau-header">
          <div className="cau-header-inner">
            <div className="cau-avatar">
              <UserPlus size={22} color="rgba(255,255,255,0.85)" />
            </div>
            <div className="cau-header-text">
              <h1>Create User</h1>
              <p>Add a new member to your team</p>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="cau-body">
          <form onSubmit={handleSubmit}>
            <div className="cau-grid">

              {/* Text fields */}
              {fields.map(({ name, label, icon: Icon, placeholder, type, col }) => (
                <div
                  key={name}
                  className={`cau-field cau-col-${col}${focused === name ? " focused" : ""}`}
                >
                  <label htmlFor={name}>{label}</label>
                  <div className="cau-input-wrap">
                    <span className="cau-input-icon"><Icon size={15} /></span>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      value={formValues[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      onFocus={() => setFocused(name)}
                      onBlur={() => setFocused(null)}
                      className="cau-input"
                    />
                    {formValues[name] && (
                      <span className="cau-input-check">
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Password fields */}
              {passwordFields.map(({ name, label, show, toggle }) => (
                <div
                  key={name}
                  className={`cau-field cau-col-1${focused === name ? " focused" : ""}`}
                >
                  <label htmlFor={name}>{label}</label>
                  <div className="cau-input-wrap">
                    <span className="cau-input-icon"><Lock size={15} /></span>
                    <input
                      id={name}
                      name={name}
                      type={show ? "text" : "password"}
                      value={formValues[name]}
                      onChange={handleChange}
                      placeholder="••••••••"
                      onFocus={() => setFocused(name)}
                      onBlur={() => setFocused(null)}
                      className="cau-input cau-input-password"
                    />
                    <button type="button" onClick={toggle} className="cau-toggle-btn">
                      {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}

            </div>

            {/* Divider */}
            <div className="cau-divider" />

            {/* Actions */}
            <div className="cau-actions">
              <button
                type="button"
                className="cau-btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={btnClass}
              >
                {submitted ? (
                  <><CheckCircle2 size={15} /> Created!</>
                ) : isSubmitting ? (
                  <><div className="cau-spinner" /> Creating...</>
                ) : (
                  <>Create User <ArrowRight size={15} /></>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default CustomerAddUserPage;