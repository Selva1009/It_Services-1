"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  UserPlus, User, Phone, Mail, Briefcase,
  Lock, Eye, EyeOff, ArrowRight, CheckCircle2,
} from "lucide-react";
import "./vendor-addUser.css";

const Page = () => {
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    name:            "",
    mobile:          "",
    email:           "",
    designation:     "",
    password:        "",
    confirmPassword: "",
  });

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused,             setFocused]             = useState(null);
  const [vendorId,            setVendorId]            = useState(null);
  const [adminId,             setAdminId]             = useState(null);
  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [submitted,           setSubmitted]           = useState(false);

  /* ── Load vendor from localStorage ── */
  useEffect(() => {
    const storedVendor = localStorage.getItem("vendor");
    if (storedVendor) {
      try {
        const vendorData = JSON.parse(storedVendor);
        setVendorId(vendorData.id);
        setAdminId(vendorData.id);
      } catch (err) {
        console.error("Invalid vendor data:", err);
      }
    }
  }, []);

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!vendorId) {
      Swal.fire({
        title: "Error",
        text: "Vendor session not found. Please login again.",
        icon: "error",
        confirmButtonColor: "#1a56db",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name:          formValues.name,
        mobile:        formValues.mobile,
        email:         formValues.email,
        designation:   formValues.designation,
        password:      formValues.password,
        vendorId,
        vendorAdminId: adminId,
      };

      const response = await fetch(`${API_BASE_URL}/api/vendor-user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
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
          confirmButtonColor: "#1a56db",
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
          confirmButtonColor: "#1a56db",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "Network error occurred",
        icon: "error",
        confirmButtonColor: "#1a56db",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Text field config ── */
  const fields = [
    { name: "name",        label: "Full Name",     icon: User,      placeholder: "Enter full name",     type: "text",  col: 1 },
    { name: "mobile",      label: "Mobile",        icon: Phone,     placeholder: "Enter mobile number", type: "tel",   col: 1 },
    { name: "email",       label: "Email Address", icon: Mail,      placeholder: "Enter email address", type: "email", col: 2 },
    { name: "designation", label: "Designation",   icon: Briefcase, placeholder: "Enter designation",   type: "text",  col: 2 },
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

            {/* Dummy fields to prevent browser autofill */}
            <input type="text"     style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

            <div className="vau-grid">

              {/* Text fields */}
              {fields.map(({ name, label, icon: Icon, placeholder, type, col }) => (
                <div
                  key={name}
                  className={`vau-field vau-col-${col}${focused === name ? " focused" : ""}`}
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
                      placeholder={placeholder}
                      onFocus={() => setFocused(name)}
                      onBlur={() => setFocused(null)}
                      className="vau-input"
                      autoComplete="off"
                    />
                    {formValues[name] && (
                      <span className="vau-input-check">
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Password — rendered directly to avoid stale state in map */}
              <div className={`vau-field vau-col-1${focused === "password" ? " focused" : ""}`}>
                <label htmlFor="password">Password</label>
                <div className="vau-input-wrap">
                  <span className="vau-input-icon"><Lock size={15} /></span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
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
              </div>

              {/* Confirm Password — rendered directly */}
              <div className={`vau-field vau-col-1${focused === "confirmPassword" ? " focused" : ""}`}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="vau-input-wrap">
                  <span className="vau-input-icon"><Lock size={15} /></span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    onFocus={() => setFocused("confirmPassword")}
                    onBlur={() => setFocused(null)}
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