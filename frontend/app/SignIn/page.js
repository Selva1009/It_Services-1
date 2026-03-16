"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import ImageSlider from "./ImageSlider";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import Swal from "sweetalert2";
import "./login.css";
import { useAuth } from "@/app/contexts/AuthContext";

const ROLE_REDIRECT = {
  vendor_admin: "/vendor-admin",
  it_admin: "/customer-admin/customerAdminDashboard",
  vendor_user: "/vendorUser",
  it_user: "/customer/products",
};

const normalizeRole = (value) => String(value || "").toLowerCase().replace(/-/g, "_");

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const[rememberMe,setRememberMe]=useState(false)
  const [, setSession] = useState({
    authToken: "",
    userToken: "",
    role: "",
  });
  const { setAuthFromLogin } = useAuth();
  const router = useRouter();
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleLogin = async () => {
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
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email: normalizedEmail,
        password,
      });
      const { authToken, userToken, role, user } = data || {};
      const normalizedRole = normalizeRole(role);

      if (!authToken || !userToken || !normalizedRole) {
        throw new Error("Invalid login response from server.");
      }

      setSession({
        authToken,
        userToken,
        role: normalizedRole,
      });

      const userIdFromResponse = user?.id ? String(user.id) : String(data?.id || "");
      const parentIdFromResponse =
        user?.parentId ||
        user?.vendor_id ||
        user?.admin_id ||
        null;

      setAuthFromLogin({
        ...data,
        authToken,
        userToken,
        role: normalizedRole,
        userId: userIdFromResponse || undefined,
        parentId: parentIdFromResponse || undefined,
      });
      
      sessionStorage.setItem("authToken", authToken);
      sessionStorage.setItem("userToken", userToken);
      sessionStorage.setItem("role", normalizedRole);
      sessionStorage.setItem("token", authToken);

      if (normalizedRole === "vendor_admin") {
        sessionStorage.setItem("vendorToken", userToken);
        if (userIdFromResponse) {
          sessionStorage.setItem(
            "vendor",
            JSON.stringify({
              id: Number(userIdFromResponse),
              ...user,
            })
          );
        }
      }

      if (normalizedRole === "vendor_user") {
        if (userIdFromResponse) {
          sessionStorage.setItem("vendorUserId", userIdFromResponse);
          sessionStorage.setItem(
            "vendorUser",
            JSON.stringify({
              id: Number(userIdFromResponse),
              ...user,
            })
          );
        }
        if (parentIdFromResponse) {
          sessionStorage.setItem("vendorId", String(parentIdFromResponse));
        }
      }

      if (normalizedRole === "it_admin") {
        if (userIdFromResponse) {
          sessionStorage.setItem(
            "customer",
            JSON.stringify({
              id: Number(userIdFromResponse),
              ...user,
            })
          );
        }
      }

      if (normalizedRole === "it_user") {
        if (userIdFromResponse) {
          sessionStorage.setItem("customerUserId", userIdFromResponse);
          sessionStorage.setItem(
            "customerUser",
            JSON.stringify({
              id: Number(userIdFromResponse),
              ...user,
            })
          );
        }
        if (parentIdFromResponse) {
          sessionStorage.setItem("adminId", String(parentIdFromResponse));
        }
      }

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
        const redirectPath = ROLE_REDIRECT[normalizedRole];

        if (!redirectPath) {
          Swal.fire("Unknown User Type", "Please contact support.", "warning");
          return;
        }

        router.push(redirectPath);
      });
    } catch (err) {
      Swal.fire({
        title: "Login Failed!",
        text: err.response?.data?.message || err.response?.data?.messages || err.message || "Login failed. Please try again.",
        icon: "error",
        confirmButtonColor: "#D33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <div className="signin-page flex flex-col lg:flex-row h-screen w-full">
      <div className="signin-left-panel hidden lg:block lg:w-1/2 h-full overflow-hidden">
        <ImageSlider />
      </div>

      <div className="signin-right-panel w-full lg:w-1/2 flex items-center justify-center px-5 py-8 md:px-8 md:py-10 2xl:py-16">
        <Card className="signin-card w-full max-w-md 2xl:max-w-lg p-5 sm:p-6 2xl:p-8 rounded-3xl">
          <CardHeader className="signin-card-header">
            <div className="signin-brand-row">
              <div className="signin-logo-shell relative w-16 h-16 sm:w-20 sm:h-20 2xl:w-24 2xl:h-24 p-1">
                <div className="signin-logo-inner w-full h-full flex items-center justify-center">
                  <Image
                    src="/Logo.png"
                    alt="M-Place Logo"
                    width={80}
                    height={80}
                    className="signin-logo-image w-12 h-12 sm:w-16 sm:h-16 2xl:w-20 2xl:h-20 object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
            <h2 className="signin-title text-2xl 2xl:text-3xl font-semibold">Welcome Back</h2>
            <p className="signin-subtitle mb-4 2xl:mb-5 2xl:text-lg">
              Login to continue to your account
            </p>
          </CardHeader>
          <CardContent className="signin-card-content">
            <form className="signin-form space-y-4 2xl:space-y-6" onSubmit={handleSubmit}>
              <div className="signin-field">
                <label htmlFor="email" className="signin-label text-sm 2xl:text-base">
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
                    className="signin-input signin-input-with-icon 2xl:h-12 2xl:text-base"
                  />
                </div>
              </div>

              <div className="signin-field">
                <label htmlFor="password" className="signin-label text-sm 2xl:text-base">
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
                    className="signin-input signin-input-with-icon signin-password-input 2xl:h-12 2xl:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="signin-eye-toggle absolute inset-y-0 right-3 flex items-center"
                  >
                    {showPassword ? <EyeOff size={20} className="2xl:w-6 2xl:h-6" /> : <Eye size={20} className="2xl:w-6 2xl:h-6" />}
                  </button>
                </div>
              </div>

             <div className="signin-meta flex justify-between items-center text-sm 2xl:text-base">
                <label className="signin-remember flex items-center">
                  <input
                    type="checkbox"
                    checked={ rememberMe }
                    onChange={ () => setRememberMe(!rememberMe) }
                    className="signin-checkbox mr-2 w-4 h-4 2xl:w-5 2xl:h-5"
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
                className="signin-submit w-full py-2.5 2xl:py-3 flex items-center justify-center text-base 2xl:text-lg"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <span className="signin-submit-content">
                    <span>SIGN IN</span>
                    <ArrowRight size={ 18 } className="signin-submit-icon" />
                  </span>
                )}
              </Button>
            </form>

            <p className="signin-footer text-center text-sm 2xl:text-base mt-4 2xl:mt-6">
              New here? <Link href="/LandingPage" className="signin-create-account"  >Create an account</Link>

            </p>
          </CardContent >
        </Card>
      </div>
    </div>
  );
}
