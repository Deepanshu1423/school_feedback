import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

const TeacherRespond = () => {
  // =========================================
  // Router hooks
  // =========================================
  // navigate is used for page redirection.
  const navigate = useNavigate();

  // teacherId and feedbackId come from the route URL.
  // Example URL: /teacher/respond/:teacherId/:feedbackId
  const { teacherId, feedbackId } = useParams();

  // searchParams is used to read query params.
  // Example: ?scroll=comments
  const [searchParams] = useSearchParams();

  // This ref is used to scroll directly to the Comments & Response section.
  const commentsSectionRef = useRef(null);

  // =========================================
  // Page state
  // =========================================
  // loading is used while feedback details are being fetched.
  const [loading, setLoading] = useState(true);

  // saving is used while teacher response is being submitted.
  const [saving, setSaving] = useState(false);

  // message stores success/error messages shown on the page.
  const [message, setMessage] = useState("");

  // isSuccess decides message color.
  // true = green success message
  // false = red error message
  const [isSuccess, setIsSuccess] = useState(false);

  // feedbackItem stores the selected feedback record.
  const [feedbackItem, setFeedbackItem] = useState(null);

  // teacherResponse stores textarea value.
  const [teacherResponse, setTeacherResponse] = useState("");

  // =========================================
  // Fetch selected feedback details
  // =========================================
  useEffect(() => {
    const fetchFeedbackItem = async () => {
      try {
        setLoading(true);
        setMessage("");
        setIsSuccess(false);

        // We fetch all feedbacks for this teacher.
        // Then we find the selected feedback by feedbackId.
        const response = await api.get(`/teacher/feedbacks/${teacherId}`);
        const feedbacks = response.data?.data || [];

        const foundItem = feedbacks.find(
          (item) => String(item.FeedbackId) === String(feedbackId),
        );

        // If feedback is not found, show message and stop.
        if (!foundItem) {
          setMessage("Feedback record not found.");
          setFeedbackItem(null);
          return;
        }

        // Save selected feedback record in state.
        setFeedbackItem(foundItem);

        // If response already exists, show it inside textarea.
        // If response does not exist, textarea stays empty.
        setTeacherResponse(foundItem.TeacherResponse || "");
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to load feedback details.",
        );
      } finally {
        setLoading(false);
      }
    };

    // API should run only when both route params are available.
    if (teacherId && feedbackId) {
      fetchFeedbackItem();
    }
  }, [teacherId, feedbackId]);

  // =========================================
  // Auto-scroll to Comments & Response section
  // =========================================
  useEffect(() => {
    // This checks URL query param:
    // /teacher/respond/1/5?scroll=comments
    const shouldScrollToComments = searchParams.get("scroll") === "comments";

    // Do not scroll until page loading is completed and feedback item exists.
    if (!shouldScrollToComments || loading || !feedbackItem) return;

    // Small delay gives the page time to render before scrolling.
    const timer = setTimeout(() => {
      if (commentsSectionRef.current) {
        commentsSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 250);

    // Cleanup timer when component unmounts or dependencies change.
    return () => clearTimeout(timer);
  }, [searchParams, loading, feedbackItem]);

  // =========================================
  // Date and time formatter
  // =========================================
  const formatDateTime = (dateValue) => {
    // If date is missing, return fallback values.
    if (!dateValue) {
      return {
        date: "N/A",
        time: "",
        relative: "",
      };
    }

    const parsedDate = new Date(dateValue);

    // If date is invalid, return raw date value.
    if (Number.isNaN(parsedDate.getTime())) {
      return {
        date: dateValue,
        time: "",
        relative: "",
      };
    }

    const now = new Date();

    // Format date like: 29 Apr 2026
    const date = parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Format time like: 04:30 PM
    const time = parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Check if date is today.
    const isToday =
      parsedDate.getDate() === now.getDate() &&
      parsedDate.getMonth() === now.getMonth() &&
      parsedDate.getFullYear() === now.getFullYear();

    // Create yesterday date for comparison.
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    // Check if date is yesterday.
    const isYesterday =
      parsedDate.getDate() === yesterday.getDate() &&
      parsedDate.getMonth() === yesterday.getMonth() &&
      parsedDate.getFullYear() === yesterday.getFullYear();

    let relative = "";

    if (isToday) relative = "Today";
    else if (isYesterday) relative = "Yesterday";

    return {
      date,
      time,
      relative,
    };
  };

  // =========================================
  // Logout handler
  // =========================================
  const handleLogout = () => {
    // Remove login token and user details from localStorage.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect user back to login page.
    navigate("/");
  };

  // =========================================
  // Check whether response is already submitted
  // =========================================
  // If TeacherResponse already exists, teacher should only view it.
  // Editing is not allowed after first submission.
  const isAlreadyResponded =
    feedbackItem?.TeacherResponse && feedbackItem.TeacherResponse.trim() !== "";

  // =========================================
  // Submit teacher response
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setIsSuccess(false);

    // Frontend safety check:
    // If response is already submitted, do not allow edit/update.
    if (isAlreadyResponded) {
      setIsSuccess(false);
      setMessage("Response already submitted. Editing is not allowed.");
      return;
    }

    // Empty response validation.
    if (!teacherResponse.trim()) {
      setMessage("Teacher response is required.");
      return;
    }

    try {
      setSaving(true);

      // Remove extra spaces before sending response to backend.
      const submittedResponse = teacherResponse.trim();

      // API call to submit teacher response.
      await api.put("/teacher/respond", {
        feedbackId,
        teacherId,
        teacherResponse: submittedResponse,
      });

      setIsSuccess(true);
      setMessage("Teacher response submitted successfully.");

      // Update local feedback item after successful response submission.
      // This immediately changes status from Pending to Responded on this page.
      setFeedbackItem((prev) =>
        prev
          ? {
              ...prev,
              TeacherResponse: submittedResponse,
              TeacherRespondedAt: new Date().toISOString(),
            }
          : prev,
      );

      // Keep submitted response visible in textarea.
      // Do not clear it, because the response should be visible in view mode.
      setTeacherResponse(submittedResponse);
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to submit teacher response.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // Feedback status
  // =========================================
  const status =
    feedbackItem?.TeacherResponse && feedbackItem?.TeacherResponse.trim() !== ""
      ? "Responded"
      : "Pending";

  // Format submitted and responded dates.
  const submittedDate = formatDateTime(feedbackItem?.SubmittedAt);
  const respondedDate = formatDateTime(feedbackItem?.TeacherRespondedAt);

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <div className="mx-auto w-full max-w-7xl">
        {/* =========================================
            Page header
           ========================================= */}
        <header className="border-b border-[#d6c2a8] bg-[#fffaf3]">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a] sm:text-3xl">
                Teacher Response
              </h1>

              <p className="mt-1 text-sm text-[#6b7280] sm:text-base">
                Review feedback details and submit your response
              </p>
            </div>

            {/* Header action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/teacher/feedbacks/${teacherId}`)}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Back to Feedback List
              </button>

              <button
                onClick={() => navigate(`/teacher/dashboard/${teacherId}`)}
                className="rounded-xl bg-[#e8dcc8] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#d6c2a8]"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-[#e8dcc8] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#d6c2a8]"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          {/* Loading message */}
          {loading && (
            <div className="mb-4 rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-[#5f5446]">
              Loading feedback details...
            </div>
          )}

          {/* Render content only after loading is complete and feedback item exists */}
          {!loading && feedbackItem && (
            <>
              {/* =========================================
                  Hero section
                 ========================================= */}
              <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-4 shadow-lg sm:p-5 lg:p-6">
                <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#2f2418]/20 bg-gradient-to-br from-[#171311] via-[#2b2119] to-[#b08d57] p-5 text-white sm:p-6">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                      Feedback Details
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/90 sm:text-base">
                      Carefully review the parent feedback before submitting
                      your response.
                    </p>
                  </div>
                </div>
              </section>

              {/* =========================================
                  Summary cards
                 ========================================= */}
              <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Status card */}
                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Status
                  </p>

                  <div className="mt-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        status === "Responded"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                {/* Rating card */}
                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Rating
                  </p>

                  <p className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                    {feedbackItem.Rating ? `${feedbackItem.Rating}/5` : "N/A"}
                  </p>
                </div>

                {/* Submitted date card */}
                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Submitted On
                  </p>

                  <div className="mt-3 inline-flex flex-col rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span>🗓️</span>

                      <p className="font-medium text-[#1a1a1a] whitespace-nowrap">
                        {submittedDate.date}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span>🕒</span>

                      <p className="text-sm text-[#6b7280]">
                        {submittedDate.time}
                      </p>

                      {submittedDate.relative && (
                        <span className="rounded-full bg-[#eee6d8] px-2 py-0.5 text-[11px] font-semibold text-[#8d6b3f] whitespace-nowrap">
                          {submittedDate.relative}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* =========================================
                  Feedback information section
                 ========================================= */}
              <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md sm:p-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a]">
                    Feedback Information
                  </h3>

                  <p className="mt-1 text-sm text-[#6b7280]">
                    Parent and feedback details
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Parent Name
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
                      {feedbackItem.ParentName || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Student Name
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
                      {feedbackItem.StudentName || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Class
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
                      {feedbackItem.ClassName || "N/A"}
                      {feedbackItem.Section ? `-${feedbackItem.Section}` : ""}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Subject
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
                      {feedbackItem.SubjectName || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                    <p className="text-sm font-semibold text-[#6b7280]">
                      Category
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
                      {feedbackItem.CategoryName || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                    <p className="text-sm font-semibold text-[#6b7280]">Form</p>

                    <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
                      {feedbackItem.FormName || "N/A"}
                    </p>
                  </div>
                </div>
              </section>

              {/* =========================================
                  Comments and response section
                 ========================================= */}
              <section
                ref={commentsSectionRef}
                className="rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md sm:p-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a]">
                    Comments & Response
                  </h3>

                  <p className="mt-1 text-sm text-[#6b7280]">
                    Review the parent comment and submit your response
                  </p>
                </div>

                {/* Parent comment card */}
                <div className="mt-4 rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                  <p className="text-sm font-semibold text-[#6b7280]">
                    Parent Comment
                  </p>

                  <p className="mt-2 text-base leading-7 text-[#1a1a1a]">
                    {feedbackItem.Comments || "No comment provided."}
                  </p>
                </div>

                {/* Teacher response form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Teacher Response
                    </label>

                    <textarea
                      value={teacherResponse}
                      onChange={(e) => setTeacherResponse(e.target.value)}
                      rows="5"
                      disabled={isAlreadyResponded || saving}
                      placeholder={
                        isAlreadyResponded
                          ? "Response already submitted"
                          : "Write your response here..."
                      }
                      className={`w-full rounded-2xl border border-[#d6c2a8] px-4 py-3 text-sm text-black outline-none transition ${
                        isAlreadyResponded
                          ? "cursor-not-allowed bg-[#eee6d8] opacity-90"
                          : "bg-[#f7f1e8] focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
                      }`}
                    />

                    <p className="mt-2 text-xs text-[#6b7280]">
                      {isAlreadyResponded
                        ? "Response already submitted. Editing is not allowed."
                        : "Write a clear, professional, and helpful response for the parent."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* Show submit button only when feedback is still pending */}
                    {!isAlreadyResponded && (
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-2xl bg-[#b08d57] px-6 py-3.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                      >
                        {saving ? "Saving..." : "Submit Response"}
                      </button>
                    )}

                    {/* Show view-only message when response is already submitted */}
                    {isAlreadyResponded && !message && (
                      <div className="w-full rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 sm:w-auto">
                        Response already submitted
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/teacher/feedbacks/${teacherId}`)
                      }
                      className="w-full rounded-2xl bg-[#e8dcc8] px-6 py-3.5 font-semibold text-black shadow-sm transition hover:bg-[#d6c2a8] sm:w-auto"
                    >
                      Cancel
                    </button>

                    {/* Success or error message near buttons */}
                    {message && (
                      <span
                        className={`text-sm font-medium ${
                          isSuccess ? "text-green-700" : "text-red-700"
                        }`}
                      >
                        {message}
                      </span>
                    )}
                  </div>
                </form>

                
                

                {/* Last responded date display */}
                {feedbackItem.TeacherRespondedAt && (
                  <div className="mt-5 rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                    <p className="text-sm font-semibold text-[#6b7280]">
                       Responded At
                    </p>

                    <div className="mt-2 inline-flex flex-col rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span>🗓️</span>

                        <p className="font-medium text-[#1a1a1a] whitespace-nowrap">
                          {respondedDate.date}
                        </p>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <span>🕒</span>

                        <p className="text-sm text-[#6b7280]">
                          {respondedDate.time}
                        </p>

                        {respondedDate.relative && (
                          <span className="rounded-full bg-[#eee6d8] px-2 py-0.5 text-[11px] font-semibold text-[#8d6b3f] whitespace-nowrap">
                            {respondedDate.relative}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherRespond;
