"use client";

import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import CustomerAdminNavbar from "../components/customerAdminNavbar";
import {
  Eye, EyeOff,
  User, Mail, Phone, Briefcase,
  Lock, ArrowRight, CheckCircle2, UserPlus,
} from "lucide-react";
import "./customer-addUser.css";

const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("token") || sessionStorage.getItem("token")
    : null;

/* ── Validation helpers ── */
const validateMobile   = (mobile)   => /^[6-9]\d{9}$/.test(mobile);
const validateEmail    = (email)    => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

const CustomerAddUserPage = () => {
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    name:            "",
    email:           "",
    mobile:          "",
    designation:     "",
    password:        "",
    confirmPassword: "",
  });

  const [errors,              setErrors]              = useState({});
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [submitted,           setSubmitted]           = useState(false);
  const [focused,             setFocused]             = useState(null);
  const [userId,              setUserId]              = useState(null);

  /* ── Decode user id from authToken ── */
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const base64Payload = token.split(".")[1];
        const decoded = JSON.parse(atob(base64Payload));
        setUserId(decoded.id);
      } catch (err) {
        console.error("Failed to decode token:", err);
      }
    }
  }, []);

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

  const handleCancel = () => router.push("/customer-admin");

  /* ── Full form validation before submit ── */
  const validateAll = () => {
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      newErrors[key] = validateField(key, formValues[key]);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateAll()) return;

    setIsSubmitting(true);

    if (!userId) {
      Swal.fire({
        title: "Error",
        text: "Auth token not found. Please login again.",
        icon: "error",
        confirmButtonColor: "#1a56db",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/it-user-employee/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:        formValues.name,
          email:       formValues.email,
          mobile:      formValues.mobile,
          designation: formValues.designation,
          password:    formValues.password,
          user_id:     userId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create user");
      }

      setSubmitted(true);

      Swal.fire({
        icon: "success",
        title: "User Created",
        text: "The new user has been added successfully.",
        confirmButtonColor: "#1a56db",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        router.push("/customer-admin");
      });

    } catch (err) {
      Swal.fire({ icon: "error", title: "Creation Failed", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { name: "name",        label: "Full Name",     icon: User,      placeholder: "Enter full name",     type: "text",  col: 1 },
    { name: "mobile",      label: "Mobile",        icon: Phone,     placeholder: "Enter mobile number", type: "tel",   col: 1 },
    { name: "email",       label: "Email Address", icon: Mail,      placeholder: "Enter email address", type: "email", col: 2 },
    { name: "designation", label: "Designation",   icon: Briefcase, placeholder: "Enter designation",   type: "text",  col: 2 },
  ];

  const btnClass = [
    "cau-btn-submit",
    isSubmitting ? "loading" : "",
    submitted    ? "success" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <CustomerAdminNavbar />
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
            <form onSubmit={handleSubmit} autoComplete="off">

              {/* Dummy fields to prevent browser autofill */}
              <input type="text"     style={{ display: "none" }} />
              <input type="password" style={{ display: "none" }} />

              <div className="cau-grid">

                {/* Text fields */}
                {fields.map(({ name, label, icon: Icon, placeholder, type, col }) => (
                  <div
                    key={name}
                    className={`cau-field cau-col-${col}${focused === name ? " focused" : ""}${errors[name] ? " error" : ""}`}
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
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        onFocus={() => setFocused(name)}
                        className="cau-input"
                        autoComplete="off"
                        maxLength={name === "mobile" ? 10 : undefined}
                      />
                      {formValues[name] && !errors[name] && (
                        <span className="cau-input-check">
                          <CheckCircle2 size={14} />
                        </span>
                      )}
                    </div>
                    {errors[name] && (
                      <span className="cau-error-msg">{errors[name]}</span>
                    )}
                  </div>
                ))}

                {/* Password */}
                <div className={`cau-field cau-col-1${focused === "password" ? " focused" : ""}${errors.password ? " error" : ""}`}>
                  <label htmlFor="password">Password</label>
                  <div className="cau-input-wrap">
                    <span className="cau-input-icon"><Lock size={15} /></span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formValues.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      onFocus={() => setFocused("password")}
                      className="cau-input cau-input-password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="cau-toggle-btn"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="cau-error-msg">{errors.password}</span>
                  )}
                  {focused === "password" && !errors.password && (
                    <span className="cau-hint-msg">
                      Min 8 chars · Uppercase · Lowercase · Number · Special (@$!%*?&)
                    </span>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={`cau-field cau-col-1${focused === "confirmPassword" ? " focused" : ""}${errors.confirmPassword ? " error" : ""}`}>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="cau-input-wrap">
                    <span className="cau-input-icon"><Lock size={15} /></span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formValues.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      onFocus={() => setFocused("confirmPassword")}
                      className="cau-input cau-input-password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="cau-toggle-btn"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="cau-error-msg">{errors.confirmPassword}</span>
                  )}
                </div>

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
    </>
  );
};

export default CustomerAddUserPage;