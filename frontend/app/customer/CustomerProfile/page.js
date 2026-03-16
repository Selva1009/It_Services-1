"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api/config";
import Swal from "sweetalert2";
import "./itUserProfile.css";
import { useAuth } from "@/app/contexts/AuthContext";

/* ─── Field Config ───────────────────────────────────────── */
const PROFILE_FIELDS = [
  { label: "Company Name", key: "company_name", editable: false },
  { label: "Name",         key: "name",         editable: true,  type: "text" },
  { label: "Email",        key: "email",        editable: false, type: "email" },
  { label: "Mobile",       key: "mobile",       editable: true,  type: "tel"  },
  { label: "Designation",  key: "designation",  editable: true,  type: "text" },
];

/* ─── Helpers ────────────────────────────────────────────── */
const getAuthToken = () =>
  typeof window !== "undefined"
    ? sessionStorage.getItem("token")
    : null;

const getInitials = (name) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "IT";

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

/* ─── Main Component ─────────────────────────────────────── */
export default function ITUserProfilePage() {
  const router = useRouter();
  const { getAuthToken: getAuthTokenFromContext } = useAuth();

  const [profile, setProfile]     = useState(null);
  const [formData, setFormData]   = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Fetch profile ── */
  const fetchProfile = useCallback(async () => {
    const token = getAuthTokenFromContext() || getAuthToken();
    if (!token) { router.push("/SignIn"); return; }

    try {
      const res = await fetch(`${API_BASE_URL}/api/it-user-employee/profile`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) { router.push("/SignIn"); return; }
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setProfile(data.profile);
      setFormData(data.profile);
    } catch (err) {
      console.error("Profile fetch error:", err);
      Swal.fire({ icon: "error", title: "Error", text: "Could not load your profile." });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const token = getAuthTokenFromContext() || getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/it-user-employee/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name:        formData.name,
          mobile:      formData.mobile,
          designation: formData.designation,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Update failed");
      }

      await fetchProfile();
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your changes have been saved.",
        confirmButtonColor: "#1a56db",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="vp-loading">
        <div className="vp-loading-spinner" />
        <span>Loading your profile…</span>
      </div>
    );
  }

  if (!profile) return null;

  /* ── Render ── */
  return (
    <div className="vp-page">
      <div className="vp-container">

        <button className="vp-back-btn" onClick={() => router.back()}>
          ← Back
        </button>

        <div className="vp-card">

          {/* ── Header ── */}
          <div className="vp-card-header">
            <div className="vp-avatar-wrapper">
              <div className="vp-avatar-initials">
                {getInitials(profile.name)}
              </div>
              <div className="vp-avatar-badge" />
            </div>

            <div className="vp-header-info">
              <h1 className="vp-header-name">{profile.name || "IT User"}</h1>
              <p className="vp-header-role">{profile.email}</p>
              <span className="vp-header-badge">✦ {profile.designation || "Employee"}</span>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="vp-card-body">
            {!isEditing ? (
              <>
                <SectionTitle>Profile Information</SectionTitle>
                <div className="vp-info-grid">
                  {PROFILE_FIELDS.map(({ label, key }) => (
                    <InfoItem key={key} label={label} value={profile[key]} />
                  ))}
                </div>

                <div className="vp-actions">
                  <button className="vp-btn vp-btn-primary" onClick={() => setIsEditing(true)}>
                    ✎ Edit Profile
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave}>
                <SectionTitle>Edit Profile</SectionTitle>
                <div className="vp-form-grid">
                  {PROFILE_FIELDS.map(({ label, key, editable, type }) => (
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
                        <svg className="vp-spin" width="15" height="15" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        Saving…
                      </>
                    ) : "Save Changes"}
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
