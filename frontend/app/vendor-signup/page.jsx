"use client";

import React, { useState, useRef } from "react";
import "./vendorSignup.css";
import { useCountriesStatesCities } from "../hooks/useCountriesStatesCities";

import {
  TextField,
  Button,
  MenuItem,
  Grid,
  Paper,
  Typography,
  Select,
  InputLabel,
  FormControl,
  Box,
  IconButton,
  InputAdornment,
  Alert,
  Chip,
  FormHelperText,
  Container,
  Card,
  CardContent,
  Tooltip,
  Zoom,
  Fade,
} from "@mui/material";

import {
  Send as SendIcon,
  Add as AddIcon,
  Visibility,
  VisibilityOff,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  VpnKey as VpnKeyIcon,
  Badge as BadgeIcon,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  MenuBook as MenuBookIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

const SERVICES = [
  "Hardware Support",
  "Operating System Support",
  "Networking Support",
  "Audio & Video Conferencing Support",
  "Antivirus & Malware Support",
  "Identity & Access Support",
  "Patch & Update Management",
  "Backup & Data Protection",
  "Collaboration Tools Support",
  "Asset Lifecycle Support",
  "Environmental & Infrastructure Support",
  "Software–Hardware Compatibility Support",
];

const SERVICE_LEVELS = [
  { value: "L1", label: "Level 1 (Basic Support)", color: "#10b981" },
  { value: "L2", label: "Level 2 (Advanced Support)", color: "#f59e0b" },
  { value: "L3", label: "Level 3 (Expert Support)", color: "#ef4444" },
];

export default function VendorSignup() {
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    mobile: "",
    pan: "",
    gst: "",
    password: "",
    confirmPassword: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    otp: "",
  });

  const [services, setServices] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const otpInputRefs = useRef([]);
  const { countries, states, cities } = useCountriesStatesCities(
    form.country,
    form.state
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue =
      name === "mobile"
        ? value.replace(/\D/g, "").slice(0, 10)
        : name === "otp"
          ? value.replace(/\D/g, "").slice(0, 4)
        : name === "pincode"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value;

    setForm((prev) => {
      if (name === "country") {
        return { ...prev, country: sanitizedValue, state: "", city: "" };
      }

      if (name === "state") {
        return { ...prev, state: sanitizedValue, city: "" };
      }

      if (name === "email") {
        return { ...prev, email: sanitizedValue, otp: "" };
      }

      return { ...prev, [name]: sanitizedValue };
    });

    setErrors((prev) => ({
      ...prev,
      [name]: null,
      ...(name === "country" ? { state: null, city: null } : {}),
      ...(name === "state" ? { city: null } : {}),
    }));

    if (name === "password") {
      calculatePasswordStrength(sanitizedValue);
    }

    if (name === "email") {
      setShowOtpInput(false);
      setOtpDigits(["", "", "", ""]);
      setOtpSent(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    if (password.match(/[$@#&!]+/)) strength += 25;
    setPasswordStrength(Math.min(100, strength));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "#ef4444";
    if (passwordStrength < 75) return "#f59e0b";
    return "#10b981";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Medium";
    return "Strong";
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateMobile = (mobile) => {
    const re = /^[0-9]{10}$/;
    return re.test(mobile);
  };

  const updateOtpDigits = (nextDigits) => {
    setOtpDigits(nextDigits);
    setForm((prev) => ({ ...prev, otp: nextDigits.join("") }));
    setErrors((prev) => ({ ...prev, otp: null }));
  };

  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    updateOtpDigits(nextDigits);

    if (digit && index < otpInputRefs.current.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < otpInputRefs.current.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedDigits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pastedDigits) return;

    const nextDigits = ["", "", "", ""];
    pastedDigits.split("").forEach((digit, idx) => {
      nextDigits[idx] = digit;
    });
    updateOtpDigits(nextDigits);

    const focusIndex = Math.max(0, Math.min(pastedDigits.length, 4) - 1);
    otpInputRefs.current[focusIndex]?.focus();
  };

  const sendOtp = async () => {
    const normalizedEmail = form.email.trim();

    if (!normalizedEmail) {
      setErrors({ ...errors, email: "Email is required" });
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setErrors({ ...errors, email: "Invalid email format" });
      return;
    }

    setOtpDigits(["", "", "", ""]);
    setForm((prev) => ({ ...prev, otp: "" }));
    setShowOtpInput(true);
    setOtpLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/vendor-admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      if (res.ok) {
        setErrors((prev) => ({ ...prev, email: null }));
        setOtpSent(true);
        setTimeout(() => setOtpSent(false), 3000);
      } else {
        setShowOtpInput(false);
        setOtpDigits(["", "", "", ""]);
        setForm((prev) => ({ ...prev, otp: "" }));
      }
    } catch (error) {
      console.error("OTP send failed:", error);
      setShowOtpInput(false);
      setOtpDigits(["", "", "", ""]);
      setForm((prev) => ({ ...prev, otp: "" }));
    } finally {
      setOtpLoading(false);
    }
  };

  const addService = () => {
    setServices([...services, { name: "", level: "L1" }]);
  };

  const removeService = (index) => {
    const updated = services.filter((_, i) => i !== index);
    setServices(updated);
  };

  const updateService = (i, key, val) => {
    const copy = [...services];
    copy[i][key] = val;
    setServices(copy);
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

    if (!form.companyName) newErrors.companyName = "Company name is required";
    if (!form.contactPerson) newErrors.contactPerson = "Contact person is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!validateEmail(form.email)) newErrors.email = "Invalid email format";
    if (!form.mobile) newErrors.mobile = "Mobile number is required";
    else if (!validateMobile(form.mobile)) newErrors.mobile = "Mobile must be 10 digits";
    if (!/^\d{4}$/.test(form.otp)) newErrors.otp = "OTP must be 4 digits";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!passwordPattern.test(form.password)) {
      newErrors.password = "Password must include at least one uppercase letter, one number, and one special character";
    }
    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!form.address) newErrors.address = "Address is required";
    if (!form.country) newErrors.country = "Country is required";
    if (!form.state) newErrors.state = "State is required";
    if (!form.city) newErrors.city = "City is required";
    if (!form.pincode) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(form.pincode)) newErrors.pincode = "Pincode must be 6 digits";

    return newErrors;
  };

  const submitSignup = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = { ...form, services };

    try {
      const res = await fetch("http://localhost:5000/api/vendor-admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Registration successful! Please check your email for verification.");
        setForm({
          companyName: "",
          contactPerson: "",
          email: "",
          mobile: "",
          pan: "",
          gst: "",
          password: "",
          confirmPassword: "",
          address: "",
          country: "",
          state: "",
          city: "",
          pincode: "",
          otp: "",
        });
        setShowOtpInput(false);
        setOtpDigits(["", "", "", ""]);
        setServices([]);
      } else {
        alert(result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Network error. Please try again.");
    }
  };

  const isCompanyStepComplete = Boolean(
    form.companyName.trim() || form.contactPerson.trim()
  );
  const isContactStepComplete = Boolean(
    form.email.trim() ||
    form.otp.trim() ||
    form.mobile.trim() ||
    form.pan.trim() ||
    form.gst.trim()
  );
  const isAddressStepComplete = Boolean(
    form.address.trim() ||
    form.country ||
    form.state ||
    form.city ||
    form.pincode.trim()
  );
  const isSecurityStepComplete = Boolean(
    form.password.trim() || form.confirmPassword.trim()
  );
  const isServicesStepComplete = Boolean(services.length > 0);
  const normalizedVendorEmail = form.email.trim();
  const isVendorEmailValid = validateEmail(normalizedVendorEmail);
  const isVendorSendOtpDisabled = otpLoading || !isVendorEmailValid;

  return (
    <Container maxWidth="lg" className="signupContainer">
      <Paper className="signupCard" elevation={3}>
        {/* Header with Progress Indicator */}
        <Box className="cardHeader">
          <Typography variant="h4" className="headerTitle">
            Vendor Engineer Registration
          </Typography>
          <Typography variant="body1" className="headerSubtitle">
            Join our network of IT service providers
          </Typography>
          <Box className="headerSteps">
            <Chip
              icon={<BusinessIcon />}
              label="Company"
              className={`stepChip ${isCompanyStepComplete ? "active" : ""}`}
              size="small"
            />
            <ArrowForwardIcon className="stepArrow" />
            <Chip
              icon={<PersonIcon />}
              label="Contact"
              className={`stepChip ${isContactStepComplete ? "active" : ""}`}
              size="small"
            />
            <ArrowForwardIcon className="stepArrow" />
            <Chip
              icon={<LocationIcon />}
              label="Address"
              className={`stepChip ${isAddressStepComplete ? "active" : ""}`}
              size="small"
            />
            <ArrowForwardIcon className="stepArrow" />
            <Chip
              icon={<SecurityIcon />}
              label="Security"
              className={`stepChip ${isSecurityStepComplete ? "active" : ""}`}
              size="small"
            />
            <ArrowForwardIcon className="stepArrow" />
            <Chip
              icon={<MenuBookIcon />}
              label="Services"
              className={`stepChip ${isServicesStepComplete ? "active" : ""}`}
              size="small"
            />
          </Box>
        </Box>

        <form onSubmit={submitSignup}>
          <Box className="detailsOverallBox">
            {/* Company Information */}
            <Box className="sectionHeader">
              <BusinessIcon className="sectionIcon1" />
              <Typography variant="h6" className="sectionTitle1">
                Company Details
              </Typography>
            </Box>

            <Card className="formSection" elevation={0}>
            <CardContent>
             
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Company Name *"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    error={!!errors.companyName}
                    helperText={errors.companyName}
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Contact Person *"
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    error={!!errors.contactPerson}
                    helperText={errors.contactPerson}
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

            {/* Contact Information */}
            <Card className="formSection" elevation={0}>
            <CardContent>
              {/* <Box className="sectionHeader">
                <EmailIcon className="sectionIcon" />
                <Typography variant="h6" className="sectionTitle">
                  Contact Information
                </Typography>
              </Box> */}

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={sendOtp}
                    disabled={isVendorSendOtpDisabled}
                    className="otpBtn"
                    startIcon={<SendIcon />}
                  >
                    {otpLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </Grid>

                {showOtpInput && (
                  <Grid item xs={6} md={4} className="otpGridItem">
                    {/* <Typography className="otpLabel">Enter OTP</Typography> */}
                    <Box className="otpInputContainer" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, index) => (
                        <TextField
                          key={`otp-${index}`}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          inputRef={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          inputProps={{
                            maxLength: 1,
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                            "aria-label": `OTP digit ${index + 1}`,
                          }}
                          className={`otpDigitField ${errors.otp ? "otpDigitFieldError" : ""}`}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                    {errors.otp && (
                      <FormHelperText error className="otpHelperText">
                        {errors.otp}
                      </FormHelperText>
                    )}
                  </Grid>
                )}

                {otpSent && (
                  <Grid item xs={12}>
                    <Fade in={otpSent}>
                      <Alert severity="success" className="successAlert">
                        OTP sent successfully to {form.email}
                      </Alert>
                    </Fade>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number *"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    inputProps={{
                      maxLength: 10,
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    error={!!errors.mobile}
                    helperText={errors.mobile}
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    label="PAN"
                    name="pan"
                    value={form.pan}
                    onChange={handleChange}
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    label="GST"
                    name="gst"
                    value={form.gst}
                    onChange={handleChange}
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ReceiptIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

            {/* Address Information */}
            <Card className="formSection" elevation={0}>
            <CardContent>
              {/* <Box className="sectionHeader">
                <LocationIcon className="sectionIcon" />
                <Typography variant="h6" className="sectionTitle">
                  Address Information
                </Typography>
              </Box> */}

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    sx={{ width: '300px' }}
                    label="Address *"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    multiline
                    rows={2}
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth error={!!errors.country} className="formField">
                    <InputLabel>Country *</InputLabel>
                    <Select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      label="Country *"
                      displayEmpty // ensures placeholder is visible
                    >
                      <MenuItem value="">
                        <em>Select Country</em> {/* This acts as the placeholder */}
                      </MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.code} value={country.name}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.country && (
                      <FormHelperText>{errors.country}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth error={!!errors.state} className="formField">
                    <InputLabel>State *</InputLabel>
                    <Select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      label="State *"
                      disabled={!form.country}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Select State</em>
                      </MenuItem>
                      {states.map((state) => (
                        <MenuItem key={state.iso2} value={state.name}>
                          {state.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.state && (
                      <FormHelperText>{errors.state}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth error={!!errors.city} className="formField">
                    <InputLabel>City *</InputLabel>
                    <Select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      label="City *"
                      disabled={!form.state}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>Select City</em>
                      </MenuItem>
                      {cities.map((city, index) => (
                        <MenuItem key={`${city}-${index}`} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.city && (
                      <FormHelperText>{errors.city}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Postal Code *"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    disabled={!form.country || !form.state || !form.city}
                    inputProps={{
                      maxLength: 6,
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    error={!!errors.pincode}
                    helperText={errors.pincode}
                    variant="outlined"
                    className="formField"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

            {/* Security */}
            <Card className="formSection" elevation={0}>
            <CardContent>
              {/* <Box className="sectionHeader">
                <SecurityIcon className="sectionIcon" />
                <Typography variant="h6" className="sectionTitle">
                  Security
                </Typography>
              </Box> */}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    sx={{ width: '400px' }}
                    label="Password *"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={
                      errors.password ||
                      "Password must include at least one uppercase letter, one number, and one special character."
                    }
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            className="passwordToggle"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {form.password && (
                    <Box className="passwordStrength">
                      <Box
                        className="strengthBar"
                        sx={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      />
                      <Typography
                        variant="caption"
                        className="strengthText"
                        sx={{ color: getPasswordStrengthColor() }}
                      >
                        {getPasswordStrengthText()} Password
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    sx={{ width: '400px' }}
                    label="Confirm Password *"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    variant="outlined"
                    className="formField"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon className="fieldIcon" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            className="passwordToggle"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          </Box>

          {/* Services - Always Visible */}
          <Card className="formSection servicesSection" elevation={0}>
            <CardContent>
              <Box className="sectionHeader">
                <MenuBookIcon className="sectionIcon" />
                <Typography variant="h6" className="sectionTitle">
                  Services Offered
                </Typography>
                <Tooltip title="Add the services you provide" arrow placement="top">
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={addService}
                    className="addServiceBtn"
                    size="small"
                  >
                    Add Service
                  </Button>
                </Tooltip>
              </Box>

              {errors.services && (
                <FormHelperText error className="servicesError">
                  {errors.services}
                </FormHelperText>
              )}

              {/* Service List - Always Visible */}
              <Box className="serviceList">
                {services.length > 0 ? (
                  services.map((s, i) => (
                    <Zoom in={true} key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                      <Box className="serviceItem">
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth className="serviceSelect">
                              <InputLabel>Service *</InputLabel>
                              <Select
                                value={s.name || ""} // empty string initially
                                onChange={(e) => updateService(i, "name", e.target.value)}
                                displayEmpty
                                renderValue={(selected) => selected || "Select Services"} // show placeholder
                                label="Service *"
                              >
                                <MenuItem disabled value="">
                                  Select Services
                                </MenuItem>
                                {SERVICES.map((sv) => (
                                  <MenuItem key={sv} value={sv}>
                                    {sv}

                                  </MenuItem>
                                ))}
                              </Select>

                            </FormControl>
                          </Grid>

                          <Grid item xs={10} md={5}>
                            <FormControl fullWidth className="serviceSelect">
                              <InputLabel>Support Level *</InputLabel>
                              <Select
                                value={s.level}
                                onChange={(e) => updateService(i, "level", e.target.value)}
                                label="Support Level *"
                              >
                                {SERVICE_LEVELS.map((level) => (
                                  <MenuItem key={level.value} value={level.value}>
                                    <Box className="levelOption">
                                      <span>{level.label}</span>
                                      <Chip
                                        label={level.value}
                                        size="small"
                                        sx={{
                                          backgroundColor: level.color,
                                          color: 'white',
                                          ml: 1
                                        }}
                                      />
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={2} md={1}>
                            <Tooltip title="Remove service" arrow>
                              <IconButton
                                onClick={() => removeService(i)}
                                className="removeServiceBtn"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Box>
                    </Zoom>
                  ))
                ) : (
                  <Fade in={true}>
                    <Box className="emptyServices">
                      <MenuBookIcon className="emptyIcon" />
                      <Typography variant="body1" className="emptyText">
                        No services added yet
                      </Typography>
                      <Typography variant="body2" className="emptySubtext">
                        Click the "Add Service" button to start adding your services
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Box>

              {/* Quick Service Suggestions */}
              {services.length === 0 && (
                <Box className="serviceSuggestions">
                  <Typography variant="subtitle2" className="suggestionsTitle">
                    Popular Services:
                  </Typography>
                  <Box className="suggestionChips">
                    {SERVICES.slice(0, 4).map((service) => (
                      <Chip
                        key={service}
                        label={service}
                        onClick={() => setServices([...services, { name: service, level: "L1" }])}
                        className="suggestionChip"
                        clickable
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Form Actions - Centered */}
          <Box className="formActions">
            <Button
              variant="contained"
              type="submit"
              className="submitBtn"
              size="large"
              endIcon={<SendIcon />}
            >
              Register Vendor
            </Button>

            <Typography variant="caption" className="requiredNote">
              * All marked fields are required
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
