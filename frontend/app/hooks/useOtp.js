import { useState } from "react";

export const useOtp = () => {
  const [otpMessage, setOtpMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleOtpRequest = async (email, endpoint) => {
    if (!email) {
      setOtpMessage("Email is required before requesting OTP.");
      return;
    }
    setLoading(true);
    setOtpError("");
    try {
      const otpRouteByEndpoint = {
        customer: "unavailable",
        vendor: "unavailable",
      };

      const otpRoute = otpRouteByEndpoint[endpoint];
      if (!otpRoute || otpRoute === "unavailable") {
        setOtpError("OTP requests are disabled because the API endpoint is not available in this backend.");
        return;
      }
    } catch (error) {
      setOtpError("Error sending OTP. Try again.");
      setTimeout(() => {
        setOtpMessage("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return { otpMessage, otpSent, setOtpError, otpError, loading, handleOtpRequest };
};
