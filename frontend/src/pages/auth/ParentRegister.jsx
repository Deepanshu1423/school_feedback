import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ParentRegister = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (
      !formData.fullName ||
      !formData.mobile ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage("Please fill all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/send-register-otp", {
        mobile: formData.mobile,
      });

      setIsSuccess(true);
      setMessage("OTP sent successfully");
      setStep(2);
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!formData.otp) {
      setMessage("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/verify-register-otp", {
        mobile: formData.mobile,
        otp: formData.otp,
      });

      const response = await api.post("/auth/register-parent", {
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });

      const parentCode =
        response.data?.data?.parentCode || response.data?.parentCode || "";

      setIsSuccess(true);
      setMessage(
        `Registration successful. Your Parent Code is ${parentCode}. Please save it for future reference.`
      );

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2500);
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setMessage("");
    setIsSuccess(false);

    try {
      setLoading(true);

      await api.post("/auth/send-register-otp", {
        mobile: formData.mobile,
      });

      setIsSuccess(true);
      setMessage("OTP resent successfully");
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-[#fffaf3] border border-[#d6c2a8] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
          <div className="flex flex-col justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d241a] to-[#b08d57] p-8 sm:p-10 lg:p-12 text-white">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Parent
              <br />
              Registration
            </h1>

            <p className="mt-5 text-sm sm:text-base leading-7 text-[#f7f1e8]/90">
              Create your parent account to submit feedback, track responses,
              and view your feedback history in the School Feedback System.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xl font-semibold">Step 1</p>
                <p className="mt-1 text-sm sm:text-base text-[#f7f1e8]/90">
                  Fill parent details and send OTP.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xl font-semibold">Step 2</p>
                <p className="mt-1 text-sm sm:text-base text-[#f7f1e8]/90">
                  Verify OTP and complete registration.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#fffaf3] p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
                  {step === 1 ? "Create Account" : "Verify OTP"}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#6b7280]">
                  {step === 1
                    ? "Register as parent with OTP verification"
                    : "Enter the OTP sent to your mobile number"}
                </p>
              </div>

              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Mobile
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Enter mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
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
                      placeholder="Confirm password"
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
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={formData.mobile}
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
                    className="w-full rounded-xl bg-[#b08d57] px-4 py-3 font-semibold text-black shadow-md transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:bg-[#d6c2a8] disabled:text-black"
                  >
                    {loading ? "Verifying..." : "Verify OTP & Register"}
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
                      setIsSuccess(false);
                    }}
                    className="w-full text-sm font-medium text-[#6b7280] hover:text-[#1a1a1a]"
                  >
                    Back
                  </button>
                </form>
              )}

              {message && (
                <div
                  className={`mt-4 rounded-lg px-4 py-3 text-sm border ${
                    isSuccess
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="mt-6 text-center text-sm text-[#7a7a7a]">
                Already have an account?{" "}
                <Link
                  to="/"
                  className="font-semibold text-[#b08d57] hover:underline"
                >
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

export default ParentRegister;