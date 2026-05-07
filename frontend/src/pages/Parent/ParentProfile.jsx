import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const ParentProfile = () => {
  const navigate = useNavigate();
  const { parentId } = useParams();

  // =========================================
  // Main page states
  // =========================================
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  // =========================================
  // Mobile header menu states
  // On mobile, Edit Profile / Back / Logout are shown inside one menu
  // =========================================
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // =========================================
  // Edit profile modal states
  // =========================================
  const [showEditModal, setShowEditModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // =========================================
  // Mobile change OTP states
  // Mobile number still updates through OTP verification
  // =========================================
  const [mobileSending, setMobileSending] = useState(false);
  const [mobileVerifying, setMobileVerifying] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileMessage, setMobileMessage] = useState("");
  const [mobileError, setMobileError] = useState("");
  

  // =========================================
  // Form data for edit modal
  // Email updates directly through Save Changes
  // Mobile updates separately through OTP
  // =========================================
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    address: "",
    newMobile: "",
    mobileOtp: "",
  });

  // =========================================
  // Close mobile header menu on outside click
  // =========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(event.target)
      ) {
        setIsHeaderMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================
  // Fetch parent profile data from backend
  // This fills the profile card and edit form values
  // =========================================
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

  

  

  // =========================================
  // Open edit profile modal
  // This resets old messages and fills form with latest profile data
  // =========================================
  const openEditModal = () => {
    setIsHeaderMenuOpen(false);
    setMessage("");
    setError("");

    setMobileMessage("");
    setMobileError("");
    setMobileOtpSent(false);

    setFormData({
      fullName: profile?.FullName || "",
      email: profile?.Email || "",
      mobile: profile?.Mobile || "",
      alternateMobile: profile?.AlternateMobile || "",
      address: profile?.Address || "",
      newMobile: "",
      mobileOtp: "",
    });

    setShowEditModal(true);
  };

  // =========================================
  // Close edit profile modal
  // This also clears modal messages
  // =========================================
  const closeEditModal = () => {
    setShowEditModal(false);
    setMessage("");
    setError("");

    setMobileMessage("");
    setMobileError("");
    setMobileOtpSent(false);
  };

  // =========================================
  // Header navigation helper
  // Used by mobile dropdown menu
  // =========================================
  const handleHeaderNavigate = (path) => {
    setIsHeaderMenuOpen(false);
    navigate(path);
  };

  // =========================================
  // Logout handler
  // Clears login and selected child data from localStorage
  // =========================================
  const handleLogout = () => {
    setIsHeaderMenuOpen(false);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedStudentId");
    localStorage.removeItem("selectedStudentName");
    localStorage.removeItem("selectedStudentClass");
    localStorage.removeItem("selectedStudentClassId");

    navigate("/");
  };

  // =========================================
  // Common input handler
  // Mobile-related fields allow digits only
  // Other fields like fullName, email, address allow normal text
  // =========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "mobile" ||
      name === "alternateMobile" ||
      name === "newMobile" ||
      name === "mobileOtp"
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

  // =========================================
  // Send OTP for mobile number change
  // Mobile number change is still protected by OTP
  // =========================================
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
      setMobileError(
        "New mobile number cannot be same as current mobile number"
      );
      return;
    }

    if (
      formData.alternateMobile &&
      formData.newMobile === formData.alternateMobile
    ) {
      setMobileError(
        "New mobile number cannot be same as alternate mobile number"
      );
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

  // =========================================
  // Verify OTP and update mobile number
  // =========================================
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

  // =========================================
  // Save profile details
  // FullName, Email, AlternateMobile and Address update directly
  // Mobile number updates separately through OTP flow
  // =========================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address");
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
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        alternateMobile: formData.alternateMobile,
        address: formData.address,
      });

      if (response.data.success) {
        setProfile((prev) => ({
          ...prev,
          FullName: formData.fullName.trim(),
          Email: formData.email.trim(),
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

            {/* =========================================
                Header buttons
                Mobile: menu icon
                Desktop: normal action buttons
               ========================================= */}
            <div className="flex w-full items-center justify-start lg:w-auto lg:justify-end">
              {/* Mobile header menu */}
              <div
                ref={headerMenuRef}
                className="relative flex flex-shrink-0 justify-start lg:hidden"
              >
                <button
                  type="button"
                  onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b08d57] font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
                  aria-label="Open parent profile menu"
                >
                  <span className="text-2xl leading-none">
                    {isHeaderMenuOpen ? "×" : "☰"}
                  </span>
                </button>

                {isHeaderMenuOpen && (
                  <div className="absolute left-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] shadow-xl">
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#f1e7d7]"
                    >
                      Edit Profile
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleHeaderNavigate(`/parent/dashboard/${parentId}`)
                      }
                      className="block w-full px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#f1e7d7]"
                    >
                      Back to Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full border-t border-[#eadfcf] px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop header buttons */}
              <div className="hidden flex-wrap gap-3 lg:flex">
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

              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        profile.IsActive
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-3 py-4 sm:items-center sm:px-4 sm:py-6">
          <div className="relative max-h-[92vh] w-full max-w-[640px] overflow-hidden rounded-[24px] border border-[#d8c3a0] bg-white shadow-2xl sm:rounded-[30px]">
            <button
              onClick={closeEditModal}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-black shadow-md hover:bg-[#f6efe4] sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-4 py-4 sm:px-8 sm:py-6">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Edit Profile
              </h2>
              <p className="mt-1 text-sm text-[#ece1cf] sm:mt-2 sm:text-base">
                Manage all profile details from one place
              </p>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="max-h-[calc(92vh-110px)] space-y-4 overflow-y-auto p-4 sm:max-h-[calc(92vh-125px)] sm:space-y-5 sm:p-6"
            >
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
                  className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[24px] sm:px-5 sm:py-4 sm:text-lg"
                />
              </div>

              {/* Email updates directly through Save Changes */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-black">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[24px] sm:px-5 sm:py-4 sm:text-lg"
                />

                <p className="mt-2 text-xs text-[#8b7355]">
                  Email will be updated directly after clicking Save Changes.
                </p>
              </div>

              {/* Mobile number updates through OTP */}
              <div className="space-y-3 rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-3 sm:space-y-4 sm:p-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Current Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    readOnly
                    className="w-full cursor-not-allowed rounded-[18px] border border-[#d7dce6] bg-[#edf1f8] px-4 py-3 text-base text-[#6b7280] outline-none sm:rounded-[20px] sm:px-5 sm:py-4 sm:text-lg"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    New Mobile
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      name="newMobile"
                      value={formData.newMobile}
                      onChange={handleChange}
                      placeholder="Enter new mobile number"
                      className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[20px] sm:px-5 sm:py-4 sm:text-lg"
                    />

                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      disabled={mobileSending}
                      className="w-full rounded-[18px] bg-[#b79257] px-4 py-3 font-semibold text-black shadow-md transition hover:bg-[#a57f42] disabled:opacity-70 sm:w-auto sm:min-w-[120px] sm:rounded-[20px] sm:px-5 sm:py-4"
                    >
                      {mobileSending ? "Sending..." : "Send OTP"}
                    </button>
                  </div>
                </div>

                {mobileOtpSent && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-black">
                      OTP
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        name="mobileOtp"
                        value={formData.mobileOtp}
                        onChange={handleChange}
                        placeholder="Enter OTP"
                        className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[20px] sm:px-5 sm:py-4 sm:text-lg"
                      />

                      <button
                        type="button"
                        onClick={handleVerifyMobileOtp}
                        disabled={mobileVerifying}
                        className="w-full rounded-[18px] bg-black px-4 py-3 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-70 sm:w-auto sm:min-w-[140px] sm:rounded-[20px] sm:px-5 sm:py-4"
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
                <label className="mb-2 block text-sm font-semibold text-black">
                  Alternate Mobile
                </label>
                <input
                  type="text"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleChange}
                  placeholder="Enter alternate mobile number"
                  className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[24px] sm:px-5 sm:py-4 sm:text-lg"
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
                  className="w-full resize-none rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[24px] sm:px-5 sm:py-4 sm:text-lg"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="w-full flex-1 rounded-[20px] bg-[#b79257] py-3.5 text-base font-semibold text-black shadow-md transition hover:bg-[#a57f42] disabled:opacity-70 sm:rounded-[22px] sm:py-4 sm:text-lg"
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full rounded-[20px] bg-black px-6 py-3.5 text-base font-semibold text-white sm:w-auto sm:rounded-[22px] sm:py-4"
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