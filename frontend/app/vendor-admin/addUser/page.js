"use client";

import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  UserPlus, User, Phone, Mail, Briefcase,
  Lock, Eye, EyeOff, CheckCircle2, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import "./vendor-addUser.css";

/* ── Validation helpers ── */
const validateMobile   = (mobile)   => /^[6-9]\d{9}$/.test(mobile);
const validateEmail    = (email)    => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

const Page = () => {
  const router = useRouter();
  const { auth, getUserToken } = useAuth();

  const [formValues, setFormValues] = useState({
    name:            "",
    mobile:          "",
    email:           "",
    designation:     "",
    password:        "",
    confirmPassword: "",
  });

  const [errors,              setErrors]              = useState({});
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused,             setFocused]             = useState(null);
  const [vendorId,            setVendorId]            = useState(null);
  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [submitted,           setSubmitted]           = useState(false);

  /* ── Load vendor from session/auth ── */
  useEffect(() => {
    const storedVendor = sessionStorage.getItem("vendor");
    if (storedVendor) {
      try {
        const vendorData = JSON.parse(storedVendor);
        if (vendorData?.id) setVendorId(vendorData.id);
      } catch (err) {
        console.error("Invalid vendor data:", err);
      }
    }
    if (auth.vendor?.id) {
      setVendorId(auth.vendor.id);
    }
  }, [auth.vendor]);

  /* ── Per-field validation ── */
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim().length < 2 ? "Name must be at least 2 characters." : "";

      case "mobile":
        if (!value) return "Mobile number is required.";
        if (!/^\d+$/.test(value)) return "Mobile must contain digits only.";
        if (value.length !== 10) return "Mobile number must be exactly 10 digits.";
        if (!validateMobile(value)) return "Enter a valid Indian mobile number (starts with 6-9).";
        return "";

      case "email":
        if (!value) return "Email is required.";
        if (!validateEmail(value)) return "Enter a valid email address (e.g. user@example.com).";
        return "";

      case "designation":
        return value.trim().length < 2 ? "Designation must be at least 2 characters." : "";

      case "password":
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must be at least 8 characters.";
        if (!validatePassword(value))
          return "Must include uppercase, lowercase, number & special character (@$!%*?&).";
        return "";

      case "confirmPassword":
        if (!value) return "Please confirm your password.";
        if (value !== formValues.password) return "Passwords do not match.";
        return "";

      default:
        return "";
    }
  };

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    setFormValues((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "password") {
      const cpError = formValues.confirmPassword
        ? value !== formValues.confirmPassword ? "Passwords do not match." : ""
        : "";
      setErrors((prev) => ({ ...prev, confirmPassword: cpError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFocused(null);
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  /* ── Full form validation before submit ── */
  const validateAll = () => {
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      newErrors[key] = validateField(key, formValues[key]);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateAll()) return;

    setIsSubmitting(true);

    if (!vendorId) {
      Swal.fire({
        title: "Error",
        text: "Vendor session not found. Please login again.",
        icon: "error",
        confirmButtonColor: "#10b981",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name:        formValues.name,
        mobile:      formValues.mobile,
        email:       formValues.email,
        designation: formValues.designation,
        password:    formValues.password,
        vendor_id:   vendorId,
      };

      const response = await fetch(`${API_BASE_URL}/api/vendor-user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getUserToken?.() || sessionStorage.getItem("vendorToken") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
        Swal.fire({
          title: "Success!",
          text: "User created successfully.",
          icon: "success",
          confirmButtonColor: "#10b981",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          router.push("/vendor-admin/usersprofile");
        });
      } else {
        Swal.fire({
          title: "Error",
          text: result.message || "Failed to create user",
          icon: "error",
          confirmButtonColor: "#10b981",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Network error occurred",
        icon: "error",
        confirmButtonColor: "#10b981",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Field config ── */
  const fields = [
    { name: "name",        label: "Full Name",     icon: User,      placeholder: "Enter full name",       type: "text",  col: 1 },
    { name: "mobile",      label: "Mobile",        icon: Phone,     placeholder: "Enter 10-digit number", type: "tel",   col: 1 },
    { name: "email",       label: "Email Address", icon: Mail,      placeholder: "Enter email address",   type: "email", col: 2 },
    { name: "designation", label: "Designation",   icon: Briefcase, placeholder: "Enter designation",     type: "text",  col: 2 },
  ];

  const btnClass = ["vau-btn-submit", submitted ? "success" : ""].filter(Boolean).join(" ");

  return (
    <div className="vau-page">
      <div className="vau-card">

        {/* ── Header ── */}
        <div className="vau-header">
          <div className="vau-header-inner">
            <div className="vau-avatar">
              <UserPlus size={22} color="rgba(255,255,255,0.85)" />
            </div>
            <div className="vau-header-text">
              <h1>Create User</h1>
              <p>Add a new member to your team</p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="vau-body">
          <form onSubmit={handleSubmit} autoComplete="off">

            <input type="text"     style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            <div className="vau-grid">

              {/* Text fields */}
              {fields.map(({ name, label, icon: Icon, placeholder, type, col }) => (
                <div
                  key={name}
                  className={`vau-field vau-col-${col}${focused === name ? " focused" : ""}${errors[name] ? " error" : ""}`}
                >
                  <label htmlFor={name}>{label}</label>
                  <div className="vau-input-wrap">
                    <span className="vau-input-icon"><Icon size={15} /></span>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      value={formValues[name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={placeholder}
                      onFocus={() => setFocused(name)}
                      className="vau-input"
                      autoComplete="off"
                      maxLength={name === "mobile" ? 10 : undefined}
                    />
                    {formValues[name] && !errors[name] && (
                      <span className="vau-input-check">
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                  </div>
                  {errors[name] && (
                    <span className="vau-error-msg">{errors[name]}</span>
                  )}
                </div>
              ))}

              {/* Password */}
              <div className={`vau-field vau-col-1${focused === "password" ? " focused" : ""}${errors.password ? " error" : ""}`}>
                <label htmlFor="password">Password</label>
                <div className="vau-input-wrap">
                  <span className="vau-input-icon"><Lock size={15} /></span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formValues.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    onFocus={() => setFocused("password")}
                    className="vau-input vau-input-password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="vau-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="vau-error-msg">{errors.password}</span>
                )}
                {focused === "password" && !errors.password && (
                  <span className="vau-hint-msg">
                    Min 8 chars · Uppercase · Lowercase · Number · Special (@$!%*?&)
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className={`vau-field vau-col-1${focused === "confirmPassword" ? " focused" : ""}${errors.confirmPassword ? " error" : ""}`}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="vau-input-wrap">
                  <span className="vau-input-icon"><Lock size={15} /></span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    onFocus={() => setFocused("confirmPassword")}
                    className="vau-input vau-input-password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="vau-toggle-btn"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="vau-error-msg">{errors.confirmPassword}</span>
                )}
              </div>

            </div>

            {/* Divider */}
            <div className="vau-divider" />

            {/* Actions */}
            <div className="vau-actions">
              <button
                type="button"
                className="vau-btn-cancel"
                onClick={() => router.push("/vendor-admin")}
                disabled={isSubmitting}
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
                  <><div className="vau-spinner" /> Creating...</>
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

export default Page;