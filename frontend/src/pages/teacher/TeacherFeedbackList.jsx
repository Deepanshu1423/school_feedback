import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const TeacherFeedbackList = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams();

  // =========================================
  // Main data states
  // loading  = shows loading message while API data is loading
  // message  = stores API error message
  // feedbacks = stores all feedback records received from backend
  // =========================================
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  // =========================================
  // Filter states
  // searchTerm   = text used for searching parent/student/subject/category
  // statusFilter = All / Responded / Pending filter
  // =========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // =========================================
  // Pagination states
  // ITEMS_PER_PAGE = how many feedback records show on one page
  // currentPage    = active pagination page number
  // =========================================
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // =========================================
  // Sorting states
  // Empty string means default order
  // parent/student/class sorting: asc -> desc -> default
  // submitted sorting: latest -> oldest -> default
  // =========================================
  const [parentSort, setParentSort] = useState("");
  const [studentSort, setStudentSort] = useState("");
  const [classSort, setClassSort] = useState("");
  const [submittedSort, setSubmittedSort] = useState("");

  // =========================================
  // Logout handler
  // Removes login details and sends teacher back to login page
  // =========================================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // =========================================
  // Fetch teacher feedback list
  // This API loads all feedback records assigned to the current teacher
  // =========================================
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

  // =========================================
  // Open response page
  // This sends teacher to TeacherRespond page and scrolls directly to comments section
  // =========================================
  const openResponsePage = (feedbackId) => {
    navigate(`/teacher/respond/${teacherId}/${feedbackId}?scroll=comments`);
  };

  // =========================================
  // Format date and time
  // Converts raw database date into readable date, time, and Today/Yesterday label
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
  // Reset all sorting states
  // Only one column sorting should remain active at one time
  // =========================================
  const resetAllSorts = () => {
    setParentSort("");
    setStudentSort("");
    setClassSort("");
    setSubmittedSort("");
  };

  // =========================================
  // Toggle sorting on table header click
  // First click  = ascending/latest
  // Second click = descending/oldest
  // Third click  = default
  // =========================================
  const toggleSort = (column) => {
    if (column === "parent") {
      const nextSort =
        parentSort === "" ? "asc" : parentSort === "asc" ? "desc" : "";

      resetAllSorts();
      setParentSort(nextSort);
    }

    if (column === "student") {
      const nextSort =
        studentSort === "" ? "asc" : studentSort === "asc" ? "desc" : "";

      resetAllSorts();
      setStudentSort(nextSort);
    }

    if (column === "class") {
      const nextSort =
        classSort === "" ? "asc" : classSort === "asc" ? "desc" : "";

      resetAllSorts();
      setClassSort(nextSort);
    }

    if (column === "submitted") {
      const nextSort =
        submittedSort === ""
          ? "latest"
          : submittedSort === "latest"
          ? "oldest"
          : "";

      resetAllSorts();
      setSubmittedSort(nextSort);
    }
  };

  // =========================================
  // Get sorting indicator
  // Shows arrow beside sortable column name
  // =========================================
  const getSortIndicator = (sortValue, type = "text") => {
    if (type === "date") {
      if (sortValue === "latest") return " ↓";
      if (sortValue === "oldest") return " ↑";
      return "";
    }

    if (sortValue === "asc") return " ↑";
    if (sortValue === "desc") return " ↓";

    return "";
  };

  // =========================================
  // Clear filters and sorting
  // This resets search, status filter, sorting, and pagination page
  // =========================================
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    resetAllSorts();
    setCurrentPage(1);
  };

  // =========================================
  // Filter and sort feedback records
  // useMemo avoids recalculating filtered/sorted data unnecessarily
  // =========================================
  const filteredFeedbacks = useMemo(() => {
    let result = feedbacks.filter((item) => {
      const parentText = (item.ParentName || "").toLowerCase();
      const studentText = (item.StudentName || "").toLowerCase();
      const subjectText = (item.SubjectName || "").toLowerCase();
      const categoryText = (item.CategoryName || "").toLowerCase();
      const currentSearch = searchTerm.toLowerCase();

      const matchesSearch =
        parentText.includes(currentSearch) ||
        studentText.includes(currentSearch) ||
        subjectText.includes(currentSearch) ||
        categoryText.includes(currentSearch);

      const status =
        item.TeacherResponse && item.TeacherResponse.trim() !== ""
          ? "Responded"
          : "Pending";

      const matchesStatus =
        statusFilter === "All" ? true : status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Class text combines class name and section for proper class sorting
    const getClassText = (item) => {
      return `${item.ClassName || ""}${item.Section ? `-${item.Section}` : ""}`
        .trim()
        .toLowerCase();
    };

    if (parentSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.ParentName || "").localeCompare(String(b.ParentName || ""))
      );
    } else if (parentSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.ParentName || "").localeCompare(String(a.ParentName || ""))
      );
    } else if (studentSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.StudentName || "").localeCompare(String(b.StudentName || ""))
      );
    } else if (studentSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.StudentName || "").localeCompare(String(a.StudentName || ""))
      );
    } else if (classSort === "asc") {
      result = [...result].sort((a, b) =>
        getClassText(a).localeCompare(getClassText(b))
      );
    } else if (classSort === "desc") {
      result = [...result].sort((a, b) =>
        getClassText(b).localeCompare(getClassText(a))
      );
    } else if (submittedSort === "latest") {
      result = [...result].sort(
        (a, b) => new Date(b.SubmittedAt || 0) - new Date(a.SubmittedAt || 0)
      );
    } else if (submittedSort === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.SubmittedAt || 0) - new Date(b.SubmittedAt || 0)
      );
    }

    return result;
  }, [
    feedbacks,
    searchTerm,
    statusFilter,
    parentSort,
    studentSort,
    classSort,
    submittedSort,
  ]);

  // =========================================
  // Reset pagination when search/filter/sorting changes
  // This prevents user from staying on an invalid page after filtering
  // =========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    parentSort,
    studentSort,
    classSort,
    submittedSort,
  ]);

  // =========================================
  // Pagination calculation
  // filteredFeedbacks contains final filtered/sorted data
  // paginatedFeedbacks contains only current page records
  // =========================================
  const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

  // =========================================
  // Go to selected page
  // This also prevents invalid page numbers
  // =========================================
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // =========================================
  // Go to previous page
  // This never allows page number below 1
  // =========================================
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // =========================================
  // Go to next page
  // This never allows page number above totalPages
  // =========================================
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // =========================================
  // Build visible page number list
  // If pages are more than 5, ellipsis is used for compact UI
  // =========================================
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  // =========================================
  // Reusable pagination UI
  // Used in both desktop table view and mobile card view
  // =========================================
  const renderPagination = (viewType) => {
    if (filteredFeedbacks.length === 0 || totalPages <= 1) return null;

    return (
      <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] pt-6">
        <p className="text-center text-sm text-[#6b7280]">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredFeedbacks.length)} of{" "}
          {filteredFeedbacks.length} records
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ≪
          </button>

          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹
          </button>

          {getVisiblePages().map((page, index) =>
            page === "..." ? (
              <span
                key={`${viewType}-ellipsis-${index}`}
                className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl px-2 text-base font-semibold text-[#6b7280]"
              >
                ...
              </span>
            ) : (
              <button
                key={`${viewType}-page-${page}`}
                type="button"
                onClick={() => goToPage(page)}
                className={`h-11 min-w-[44px] rounded-2xl px-3 text-base font-semibold transition ${
                  currentPage === page
                    ? "bg-[#b08d57] text-black shadow-md"
                    : "border border-[#d6c2a8] bg-white text-[#1a1a1a] hover:bg-[#efe4d2]"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ›
          </button>

          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ≫
          </button>
        </div>
      </div>
    );
  };

  // =========================================
  // Summary counts
  // These cards always calculate from original feedback list, not filtered list
  // =========================================
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
        {/* =========================================
            Page header
           ========================================= */}
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
          {/* Loading message */}
          {loading && (
            <div className="mb-4 rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-[#5f5446]">
              Loading feedback list...
            </div>
          )}

          {/* Error message */}
          {message && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {message}
            </div>
          )}

          {!loading && !message && (
            <>
              {/* =========================================
                  Hero section
                 ========================================= */}
              <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-4 shadow-lg sm:p-5 lg:p-6">
                <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#2f2418]/20 bg-gradient-to-br from-[#171311] via-[#2b2119] to-[#b08d57] p-5 text-white sm:p-6">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                      Teacher Feedback Records
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/90 sm:text-base">
                      Track feedback status, review parent comments, and open
                      any record directly in the response page.
                    </p>
                  </div>
                </div>
              </section>

              {/* =========================================
                  Summary cards section
                 ========================================= */}
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

              {/* =========================================
                  Filters section
                  This section is common for both desktop and mobile views
                 ========================================= */}
              <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#0c0c0c]">
                      Filters
                    </h3>
                    <p className="text-sm text-[#6b7280]">
                      Search, filter, and sort feedback records
                    </p>
                  </div>

                  <button
                    onClick={handleClearFilters}
                    className="rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2]"
                  >
                    Clear
                  </button>
                </div>

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

              {/* =========================================
                  DESKTOP VIEW
                  This table view is visible only on large screens.
                  Tailwind class lg:block shows it on desktop.
                  Tailwind class hidden hides it on mobile/tablet.
                 ========================================= */}
              <section className="hidden rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md sm:p-6 lg:block">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-[#1a1a1a]">
                    Feedback Records
                  </h3>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Click respond or view response to open comments and response
                    area
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr>
                        <th
                          onClick={() => toggleSort("parent")}
                          className="cursor-pointer select-none px-4 py-2 text-left text-sm font-bold text-[#000308]"
                        >
                          Parent{getSortIndicator(parentSort)}
                        </th>

                        <th
                          onClick={() => toggleSort("student")}
                          className="cursor-pointer select-none px-4 py-2 text-left text-sm font-bold text-[#000308]"
                        >
                          Student{getSortIndicator(studentSort)}
                        </th>

                        <th
                          onClick={() => toggleSort("class")}
                          className="cursor-pointer select-none px-4 py-2 text-left text-sm font-bold text-[#000308]"
                        >
                          Class{getSortIndicator(classSort)}
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-bold text-[#000308]">
                          Subject
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-bold text-[#000308]">
                          Category
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-bold text-[#000308]">
                          Rating
                        </th>

                        <th
                          onClick={() => toggleSort("submitted")}
                          className="cursor-pointer select-none px-4 py-2 text-left text-sm font-bold text-[#000308]"
                        >
                          Submitted At{getSortIndicator(submittedSort, "date")}
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-bold text-[#000308]">
                          Status
                        </th>

                        <th className="px-4 py-2 text-left text-sm font-bold text-[#000308]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFeedbacks.length > 0 ? (
                        paginatedFeedbacks.map((item, index) => {
                          const status =
                            item.TeacherResponse &&
                            item.TeacherResponse.trim() !== ""
                              ? "Responded"
                              : "Pending";

                          const submittedDate = formatDateTime(
                            item.SubmittedAt
                          );

                          return (
                            <tr
                              key={item.FeedbackId || index}
                              className="bg-[#f7f1e8]"
                            >
                              <td className="rounded-l-xl px-4 py-4 text-[#1a1a1a]">
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
                                <div className="flex w-50 flex-col rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span>🗓️</span>
                                    <p className="whitespace-nowrap font-medium text-[#1a1a1a]">
                                      {submittedDate.date}
                                    </p>
                                  </div>

                                  <div className="mt-1 grid grid-cols-[auto_1fr_80px] items-center gap-2">
                                    <span>🕒</span>

                                    <p className="whitespace-nowrap text-sm text-[#6b7280]">
                                      {submittedDate.time || "-"}
                                    </p>

                                    <span
                                      className={`inline-block w-20 whitespace-nowrap rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${
                                        submittedDate.relative
                                          ? "bg-[#eee6d8] text-[#8d6b3f]"
                                          : "invisible bg-[#eee6d8] text-[#8d6b3f]"
                                      }`}
                                    >
                                      {submittedDate.relative || "-"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex w-27.5 justify-center rounded-full px-3 py-1 text-xs font-semibold ${
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
                                    openResponsePage(item.FeedbackId)
                                  }
                                  className={`w-37.5 rounded-xl px-4 py-2 text-center text-sm font-semibold shadow-sm transition ${
                                    status === "Responded"
                                      ? "bg-[#e8dcc8] text-black hover:bg-[#d6c2a8]"
                                      : "bg-[#b08d57] text-black hover:bg-[#c39a5f]"
                                  }`}
                                >
                                  {status === "Responded"
                                    ? "View Response"
                                    : "Respond"}
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

                {/* Desktop pagination */}
                {renderPagination("desktop")}
              </section>

              {/* =========================================
                  MOBILE VIEW
                  This card view is visible on mobile and tablet screens.
                  Tailwind class lg:hidden hides it on large desktop screens.
                 ========================================= */}
              <section className="space-y-4 lg:hidden">
                {filteredFeedbacks.length > 0 ? (
                  paginatedFeedbacks.map((item, index) => {
                    const status =
                      item.TeacherResponse &&
                      item.TeacherResponse.trim() !== ""
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

                                <span className="text-sm text-[#9ca3af]">
                                  •
                                </span>

                                <span className="text-sm font-medium text-[#6b7280]">
                                  {item.SubjectName || "N/A"}
                                </span>

                                <span className="text-sm text-[#9ca3af]">
                                  •
                                </span>

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
                                className={`inline-flex w-27.5 justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                                  status === "Responded"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {status}
                              </span>

                              <button
                                onClick={() =>
                                  openResponsePage(item.FeedbackId)
                                }
                                className={`w-37.5 rounded-xl px-4 py-2 text-center text-sm font-semibold text-black shadow-sm transition ${
                                  status === "Responded"
                                    ? "bg-[#e8dcc8] hover:bg-[#d6c2a8]"
                                    : "bg-[#b08d57] hover:bg-[#c39a5f]"
                                }`}
                              >
                                {status === "Responded"
                                  ? "View Response"
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

                            <div className="w-50 rounded-xl border border-[#e7dbc9] bg-white px-3 py-2 shadow-sm">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <span>🗓️</span>
                                <p className="whitespace-nowrap font-medium text-[#1a1a1a]">
                                  {submittedDate.date}
                                </p>
                              </div>

                              <div className="mt-1 grid grid-cols-[auto_1fr_80px] items-center gap-2">
                                <span>🕒</span>

                                <p className="whitespace-nowrap text-sm text-[#6b7280]">
                                  {submittedDate.time || "-"}
                                </p>

                                <span
                                  className={`inline-block w-20 whitespace-nowrap rounded-full px-2 py-0.5 text-center text-[11px] font-semibold ${
                                    submittedDate.relative
                                      ? "bg-[#eee6d8] text-[#8d6b3f]"
                                      : "invisible bg-[#eee6d8] text-[#8d6b3f]"
                                  }`}
                                >
                                  {submittedDate.relative || "-"}
                                </span>
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

                {/* Mobile pagination */}
                {renderPagination("mobile")}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeacherFeedbackList;