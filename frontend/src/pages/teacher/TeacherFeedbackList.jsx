import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const TeacherFeedbackList = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const fetchTeacherFeedbacks = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await api.get(`/teacher/feedbacks/${teacherId}`);
        setFeedbacks(response.data?.data || []);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to load teacher feedbacks."
        );
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacherFeedbacks();
    }
  }, [teacherId]);

  // Open TeacherRespond page and auto-scroll
  // directly to Comments & Response section
  const openResponsePage = (feedbackId) => {
    navigate(`/teacher/respond/${teacherId}/${feedbackId}?scroll=comments`);
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return {
        date: "N/A",
        time: "",
        relative: "",
      };
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return {
        date: dateValue,
        time: "",
        relative: "",
      };
    }

    const now = new Date();

    const date = parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const time = parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const isToday =
      parsedDate.getDate() === now.getDate() &&
      parsedDate.getMonth() === now.getMonth() &&
      parsedDate.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

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

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const parentText = (item.ParentName || "").toLowerCase();
      const studentText = (item.StudentName || "").toLowerCase();
      const subjectText = (item.SubjectName || "").toLowerCase();
      const categoryText = (item.CategoryName || "").toLowerCase();

      const matchesSearch =
        parentText.includes(searchTerm.toLowerCase()) ||
        studentText.includes(searchTerm.toLowerCase()) ||
        subjectText.includes(searchTerm.toLowerCase()) ||
        categoryText.includes(searchTerm.toLowerCase());

      const status =
        item.TeacherResponse && item.TeacherResponse.trim() !== ""
          ? "Responded"
          : "Pending";

      const matchesStatus =
        statusFilter === "All" ? true : status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [feedbacks, searchTerm, statusFilter]);

  const totalRecords = feedbacks.length;
  const respondedCount = feedbacks.filter(
    (item) => item.TeacherResponse && item.TeacherResponse.trim() !== ""
  ).length;
  const pendingCount = feedbacks.filter(
    (item) => !item.TeacherResponse || item.TeacherResponse.trim() === ""
  ).length;

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-[#d6c2a8] bg-[#fffaf3]">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a] sm:text-3xl">
                Teacher Feedback List
              </h1>
              <p className="mt-1 text-sm text-[#6b7280] sm:text-base">
                View and manage submitted feedback records
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/teacher/dashboard/${teacherId}`)}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Back to Dashboard
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
          {loading && (
            <div className="mb-4 rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-[#5f5446]">
              Loading feedback list...
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {message}
            </div>
          )}

          {!loading && !message && (
            <>
              <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-4 shadow-lg sm:p-5 lg:p-6">
                <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#2f2418]/20 bg-gradient-to-br from-[#171311] via-[#2b2119] to-[#b08d57] p-5 text-white sm:p-6">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                      Teacher Feedback Records
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/90 sm:text-base">
                      Track feedback status, review parent comments, and open any
                      record directly in the response page.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Total Feedbacks
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                    {totalRecords}
                  </p>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    All feedback records received
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Responded
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                    {respondedCount}
                  </p>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    Feedbacks with saved response
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Pending
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                    {pendingCount}
                  </p>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    Feedbacks waiting for response
                  </p>
                </div>
              </section>

              <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md sm:p-6">
                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search by parent, student, subject, category"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Status Filter
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
                    >
                      <option value="All">All</option>
                      <option value="Responded">Responded</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="hidden rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md lg:block sm:p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-[#1a1a1a]">
                    Feedback Records
                  </h3>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Click respond or view/edit to open comments and response area
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Parent
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Student
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Class
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Subject
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Category
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Rating
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Submitted At
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFeedbacks.length > 0 ? (
                        filteredFeedbacks.map((item, index) => {
                          const status =
                            item.TeacherResponse &&
                            item.TeacherResponse.trim() !== ""
                              ? "Responded"
                              : "Pending";

                          const submittedDate = formatDateTime(item.SubmittedAt);

                          return (
                            <tr
                              key={item.FeedbackId || index}
                              className="bg-[#f7f1e8]"
                            >
                              <td className="rounded-l-xl px-4 py-4 font-medium text-[#1a1a1a]">
                                {item.ParentName || "N/A"}
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                {item.StudentName || "N/A"}
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                {item.ClassName || "N/A"}
                                {item.Section ? `-${item.Section}` : ""}
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                {item.SubjectName || "N/A"}
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                {item.CategoryName || "N/A"}
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                {item.Rating ? `${item.Rating}/5` : "N/A"}
                              </td>

                              <td className="px-4 py-4">
                                <div className="inline-flex flex-col rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
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
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    status === "Responded"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>

                              <td className="rounded-r-xl px-4 py-4">
                                <button
                                  onClick={() => openResponsePage(item.FeedbackId)}
                                  className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                                    status === "Responded"
                                      ? "bg-[#e8dcc8] text-black hover:bg-[#d6c2a8]"
                                      : "bg-[#b08d57] text-black hover:bg-[#c39a5f]"
                                  }`}
                                >
                                  {status === "Responded" ? "View / Edit" : "Respond"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="rounded-xl bg-[#f7f1e8] px-4 py-4 text-center text-[#6b7280]"
                          >
                            No feedback records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-4 lg:hidden">
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((item, index) => {
                    const status =
                      item.TeacherResponse && item.TeacherResponse.trim() !== ""
                        ? "Responded"
                        : "Pending";

                    const submittedDate = formatDateTime(item.SubmittedAt);

                    return (
                      <div
                        key={item.FeedbackId || index}
                        className="rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-lg font-bold text-[#1a1a1a]">
                                  {item.StudentName || "N/A"}
                                </h4>

                                <span className="text-sm text-[#9ca3af]">•</span>

                                <span className="text-sm font-medium text-[#6b7280]">
                                  {item.SubjectName || "N/A"}
                                </span>

                                <span className="text-sm text-[#9ca3af]">•</span>

                                <span className="text-sm font-medium text-[#6b7280]">
                                  {item.CategoryName || "N/A"}
                                </span>
                              </div>

                              <p className="mt-2 text-sm text-[#6b7280]">
                                Parent: {item.ParentName || "N/A"}
                              </p>

                              <p className="mt-1 text-sm text-[#6b7280]">
                                Class: {item.ClassName || "N/A"}
                                {item.Section ? `-${item.Section}` : ""}
                              </p>
                            </div>

                            <div className="flex flex-row items-start gap-2 sm:items-end">
                              <span
                                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                  status === "Responded"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {status}
                              </span>

                              <button
                                onClick={() => openResponsePage(item.FeedbackId)}
                                className={`w-fit rounded-xl px-4 py-2 text-sm font-semibold text-black shadow-sm transition ${
                                  status === "Responded"
                                    ? "bg-[#e8dcc8] hover:bg-[#d6c2a8]"
                                    : "bg-[#b08d57] hover:bg-[#c39a5f]"
                                }`}
                              >
                                {status === "Responded"
                                  ? "View / Edit Response"
                                  : "Respond"}
                              </button>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
                            <p className="text-sm font-semibold text-[#6b7280]">
                              Parent Comment
                            </p>
                            <p className="mt-2 text-base leading-7 text-[#1a1a1a]">
                              {item.Comments || "No comment provided."}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <div className="rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8b7355]">
                                Rating
                              </p>
                              <p className="mt-1 text-base font-bold text-[#1a1a1a]">
                                {item.Rating ? `${item.Rating}/5` : "N/A"}
                              </p>
                            </div>

                            <div className="rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
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
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-6 text-center text-sm font-medium text-[#6b7280] shadow-md">
                    No feedback records found.
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

export default TeacherFeedbackList;