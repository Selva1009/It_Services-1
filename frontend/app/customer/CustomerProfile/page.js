"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import ImageSlider from "./ImageSlider";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import Swal from "sweetalert2";
import { createSession } from "@/lib/api/sessions";
import "./login.css";


const USER_SESSION_CONFIG = {
  "vendor_admin": {
    storageKey: "vendor",
    redirectTo: "/vendor-admin",
    idKeys: ["vendorAdminId"],
  },
  "customer_admin": {
    storageKey: "customer",
    redirectTo: "/customer-admin/customerAdminDashboard",
    idKeys: [],
  },
  "vendor-user": {
    storageKey: "vendorUser",
    redirectTo: "/vendorUser",
    idKeys: ["vendorUserId"],
  },
  "customer-user": {
    storageKey: "customerUser",
    redirectTo: "/customer/products",
    idKeys: ["customerUserId"],
  },
};

const persistSessionToken = ({ token, rememberMe, userType }) => {
  if (rememberMe) {
    localStorage.setItem("userType", userType);
    sessionStorage.removeItem("token");
    return;
  }

  sessionStorage.setItem("token", token);
  localStorage.removeItem("token");
};

export default function LoginPage({ isSignupCardOpen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const canSubmit = email.trim().length > 0 && password.length > 0;

  useEffect(() => {
    const preventBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  const handleLogin = useCallback(async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      Swal.fire({
        title: "Missing Credentials",
        text: "Please enter both email and password.",
        icon: "warning",
        confirmButtonColor: "#3085D6",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await createSession({ email: normalizedEmail, password });

      const token = data.authToken;
      const userType = data.role;

      persistSessionToken({ token, rememberMe });

      localStorage.setItem("userType", userType);


      localStorage.setItem("userType", userType);
      // localStorage.setItem("userId", data.user.id.toString());

      Swal.fire({
        title: "Login Successful!",
        text: "You are now logged in.",
        imageUrl: "/login.gif",
        imageWidth: 127,
        imageHeight: 151,
        imageAlt: "Login Success",
        confirmButtonColor: "#3085D6",
        customClass: {
          popup: "rounded-lg shadow-md",
          confirmButton: "px-6 py-2 bg-blue-600 text-white rounded-md",
        },
      }).then(() => {
        const config = USER_SESSION_CONFIG[userType];

        if (!config) {
          Swal.fire("Unknown User Type", "Please contact support.", "warning");
          return;
        }

        router.push(config.redirectTo);
      });
    } catch (err) {
      Swal.fire({
        title: "Login Failed!",
        text: err.message || "Login failed. Please try again.",
        icon: "error",
        confirmButtonColor: "#D33",
      });
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, router]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    handleLogin();
  }, [handleLogin]);

  return (
    <div className="signin-page">
      <div className="signin-container">

        <div className="signin-left-panel">
          <ImageSlider />
        </div>

        <div className="signin-right-panel">
          <Card className="signin-card">
            <CardHeader className="signin-card-header">

              <div className="signin-brand-row">
                <div className="signin-logo-shell">
                  <div className="signin-logo-inner">
                    <Image
                      src="/Logo.png"
                      alt="M-Place Logo"
                      width={80}
                      height={80}
                      className="signin-logo-image"
                      priority
                    />
                  </div>
                </div>
              </div>

              <h2 className="signin-title">Welcome Back</h2>
              <p className="signin-subtitle">
                Login to continue to your account
              </p>

            </CardHeader>

            <CardContent className="signin-card-content">
              <form className="signin-form" onSubmit={handleSubmit}>

                <div className="signin-field">
                  <label htmlFor="email" className="signin-label">
                    Email Address
                  </label>

                  <div className="signin-input-wrap">
                    <Mail size={18} className="signin-field-icon" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="signin-input signin-input-with-icon"
                    />
                  </div>
                </div>

                <div className="signin-field">
                  <label htmlFor="password" className="signin-label">
                    Password
                  </label>

                  <div className="signin-input-wrap">
                    <LockKeyhole size={18} className="signin-field-icon" />

                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="signin-input signin-input-with-icon signin-password-input"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="signin-eye-toggle"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="signin-meta">
                  <label className="signin-remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="signin-checkbox"
                    />
                    Remember Me
                  </label>

                  <Link href="../ForgotPassword" className="signin-forgot">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="signin-submit"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <span className="signin-submit-content">
                      <span>SIGN IN</span>
                      <ArrowRight size={18} className="signin-submit-icon" />
                    </span>
                  )}
                </Button>

              </form>

              <p className="signin-footer">
                New here?{" "}
                <Link href="/LandingPage" className="signin-create-account">
                  Create an account
                </Link>
              </p>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}