import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const FeedbackHistory = () => {
  const navigate = useNavigate();
  const { parentId } = useParams();

  // =========================================
  // Selected student state from localStorage
  // =========================================
  const [selectedStudentId, setSelectedStudentId] = useState(
    localStorage.getItem("selectedStudentId") || ""
  );
  const [selectedStudentName, setSelectedStudentName] = useState(
    localStorage.getItem("selectedStudentName") || ""
  );

  // =========================================
  // Main page states
  // =========================================
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);

  // =========================================
  // Sorting states
  // =========================================
  const [teacherSort, setTeacherSort] = useState("");
  const [ratingSort, setRatingSort] = useState("");
  const [submittedSort, setSubmittedSort] = useState("");

  // =========================================
  // Pagination states
  // =========================================
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // =========================================
  // Load students for the selected parent
  // =========================================
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get(`/parent/dashboard/${parentId}`);
        const studentsData = response.data?.data?.students || [];
        setStudents(studentsData);

        if (studentsData.length > 0) {
          const storedStudentId = localStorage.getItem("selectedStudentId");

          const exists = studentsData.some(
            (student) => String(student.studentId) === String(storedStudentId)
          );

          const activeStudent = exists
            ? studentsData.find(
              (student) => String(student.studentId) === String(storedStudentId)
            )
            : studentsData[0];

          if (activeStudent) {
            localStorage.setItem(
              "selectedStudentId",
              String(activeStudent.studentId)
            );
            localStorage.setItem(
              "selectedStudentName",
              activeStudent.studentName || ""
            );
            localStorage.setItem(
              "selectedStudentClass",
              `${activeStudent.class?.className || ""}${activeStudent.class?.section
                ? `-${activeStudent.class.section}`
                : ""
              }`
            );
            localStorage.setItem(
              "selectedStudentClassId",
              String(activeStudent.class?.classId || "")
            );

            setSelectedStudentId(String(activeStudent.studentId));
            setSelectedStudentName(activeStudent.studentName || "");
          }
        }
      } catch (error) {
        console.error("Failed to load students", error);
      }
    };

    if (parentId) {
      fetchStudents();
    }
  }, [parentId]);

  // =========================================
  // Load feedback history
  // =========================================
  useEffect(() => {
    const fetchFeedbackHistory = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await api.get(`/parent/feedback-history/${parentId}`);
        setFeedbackData(response.data?.data || []);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to load feedback history."
        );
      } finally {
        setLoading(false);
      }
    };

    if (parentId) {
      fetchFeedbackHistory();
    }
  }, [parentId]);

  // =========================================
  // Reset to page 1 whenever filters or sorting change
  // =========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    selectedStudentId,
    teacherSort,
    ratingSort,
    submittedSort,
  ]);

  // =========================================
  // Format date and time for display
  // =========================================
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

  // =========================================
  // Toggle sorting for table/card data
  // =========================================
  const toggleSort = (column) => {
    if (column === "teacher") {
      const nextSort =
        teacherSort === "" ? "asc" : teacherSort === "asc" ? "desc" : "";
      setTeacherSort(nextSort);
      setRatingSort("");
      setSubmittedSort("");
    }

    if (column === "rating") {
      const nextSort =
        ratingSort === "" ? "asc" : ratingSort === "asc" ? "desc" : "";
      setRatingSort(nextSort);
      setTeacherSort("");
      setSubmittedSort("");
    }

    if (column === "submitted") {
      const nextSort =
        submittedSort === "" ? "asc" : submittedSort === "asc" ? "desc" : "";
      setSubmittedSort(nextSort);
      setTeacherSort("");
      setRatingSort("");
    }
  };

  // =========================================
  // Show sort arrow beside column name
  // =========================================
  const getSortIndicator = (sortValue) => {
    if (sortValue === "asc") return " ↑";
    if (sortValue === "desc") return " ↓";
    return "";
  };

  // =========================================
  // Handle selected student change
  // =========================================
  const handleStudentChange = (e) => {
    const newStudentId = e.target.value;

    const selected = students.find(
      (student) => String(student.studentId) === String(newStudentId)
    );

    if (selected) {
      localStorage.setItem("selectedStudentId", String(selected.studentId));
      localStorage.setItem("selectedStudentName", selected.studentName || "");
      localStorage.setItem(
        "selectedStudentClass",
        `${selected.class?.className || ""}${selected.class?.section ? `-${selected.class.section}` : ""
        }`
      );
      localStorage.setItem(
        "selectedStudentClassId",
        String(selected.class?.classId || "")
      );

      setSelectedStudentId(String(selected.studentId));
      setSelectedStudentName(selected.studentName || "");

      setSearchTerm("");
      setStatusFilter("All");
      setTeacherSort("");
      setRatingSort("");
      setSubmittedSort("");
      setCurrentPage(1);

      window.location.reload();
    }
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

  // =========================================
  // Clear all filters and sorting
  // =========================================
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setTeacherSort("");
    setRatingSort("");
    setSubmittedSort("");
    setCurrentPage(1);
  };

  // =========================================
  // Filter and sort feedback records
  // Default sort = latest submitted first
  // =========================================
  const filteredFeedback = useMemo(() => {
    let data = feedbackData.filter((item) => {
      const teacherText = (
        item.TeacherName ||
        item.teacherName ||
        item.teacher ||
        ""
      ).toLowerCase();

      const subjectText = (
        item.SubjectName ||
        item.subjectName ||
        item.subject ||
        ""
      ).toLowerCase();

      const categoryText = (
        item.CategoryName ||
        item.categoryName ||
        item.category ||
        ""
      ).toLowerCase();

      const matchesSearch =
        teacherText.includes(searchTerm.toLowerCase()) ||
        subjectText.includes(searchTerm.toLowerCase()) ||
        categoryText.includes(searchTerm.toLowerCase());

      const itemStatus =
        item.TeacherResponse && item.TeacherResponse.trim() !== ""
          ? "Responded"
          : "Pending";

      const matchesStatus =
        statusFilter === "All" ? true : itemStatus === statusFilter;

      const matchesStudent = selectedStudentId
        ? String(item.StudentId) === String(selectedStudentId)
        : true;

      return matchesSearch && matchesStatus && matchesStudent;
    });

    if (teacherSort) {
      data.sort((a, b) => {
        const aValue = (
          a.TeacherName ||
          a.teacherName ||
          a.teacher ||
          ""
        ).toLowerCase();
        const bValue = (
          b.TeacherName ||
          b.teacherName ||
          b.teacher ||
          ""
        ).toLowerCase();

        return teacherSort === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    } else if (ratingSort) {
      data.sort((a, b) => {
        const aValue = Number(a.Rating) || 0;
        const bValue = Number(b.Rating) || 0;
        return ratingSort === "asc" ? aValue - bValue : bValue - aValue;
      });
    } else if (submittedSort) {
      data.sort((a, b) => {
        const aValue = a.SubmittedAt ? new Date(a.SubmittedAt).getTime() : 0;
        const bValue = b.SubmittedAt ? new Date(b.SubmittedAt).getTime() : 0;
        return submittedSort === "asc" ? aValue - bValue : bValue - aValue;
      });
    } else {
      data.sort((a, b) => {
        const aValue = a.SubmittedAt ? new Date(a.SubmittedAt).getTime() : 0;
        const bValue = b.SubmittedAt ? new Date(b.SubmittedAt).getTime() : 0;
        return bValue - aValue;
      });
    }

    return data;
  }, [
    feedbackData,
    searchTerm,
    statusFilter,
    selectedStudentId,
    teacherSort,
    ratingSort,
    submittedSort,
  ]);

  // =========================================
  // Summary counts
  // =========================================
  const totalRecords = filteredFeedback.length;
  const respondedCount = filteredFeedback.filter(
    (item) => item.TeacherResponse && item.TeacherResponse.trim() !== ""
  ).length;
  const pendingCount = filteredFeedback.filter(
    (item) => !item.TeacherResponse || item.TeacherResponse.trim() === ""
  ).length;

  // =========================================
  // Pagination calculations
  // =========================================
  const totalPages = Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE);

  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredFeedback.slice(startIndex, endIndex);
  }, [filteredFeedback, currentPage]);

  // =========================================
  // Pagination actions
  // =========================================
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // =========================================
  // Build visible pagination numbers like:
  // << < 1 2 3 ... 10 > >>
  // =========================================
  const getVisiblePages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-[#d6c2a8] bg-[#fffaf3]">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a] sm:text-3xl">
                Feedback History
              </h1>
              <p className="mt-1 text-sm text-[#6b7280] sm:text-base">
                Selected child: {selectedStudentName || "No child selected"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedStudentId}
                onChange={handleStudentChange}
                className="rounded-xl border border-[#d6c2a8] bg-[#e8dcc8] px-4 py-2.5 pr-10 font-semibold text-black shadow-sm outline-none transition hover:bg-[#ddcfb8]"
              >
                {students.map((student) => (
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
                onClick={() => navigate(`/parent/dashboard/${parentId}`)}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Back to Dashboard
              </button>

              <button
                onClick={() => navigate(`/submit-feedback/${parentId}`)}
                className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
              >
                Submit Feedback
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
              Loading feedback history...
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
                      Parent Feedback Records
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/90 sm:text-base">
                      View the selected child’s submitted feedback, response
                      status, and teacher replies in one place.
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
                    onClick={clearAllFilters}
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
                      placeholder="Search by teacher, subject, or category"
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

              {/* =========================
                  Desktop table view
                 ========================= */}
              <section className="hidden rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr>
                        <th
                          onClick={() => toggleSort("teacher")}
                          className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#6b7280] select-none"
                        >
                          Teacher{getSortIndicator(teacherSort)}
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Subject
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Category
                        </th>

                        <th
                          onClick={() => toggleSort("rating")}
                          className="cursor-pointer px-4 py-2 text-left text-sm font-semibold text-[#6b7280] select-none"
                        >
                          Rating{getSortIndicator(ratingSort)}
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Comments
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-semibold text-[#6b7280]">
                          Response
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
                      {paginatedFeedback.length > 0 ? (
                        paginatedFeedback.map((item, index) => {
                          const status =
                            item.TeacherResponse && item.TeacherResponse.trim() !== ""
                              ? "Responded"
                              : "Pending";

                          const formattedDateTime = formatDateTime(item.SubmittedAt);

                          return (
                            <tr
                              key={item.FeedbackId || item.id || index}
                              className="bg-[#f7f1e8]"
                            >
                              <td className="rounded-l-xl px-4 py-4 font-medium text-[#1a1a1a]">
                                {item.TeacherName || "N/A"}
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
                              <td className="max-w-[200px] px-4 py-4 text-[#1a1a1a]">
                                <p className="line-clamp-3">
                                  {item.Comments || "N/A"}
                                </p>
                              </td>
                              <td className="max-w-[200px] px-4 py-4 text-[#1a1a1a]">
                                <p className="line-clamp-3">
                                  {item.TeacherResponse || "No response yet"}
                                </p>
                              </td>
                              <td className="px-4 py-4 text-[#1a1a1a]">
                                <div className="inline-flex flex-col rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span className="text-sm">🗓️</span>
                                    <p className="text-sm font-semibold text-[#1a1a1a] whitespace-nowrap">
                                      {formattedDateTime.date}
                                    </p>
                                  </div>

                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs">🕒</span>
                                    <p className="text-xs text-[#6b7280]">
                                      {formattedDateTime.time}
                                    </p>

                                    {formattedDateTime.relative && (
                                      <span className="rounded-full bg-[#eee6d8] px-2 py-0.5 text-[11px] font-semibold text-[#8d6b3f] whitespace-nowrap">
                                        {formattedDateTime.relative}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="rounded-r-xl px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "Responded"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                    }`}
                                >
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="rounded-xl bg-[#f7f1e8] px-4 py-4 text-center text-[#6b7280]"
                          >
                            No feedback records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Desktop pagination inside same section */}
                {filteredFeedback.length > 0 && totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] pt-6">
                    <p className="text-sm text-[#6b7280] text-center">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredFeedback.length)} of{" "}
                      {filteredFeedback.length} records
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ≪
                      </button>

                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ‹
                      </button>

                      {getVisiblePages().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="flex h-12 min-w-[48px] items-center justify-center rounded-2xl px-3 text-lg font-semibold text-[#6b7280]"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`h-12 min-w-[48px] rounded-2xl px-4 text-lg font-semibold transition ${currentPage === page
                              ? "bg-blue-500 text-white shadow-md"
                              : "border border-[#d6c2a8] bg-white text-[#1a1a1a] hover:bg-[#efe4d2]"
                              }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ›
                      </button>

                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ≫
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* =========================
                  Mobile card view
                 ========================= */}
              <section className="space-y-4 lg:hidden">
                {paginatedFeedback.length > 0 ? (
                  paginatedFeedback.map((item, index) => {
                    const status =
                      item.TeacherResponse && item.TeacherResponse.trim() !== ""
                        ? "Responded"
                        : "Pending";

                    const formattedDateTime = formatDateTime(item.SubmittedAt);

                    return (
                      <div
                        key={item.FeedbackId || item.id || index}
                        className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-[#1a1a1a]">
                              {item.TeacherName || "N/A"}
                            </h3>
                            <p className="mt-1 text-sm text-[#6b7280]">
                              {item.SubjectName || "N/A"} •{" "}
                              {item.CategoryName || "N/A"}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "Responded"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                          <div className="rounded-xl bg-[#f7f1e8] p-3">
                            <p className="font-semibold text-[#1a1a1a]">Rating</p>
                            <p className="mt-1 text-[#6b7280]">
                              {item.Rating ? `${item.Rating}/5` : "N/A"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#f7f1e8] p-3">
                            <p className="font-semibold text-[#1a1a1a]">Comments</p>
                            <p className="mt-1 text-[#6b7280]">
                              {item.Comments || "N/A"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#f7f1e8] p-3">
                            <p className="font-semibold text-[#1a1a1a]">
                              Teacher Response
                            </p>
                            <p className="mt-1 text-[#6b7280]">
                              {item.TeacherResponse || "No response yet"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#f7f1e8] p-3">
                            <p className="font-semibold text-[#1a1a1a]">
                              Submitted Date
                            </p>
                            <div className="mt-2 rounded-xl border border-[#e7dbc9] bg-white px-3 py-3">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <span>🗓️</span>
                                <p className="font-medium text-[#1a1a1a] whitespace-nowrap">
                                  {formattedDateTime.date}
                                </p>
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                <span>🕒</span>
                                <p className="text-sm text-[#6b7280]">
                                  {formattedDateTime.time}
                                </p>

                                {formattedDateTime.relative && (
                                  <span className="rounded-full bg-[#eee6d8] px-2 py-0.5 text-[11px] font-semibold text-[#8d6b3f] whitespace-nowrap">
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
                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-6 text-center text-sm font-medium text-[#6b7280] shadow-md">
                    No feedback records found.
                  </div>
                )}

                {/* Mobile pagination inside same section */}
                {filteredFeedback.length > 0 && totalPages > 1 && (
                  <div className="rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] p-4 shadow-md">
                    <p className="mb-4 text-center text-sm text-[#6b7280]">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredFeedback.length)} of{" "}
                      {filteredFeedback.length} records
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ≪
                      </button>

                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ‹
                      </button>

                      {getVisiblePages().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-mobile-${index}`}
                            className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl px-2 text-base font-semibold text-[#6b7280]"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={`mobile-${page}`}
                            onClick={() => goToPage(page)}
                            className={`h-11 min-w-[44px] rounded-2xl px-3 text-base font-semibold transition ${currentPage === page
                              ? "bg-blue-500 text-white shadow-md"
                              : "border border-[#d6c2a8] bg-white text-[#1a1a1a] hover:bg-[#efe4d2]"
                              }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ›
                      </button>

                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ≫
                      </button>
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

export default FeedbackHistory;