import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const ReportsManagement = () => {
  // =========================================
  // Main report data states
  // =========================================
  const [teacherPerformance, setTeacherPerformance] = useState([]);
  const [classSummary, setClassSummary] = useState([]);
  const [monthlyFeedback, setMonthlyFeedback] = useState([]);

  // =========================================
  // UI states
  // =========================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // Global filter states
  // =========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [reportFilter, setReportFilter] = useState("all");

  // =========================================
  // Teacher report sort states
  // =========================================
  const [teacherNameSort, setTeacherNameSort] = useState("");
  const [teacherCodeSort, setTeacherCodeSort] = useState("");
  const [teacherRatingSort, setTeacherRatingSort] = useState("");
  const [teacherSubjectsSort, setTeacherSubjectsSort] = useState("");

  // =========================================
  // Class report sort states
  // =========================================
  const [classNameSort, setClassNameSort] = useState("");
  const [classYearSort, setClassYearSort] = useState("");
  const [classTeachersSort, setClassTeachersSort] = useState("");
  const [classStudentsSort, setClassStudentsSort] = useState("");

  // =========================================
  // Monthly report sort states
  // =========================================
  const [monthSort, setMonthSort] = useState("");

  // =========================================
  // Separate pagination states for each report
  // =========================================
  const [teacherCurrentPage, setTeacherCurrentPage] = useState(1);
  const [classCurrentPage, setClassCurrentPage] = useState(1);
  const [monthlyCurrentPage, setMonthlyCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // =========================================
  // Get auth headers for protected API calls
  // =========================================
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // =========================================
  // Initial page load
  // Fetch all report data
  // =========================================
  useEffect(() => {
    fetchReports();
  }, []);

  // =========================================
  // Reset teacher page when teacher filters/sorts change
  // =========================================
  useEffect(() => {
    setTeacherCurrentPage(1);
  }, [
    searchTerm,
    reportFilter,
    teacherNameSort,
    teacherCodeSort,
    teacherRatingSort,
    teacherSubjectsSort,
  ]);

  // =========================================
  // Reset class page when class filters/sorts change
  // =========================================
  useEffect(() => {
    setClassCurrentPage(1);
  }, [
    searchTerm,
    reportFilter,
    classNameSort,
    classYearSort,
    classTeachersSort,
    classStudentsSort,
  ]);

  // =========================================
  // Reset monthly page when monthly filters/sorts change
  // =========================================
  useEffect(() => {
    setMonthlyCurrentPage(1);
  }, [searchTerm, reportFilter, monthSort]);

  // =========================================
  // Fetch all reports from backend
  // =========================================
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [teacherRes, classRes, monthlyRes] = await Promise.all([
        axios.get("/admin/reports/teacher-performance", {
          headers: getAuthHeaders(),
        }),
        axios.get("/admin/reports/class-feedback-summary", {
          headers: getAuthHeaders(),
        }),
        axios.get("/admin/reports/monthly-feedback", {
          headers: getAuthHeaders(),
        }),
      ]);

      if (teacherRes.data.success) {
        setTeacherPerformance(teacherRes.data.data || []);
      }

      if (classRes.data.success) {
        setClassSummary(classRes.data.data || []);
      }

      if (monthlyRes.data.success) {
        setMonthlyFeedback(monthlyRes.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Reset all teacher report sorting
  // =========================================
  const resetTeacherSorts = () => {
    setTeacherNameSort("");
    setTeacherCodeSort("");
    setTeacherRatingSort("");
    setTeacherSubjectsSort("");
  };

  // =========================================
  // Reset all class report sorting
  // =========================================
  const resetClassSorts = () => {
    setClassNameSort("");
    setClassYearSort("");
    setClassTeachersSort("");
    setClassStudentsSort("");
  };

  // =========================================
  // Reset all monthly report sorting
  // =========================================
  const resetMonthlySorts = () => {
    setMonthSort("");
  };

  // =========================================
  // Clear search, report filter, all sorting,
  // and reset all paginations
  // =========================================
  const handleClearFilters = () => {
    setSearchTerm("");
    setReportFilter("all");
    resetTeacherSorts();
    resetClassSorts();
    resetMonthlySorts();
    setTeacherCurrentPage(1);
    setClassCurrentPage(1);
    setMonthlyCurrentPage(1);
  };

  // =========================================
  // Toggle teacher report sorting
  // Click cycle: asc -> desc -> default
  // =========================================
  const toggleTeacherSort = (type) => {
    if (type === "name") {
      const next =
        teacherNameSort === "" ? "asc" : teacherNameSort === "asc" ? "desc" : "";
      resetTeacherSorts();
      setTeacherNameSort(next);
    }

    if (type === "code") {
      const next =
        teacherCodeSort === "" ? "asc" : teacherCodeSort === "asc" ? "desc" : "";
      resetTeacherSorts();
      setTeacherCodeSort(next);
    }

    if (type === "rating") {
      const next =
        teacherRatingSort === ""
          ? "desc"
          : teacherRatingSort === "desc"
          ? "asc"
          : "";
      resetTeacherSorts();
      setTeacherRatingSort(next);
    }

    if (type === "subjects") {
      const next =
        teacherSubjectsSort === ""
          ? "desc"
          : teacherSubjectsSort === "desc"
          ? "asc"
          : "";
      resetTeacherSorts();
      setTeacherSubjectsSort(next);
    }
  };

  // =========================================
  // Toggle class report sorting
  // =========================================
  const toggleClassSort = (type) => {
    if (type === "class") {
      const next =
        classNameSort === "" ? "asc" : classNameSort === "asc" ? "desc" : "";
      resetClassSorts();
      setClassNameSort(next);
    }

    if (type === "year") {
      const next =
        classYearSort === "" ? "asc" : classYearSort === "asc" ? "desc" : "";
      resetClassSorts();
      setClassYearSort(next);
    }

    if (type === "teachers") {
      const next =
        classTeachersSort === ""
          ? "desc"
          : classTeachersSort === "desc"
          ? "asc"
          : "";
      resetClassSorts();
      setClassTeachersSort(next);
    }

    if (type === "students") {
      const next =
        classStudentsSort === ""
          ? "desc"
          : classStudentsSort === "desc"
          ? "asc"
          : "";
      resetClassSorts();
      setClassStudentsSort(next);
    }
  };

  // =========================================
  // Toggle monthly report sorting
  // =========================================
  const toggleMonthlySort = () => {
    const next = monthSort === "" ? "asc" : monthSort === "asc" ? "desc" : "";
    resetMonthlySorts();
    setMonthSort(next);
  };

  // =========================================
  // Show arrow indicator beside sortable headers/buttons
  // =========================================
  const getSortIndicator = (sortValue) => {
    if (sortValue === "asc") return " ↑";
    if (sortValue === "desc") return " ↓";
    return "";
  };

  // =========================================
  // Helper to sort class names properly
  // Supports numeric classes like 1,2,10
  // =========================================
  const getClassValue = (item) => {
    const raw = String(item.ClassName || "").trim();
    const num = Number(raw);

    if (!Number.isNaN(num) && raw !== "") {
      return { isNumeric: true, value: num };
    }

    return { isNumeric: false, value: raw.toLowerCase() };
  };

  // =========================================
  // Helper to sort academic year using first year
  // Example: 2025-26 -> 2025
  // =========================================
  const getYearValue = (item) => {
    const raw = String(item.AcademicYear || "");
    const firstYear = raw.split("-")[0]?.trim();
    const num = Number(firstYear);
    return Number.isNaN(num) ? 0 : num;
  };

  // =========================================
  // Helper to sort report month
  // Supports values like:
  // Apr 2026 / April 2026 / 2026-04 / 2026-04-01
  // =========================================
  const getMonthValue = (item) => {
    const raw = String(item.ReportMonth || "").trim();

    const directDate = new Date(raw);
    if (!Number.isNaN(directDate.getTime())) return directDate.getTime();

    const prefixedDate = new Date(`1 ${raw}`);
    if (!Number.isNaN(prefixedDate.getTime())) return prefixedDate.getTime();

    const isoMonthMatch = raw.match(/^(\d{4})-(\d{1,2})$/);
    if (isoMonthMatch) {
      const year = Number(isoMonthMatch[1]);
      const month = Number(isoMonthMatch[2]) - 1;
      return new Date(year, month, 1).getTime();
    }

    return 0;
  };

  // =========================================
  // Teacher report filtered + sorted data
  // Search applies here
  // =========================================
  const filteredTeacherPerformance = useMemo(() => {
    let result = teacherPerformance.filter((teacher) => {
      const q = searchTerm.toLowerCase();
      return (
        teacher.TeacherCode?.toLowerCase().includes(q) ||
        teacher.TeacherName?.toLowerCase().includes(q) ||
        teacher.Email?.toLowerCase().includes(q) ||
        teacher.Mobile?.toLowerCase().includes(q)
      );
    });

    if (teacherNameSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.TeacherName || "").localeCompare(String(b.TeacherName || ""))
      );
    } else if (teacherNameSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.TeacherName || "").localeCompare(String(a.TeacherName || ""))
      );
    } else if (teacherCodeSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.TeacherCode || "").localeCompare(
          String(b.TeacherCode || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        )
      );
    } else if (teacherCodeSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.TeacherCode || "").localeCompare(
          String(a.TeacherCode || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        )
      );
    } else if (teacherRatingSort === "desc") {
      result = [...result].sort(
        (a, b) => Number(b.AverageRating || 0) - Number(a.AverageRating || 0)
      );
    } else if (teacherRatingSort === "asc") {
      result = [...result].sort(
        (a, b) => Number(a.AverageRating || 0) - Number(b.AverageRating || 0)
      );
    } else if (teacherSubjectsSort === "desc") {
      result = [...result].sort(
        (a, b) =>
          Number(b.TotalSubjectsCovered || 0) - Number(a.TotalSubjectsCovered || 0)
      );
    } else if (teacherSubjectsSort === "asc") {
      result = [...result].sort(
        (a, b) =>
          Number(a.TotalSubjectsCovered || 0) - Number(b.TotalSubjectsCovered || 0)
      );
    }

    return result;
  }, [
    teacherPerformance,
    searchTerm,
    teacherNameSort,
    teacherCodeSort,
    teacherRatingSort,
    teacherSubjectsSort,
  ]);

  // =========================================
  // Class report filtered + sorted data
  // =========================================
  const filteredClassSummary = useMemo(() => {
    let result = classSummary.filter((item) => {
      const q = searchTerm.toLowerCase();
      return (
        item.ClassName?.toLowerCase().includes(q) ||
        item.Section?.toLowerCase().includes(q) ||
        item.AcademicYear?.toLowerCase().includes(q)
      );
    });

    if (classNameSort === "asc") {
      result = [...result].sort((a, b) => {
        const av = getClassValue(a);
        const bv = getClassValue(b);

        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    } else if (classNameSort === "desc") {
      result = [...result].sort((a, b) => {
        const av = getClassValue(a);
        const bv = getClassValue(b);

        if (av.isNumeric && bv.isNumeric) return bv.value - av.value;
        if (av.isNumeric && !bv.isNumeric) return 1;
        if (!av.isNumeric && bv.isNumeric) return -1;
        return String(bv.value).localeCompare(String(av.value));
      });
    } else if (classYearSort === "asc") {
      result = [...result].sort((a, b) => getYearValue(a) - getYearValue(b));
    } else if (classYearSort === "desc") {
      result = [...result].sort((a, b) => getYearValue(b) - getYearValue(a));
    } else if (classTeachersSort === "desc") {
      result = [...result].sort(
        (a, b) => Number(b.TotalTeachers || 0) - Number(a.TotalTeachers || 0)
      );
    } else if (classTeachersSort === "asc") {
      result = [...result].sort(
        (a, b) => Number(a.TotalTeachers || 0) - Number(b.TotalTeachers || 0)
      );
    } else if (classStudentsSort === "desc") {
      result = [...result].sort(
        (a, b) => Number(b.TotalStudents || 0) - Number(a.TotalStudents || 0)
      );
    } else if (classStudentsSort === "asc") {
      result = [...result].sort(
        (a, b) => Number(a.TotalStudents || 0) - Number(b.TotalStudents || 0)
      );
    }

    return result;
  }, [
    classSummary,
    searchTerm,
    classNameSort,
    classYearSort,
    classTeachersSort,
    classStudentsSort,
  ]);

  // =========================================
  // Monthly report filtered + sorted data
  // =========================================
  const filteredMonthlyFeedback = useMemo(() => {
    let result = monthlyFeedback.filter((item) => {
      const q = searchTerm.toLowerCase();
      return item.ReportMonth?.toLowerCase().includes(q);
    });

    if (monthSort === "asc") {
      result = [...result].sort((a, b) => getMonthValue(a) - getMonthValue(b));
    } else if (monthSort === "desc") {
      result = [...result].sort((a, b) => getMonthValue(b) - getMonthValue(a));
    }

    return result;
  }, [monthlyFeedback, searchTerm, monthSort]);

  // =========================================
  // Total rows after filtering
  // =========================================
  const totalRows =
    filteredTeacherPerformance.length +
    filteredClassSummary.length +
    filteredMonthlyFeedback.length;

  // =========================================
  // Teacher report pagination
  // =========================================
  const teacherTotalPages = Math.ceil(
    filteredTeacherPerformance.length / ITEMS_PER_PAGE
  );

  const paginatedTeacherPerformance = useMemo(() => {
    const startIndex = (teacherCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTeacherPerformance.slice(startIndex, endIndex);
  }, [filteredTeacherPerformance, teacherCurrentPage]);

  // =========================================
  // Class report pagination
  // =========================================
  const classTotalPages = Math.ceil(filteredClassSummary.length / ITEMS_PER_PAGE);

  const paginatedClassSummary = useMemo(() => {
    const startIndex = (classCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredClassSummary.slice(startIndex, endIndex);
  }, [filteredClassSummary, classCurrentPage]);

  // =========================================
  // Monthly report pagination
  // =========================================
  const monthlyTotalPages = Math.ceil(
    filteredMonthlyFeedback.length / ITEMS_PER_PAGE
  );

  const paginatedMonthlyFeedback = useMemo(() => {
    const startIndex = (monthlyCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMonthlyFeedback.slice(startIndex, endIndex);
  }, [filteredMonthlyFeedback, monthlyCurrentPage]);

  // =========================================
  // Teacher pagination actions
  // =========================================
  const goToTeacherPreviousPage = () => {
    if (teacherCurrentPage > 1) {
      setTeacherCurrentPage((prev) => prev - 1);
    }
  };

  const goToTeacherNextPage = () => {
    if (teacherCurrentPage < teacherTotalPages) {
      setTeacherCurrentPage((prev) => prev + 1);
    }
  };

  const goToTeacherPage = (pageNumber) => {
    setTeacherCurrentPage(pageNumber);
  };

  // =========================================
  // Class pagination actions
  // =========================================
  const goToClassPreviousPage = () => {
    if (classCurrentPage > 1) {
      setClassCurrentPage((prev) => prev - 1);
    }
  };

  const goToClassNextPage = () => {
    if (classCurrentPage < classTotalPages) {
      setClassCurrentPage((prev) => prev + 1);
    }
  };

  const goToClassPage = (pageNumber) => {
    setClassCurrentPage(pageNumber);
  };

  // =========================================
  // Monthly pagination actions
  // =========================================
  const goToMonthlyPreviousPage = () => {
    if (monthlyCurrentPage > 1) {
      setMonthlyCurrentPage((prev) => prev - 1);
    }
  };

  const goToMonthlyNextPage = () => {
    if (monthlyCurrentPage < monthlyTotalPages) {
      setMonthlyCurrentPage((prev) => prev + 1);
    }
  };

  const goToMonthlyPage = (pageNumber) => {
    setMonthlyCurrentPage(pageNumber);
  };

  // =========================================
  // Generic helper to build visible page numbers
  // Example: << < 1 2 3 ... 10 > >>
  // =========================================
  const getVisiblePages = (currentPage, totalPages) => {
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

  // =========================================
  // Reusable pagination UI block
  // =========================================
  const PaginationBlock = ({
    currentPage,
    totalPages,
    totalItems,
    label,
    onPrev,
    onNext,
    onPage,
  }) => {
    if (totalItems === 0 || totalPages <= 1) return null;

    return (
      <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] bg-white px-4 py-6">
        <p className="text-sm text-[#6b7280] text-center">
          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}{" "}
          {label}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => onPage(1)}
            disabled={currentPage === 1}
            className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ≪
          </button>

          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹
          </button>

          {getVisiblePages(currentPage, totalPages).map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${label}-${index}`}
                className="flex h-12 min-w-[48px] items-center justify-center rounded-2xl px-3 text-lg font-semibold text-[#6b7280]"
              >
                ...
              </span>
            ) : (
              <button
                key={`${label}-${page}`}
                onClick={() => onPage(page)}
                className={`h-12 min-w-[48px] rounded-2xl px-4 text-lg font-semibold transition ${
                  currentPage === page
                    ? "bg-blue-500 text-white shadow-md"
                    : "border border-[#d6c2a8] bg-white text-[#1a1a1a] hover:bg-[#efe4d2]"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ›
          </button>

          <button
            onClick={() => onPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ≫
          </button>
        </div>
      </div>
    );
  };

  // =========================================
  // Mobile teacher report card
  // Used on small / medium screens
  // =========================================
  const TeacherReportCard = ({ teacher }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Teacher Code</p>
          <p className="font-semibold text-[#a57f42] break-words">
            {teacher.TeacherCode}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Teacher Name</p>
          <p className="font-semibold text-black break-words">
            {teacher.TeacherName}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-black break-words">{teacher.Email || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Mobile</p>
          <p className="text-black">{teacher.Mobile || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Average Rating</p>
          <p className="text-black">{teacher.AverageRating ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Feedbacks</p>
          <p className="text-black">{teacher.TotalFeedbacks ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Subjects Covered</p>
          <p className="text-black">{teacher.TotalSubjectsCovered ?? 0}</p>
        </div>
      </div>
    </div>
  );

  // =========================================
  // Mobile class report card
  // Used on small / medium screens
  // =========================================
  const ClassReportCard = ({ item }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="font-semibold text-black">{item.ClassName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Section</p>
          <p className="text-black">{item.Section}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Academic Year</p>
          <p className="text-black">{item.AcademicYear}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Average Rating</p>
          <p className="text-black">{item.AverageRating ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Feedbacks</p>
          <p className="text-black">{item.TotalFeedbacks ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Teachers</p>
          <p className="text-black">{item.TotalTeachers ?? 0}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Total Students</p>
          <p className="text-black">{item.TotalStudents ?? 0}</p>
        </div>
      </div>
    </div>
  );

  // =========================================
  // Mobile monthly report card
  // Used on small / medium screens
  // =========================================
  const MonthlyReportCard = ({ item }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Month</p>
          <p className="font-semibold text-black">{item.ReportMonth}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Feedbacks</p>
          <p className="text-black">{item.TotalFeedbacks ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Average Rating</p>
          <p className="text-black">{item.AverageRating ?? "-"}</p>
        </div>
      </div>
    </div>
  );

  // =========================================
  // Loading state
  // =========================================
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xl font-semibold text-black">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =========================================
          Summary cards
         ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Teacher Reports
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {teacherPerformance.length}
          </h3>
          <p className="mt-2 text-sm text-gray-500">Teacher report rows</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Class Reports
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {classSummary.length}
          </h3>
          <p className="mt-2 text-sm text-gray-500">Class report rows</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Monthly Reports
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {monthlyFeedback.length}
          </h3>
          <p className="mt-2 text-sm text-gray-500">Monthly report rows</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Filtered Rows
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">{totalRows}</h3>
          <p className="mt-2 text-sm text-gray-500">Rows after filters</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================================
          Global report filters
         ========================================= */}
      <div className="bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
        <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6] space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-black">Report Filters</h2>
              <p className="text-gray-600 text-sm mt-1">
                Search and switch between report sections easily
              </p>
            </div>

            <button
              onClick={handleClearFilters}
              className="rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search teacher, class, section, month..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            />

            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            >
              <option value="all">All Reports</option>
              <option value="teacher">Teacher Performance</option>
              <option value="class">Class Feedback Summary</option>
              <option value="monthly">Monthly Feedback</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================
          Teacher Performance Report
         ========================================= */}
      {(reportFilter === "all" || reportFilter === "teacher") && (
        <div className="bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6]">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Teacher Performance Report
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Performance summary of teachers
              </p>
            </div>
          </div>

          {/* Mobile / tablet cards */}
          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => toggleTeacherSort("code")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Code{getSortIndicator(teacherCodeSort)}
              </button>

              <button
                onClick={() => toggleTeacherSort("name")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Name{getSortIndicator(teacherNameSort)}
              </button>

              <button
                onClick={() => toggleTeacherSort("rating")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Rating{getSortIndicator(teacherRatingSort)}
              </button>

              <button
                onClick={() => toggleTeacherSort("subjects")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Subjects{getSortIndicator(teacherSubjectsSort)}
              </button>
            </div>

            {paginatedTeacherPerformance.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No teacher performance data found
              </div>
            ) : (
              paginatedTeacherPerformance.map((teacher, index) => (
                <TeacherReportCard
                  key={`${teacher.TeacherId}-${index}`}
                  teacher={teacher}
                />
              ))
            )}

            <PaginationBlock
              currentPage={teacherCurrentPage}
              totalPages={teacherTotalPages}
              totalItems={filteredTeacherPerformance.length}
              label="teacher report rows"
              onPrev={goToTeacherPreviousPage}
              onNext={goToTeacherNextPage}
              onPage={goToTeacherPage}
            />
          </div>

          {/* Laptop / desktop table */}
          <div className="hidden 2xl:block overflow-x-auto">
            {paginatedTeacherPerformance.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No teacher performance data found
              </div>
            ) : (
              <>
                <table className="min-w-[1080px] w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleTeacherSort("code")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Teacher Code{getSortIndicator(teacherCodeSort)}
                      </th>

                      <th
                        onClick={() => toggleTeacherSort("name")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Teacher Name{getSortIndicator(teacherNameSort)}
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Email
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Mobile
                      </th>

                      <th
                        onClick={() => toggleTeacherSort("rating")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Average Rating{getSortIndicator(teacherRatingSort)}
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Total Feedbacks
                      </th>

                      <th
                        onClick={() => toggleTeacherSort("subjects")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Total Subjects Covered{getSortIndicator(teacherSubjectsSort)}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTeacherPerformance.map((teacher, index) => (
                      <tr
                        key={`${teacher.TeacherId}-${index}`}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td className="px-3 py-4 font-semibold text-[#a57f42]">
                          {teacher.TeacherCode}
                        </td>
                        <td
                          className="px-3 py-4 text-black max-w-[140px] truncate"
                          title={teacher.TeacherName}
                        >
                          {teacher.TeacherName}
                        </td>
                        <td
                          className="px-3 py-4 text-gray-700 max-w-[180px] truncate"
                          title={teacher.Email || "-"}
                        >
                          {teacher.Email || "-"}
                        </td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {teacher.Mobile || "-"}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {teacher.AverageRating ?? "-"}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {teacher.TotalFeedbacks ?? 0}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {teacher.TotalSubjectsCovered ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <PaginationBlock
                  currentPage={teacherCurrentPage}
                  totalPages={teacherTotalPages}
                  totalItems={filteredTeacherPerformance.length}
                  label="teacher report rows"
                  onPrev={goToTeacherPreviousPage}
                  onNext={goToTeacherNextPage}
                  onPage={goToTeacherPage}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          Class Feedback Summary Report
         ========================================= */}
      {(reportFilter === "all" || reportFilter === "class") && (
        <div className="bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6]">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Class Feedback Summary Report
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Feedback summary by class
              </p>
            </div>
          </div>

          {/* Mobile / tablet cards */}
          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => toggleClassSort("class")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Class{getSortIndicator(classNameSort)}
              </button>

              <button
                onClick={() => toggleClassSort("year")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Academic Year{getSortIndicator(classYearSort)}
              </button>

              <button
                onClick={() => toggleClassSort("teachers")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Teachers{getSortIndicator(classTeachersSort)}
              </button>

              <button
                onClick={() => toggleClassSort("students")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Students{getSortIndicator(classStudentsSort)}
              </button>
            </div>

            {paginatedClassSummary.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No class summary data found
              </div>
            ) : (
              paginatedClassSummary.map((item, index) => (
                <ClassReportCard key={`${item.ClassId}-${index}`} item={item} />
              ))
            )}

            <PaginationBlock
              currentPage={classCurrentPage}
              totalPages={classTotalPages}
              totalItems={filteredClassSummary.length}
              label="class report rows"
              onPrev={goToClassPreviousPage}
              onNext={goToClassNextPage}
              onPage={goToClassPage}
            />
          </div>

          {/* Laptop / desktop table */}
          <div className="hidden 2xl:block overflow-x-auto">
            {paginatedClassSummary.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No class summary data found
              </div>
            ) : (
              <>
                <table className="min-w-[1080px] w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleClassSort("class")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Class{getSortIndicator(classNameSort)}
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Section
                      </th>

                      <th
                        onClick={() => toggleClassSort("year")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Academic Year{getSortIndicator(classYearSort)}
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Average Rating
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Total Feedbacks
                      </th>

                      <th
                        onClick={() => toggleClassSort("teachers")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Total Teachers{getSortIndicator(classTeachersSort)}
                      </th>

                      <th
                        onClick={() => toggleClassSort("students")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Total Students{getSortIndicator(classStudentsSort)}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedClassSummary.map((item, index) => (
                      <tr
                        key={`${item.ClassId}-${index}`}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td className="px-3 py-4 text-black font-medium">
                          {item.ClassName}
                        </td>
                        <td className="px-3 py-4 text-gray-700">{item.Section}</td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.AcademicYear}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {item.AverageRating ?? "-"}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {item.TotalFeedbacks ?? 0}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {item.TotalTeachers ?? 0}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {item.TotalStudents ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <PaginationBlock
                  currentPage={classCurrentPage}
                  totalPages={classTotalPages}
                  totalItems={filteredClassSummary.length}
                  label="class report rows"
                  onPrev={goToClassPreviousPage}
                  onNext={goToClassNextPage}
                  onPage={goToClassPage}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          Monthly Feedback Report
         ========================================= */}
      {(reportFilter === "all" || reportFilter === "monthly") && (
        <div className="bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6]">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Monthly Feedback Report
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Month-wise feedback summary
              </p>
            </div>
          </div>

          {/* Mobile / tablet cards */}
          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={toggleMonthlySort}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Month{getSortIndicator(monthSort)}
              </button>
            </div>

            {paginatedMonthlyFeedback.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No monthly feedback data found
              </div>
            ) : (
              paginatedMonthlyFeedback.map((item, index) => (
                <MonthlyReportCard
                  key={`${item.ReportMonth}-${index}`}
                  item={item}
                />
              ))
            )}

            <PaginationBlock
              currentPage={monthlyCurrentPage}
              totalPages={monthlyTotalPages}
              totalItems={filteredMonthlyFeedback.length}
              label="monthly report rows"
              onPrev={goToMonthlyPreviousPage}
              onNext={goToMonthlyNextPage}
              onPage={goToMonthlyPage}
            />
          </div>

          {/* Laptop / desktop table */}
          <div className="hidden 2xl:block overflow-x-auto">
            {paginatedMonthlyFeedback.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No monthly feedback data found
              </div>
            ) : (
              <>
                <table className="min-w-[900px] w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={toggleMonthlySort}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Month{getSortIndicator(monthSort)}
                      </th>
                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Total Feedbacks
                      </th>
                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Average Rating
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedMonthlyFeedback.map((item, index) => (
                      <tr
                        key={`${item.ReportMonth}-${index}`}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td className="px-3 py-4 text-black font-medium">
                          {item.ReportMonth}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {item.TotalFeedbacks ?? 0}
                        </td>
                        <td className="px-3 py-4 text-gray-700">
                          {item.AverageRating ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <PaginationBlock
                  currentPage={monthlyCurrentPage}
                  totalPages={monthlyTotalPages}
                  totalItems={filteredMonthlyFeedback.length}
                  label="monthly report rows"
                  onPrev={goToMonthlyPreviousPage}
                  onNext={goToMonthlyNextPage}
                  onPage={goToMonthlyPage}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;