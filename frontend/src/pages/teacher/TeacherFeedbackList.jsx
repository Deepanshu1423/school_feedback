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

  const [studentSort, setStudentSort] = useState("");
  const [classSort, setClassSort] = useState("");
  const [ratingSort, setRatingSort] = useState("");
  const [submittedSort, setSubmittedSort] = useState("");

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

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return {
        date: "N/A",
        time: "",
        full: "N/A",
        relative: "",
      };
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return {
        date: dateValue,
        time: "",
        full: dateValue,
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
      full: `${date}, ${time}`,
      relative,
    };
  };

  const getStatus = (item) => {
    return item.TeacherResponse && item.TeacherResponse.trim() !== ""
      ? "Responded"
      : "Pending";
  };

  const resetAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setStudentSort("");
    setClassSort("");
    setRatingSort("");
    setSubmittedSort("");
  };

  const filteredFeedbacks = useMemo(() => {
    let data = [...feedbacks].filter((item) => {
      const parentText = (item.ParentName || "").toLowerCase();
      const studentText = (item.StudentName || "").toLowerCase();
      const subjectText = (item.SubjectName || "").toLowerCase();
      const categoryText = (item.CategoryName || "").toLowerCase();

      const matchesSearch =
        parentText.includes(searchTerm.toLowerCase()) ||
        studentText.includes(searchTerm.toLowerCase()) ||
        subjectText.includes(searchTerm.toLowerCase()) ||
        categoryText.includes(searchTerm.toLowerCase());

      const status = getStatus(item);
      const matchesStatus =
        statusFilter === "All" ? true : status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (studentSort) {
      data.sort((a, b) => {
        const aName = (a.StudentName || "").toLowerCase();
        const bName = (b.StudentName || "").toLowerCase();
        return studentSort === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      });
    } else if (classSort) {
      data.sort((a, b) => {
        const aClass = `${a.ClassName || ""}-${a.Section || ""}`.toLowerCase();
        const bClass = `${b.ClassName || ""}-${b.Section || ""}`.toLowerCase();
        return classSort === "asc"
          ? aClass.localeCompare(bClass)
          : bClass.localeCompare(aClass);
      });
    } else if (ratingSort) {
      data.sort((a, b) => {
        const aRating = Number(a.Rating) || 0;
        const bRating = Number(b.Rating) || 0;
        return ratingSort === "asc" ? aRating - bRating : bRating - aRating;
      });
    } else if (submittedSort) {
      data.sort((a, b) => {
        const aDate = a.SubmittedAt ? new Date(a.SubmittedAt).getTime() : 0;
        const bDate = b.SubmittedAt ? new Date(b.SubmittedAt).getTime() : 0;
        return submittedSort === "asc" ? aDate - bDate : bDate - aDate;
      });
    }

    return data;
  }, [
    feedbacks,
    searchTerm,
    statusFilter,
    studentSort,
    classSort,
    ratingSort,
    submittedSort,
  ]);

  const totalRecords = feedbacks.length;
  const respondedCount = feedbacks.filter(
    (item) => item.TeacherResponse && item.TeacherResponse.trim() !== ""
  ).length;
  const pendingCount = feedbacks.filter(
    (item) => !item.TeacherResponse || item.TeacherResponse.trim() === ""
  ).length;

  const handleStudentSort = (value) => {
    setStudentSort(value);
    if (value) {
      setClassSort("");
      setRatingSort("");
      setSubmittedSort("");
    }
  };

  const handleClassSort = (value) => {
    setClassSort(value);
    if (value) {
      setStudentSort("");
      setRatingSort("");
      setSubmittedSort("");
    }
  };

  const handleRatingSort = (value) => {
    setRatingSort(value);
    if (value) {
      setStudentSort("");
      setClassSort("");
      setSubmittedSort("");
    }
  };

  const handleSubmittedSort = (value) => {
    setSubmittedSort(value);
    if (value) {
      setStudentSort("");
      setClassSort("");
      setRatingSort("");
    }
  };

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
                View all feedback records submitted for this teacher
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
                onClick={() => navigate("/")}
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
                      Review parent feedback, check status, and open individual
                      items for response.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Total Records
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                    {totalRecords}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Responded
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                    {respondedCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Pending
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#1a1a1a]">
                    {pendingCount}
                  </p>
                </div>
              </section>

              <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1a1a]">
                      Filters
                    </h3>
                    <p className="text-sm text-[#6b7280]">
                      Search, filter, and sort feedback records
                    </p>
                  </div>

                  <button
                    onClick={resetAllFilters}
                    className="rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2]"
                  >
                    Clear
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search feedback..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Status Filter
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
                    >
                      <option value="All">All</option>
                      <option value="Responded">Responded</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="hidden rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Parent / Student
                          <div className="mt-2">
                            <select
                              value={studentSort}
                              onChange={(e) => handleStudentSort(e.target.value)}
                              className="rounded-lg border border-[#d6c2a8] bg-[#f7f1e8] px-2.5 py-1.5 text-xs text-[#1a1a1a] outline-none focus:border-[#b08d57]"
                            >
                              <option value="">Sort Student</option>
                              <option value="asc">A to Z</option>
                              <option value="desc">Z to A</option>
                            </select>
                          </div>
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Class
                          <div className="mt-2">
                            <select
                              value={classSort}
                              onChange={(e) => handleClassSort(e.target.value)}
                              className="rounded-lg border border-[#d6c2a8] bg-[#f7f1e8] px-2.5 py-1.5 text-xs text-[#1a1a1a] outline-none focus:border-[#b08d57]"
                            >
                              <option value="">Sort Class</option>
                              <option value="asc">A to Z</option>
                              <option value="desc">Z to A</option>
                            </select>
                          </div>
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Subject / Category
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Rating
                          <div className="mt-2">
                            <select
                              value={ratingSort}
                              onChange={(e) => handleRatingSort(e.target.value)}
                              className="rounded-lg border border-[#d6c2a8] bg-[#f7f1e8] px-2.5 py-1.5 text-xs text-[#1a1a1a] outline-none focus:border-[#b08d57]"
                            >
                              <option value="">Sort Rating</option>
                              <option value="asc">Low to High</option>
                              <option value="desc">High to Low</option>
                            </select>
                          </div>
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Submitted On
                          <div className="mt-2">
                            <select
                              value={submittedSort}
                              onChange={(e) => handleSubmittedSort(e.target.value)}
                              className="rounded-lg border border-[#d6c2a8] bg-[#f7f1e8] px-2.5 py-1.5 text-xs text-[#1a1a1a] outline-none focus:border-[#b08d57]"
                            >
                              <option value="">Sort Submitted</option>
                              <option value="asc">Oldest First</option>
                              <option value="desc">Newest First</option>
                            </select>
                          </div>
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
                          const status = getStatus(item);
                          const formattedDateTime = formatDateTime(item.SubmittedAt);

                          return (
                            <tr
                              key={item.FeedbackId || index}
                              className="bg-[#f7f1e8]"
                            >
                              <td className="rounded-l-xl px-4 py-4 text-[#1a1a1a]">
                                <p className="font-semibold">
                                  {item.ParentName || "N/A"}
                                </p>
                                <p className="mt-1 text-sm text-[#6b7280]">
                                  {item.StudentName || "N/A"}
                                </p>
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                {item.ClassName || "N/A"}
                                {item.Section ? `-${item.Section}` : ""}
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                <p className="font-medium">
                                  {item.SubjectName || "N/A"}
                                </p>
                                <p className="mt-1 text-sm text-[#6b7280]">
                                  {item.CategoryName || "N/A"}
                                </p>
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                {item.Rating ? `${item.Rating}/5` : "N/A"}
                              </td>

                              <td className="px-4 py-4 text-[#1a1a1a]">
                                <div className="inline-flex flex-col rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className="text-sm">🗓️</span>
                                    <p className="whitespace-nowrap text-sm font-semibold text-[#1a1a1a]">
                                      {formattedDateTime.date}
                                    </p>
                                  </div>

                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs">🕒</span>
                                    <p className="text-xs text-[#6b7280]">
                                      {formattedDateTime.time}
                                    </p>

                                    {formattedDateTime.relative && (
                                      <span className="whitespace-nowrap rounded-full bg-[#eee6d8] px-2 py-0.5 text-[11px] font-semibold text-[#8d6b3f]">
                                        {formattedDateTime.relative}
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
                                  onClick={() =>
                                    navigate(
                                      `/teacher/respond/${teacherId}/${item.FeedbackId}`
                                    )
                                  }
                                  className="rounded-lg bg-[#b08d57] px-3.5 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
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
                            colSpan="7"
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
                    const status = getStatus(item);
                    const formattedDateTime = formatDateTime(item.SubmittedAt);

                    return (
                      <div
                        key={item.FeedbackId || index}
                        className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-[#1a1a1a]">
                              {item.StudentName || "N/A"}
                            </h3>
                            <p className="mt-1 text-sm text-[#6b7280]">
                              {item.ParentName || "N/A"}
                            </p>
                            <p className="mt-1 text-sm text-[#6b7280]">
                              {item.SubjectName || "N/A"} •{" "}
                              {item.CategoryName || "N/A"}
                            </p>
                          </div>

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

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="rounded-xl bg-[#f7f1e8] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#8b7355]">
                              Class
                            </p>
                            <p className="mt-1 text-sm text-[#1a1a1a]">
                              {item.ClassName || "N/A"}
                              {item.Section ? `-${item.Section}` : ""}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#f7f1e8] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#8b7355]">
                              Rating
                            </p>
                            <p className="mt-1 text-sm text-[#1a1a1a]">
                              {item.Rating ? `${item.Rating}/5` : "N/A"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-[#e7dbc9] bg-white p-3">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span>🗓️</span>
                              <p className="whitespace-nowrap text-sm font-medium text-[#1a1a1a]">
                                {formattedDateTime.date}
                              </p>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <span>🕒</span>
                              <p className="text-sm text-[#6b7280]">
                                {formattedDateTime.time}
                              </p>

                              {formattedDateTime.relative && (
                                <span className="whitespace-nowrap rounded-full bg-[#eee6d8] px-2 py-0.5 text-[11px] font-semibold text-[#8d6b3f]">
                                  {formattedDateTime.relative}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl bg-[#f7f1e8] p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#8b7355]">
                            Comments
                          </p>
                          <p className="mt-1 text-sm text-[#4b5563]">
                            {item.Comments || "No comment"}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            navigate(`/teacher/respond/${teacherId}/${item.FeedbackId}`)
                          }
                          className="mt-4 w-full rounded-xl bg-[#b08d57] px-4 py-3 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
                        >
                          {status === "Responded" ? "View / Edit Response" : "Respond"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-6 text-center text-sm font-medium text-[#6b7280] shadow-md">
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