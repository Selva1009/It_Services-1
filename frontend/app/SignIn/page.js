"use client";

import { useState, useEffect, useCallback } from "react";
import ImageSlider from "./ImageSlider";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  /* Prevent back navigation */
  useEffect(() => {
    const preventBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", preventBackNavigation);

    return () =>
      window.removeEventListener("popstate", preventBackNavigation);
  }, []);

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      Swal.fire("Missing Credentials", "Enter email & password", "warning");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      /* Save token */
      if (rememberMe)
        localStorage.setItem("token", data.authToken);
      else
        sessionStorage.setItem("token", data.authToken);

      localStorage.setItem("userRole", data.role);

      Swal.fire({
        title: "Login Successful!",
        imageUrl: "/login.gif",
        confirmButtonColor: "#3085D6",
      }).then(() => {
        if (data.role.toLowerCase().includes("vendor"))
          router.push("/vendor-admin");
        else
          router.push("/customer-admin/customerAdminDashboard");
      });

    } catch (err) {
      Swal.fire("Login Failed", err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [email, password, rememberMe, router]);

  return (
    <div className="login-page">

      {/* Left slider */}
      <div className="slider-section">
        <ImageSlider />
      </div>

      {/* Login Section */}
      <div className="login-section">
        <div className="login-card">

          <div className="logo-wrapper">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={80}
              height={80}
            />
          </div>

          <h2>Welcome Back</h2>
          <p>Log in to continue your journey.</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="login-options">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              Remember Me
            </label>

            <a href="/ForgotPassword">Forgot password?</a>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="login-btn"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="signup-link">
            New here? <a href="/">Create an account</a>
          </p>

        </div>
      </div>
    </div>
  );
}
