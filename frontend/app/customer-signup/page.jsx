"use client";

import React, { useState, useRef } from "react";
import "./customerSignup.css";
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
  Fade,
} from "@mui/material";
import {
  Send as SendIcon,
  Visibility,
  VisibilityOff,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowForwardIcon,
  Badge as BadgeIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const CustomerSignup = () => {
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    companyName: "",
    registrationNumber: "",
    companyWebsite: "",
    gstNumber: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    otp: "",
    address: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const otpInputRefs = useRef([]);

  const { countries, states, cities } = useCountriesStatesCities(
    formValues.country,
    formValues.state
  );

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
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

  /* ---------- Input ---------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue =
      name === "phoneNumber"
        ? value.replace(/\D/g, "").slice(0, 10)
        : name === "otp"
          ? value.replace(/\D/g, "").slice(0, 4)
          : name === "postalCode"
            ? value.replace(/\D/g, "").slice(0, 6)
            : value;

    setFormValues((prev) => {
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

  const updateOtpDigits = (nextDigits) => {
    setOtpDigits(nextDigits);
    setFormValues((prev) => ({ ...prev, otp: nextDigits.join("") }));
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

  /* ---------- OTP ---------- */
  const handleOtpRequest = async () => {
    const normalizedEmail = formValues.email.trim();

    if (!normalizedEmail) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      Swal.fire("Enter email first");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
      Swal.fire("Enter a valid email");
      return;
    }

    setOtpDigits(["", "", "", ""]);
    setFormValues((prev) => ({ ...prev, otp: "" }));
    setShowOtpInput(true);
    setLoadingOtp(true);

    try {
      const res = await fetch(
        'http://localhost:5000/api/user-admin/send-otp',
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalizedEmail }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setErrors((prev) => ({ ...prev, email: null }));
        setOtpSent(true);
        setTimeout(() => setOtpSent(false), 3000);
        Swal.fire("Success", data.message || "OTP sent successfully", "success");
      } else {
        const apiMessage = (data.message || data.error || "").trim();
        const isExistingEmail =
          res.status === 409 || /email already exists/i.test(apiMessage);

        if (isExistingEmail) {
          setOtpSent(false);
          setShowOtpInput(false);
          setOtpDigits(["", "", "", ""]);
          setFormValues((prev) => ({ ...prev, otp: "" }));
          setErrors((prev) => ({ ...prev, email: "Email already exists." }));
          Swal.fire("Error", "Email already exists.", "error");
          return;
        }

        setShowOtpInput(false);
        setOtpDigits(["", "", "", ""]);
        setFormValues((prev) => ({ ...prev, otp: "" }));
        Swal.fire("Error", apiMessage || "OTP send failed", "error");
      }
    } catch {
      setShowOtpInput(false);
      setOtpDigits(["", "", "", ""]);
      setFormValues((prev) => ({ ...prev, otp: "" }));
      Swal.fire("Error", "OTP send failed", "error");
    } finally {
      setLoadingOtp(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

    if (!formValues.companyName) newErrors.companyName = "Company name is required";
    if (!formValues.gstNumber) newErrors.gstNumber = "GST Number is required";
    if (!formValues.firstName) newErrors.firstName = "First name is required";
    if (!formValues.lastName) newErrors.lastName = "Last name is required";
    if (!formValues.email) newErrors.email = "Email is required";
    else if (!validateEmail(formValues.email)) newErrors.email = "Invalid email format";
    if (!formValues.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    else if (!validatePhone(formValues.phoneNumber)) newErrors.phoneNumber = "Phone must be 10 digits";
    if (!/^\d{4}$/.test(formValues.otp)) newErrors.otp = "OTP must be 4 digits";
    if (!formValues.address) newErrors.address = "Address is required";
    if (!formValues.country) newErrors.country = "Country is required";
    if (!formValues.state) newErrors.state = "State is required";
    if (!formValues.city) newErrors.city = "City is required";
    if (!formValues.postalCode) newErrors.postalCode = "Postal code is required";
    else if (!/^[0-9]{6}$/.test(formValues.postalCode)) {
      newErrors.postalCode = "Postal code must be 6 digits";
    }
    if (!formValues.password) newErrors.password = "Password is required";
    else if (formValues.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!passwordPattern.test(formValues.password)) {
      newErrors.password =
        "Password must include at least one uppercase letter, one number, and one special character";
    }
    if (!formValues.confirmPassword) newErrors.confirmPassword = "Please confirm password";
    else if (formValues.password !== formValues.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoadingSubmit(true);

    try {
      const { confirmPassword, ...payload } = formValues;
      const response = await fetch(
        'http://localhost:5000/api/user-admin/signup',
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        if (result.authToken) sessionStorage.setItem("authToken", result.authToken);
        if (result.userId) sessionStorage.setItem("userId", result.userId);

        Swal.fire({
          title: "The user created successfully",
          html: `
            <div class="signupSuccessWrap">
              <div class="successLogoPulse">
                <span class="successLogoCheck">&#10003;</span>
              </div>
              <p class="signupSuccessText">Customer registered successfully.</p>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonText: "Continue",
          customClass: {
            popup: "signupSuccessPopup",
            confirmButton: "signupSuccessConfirm",
          },
          buttonsStyling: false,
        }).then(() => router.push("/SignIn"));
        setFormValues({
          companyName: "",
          registrationNumber: "",
          companyWebsite: "",
          gstNumber: "",
          firstName: "",
          lastName: "",
          phoneNumber: "",
          email: "",
          otp: "",
          address: "",
          country: "",
          state: "",
          city: "",
          postalCode: "",
          password: "",
          confirmPassword: "",
        });
        setShowOtpInput(false);
        setOtpDigits(["", "", "", ""]);
        setPasswordStrength(0);
      } else {
        Swal.fire("Failed", result.message || result.error || "Signup failed", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    }

    setLoadingSubmit(false);
  };

  const isCompanyStepComplete = Boolean(
    formValues.companyName.trim() ||
    formValues.registrationNumber.trim() ||
    formValues.companyWebsite.trim() ||
    formValues.gstNumber.trim()
  );
  const isContactStepComplete = Boolean(
    formValues.firstName.trim() ||
    formValues.lastName.trim() ||
    formValues.email.trim() ||
    formValues.phoneNumber.trim() ||
    formValues.otp.trim()
  );
  const isAddressStepComplete = Boolean(
    formValues.address.trim() ||
    formValues.country ||
    formValues.state ||
    formValues.city ||
    formValues.postalCode.trim()
  );
  const isSecurityStepComplete = Boolean(
    formValues.password.trim() || formValues.confirmPassword.trim()
  );
  const normalizedCustomerEmail = formValues.email.trim();
  const isCustomerEmailValid = validateEmail(normalizedCustomerEmail);
  const isCustomerSendOtpDisabled = loadingOtp || !isCustomerEmailValid;

  return (
    <Container maxWidth="lg" className="signupContainer">
      <Paper className="signupCard" elevation={3}>
        <Box className="cardHeader">
          <Typography variant="h4" className="headerTitle">
            IT User
          </Typography>
          <Typography variant="body1" className="headerSubtitle">
            Register your organization and start managing procurement with confidence.
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
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box className="detailsOverallBox">
            <Box className="sectionHeader">
              <BusinessIcon className="sectionIcon" />
              <Typography variant="h6" className="sectionTitle">
                Company Details
              </Typography>
              {/* <Chip
                  label="Required"
                  size="small"
                  className="requiredChip"
                  icon={<CheckCircleIcon />}
                /> */}
            </Box>
            <Card className="formSection" elevation={0}>
              <CardContent>


                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Name *"
                      name="companyName"
                      value={formValues.companyName}
                      onChange={handleInputChange}
                      error={!!errors.companyName}
                      helperText={errors.companyName}
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
                      label="Registration Number"
                      name="registrationNumber"
                      value={formValues.registrationNumber}
                      onChange={handleInputChange}
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

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Company Website"
                      name="companyWebsite"
                      value={formValues.companyWebsite}
                      onChange={handleInputChange}
                      className="formField"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="GST Number"
                      name="gstNumber"
                      value={formValues.gstNumber}
                      onChange={handleInputChange}
                      error={!!errors.gstNumber}
                      helperText={errors.email}
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
                      value={formValues.email}
                      onChange={handleInputChange}
                      error={!!errors.email}
                      helperText={errors.email}
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
                      onClick={handleOtpRequest}
                      disabled={isCustomerSendOtpDisabled}
                      className="otpBtn"
                      startIcon={<SendIcon />}
                    >
                      {loadingOtp ? "Sending..." : "Send OTP"}
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
                          OTP sent successfully to {formValues.email}
                        </Alert>
                      </Fade>
                    </Grid>
                  )}

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      name="firstName"
                      value={formValues.firstName}
                      onChange={handleInputChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
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

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Last Name *"
                      name="lastName"
                      value={formValues.lastName}
                      onChange={handleInputChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
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

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Phone Number *"
                      name="phoneNumber"
                      value={formValues.phoneNumber}
                      onChange={handleInputChange}
                      inputProps={{ maxLength: 10, inputMode: "numeric", pattern: "[0-9]*" }}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
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
                </Grid>
              </CardContent>
            </Card>

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
                      value={formValues.address}
                      onChange={handleInputChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      multiline
                      rows={2}
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

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl sx={{ width: '150px' }} error={!!errors.country} className="formField">
                      <InputLabel>Country *</InputLabel>
                      <FormControl sx={{ width: 150 }}>
                        <Select
                          name="country"
                          value={formValues.country}
                          onChange={handleInputChange}
                          displayEmpty
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                maxHeight: 250,   // 🔹 controls dropdown height
                                width: 200       // 🔹 controls dropdown width
                              }
                            }
                          }}

                        >
                          <MenuItem value="">
                            <em>Select Country</em>
                          </MenuItem>

                          {countries.map((country) => (
                            <MenuItem
                              key={country.code}
                              value={country.name}
                              sx={{ fontSize: "14px", minHeight: "30px" }}
                            >
                              {country.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {errors.country && <FormHelperText>{errors.country}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl sx={{ width: '150px' }} error={!!errors.state} className="formField">
                      <InputLabel>State *</InputLabel>
                      <Select
                        name="state"
                        value={formValues.state}
                        onChange={handleInputChange}
                        label="State *"
                        disabled={!formValues.country}
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
                      {errors.state && <FormHelperText>{errors.state}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl sx={{ width: '150px' }} error={!!errors.city} className="formField">
                      <InputLabel>City *</InputLabel>
                      <Select
                        name="city"
                        value={formValues.city}
                        onChange={handleInputChange}
                        label="City *"
                        disabled={!formValues.state}
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
                      {errors.city && <FormHelperText>{errors.city}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      sx={{ width: '150px' }}
                      label="Postal Code *"
                      name="postalCode"
                      value={formValues.postalCode}
                      onChange={handleInputChange}
                      disabled={!formValues.country || !formValues.state || !formValues.city}
                      inputProps={{
                        maxLength: 6,
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                      }}
                      error={!!errors.postalCode}
                      helperText={errors.postalCode}
                      className="formField"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

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
                      value={formValues.password}
                      onChange={handleInputChange}
                      error={!!errors.password}
                      helperText={
                        errors.password ||
                        "Password must include at least one uppercase letter, one number, and one special character."
                      }
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
                    {formValues.password && (
                      <Box className="passwordStrength">
                        <Box
                          className="strengthBar"
                          sx={{
                            width: `${passwordStrength}%`,
                            backgroundColor: getPasswordStrengthColor(),
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
                      value={formValues.confirmPassword}
                      onChange={handleInputChange}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
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

          <Box className="formActions">
            <Button
              variant="contained"
              type="submit"
              className="submitBtn"
              size="large"
              endIcon={<SendIcon />}
              disabled={loadingSubmit}
            >
              {loadingSubmit ? "Submitting..." : "Register Customer"}
            </Button>

            <Typography variant="caption" className="requiredNote">
              * All marked fields are required
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CustomerSignup;
