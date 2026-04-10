import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    identifier: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.identifier) {
      setMessage("Please enter email or mobile");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/send-forgot-password-otp", {
        identifier: formData.identifier,
      });

      setMessage("OTP sent successfully");
      setStep(2);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.otp) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/verify-forgot-password-otp", {
        identifier: formData.identifier,
        otp: formData.otp,
      });

      setMessage("OTP verified successfully");
      setStep(3);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.newPassword || !formData.confirmPassword) {
      setMessage("Please fill all password fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        identifier: formData.identifier,
        newPassword: formData.newPassword,
      });

      setMessage("Password reset successful");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setMessage("");

    try {
      setLoading(true);

      await api.post("/auth/send-forgot-password-otp", {
        identifier: formData.identifier,
      });

      setMessage("OTP resent successfully");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-[#fffaf3] border border-[#d6c2a8] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
          {/* Left Side */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d241a] to-[#b08d57] p-8 sm:p-10 lg:p-12 text-white">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Forgot
              <br />
              Password
            </h1>

            <p className="mt-5 text-sm sm:text-base leading-7 text-[#f7f1e8]/90">
              Recover your account securely using OTP verification and set a new
              password to access the School Feedback System again.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xl font-semibold">Step 1</p>
                <p className="mt-1 text-sm sm:text-base text-[#f7f1e8]/90">
                  Enter your email or mobile and send OTP.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xl font-semibold">Step 2</p>
                <p className="mt-1 text-sm sm:text-base text-[#f7f1e8]/90">
                  Verify the OTP sent to your account.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xl font-semibold">Step 3</p>
                <p className="mt-1 text-sm sm:text-base text-[#f7f1e8]/90">
                  Create a new password and login again.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center bg-[#fffaf3] p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
                  {step === 1
                    ? "Recover Account"
                    : step === 2
                    ? "Verify OTP"
                    : "Reset Password"}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#6b7280]">
                  {step === 1
                    ? "Enter your email or mobile to receive OTP"
                    : step === 2
                    ? "Enter the OTP sent to your account"
                    : "Set your new password"}
                </p>
              </div>

              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Email or Mobile
                    </label>
                    <input
                      type="text"
                      name="identifier"
                      placeholder="Enter email or mobile"
                      value={formData.identifier}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#b08d57] px-4 py-3 font-semibold text-black shadow-md transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:bg-[#b08d57] disabled:text-black disabled:opacity-100"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Identifier
                    </label>
                    <input
                      type="text"
                      value={formData.identifier}
                      disabled
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#eee6d8] px-4 py-3 text-sm text-[#5b5b5b] outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#b08d57] px-4 py-3 font-semibold text-black shadow-md transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:bg-[#b08d57] disabled:text-black disabled:opacity-100"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="w-full rounded-xl border border-[#b08d57] bg-transparent px-4 py-3 font-semibold text-[#b08d57] transition hover:bg-[#b08d57] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Resend OTP
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setMessage("");
                    }}
                    className="w-full text-sm font-medium text-[#6b7280] hover:text-[#1a1a1a]"
                  >
                    Back
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#b08d57] px-4 py-3 font-semibold text-black shadow-md transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:bg-[#b08d57] disabled:text-black disabled:opacity-100"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}

              {message && (
                <div
                  className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                    message.toLowerCase().includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="mt-6 text-center text-sm text-[#7a7a7a]">
                Remember your password?{" "}
                <Link to="/" className="font-semibold text-[#b08d57] hover:underline">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;