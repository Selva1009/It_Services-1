"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "./profile.css";
import { useAuth } from "@/app/contexts/AuthContext";

/* ─── Constants ─────────────────────────────────────────── */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const COMPANY_FIELDS = [
  { label: "Company Name", key: "companyName", editable: false },
  { label: "Contact Person", key: "contactPerson", editable: true },
  { label: "PAN Number", key: "pan", editable: false },
  { label: "GST Number", key: "gst", editable: true },
];

const CONTACT_FIELDS = [
  { label: "Email", key: "email", editable: false, type: "email" },
  { label: "Mobile", key: "mobile", editable: true, type: "tel" },
];

const ADDRESS_KEYS = ["address", "country", "state", "city", "pincode"];

/* ─── Helpers ────────────────────────────────────────────── */
const getAuthToken = () =>
  (typeof window !== "undefined" &&
    sessionStorage.getItem("token")) || null;

const val = (v) => v || <span className="not-provided">Not provided</span>;

/* ─── Sub-components ─────────────────────────────────────── */
function SectionTitle({ children }) {
  return <p className="vp-section-title">{children}</p>;
}

function InfoItem({ label, value }) {
  return (
    <div className="vp-info-item">
      <span className="vp-info-label">{label}</span>
      <span className={`vp-info-value ${!value ? "not-provided" : ""}`}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

function FormField({ label, fieldKey, value, onChange, editable = true, type = "text" }) {
  return (
    <div className="vp-form-field">
      <label className="vp-form-label" htmlFor={fieldKey}>{label}</label>
      <input
        id={fieldKey}
        name={fieldKey}
        type={type}
        value={value || ""}
        onChange={onChange}
        disabled={!editable}
        className="vp-form-input"
        autoComplete="off"
      />
    </div>
  );
}

function ServiceChip({ name, level }) {
  return (
    <div className="vp-service-chip">
      <span className="vp-service-name">{name}</span>
      <span className="vp-service-level">{level}</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function VendorProfilePage() {
  const router = useRouter();
  const { getAuthToken: getAuthTokenFromContext, setVendor: setAuthVendor } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Fetch profile from API ── */
  const fetchProfile = useCallback(async () => {
    const token = getAuthTokenFromContext() || getAuthToken();
    if (!token) {
      router.push("/SignIn");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor-admin/profile`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      // ADD THESE TWO LINES to see the exact problem
      console.log("Status:", res.status);
      console.log("URL hit:", `${API_BASE_URL}/api/vendor-admin/profile`);



      if (!res.ok) {
        if (res.status === 401) { router.push("/SignIn"); return; }
        throw new Error("Failed to fetch profile");
      }

      const json = await res.json();

      /* API returns: { message, data: { ...vendor, address: {}, services: [] } } */
      const data = json.data || json;
      setProfile(data);
      setAuthVendor(data);
      setFormData(flattenProfile(data));
    } catch (err) {
      console.error("Profile fetch error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Could not load your profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── Flatten nested address for form ── */
  function flattenProfile(data) {
    return {
      companyName: data.companyName || "",
      contactPerson: data.contactPerson || "",
      email: data.email || "",
      mobile: data.mobile || "",
      pan: data.pan || "",
      gst: data.gst || "",
      address: data.address?.address || "",
      country: data.address?.country || "",
      state: data.address?.state || "",
      city: data.address?.city || "",
      pincode: data.address?.pincode || "",
    };
  }

  /* ── Form change handler ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── Save handler ── */
  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = getAuthTokenFromContext() || getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/vendor-admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
      }

      /* Refresh from server after save */
      await fetchProfile();
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your changes have been saved successfully.",
        confirmButtonColor: "#1a56db",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Could not save changes. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(flattenProfile(profile));
    setIsEditing(false);
  };

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="vp-loading">
        <div className="vp-loading-spinner" />
        <span>Loading your profile…</span>
      </div>
    );
  }

  if (!profile) return null;

  const { services = [] } = profile;

  /* ── Render ── */
  return (
    <div className="vp-page">
      <div className="vp-container">

        {/* Back */}
        <button className="vp-back-btn" onClick={() => router.back()}>
          ← Back
        </button>

        <div className="vp-card">

          {/* ── Header ── */}
          <div className="vp-card-header">
            <div className="vp-avatar-wrapper">
              <img
                src="/User_Icon.jpg"
                alt="Profile avatar"
                className="vp-avatar"
                onError={(e) => { e.target.src = "/default-avatar.png"; }}
              />
              <div className="vp-avatar-badge" title="Active" />
            </div>

            <div className="vp-header-info">
              <h1 className="vp-header-name">
                {profile.contactPerson || profile.companyName}
              </h1>
              <p className="vp-header-role">{profile.email}</p>
              <span className="vp-header-badge">
                ✦ Vendor Admin
              </span>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="vp-card-body">

            {!isEditing ? (
              /* ── View Mode ── */
              <>
                {/* Company Info */}
                <SectionTitle sx>Company Information</SectionTitle>
                <div className="vp-info-grid">
                  {COMPANY_FIELDS.map(({ label, key }) => (
                    <InfoItem key={key} label={label} value={profile[key]?.charAt(0).toUpperCase() + profile[key]?.slice(1)} />
                  ))}
                </div>

                <div className="vp-divider" />

                {/* Contact Info */}
                <SectionTitle>Contact Details</SectionTitle>
                <div className="vp-info-grid">
                  {CONTACT_FIELDS.map(({ label, key }) => (
                    <InfoItem key={key} label={label} value={profile[key]} />
                  ))}
                </div>

                <div className="vp-divider" />

                {/* Address */}
                <SectionTitle>Address</SectionTitle>
                <div className="vp-info-grid">
                  {ADDRESS_KEYS.map((key) => (
                    <InfoItem
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={profile.address?.[key]}
                    />
                  ))}
                </div>

                {/* Services */}
                {services.length > 0 && (
                  <>
                    <div className="vp-divider" />
                    <SectionTitle>Services</SectionTitle>
                    <div className="vp-services-list">
                      {services.map((svc) => (
                        <ServiceChip
                          key={svc.id}
                          name={svc.service_name}
                          level={svc.support_level}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Edit Button */}
                <div className="vp-actions">
                  <button
                    className="vp-btn vp-btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    ✎ Edit Profile
                  </button>
                </div>
              </>
            ) : (
              /* ── Edit Mode ── */
              <form onSubmit={handleSave}>
                <SectionTitle>Company Information</SectionTitle>
                <div className="vp-form-grid" style={{ marginBottom: 28 }}>
                  {COMPANY_FIELDS.map(({ label, key, editable }) => (
                    <FormField
                      key={key}
                      label={label}
                      fieldKey={key}
                      value={formData[key]}
                      onChange={handleChange}
                      editable={editable}
                    />
                  ))}
                </div>

                <div className="vp-divider" />

                <SectionTitle>Contact Details</SectionTitle>
                <div className="vp-form-grid" style={{ marginBottom: 28 }}>
                  {CONTACT_FIELDS.map(({ label, key, editable, type }) => (
                    <FormField
                      key={key}
                      label={label}
                      fieldKey={key}
                      value={formData[key]}
                      onChange={handleChange}
                      editable={editable}
                      type={type}
                    />
                  ))}
                </div>

                <div className="vp-divider" />

                <SectionTitle>Address</SectionTitle>
                <div className="vp-form-grid" style={{ marginBottom: 28 }}>
                  {ADDRESS_KEYS.map((key) => (
                    <FormField
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      fieldKey={key}
                      value={formData[key]}
                      onChange={handleChange}
                      editable={true}
                    />
                  ))}
                </div>

                {/* Form Actions */}
                <div className="vp-btn-group">
                  <button
                    type="button"
                    className="vp-btn vp-btn-outline"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="vp-btn vp-btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="vp-spin"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Saving…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
