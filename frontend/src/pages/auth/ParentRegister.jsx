import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ParentRegister = () => {
  const navigate = useNavigate();

  // =========================================
  // Step control
  // 1 = Fill parent details
  // 2 = Verify OTP
  // =========================================
  const [step, setStep] = useState(1);

  // =========================================
  // UI states
  // =========================================
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // =========================================
  // Form state
  // Address is OPTIONAL
  // =========================================
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  // =========================================
  // Generic input change handler
  // Mobile = digits only, max 10
  // OTP = digits only, max 6
  // =========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        mobile: onlyDigits,
      }));
      return;
    }

    if (name === "otp") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        otp: onlyDigits,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // Helper to show success / error messages
  // =========================================
  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  // =========================================
  // Step 1 validation before sending OTP
  // Address is NOT required
  // =========================================
  const validateStepOne = () => {
    if (!formData.fullName.trim()) {
      showMessage("Full name is required");
      return false;
    }

    if (!formData.mobile.trim()) {
      showMessage("Mobile number is required");
      return false;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      showMessage("Mobile number must be exactly 10 digits");
      return false;
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      showMessage("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      showMessage("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      showMessage("Password must be at least 6 characters");
      return false;
    }

    if (!formData.confirmPassword) {
      showMessage("Confirm password is required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showMessage("Password and confirm password do not match");
      return false;
    }

    return true;
  };

  // =========================================
  // Send OTP to mobile
  // Backend route:
  // POST /auth/send-register-otp
  // =========================================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!validateStepOne()) return;

    try {
      setLoading(true);

      const response = await api.post("/auth/send-register-otp", {
        mobile: formData.mobile,
      });

      if (response.data.success) {
        showMessage(
          response.data.message || "OTP sent successfully",
          "success",
        );
        setOtpVerified(false);
        setStep(2);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Verify OTP
  // Backend route:
  // POST /auth/verify-register-otp
  // =========================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!formData.otp) {
      showMessage("Please enter OTP");
      return;
    }

    if (!/^\d{4,6}$/.test(formData.otp)) {
      showMessage("Please enter a valid OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify-register-otp", {
        mobile: formData.mobile,
        otp: formData.otp,
      });

      if (response.data.success) {
        setOtpVerified(true);
        setMessage("");
        setMessageType("");
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Final registration after OTP verification
  // Backend route:
  // POST /auth/register-parent
  // Address is optional and sent as-is
  // =========================================
  const handleRegisterParent = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!otpVerified) {
      showMessage("Please verify OTP before registration");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register-parent", {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        password: formData.password,
      });

      if (response.data.success) {
        showMessage(
          response.data.message || "Parent registered successfully",
          "success",
        );

        // Redirect to login after short delay
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Resend OTP
  // =========================================
  const handleResendOtp = async () => {
    setMessage("");
    setMessageType("");

    if (!formData.mobile) {
      showMessage("Mobile number is missing");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/send-register-otp", {
        mobile: formData.mobile,
      });

      if (response.data.success) {
        setOtpVerified(false);
        showMessage(
          response.data.message || "OTP resent successfully",
          "success",
        );
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Go back from OTP step to details step
  // =========================================
  const handleBackToDetails = () => {
    setStep(1);
    setOtpVerified(false);
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-[#d8c3a0] bg-white shadow-2xl lg:grid-cols-2">
          {/* =========================================
              Left info section
          ========================================= */}
          <div className="bg-gradient-to-br from-black via-[#1a1410] to-[#a67c3d] px-6 py-10 text-white sm:px-10 lg:px-12">
            <div className="max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ead8bd]">
                School Feedback System
              </p>

              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                Parent Registration
              </h1>

              <p className="mt-4 text-sm leading-7 text-[#f3e6d2] sm:text-base">
                Create your parent account securely using OTP verification.
                Address is optional and can also be updated later from your
                profile.
              </p>

              <div className="mt-8 space-y-3 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-lg">1</span>
                  <p className="text-sm text-[#f7f1e8]">
                    Enter your parent details and mobile number
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 text-lg">2</span>
                  <p className="text-sm text-[#f7f1e8]">
                    Receive OTP on your mobile and verify it
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 text-lg">3</span>
                  <p className="text-sm text-[#f7f1e8]">
                    Complete registration and log in
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f3eadc]"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>

          {/* =========================================
              Right form section
          ========================================= */}
          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="mx-auto max-w-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black sm:text-3xl">
                  {step === 1 ? "Enter Details" : "Verify OTP"}
                </h2>
                <p className="mt-2 text-sm text-[#6b7280]">
                  {step === 1
                    ? "Fill your details to receive OTP"
                    : "Verify the OTP and complete registration"}
                </p>
              </div>

              {message && (
                <div
                  className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
                    messageType === "success"
                      ? "border border-green-200 bg-green-50 text-green-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email (optional)"
                      className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Mobile
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                    />
                  </div>

                  {/* Address - Optional */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address (optional)"
                      rows={3}
                      className="w-full resize-none rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                    />
                    <p className="mt-2 text-xs text-[#7b8794]">Optional</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[24px] bg-[#b79257] py-4 text-base font-semibold text-black shadow-md transition hover:bg-[#a57f42] disabled:opacity-70"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterParent} className="space-y-5">
                  {!otpVerified && (
                    <>
                      {/* OTP */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-black">
                          OTP
                        </label>
                        <input
                          type="text"
                          name="otp"
                          value={formData.otp}
                          onChange={handleChange}
                          placeholder="Enter OTP"
                          className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                        />
                        <p className="mt-2 text-xs text-[#7b8794]">
                          OTP sent to {formData.mobile}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="w-full rounded-[24px] bg-black py-4 text-base font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-70"
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </>
                  )}

                  {otpVerified && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                      OTP verified successfully. You can now complete
                      registration.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !otpVerified}
                    className="w-full rounded-[24px] bg-[#b79257] py-4 text-base font-semibold text-black shadow-md transition hover:bg-[#a57f42] disabled:opacity-70"
                  >
                    {loading ? "Registering..." : "Complete Registration"}
                  </button>

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="w-full rounded-[22px] border border-[#d8c3a0] bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f6efe4] disabled:opacity-70"
                    >
                      Resend OTP
                    </button>

                    <button
                      type="button"
                      onClick={handleBackToDetails}
                      disabled={loading}
                      className="w-full rounded-[22px] border border-[#d8c3a0] bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f6efe4] disabled:opacity-70"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-[#6b7280]">
                Already have an account?{" "}
                <Link
                  to="/"
                  className="font-semibold text-[#9b7440] hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentRegister;
