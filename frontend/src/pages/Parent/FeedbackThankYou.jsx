import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FeedbackThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("selectedStudentId");
      localStorage.removeItem("selectedStudentName");
      localStorage.removeItem("selectedStudentClass");
      localStorage.removeItem("selectedStudentClassId");

      navigate("/parent/quick-login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleDoneNow = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedStudentId");
    localStorage.removeItem("selectedStudentName");
    localStorage.removeItem("selectedStudentClass");
    localStorage.removeItem("selectedStudentClassId");

    navigate("/parent/quick-login");
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-[#d6c2a8] bg-[#fffaf3] shadow-xl">
        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#2d241a] to-[#b08d57] px-6 py-8 text-white text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-4xl shadow-sm">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight">
            Thank You
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#f7f1e8]/90">
            Your feedback has been submitted successfully.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4 text-center">
            <p className="text-sm font-semibold text-[#1a1a1a]">
              Submission Complete
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              Thank you for sharing your feedback. For security, your session
              will end automatically and the quick login page will open again.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleDoneNow}
              className="w-full rounded-2xl bg-[#b08d57] px-5 py-3.5 text-base font-semibold text-black shadow-md transition hover:bg-[#c39a5f]"
            >
              Done
            </button>

            <p className="text-center text-xs text-[#6b7280]">
              Redirecting to quick login in a few seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackThankYou;