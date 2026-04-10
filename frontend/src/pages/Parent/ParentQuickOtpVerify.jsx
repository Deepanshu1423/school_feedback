import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

const ParentQuickOtpVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mobile = searchParams.get("mobile") || "";
  const formId = searchParams.get("formId") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!mobile) {
      setMessage("Mobile number not found. Please go back and try again.");
      return;
    }

    if (!otp.trim()) {
      setMessage("Please enter OTP.");
      return;
    }

    if (!/^[0-9]{4,6}$/.test(otp.trim())) {
      setMessage("Please enter a valid OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/quick-parent-login/verify-otp", {
        mobile,
        otp: otp.trim(),
      });

      const data = response.data;

      if (!data?.token || !data?.user) {
        setMessage("Invalid verification response.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setIsSuccess(true);
      setMessage("OTP verified successfully.");

      navigate(
        `/submit-feedback/${data.user.userId}?quickLogin=1${
            formId ? `&formId=${formId}` : ""
        }`
      );
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setMessage("");
    setIsSuccess(false);

    if (!mobile) {
      setMessage("Mobile number not found. Please go back and try again.");
      return;
    }

    try {
      setResendLoading(true);

      const response = await api.post("/auth/quick-parent-login/send-otp", {
        mobile,
      });

      if (response.data?.success) {
        setIsSuccess(true);
        setMessage("OTP resent successfully.");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#d6c2a8] bg-[#fffaf3] shadow-xl">
        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#2d241a] to-[#b08d57] px-6 py-8 text-white">
          <h1 className="text-3xl font-bold leading-tight">
            Verify OTP
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/90">
            Enter the OTP sent to your registered mobile number.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
            <p className="text-sm font-semibold text-[#1a1a1a]">
              Registered Mobile
            </p>
            <p className="mt-1 text-sm text-[#6b7280]">
              {mobile || "N/A"}
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

          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                OTP
              </label>
              <input
                type="tel"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                placeholder="Enter OTP"
                className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-base text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#b08d57] px-5 py-3.5 text-base font-semibold text-black shadow-md transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="w-full rounded-2xl bg-[#e8dcc8] px-5 py-3.5 text-base font-semibold text-black shadow-sm transition hover:bg-[#d6c2a8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParentQuickOtpVerify;