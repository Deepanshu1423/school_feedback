import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { parentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [dashboardData, setDashboardData] = useState(null);

  const [selectedStudentId, setSelectedStudentId] = useState(
    localStorage.getItem("selectedStudentId") || ""
  );

  const [studentStats, setStudentStats] = useState({
    totalFeedbackSubmitted: 0,
    pendingResponses: 0,
    respondedFeedback: 0,
    recentFeedback: [],
  });

  const [teacherSort, setTeacherSort] = useState("");
  const [subjectSort, setSubjectSort] = useState("");
  const [ratingSort, setRatingSort] = useState("");
  const [submittedSort, setSubmittedSort] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedStudentId");
    localStorage.removeItem("selectedStudentName");
    localStorage.removeItem("selectedStudentClass");
    localStorage.removeItem("selectedStudentClassId");
    navigate("/");
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await api.get(`/parent/dashboard/${parentId}`);
        setDashboardData(response.data?.data || null);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    if (parentId) {
      fetchDashboard();
    }
  }, [parentId]);

  useEffect(() => {
    if (dashboardData?.students?.length > 0) {
      const storedStudentId = localStorage.getItem("selectedStudentId");

      const exists = dashboardData.students.some(
        (student) => String(student.studentId) === String(storedStudentId)
      );

      if (exists) {
        setSelectedStudentId(String(storedStudentId));
      } else {
        const firstStudent = dashboardData.students[0];
        const classText = `${firstStudent.class?.className || ""}${firstStudent.class?.section ? `-${firstStudent.class.section}` : ""
          }`;

        setSelectedStudentId(String(firstStudent.studentId));
        localStorage.setItem("selectedStudentId", String(firstStudent.studentId));
        localStorage.setItem("selectedStudentName", firstStudent.studentName || "");
        localStorage.setItem("selectedStudentClass", classText);
        localStorage.setItem(
          "selectedStudentClassId",
          String(firstStudent.class?.classId || "")
        );
      }
    }
  }, [dashboardData]);

  useEffect(() => {
    const fetchSelectedStudentDashboard = async () => {
      if (!parentId || !selectedStudentId) return;

      try {
        const response = await api.get(
          `/parent/student-dashboard/${parentId}/${selectedStudentId}`
        );

        setStudentStats(
          response.data?.data || {
            totalFeedbackSubmitted: 0,
            pendingResponses: 0,
            respondedFeedback: 0,
            recentFeedback: [],
          }
        );
      } catch (error) {
        setStudentStats({
          totalFeedbackSubmitted: 0,
          pendingResponses: 0,
          respondedFeedback: 0,
          recentFeedback: [],
        });
      }
    };

    fetchSelectedStudentDashboard();
  }, [parentId, selectedStudentId]);

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

  const parentName = dashboardData?.parent?.parentName || "Parent";

  const selectedStudent =
    dashboardData?.students?.find(
      (student) => String(student.studentId) === String(selectedStudentId)
    ) || null;

  const studentName = selectedStudent?.studentName || "N/A";

  const studentClass = selectedStudent
    ? `${selectedStudent.class?.className || ""}${selectedStudent.class?.section ? `-${selectedStudent.class.section}` : ""
    }`
    : "N/A";

  const academicYear = selectedStudent?.class?.academicYear || "N/A";

  const totalFeedbackSubmitted = studentStats?.totalFeedbackSubmitted ?? 0;
  const pendingResponses = studentStats?.pendingResponses ?? 0;
  const respondedFeedback = studentStats?.respondedFeedback ?? 0;
  const recentFeedback = studentStats?.recentFeedback || [];

  const handleStudentSelect = (e) => {
    const newStudentId = e.target.value;

    const selected = dashboardData?.students?.find(
      (student) => String(student.studentId) === String(newStudentId)
    );

    if (selected) {
      const classText = `${selected.class?.className || ""}${selected.class?.section ? `-${selected.class.section}` : ""
        }`;

      localStorage.setItem("selectedStudentId", String(selected.studentId));
      localStorage.setItem("selectedStudentName", selected.studentName || "");
      localStorage.setItem("selectedStudentClass", classText);
      localStorage.setItem(
        "selectedStudentClassId",
        String(selected.class?.classId || "")
      );

      setSelectedStudentId(String(selected.studentId));
      setTeacherSort("");
      setSubjectSort("");
      setRatingSort("");
      setSubmittedSort("");
    }
  };

  const toggleSort = (column) => {
    if (column === "teacher") {
      const nextSort =
        teacherSort === "" ? "asc" : teacherSort === "asc" ? "desc" : "";
      setTeacherSort(nextSort);
      setSubjectSort("");
      setRatingSort("");
      setSubmittedSort("");
    }

    if (column === "subject") {
      const nextSort =
        subjectSort === "" ? "asc" : subjectSort === "asc" ? "desc" : "";
      setSubjectSort(nextSort);
      setTeacherSort("");
      setRatingSort("");
      setSubmittedSort("");
    }

    if (column === "rating") {
      const nextSort =
        ratingSort === "" ? "asc" : ratingSort === "asc" ? "desc" : "";
      setRatingSort(nextSort);
      setTeacherSort("");
      setSubjectSort("");
      setSubmittedSort("");
    }

    if (column === "submitted") {
      const nextSort =
        submittedSort === "" ? "asc" : submittedSort === "asc" ? "desc" : "";
      setSubmittedSort(nextSort);
      setTeacherSort("");
      setSubjectSort("");
      setRatingSort("");
    }
  };

  const getSortIndicator = (sortValue) => {
    if (sortValue === "asc") return " ↑";
    if (sortValue === "desc") return " ↓";
    return "";
  };

  const clearSorting = () => {
    setTeacherSort("");
    setSubjectSort("");
    setRatingSort("");
    setSubmittedSort("");
  };

  const sortedRecentFeedback = useMemo(() => {
    const now = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const data = recentFeedback.filter((item) => {
      if (!item.date) return false;

      const feedbackDate = new Date(item.date);
      if (Number.isNaN(feedbackDate.getTime())) return false;

      return feedbackDate >= twoDaysAgo;
    });

    if (teacherSort) {
      data.sort((a, b) => {
        const aValue = (a.teacher || "").toLowerCase();
        const bValue = (b.teacher || "").toLowerCase();
        return teacherSort === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    } else if (subjectSort) {
      data.sort((a, b) => {
        const aValue = (a.subject || "").toLowerCase();
        const bValue = (b.subject || "").toLowerCase();
        return subjectSort === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    } else if (ratingSort) {
      data.sort((a, b) => {
        const aValue = Number(a.rating) || 0;
        const bValue = Number(b.rating) || 0;
        return ratingSort === "asc" ? aValue - bValue : bValue - aValue;
      });
    } else if (submittedSort) {
      data.sort((a, b) => {
        const aValue = a.date ? new Date(a.date).getTime() : 0;
        const bValue = b.date ? new Date(b.date).getTime() : 0;
        return submittedSort === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    return data;
  }, [recentFeedback, teacherSort, subjectSort, ratingSort, submittedSort]);

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-[#d6c2a8] bg-[#fffaf3]">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a] sm:text-3xl">
                Parent Dashboard
              </h1>
              <p className="mt-1 text-sm text-[#6b7280] sm:text-base">
                Welcome back, {parentName}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedStudentId}
                onChange={handleStudentSelect}
                className="rounded-xl border border-[#d6c2a8] bg-[#e8dcc8] px-4 py-2.5 pr-10 font-semibold text-black shadow-sm outline-none transition hover:bg-[#ddcfb8]"
              >
                {dashboardData?.students?.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.studentName}
                    {student.class?.className
                      ? ` - ${student.class.className}${student.class?.section ? `-${student.class.section}` : ""
                      }`
                      : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={() => navigate(`/parent/profile/${parentId}`)}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Profile
              </button>

              <button
                onClick={() => navigate(`/submit-feedback/${parentId}`)}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Submit Feedback
              </button>

              <button
                onClick={() => navigate(`/parent/feedback-history/${parentId}`)}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Feedback History
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
              Loading dashboard...
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
                      School Feedback System
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/90 sm:text-base">
                      Track feedback activity, submit teacher feedback, and
                      review responses for the selected child from one place.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Selected Child
                  </p>
                  <p className="mt-3 text-xl font-bold text-[#1a1a1a]">
                    {studentName}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Class
                  </p>
                  <p className="mt-3 text-xl font-bold text-[#1a1a1a]">
                    {studentClass}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b7355]">
                    Academic Year
                  </p>
                  <p className="mt-3 text-xl font-bold text-[#1a1a1a]">
                    {academicYear}
                  </p>
                </div>
              </section>

              <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md">
                  <p className="text-sm font-semibold text-[#6b7280]">
                    Total Feedback Submitted
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-[#1a1a1a]">
                    {totalFeedbackSubmitted}
                  </h3>
                  <p className="mt-2 text-sm text-[#8a8a8a]">
                    Feedback count for selected child
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md">
                  <p className="text-sm font-semibold text-[#6b7280]">
                    Pending Responses
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-[#1a1a1a]">
                    {pendingResponses}
                  </h3>
                  <p className="mt-2 text-sm text-[#8a8a8a]">
                    Awaiting teacher response
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md">
                  <p className="text-sm font-semibold text-[#6b7280]">
                    Responded Feedback
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-[#1a1a1a]">
                    {respondedFeedback}
                  </h3>
                  <p className="mt-2 text-sm text-[#8a8a8a]">
                    Teachers have replied
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-6 shadow-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-[#1a1a1a]">
                      Recent Feedback
                    </h3>
                    <p className="mt-1 text-sm text-[#6b7280]">
                      Last two days feedback activity for the selected child
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={clearSorting}
                      className="rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-2.5 font-semibold text-[#1a1a1a] shadow-sm transition hover:bg-[#efe4d2]"
                    >
                      Clear
                    </button>

                    <button
                      onClick={() => navigate(`/parent/feedback-history/${parentId}`)}
                      className="rounded-xl bg-[#b08d57] px-4 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
                    >
                      View All
                    </button>
                  </div>
                </div>

                <section className="hidden lg:block">
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr>
                          <th
                            onClick={() => toggleSort("teacher")}
                            className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#6b7280] select-none"
                          >
                            Teacher{getSortIndicator(teacherSort)}
                          </th>

                          <th
                            onClick={() => toggleSort("subject")}
                            className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#6b7280] select-none"
                          >
                            Subject{getSortIndicator(subjectSort)}
                          </th>

                          <th
                            onClick={() => toggleSort("rating")}
                            className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#6b7280] select-none"
                          >
                            Rating{getSortIndicator(ratingSort)}
                          </th>

                          <th
                            onClick={() => toggleSort("submitted")}
                            className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#6b7280] select-none"
                          >
                            Submitted On{getSortIndicator(submittedSort)}
                          </th>

                          <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRecentFeedback.length > 0 ? (
                          sortedRecentFeedback.map((item, index) => {
                            const formattedDateTime = formatDateTime(item.date);

                            return (
                              <tr key={item.id || index} className="bg-[#f7f1e8]">
                                <td className="rounded-l-xl px-4 py-4 font-medium text-[#1a1a1a]">
                                  {item.teacher || "N/A"}
                                </td>
                                <td className="px-4 py-4 text-[#1a1a1a]">
                                  {item.subject || "N/A"}
                                </td>
                                <td className="px-4 py-4 text-[#1a1a1a]">
                                  {item.rating || "N/A"}
                                </td>
                                <td className="px-4 py-4 text-[#1a1a1a]">
                                  <div className="inline-flex flex-col rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm">🗓️</span>
                                      <p className="text-sm font-semibold text-[#1a1a1a]">
                                        {formattedDateTime.date}
                                      </p>
                                    </div>

                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="text-xs">🕒</span>
                                      <p className="text-xs text-[#6b7280]">
                                        {formattedDateTime.time}
                                      </p>

                                      {formattedDateTime.relative && (
                                        <span className="rounded-full bg-[#eee6d8] px-2.5 py-1 text-[11px] font-semibold text-[#8d6b3f]">
                                          {formattedDateTime.relative}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="rounded-r-xl px-4 py-4">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Responded"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                      }`}
                                  >
                                    {item.status || "Pending"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="rounded-xl bg-[#f7f1e8] px-4 py-4 text-center text-[#6b7280]"
                            >
                              No recent feedback found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="mt-6 space-y-4 lg:hidden">
                  {sortedRecentFeedback.length > 0 ? (
                    sortedRecentFeedback.map((item, index) => {
                      const formattedDateTime = formatDateTime(item.date);

                      return (
                        <div
                          key={item.id || index}
                          className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold text-[#1a1a1a]">
                                {item.teacher || "N/A"}
                              </h3>
                              <p className="mt-1 text-sm text-[#6b7280]">
                                {item.subject || "N/A"}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "Responded"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {item.status || "Pending"}
                            </span>
                          </div>

                          <div className="mt-4 space-y-3 text-sm">
                            <div className="rounded-xl bg-white p-3">
                              <p className="font-semibold text-[#1a1a1a]">Rating</p>
                              <p className="mt-1 text-[#6b7280]">
                                {item.rating || "N/A"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-white p-3">
                              <p className="font-semibold text-[#1a1a1a]">
                                Submitted At
                              </p>
                              <div className="mt-2 rounded-xl border border-[#e7dbc9] bg-[#fffaf3] px-3 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span>🗓️</span>
                                  <p className="font-medium text-[#1a1a1a]">
                                    {formattedDateTime.date}
                                  </p>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  <span>🕒</span>
                                  <p className="text-sm text-[#6b7280]">
                                    {formattedDateTime.time}
                                  </p>

                                  {formattedDateTime.relative && (
                                    <span className="rounded-full bg-[#eee6d8] px-2.5 py-1 text-[11px] font-semibold text-[#8d6b3f]">
                                      {formattedDateTime.relative}
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
                    <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-6 text-center text-sm font-medium text-[#6b7280]">
                      No recent feedback found.
                    </div>
                  )}
                </section>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ParentDashboard;