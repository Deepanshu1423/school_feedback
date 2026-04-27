import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const ParentProfile = () => {
  const navigate = useNavigate();
  const { parentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [mobileSending, setMobileSending] = useState(false);
  const [mobileVerifying, setMobileVerifying] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileMessage, setMobileMessage] = useState("");
  const [mobileError, setMobileError] = useState("");

  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    address: "",
    newMobile: "",
    mobileOtp: "",
    newEmail: "",
    emailOtp: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setMessage("");
        setError("");

        const response = await api.get(`/parent/profile/${parentId}`);
        const profileData = response.data?.data || null;

        setProfile(profileData);

        setFormData({
          fullName: profileData?.FullName || "",
          email: profileData?.Email || "",
          mobile: profileData?.Mobile || "",
          alternateMobile: profileData?.AlternateMobile || "",
          address: profileData?.Address || "",
          newMobile: "",
          mobileOtp: "",
          newEmail: "",
          emailOtp: "",
        });
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load parent profile."
        );
      } finally {
        setLoading(false);
      }
    };

    if (parentId) {
      fetchProfile();
    }
  }, [parentId]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date
      .toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
  };

  const getDayLabel = (dateValue) => {
    if (!dateValue) return "";

    const inputDate = new Date(dateValue);
    const today = new Date();
    const yesterday = new Date();

    today.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const compareDate = new Date(inputDate);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) return "Today";
    if (compareDate.getTime() === yesterday.getTime()) return "Yesterday";
    return "";
  };

  const openEditModal = () => {
    setMessage("");
    setError("");

    setMobileMessage("");
    setMobileError("");
    setMobileOtpSent(false);

    setEmailMessage("");
    setEmailError("");
    setEmailOtpSent(false);

    setFormData({
      fullName: profile?.FullName || "",
      email: profile?.Email || "",
      mobile: profile?.Mobile || "",
      alternateMobile: profile?.AlternateMobile || "",
      address: profile?.Address || "",
      newMobile: "",
      mobileOtp: "",
      newEmail: "",
      emailOtp: "",
    });

    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setMessage("");
    setError("");

    setMobileMessage("");
    setMobileError("");
    setMobileOtpSent(false);

    setEmailMessage("");
    setEmailError("");
    setEmailOtpSent(false);
  };

    // =========================================
  // Logout handler
  // =========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedStudentId");
    localStorage.removeItem("selectedStudentName");
    localStorage.removeItem("selectedStudentClass");
    localStorage.removeItem("selectedStudentClassId");

    navigate("/");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "mobile" ||
      name === "alternateMobile" ||
      name === "newMobile" ||
      name === "mobileOtp" ||
      name === "emailOtp"
    ) {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: onlyDigits,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendMobileOtp = async () => {
    setMobileMessage("");
    setMobileError("");

    if (!formData.newMobile) {
      setMobileError("Please enter new mobile number");
      return;
    }

    if (!/^\d{10}$/.test(formData.newMobile)) {
      setMobileError("New mobile number must be exactly 10 digits");
      return;
    }

    if (formData.newMobile === formData.mobile) {
      setMobileError("New mobile number cannot be same as current mobile number");
      return;
    }

    if (
      formData.alternateMobile &&
      formData.newMobile === formData.alternateMobile
    ) {
      setMobileError("New mobile number cannot be same as alternate mobile number");
      return;
    }

    try {
      setMobileSending(true);

      const response = await api.post(
        `/auth/profile/${parentId}/change-mobile/send-otp`,
        {
          newMobile: formData.newMobile,
        }
      );

      if (response.data.success) {
        setMobileOtpSent(true);
        setMobileMessage(
          response.data.message || "OTP sent successfully to new mobile number"
        );
      }
    } catch (error) {
      setMobileError(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setMobileSending(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    setMobileMessage("");
    setMobileError("");

    if (!formData.newMobile) {
      setMobileError("Please enter new mobile number");
      return;
    }

    if (!formData.mobileOtp) {
      setMobileError("Please enter OTP");
      return;
    }

    try {
      setMobileVerifying(true);

      const response = await api.post(
        `/auth/profile/${parentId}/change-mobile/verify-otp`,
        {
          newMobile: formData.newMobile,
          otp: formData.mobileOtp,
        }
      );

      if (response.data.success) {
        const updatedMobile = response.data?.data?.mobile || formData.newMobile;

        setProfile((prev) => ({
          ...prev,
          Mobile: updatedMobile,
        }));

        setFormData((prev) => ({
          ...prev,
          mobile: updatedMobile,
          newMobile: "",
          mobileOtp: "",
        }));

        setMobileOtpSent(false);
        setMobileMessage(
          response.data.message || "Mobile number updated successfully"
        );
      }
    } catch (error) {
      setMobileError(error.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setMobileVerifying(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setEmailMessage("");
    setEmailError("");

    if (!formData.newEmail) {
      setEmailError("Please enter new email");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.newEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (
      (formData.newEmail || "").toLowerCase() ===
      (formData.email || "").toLowerCase()
    ) {
      setEmailError("New email cannot be same as current email");
      return;
    }

    try {
      setEmailSending(true);

      const response = await api.post(
        `/auth/profile/${parentId}/change-email/send-otp`,
        {
          newEmail: formData.newEmail,
        }
      );

      if (response.data.success) {
        setEmailOtpSent(true);
        setEmailMessage(
          response.data.message || "OTP sent successfully to current mobile number"
        );
      }
    } catch (error) {
      setEmailError(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setEmailSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setEmailMessage("");
    setEmailError("");

    if (!formData.newEmail) {
      setEmailError("Please enter new email");
      return;
    }

    if (!formData.emailOtp) {
      setEmailError("Please enter OTP");
      return;
    }

    try {
      setEmailVerifying(true);

      const response = await api.post(
        `/auth/profile/${parentId}/change-email/verify-otp`,
        {
          newEmail: formData.newEmail,
          otp: formData.emailOtp,
        }
      );

      if (response.data.success) {
        const updatedEmail = response.data?.data?.email || formData.newEmail;

        setProfile((prev) => ({
          ...prev,
          Email: updatedEmail,
        }));

        setFormData((prev) => ({
          ...prev,
          email: updatedEmail,
          newEmail: "",
          emailOtp: "",
        }));

        setEmailOtpSent(false);
        setEmailMessage(response.data.message || "Email updated successfully");
      }
    } catch (error) {
      setEmailError(error.response?.data?.message || "Failed to verify OTP.");
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (
      formData.alternateMobile &&
      !/^\d{10}$/.test(formData.alternateMobile)
    ) {
      setError("Alternate mobile number must be exactly 10 digits");
      return;
    }

    if (
      formData.alternateMobile &&
      formData.alternateMobile === formData.mobile
    ) {
      setError("Mobile and alternate mobile cannot be same");
      return;
    }

    try {
      setSaveLoading(true);

      const response = await api.put(`/parent/profile/${parentId}`, {
        fullName: formData.fullName,
        alternateMobile: formData.alternateMobile,
        address: formData.address,
      });

      if (response.data.success) {
        setProfile((prev) => ({
          ...prev,
          FullName: formData.fullName,
          AlternateMobile: formData.alternateMobile || null,
          Address: formData.address || null,
        }));

        setMessage(response.data.message || "Profile updated successfully");
        setShowEditModal(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-[#d6c2a8] bg-[#fffaf3]">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a] sm:text-3xl">
                Parent Profile
              </h1>
              <p className="mt-1 text-sm text-[#6b7280] sm:text-base">
                View and manage your account details
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={openEditModal}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Edit Profile
              </button>

              <button
                onClick={() => navigate(`/parent/dashboard/${parentId}`)}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Back to Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-[#f1e7d7] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#e5d7c1]"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          {loading && (
            <div className="mb-4 rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-[#5f5446]">
              Loading profile...
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {message}
            </div>
          )}

          {error && !showEditModal && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && profile && (
            <>
              <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-4 shadow-lg sm:p-5 lg:p-6">
                <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#2f2418]/20 bg-gradient-to-br from-[#171311] via-[#2b2119] to-[#b08d57] p-5 text-white sm:p-6">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                      My Profile
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/90 sm:text-base">
                      Review your parent account details and manage personal
                      information securely.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Parent ID
                  </p>
                  <p className="mt-3 text-xl font-bold text-[#1a1a1a]">
                    {profile.ParentId || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Parent Code
                  </p>
                  <p className="mt-3 text-xl font-bold text-[#1a1a1a]">
                    {profile.ParentCode || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Status
                  </p>
                  <div className="mt-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.IsActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {profile.IsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-6 shadow-md">
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-[#1a1a1a]">
                    Personal Information
                  </h3>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    All details are shown below. Use the header Edit Profile
                    button to manage them from one form.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-5">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Full Name
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#1a1a1a]">
                      {profile.FullName || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-5">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Email
                    </p>
                    <p className="mt-2 break-words text-base font-bold text-[#1a1a1a]">
                      {profile.Email || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-5">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Mobile
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#1a1a1a]">
                      {profile.Mobile || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-5">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Alternate Mobile
                    </p>
                    <p className="mt-2 text-lg font-bold text-[#1a1a1a]">
                      {profile.AlternateMobile || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-5 sm:col-span-2">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Address
                    </p>
                    <p className="mt-2 whitespace-pre-line text-base font-bold text-[#1a1a1a]">
                      {profile.Address || "N/A"}
                    </p>
                  </div>

                  
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/45 px-3 sm:px-4 py-4 sm:py-6 overflow-y-auto">
          <div className="relative w-full max-w-[640px] rounded-[24px] sm:rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl overflow-hidden max-h-[92vh]">
            <button
              onClick={closeEditModal}
              className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-lg sm:text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-4 sm:px-8 py-4 sm:py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Edit Profile
              </h2>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-[#ece1cf]">
                Manage all profile details from one place
              </p>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto max-h-[calc(92vh-110px)] sm:max-h-[calc(92vh-125px)]"
            >
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-[18px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Current Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-[18px] sm:rounded-[20px] border border-[#d7dce6] bg-[#edf1f8] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg text-[#6b7280] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    New Email
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      name="newEmail"
                      value={formData.newEmail}
                      onChange={handleChange}
                      placeholder="Enter new email"
                      className="w-full rounded-[18px] sm:rounded-[20px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                    />
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailSending}
                      className="w-full sm:w-auto sm:min-w-[120px] rounded-[18px] sm:rounded-[20px] bg-[#b79257] px-4 sm:px-5 py-3 sm:py-4 font-semibold text-black shadow-md transition hover:bg-[#a57f42] disabled:opacity-70"
                    >
                      {emailSending ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-[#8b7355]">
                    OTP will be sent to your current mobile number for email verification.
                  </p>
                </div>

                {emailOtpSent && (
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      OTP
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        name="emailOtp"
                        value={formData.emailOtp}
                        onChange={handleChange}
                        placeholder="Enter OTP"
                        className="w-full rounded-[18px] sm:rounded-[20px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={emailVerifying}
                        className="w-full sm:w-auto sm:min-w-[140px] rounded-[18px] sm:rounded-[20px] bg-black px-4 sm:px-5 py-3 sm:py-4 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-70"
                      >
                        {emailVerifying ? "Verifying..." : "Verify & Update"}
                      </button>
                    </div>
                  </div>
                )}

                {emailMessage && (
                  <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {emailMessage}
                  </div>
                )}

                {emailError && (
                  <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {emailError}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Current Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    readOnly
                    className="w-full cursor-not-allowed rounded-[18px] sm:rounded-[20px] border border-[#d7dce6] bg-[#edf1f8] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg text-[#6b7280] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    New Mobile
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      name="newMobile"
                      value={formData.newMobile}
                      onChange={handleChange}
                      placeholder="Enter new mobile number"
                      className="w-full rounded-[18px] sm:rounded-[20px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                    />
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      disabled={mobileSending}
                      className="w-full sm:w-auto sm:min-w-[120px] rounded-[18px] sm:rounded-[20px] bg-[#b79257] px-4 sm:px-5 py-3 sm:py-4 font-semibold text-black shadow-md transition hover:bg-[#a57f42] disabled:opacity-70"
                    >
                      {mobileSending ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </div>

                {mobileOtpSent && (
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      OTP
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        name="mobileOtp"
                        value={formData.mobileOtp}
                        onChange={handleChange}
                        placeholder="Enter OTP"
                        className="w-full rounded-[18px] sm:rounded-[20px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyMobileOtp}
                        disabled={mobileVerifying}
                        className="w-full sm:w-auto sm:min-w-[140px] rounded-[18px] sm:rounded-[20px] bg-black px-4 sm:px-5 py-3 sm:py-4 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-70"
                      >
                        {mobileVerifying ? "Verifying..." : "Verify & Update"}
                      </button>
                    </div>
                  </div>
                )}

                {mobileMessage && (
                  <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {mobileMessage}
                  </div>
                )}

                {mobileError && (
                  <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {mobileError}
                  </div>
                )}
              </div>


              
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Alternate Mobile
                </label>
                <input
                  type="text"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleChange}
                  placeholder="Enter alternate mobile number"
                  className="w-full rounded-[18px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-black">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                  className="w-full rounded-[18px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] resize-none"
                />
              </div>


              {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full flex-1 rounded-[20px] sm:rounded-[22px] bg-[#b79257] hover:bg-[#a57f42] disabled:opacity-70 text-black font-semibold py-3.5 sm:py-4 text-base sm:text-lg shadow-md transition"
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full sm:w-auto rounded-[20px] sm:rounded-[22px] bg-black text-white px-6 py-3.5 sm:py-4 text-base font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentProfile;