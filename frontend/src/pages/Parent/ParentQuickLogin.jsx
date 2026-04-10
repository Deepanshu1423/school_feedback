import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

const ParentQuickLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const formId = searchParams.get("formId") || "";
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!mobile.trim()) {
      setMessage("Please enter mobile number.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile.trim())) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/quick-parent-login/send-otp", {
        mobile: mobile.trim(),
      });

      if (response.data?.success) {
        setIsSuccess(true);
        setMessage("OTP sent successfully.");

        navigate(
          `/parent/quick-login/verify?mobile=${mobile.trim()}${
            formId ? `&formId=${formId}` : ""
          }`
        );
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#d6c2a8] bg-[#fffaf3] shadow-xl">
        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#2d241a] to-[#b08d57] px-6 py-8 text-white">
          <h1 className="text-3xl font-bold leading-tight">
            Parent Quick Login
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/90">
            Enter your registered mobile number to receive OTP and continue to the feedback form.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
            <p className="text-sm font-semibold text-[#1a1a1a]">
              Parents Meeting Feedback
            </p>
            <p className="mt-1 text-sm text-[#6b7280]">
              Submit feedback directly by logging in with your registered mobile number..
            </p>
          </div>

          {message && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
                isSuccess
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                placeholder="Enter registered mobile number"
                className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-base text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#b08d57] px-5 py-3.5 text-base font-semibold text-black shadow-md transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentQuickLogin;