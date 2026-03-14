"use client";
import { API_BASE_URL } from "@/lib/api/config";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
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

  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [submitted,           setSubmitted]           = useState(false);
  const [focused,             setFocused]             = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => router.push("/customer-admin");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/user-admin/create-user`, {
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
          <form onSubmit={handleSubmit} autoComplete="off">

            {/* Dummy fields to prevent browser autofill */}
            <input type="text"     style={{ display: "none" }} />
            <input type="password" style={{ display: "none" }} />

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
                      autoComplete="off"
                    />
                    {formValues[name] && (
                      <span className="cau-input-check">
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Password — rendered directly to avoid stale state in map */}
              <div className={`cau-field cau-col-1${focused === "password" ? " focused" : ""}`}>
                <label htmlFor="password">Password</label>
                <div className="cau-input-wrap">
                  <span className="cau-input-icon"><Lock size={15} /></span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
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
              </div>

              {/* Confirm Password — rendered directly */}
              <div className={`cau-field cau-col-1${focused === "confirmPassword" ? " focused" : ""}`}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="cau-input-wrap">
                  <span className="cau-input-icon"><Lock size={15} /></span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    onFocus={() => setFocused("confirmPassword")}
                    onBlur={() => setFocused(null)}
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
  );
};

export default CustomerAddUserPage;