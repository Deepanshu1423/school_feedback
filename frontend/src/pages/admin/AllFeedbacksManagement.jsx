import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

// =========================================
// Reusable truncated text component
// Purpose:
// - Long text ko compact dikhana
// - Extra text ke liye "..." show karna
// - Hover par full text browser tooltip me show karna
// =========================================
const TruncatedText = ({
  text,
  lines = 1,
  emptyText = "-",
  className = "",
}) => {
  const value = text ? String(text) : "";

  if (!value.trim()) {
    return <span>{emptyText}</span>;
  }

  return (
    <p
      title={value}
      className={`break-words ${className}`}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}
    >
      {value}
    </p>
  );
};

const AllFeedbacksManagement = () => {
  // =========================================
  // Main data states
  // =========================================
  const [feedbacks, setFeedbacks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [forms, setForms] = useState([]);

  // =========================================
  // UI states
  // =========================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // Filter states
  // =========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");
  const [responseFilter, setResponseFilter] = useState("all");

  // =========================================
  // Sort states
  // "" = default / no sorting
  // =========================================
  const [parentSort, setParentSort] = useState("");
  const [studentSort, setStudentSort] = useState("");
  const [classSort, setClassSort] = useState("");
  const [teacherSort, setTeacherSort] = useState("");
  const [subjectSort, setSubjectSort] = useState("");
  const [ratingSort, setRatingSort] = useState("");
  const [submittedSort, setSubmittedSort] = useState("");

  // =========================================
  // Pagination states
  // =========================================
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // =========================================
  // Auth headers for protected API calls
  // =========================================
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // =========================================
  // Initial page load
  // =========================================
  useEffect(() => {
    fetchAllData();
  }, []);

  // =========================================
  // Fetch all required data from backend
  // =========================================
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [feedbackRes, classesRes, teachersRes, subjectsRes, formsRes] =
        await Promise.all([
          axios.get("/admin/all-feedbacks", { headers: getAuthHeaders() }),
          axios.get("/admin/classes", { headers: getAuthHeaders() }),
          axios.get("/admin/teachers", { headers: getAuthHeaders() }),
          axios.get("/admin/subjects", { headers: getAuthHeaders() }),
          axios.get("/admin/feedback-forms", { headers: getAuthHeaders() }),
        ]);

      if (feedbackRes.data.success) setFeedbacks(feedbackRes.data.data || []);
      if (classesRes.data.success) setClasses(classesRes.data.data || []);
      if (teachersRes.data.success) setTeachers(teachersRes.data.data || []);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.data || []);
      if (formsRes.data.success) setForms(formsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch feedback data");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Reset all sorting
  // =========================================
  const resetAllSorts = () => {
    setParentSort("");
    setStudentSort("");
    setClassSort("");
    setTeacherSort("");
    setSubjectSort("");
    setRatingSort("");
    setSubmittedSort("");
  };

  // =========================================
  // Toggle sorting for each column
  // Text columns: asc -> desc -> default
  // Numeric/date columns: desc/latest -> asc/oldest -> default
  // =========================================
  const toggleSort = (type) => {
    if (type === "parent") {
      const next =
        parentSort === "" ? "asc" : parentSort === "asc" ? "desc" : "";
      resetAllSorts();
      setParentSort(next);
    }

    if (type === "student") {
      const next =
        studentSort === "" ? "asc" : studentSort === "asc" ? "desc" : "";
      resetAllSorts();
      setStudentSort(next);
    }

    if (type === "class") {
      const next =
        classSort === "" ? "asc" : classSort === "asc" ? "desc" : "";
      resetAllSorts();
      setClassSort(next);
    }

    if (type === "teacher") {
      const next =
        teacherSort === "" ? "asc" : teacherSort === "asc" ? "desc" : "";
      resetAllSorts();
      setTeacherSort(next);
    }

    if (type === "subject") {
      const next =
        subjectSort === "" ? "asc" : subjectSort === "asc" ? "desc" : "";
      resetAllSorts();
      setSubjectSort(next);
    }

    if (type === "rating") {
      const next =
        ratingSort === "" ? "desc" : ratingSort === "desc" ? "asc" : "";
      resetAllSorts();
      setRatingSort(next);
    }

    if (type === "submitted") {
      const next =
        submittedSort === ""
          ? "latest"
          : submittedSort === "latest"
          ? "oldest"
          : "";
      resetAllSorts();
      setSubmittedSort(next);
    }
  };

  // =========================================
  // Show sort indicator arrows in UI
  // =========================================
  const getSortIndicator = (sortValue, type = "default") => {
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
  // Clear all filters + sorting
  // =========================================
  const handleClearFilters = () => {
    setSearchTerm("");
    setClassFilter("all");
    setTeacherFilter("all");
    setSubjectFilter("all");
    setFormFilter("all");
    setResponseFilter("all");
    resetAllSorts();
    setCurrentPage(1);
  };

  // =========================================
  // Reset page when filters or sorting change
  // =========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    classFilter,
    teacherFilter,
    subjectFilter,
    formFilter,
    responseFilter,
    parentSort,
    studentSort,
    classSort,
    teacherSort,
    subjectSort,
    ratingSort,
    submittedSort,
  ]);

  // =========================================
  // Date helpers for submitted date display
  // =========================================
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);

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

  // =========================================
  // Filtered + sorted feedback list
  // =========================================
  const filteredFeedbacks = useMemo(() => {
    let result = feedbacks.filter((item) => {
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        item.ParentName?.toLowerCase().includes(q) ||
        item.StudentName?.toLowerCase().includes(q) ||
        item.TeacherName?.toLowerCase().includes(q) ||
        item.SubjectName?.toLowerCase().includes(q) ||
        item.FormName?.toLowerCase().includes(q) ||
        item.Comments?.toLowerCase().includes(q) ||
        item.TeacherResponse?.toLowerCase().includes(q);

      const matchesClass =
        classFilter === "all" ? true : String(item.ClassId) === classFilter;

      const matchesTeacher =
        teacherFilter === "all"
          ? true
          : String(item.TeacherId) === teacherFilter;

      const matchesSubject =
        subjectFilter === "all"
          ? true
          : String(item.SubjectId) === subjectFilter;

      const matchesForm =
        formFilter === "all"
          ? true
          : String(item.FeedbackFormId) === formFilter;

      const hasResponse =
        item.TeacherResponse && item.TeacherResponse.trim() !== "";

      const matchesResponse =
        responseFilter === "all"
          ? true
          : responseFilter === "responded"
          ? hasResponse
          : !hasResponse;

      return (
        matchesSearch &&
        matchesClass &&
        matchesTeacher &&
        matchesSubject &&
        matchesForm &&
        matchesResponse
      );
    });

    // Helper for numeric + text class sorting
    const getClassValue = (item) => {
      const raw = String(item.ClassName || "").trim();
      const num = Number(raw);

      if (!Number.isNaN(num) && raw !== "") {
        return { isNumeric: true, value: num };
      }

      return { isNumeric: false, value: raw.toLowerCase() };
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
      result = [...result].sort((a, b) => {
        const av = getClassValue(a);
        const bv = getClassValue(b);

        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    } else if (classSort === "desc") {
      result = [...result].sort((a, b) => {
        const av = getClassValue(a);
        const bv = getClassValue(b);

        if (av.isNumeric && bv.isNumeric) return bv.value - av.value;
        if (av.isNumeric && !bv.isNumeric) return 1;
        if (!av.isNumeric && bv.isNumeric) return -1;
        return String(bv.value).localeCompare(String(av.value));
      });
    } else if (teacherSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.TeacherName || "").localeCompare(String(b.TeacherName || ""))
      );
    } else if (teacherSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.TeacherName || "").localeCompare(String(a.TeacherName || ""))
      );
    } else if (subjectSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.SubjectName || "").localeCompare(String(b.SubjectName || ""))
      );
    } else if (subjectSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.SubjectName || "").localeCompare(String(a.SubjectName || ""))
      );
    } else if (ratingSort === "asc") {
      result = [...result].sort(
        (a, b) => Number(a.Rating || 0) - Number(b.Rating || 0)
      );
    } else if (ratingSort === "desc") {
      result = [...result].sort(
        (a, b) => Number(b.Rating || 0) - Number(a.Rating || 0)
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
    classFilter,
    teacherFilter,
    subjectFilter,
    formFilter,
    responseFilter,
    parentSort,
    studentSort,
    classSort,
    teacherSort,
    subjectSort,
    ratingSort,
    submittedSort,
  ]);

  // =========================================
  // Summary values
  // =========================================
  const respondedCount = filteredFeedbacks.filter(
    (item) => item.TeacherResponse && item.TeacherResponse.trim() !== ""
  ).length;

  const pendingCount = filteredFeedbacks.length - respondedCount;

  // =========================================
  // Pagination calculations
  // =========================================
  const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE);

  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredFeedbacks.slice(startIndex, endIndex);
  }, [filteredFeedbacks, currentPage]);

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
  // Build visible page numbers like:
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

  // =========================================
  // Mobile / small-screen feedback card
  // Long text fields:
  // - Form = 1 line
  // - Comment = 2 lines
  // - Teacher Response = 2 lines
  // Hover par full text tooltip me show hoga
  // =========================================
  const FeedbackCard = ({ item }) => {
    const hasResponse =
      item.TeacherResponse && item.TeacherResponse.trim() !== "";

    return (
      <div className="space-y-4 rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Parent</p>
            <p className="break-words font-semibold text-black">
              {item.ParentName || "-"}
            </p>
            <p className="mt-1 text-xs text-[#a57f42]">
              {item.ParentCode || ""}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Student</p>
            <p className="break-words font-semibold text-black">
              {item.StudentName || "-"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Roll No: {item.RollNumber || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Class</p>
            <p className="text-black">
              {item.ClassName || "-"} {item.Section || ""}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {item.AcademicYear || ""}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Teacher</p>
            <p className="break-words font-semibold text-black">
              {item.TeacherName || "-"}
            </p>
            <p className="mt-1 text-xs text-[#a57f42]">
              {item.TeacherCode || ""}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Subject</p>
            <p className="break-words text-black">
              {item.SubjectName || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Form</p>
            <TruncatedText
              text={item.FormName}
              lines={1}
              className="text-black"
            />
          </div>

          <div>
            <p className="text-xs text-gray-500">Rating</p>
            <span className="inline-flex rounded-full bg-[#eee4d6] px-3 py-1 text-xs font-semibold text-[#9b7440]">
              {item.Rating ?? "-"}
            </span>
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-500">Comment</p>
            <div className="mt-1 rounded-xl border border-[#eadcc8] bg-[#faf6ef] px-3 py-3 text-black">
              <TruncatedText text={item.Comments} lines={2} />
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-500">Teacher Response</p>
            {hasResponse ? (
              <div className="mt-1 rounded-xl border border-[#dbe8d5] bg-[#f6fbf4] px-3 py-3 text-black">
                <TruncatedText text={item.TeacherResponse} lines={2} />
              </div>
            ) : (
              <span className="mt-1 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                Pending
              </span>
            )}
          </div>

          <div className="col-span-2">
            <p className="mb-2 text-xs text-gray-500">Submitted At</p>
            {item.SubmittedAt ? (
              <div className="rounded-2xl border border-[#e3d3bb] bg-[#fffdf9] px-3 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-black">
                  <span>📅</span>
                  <span>{formatDate(item.SubmittedAt)}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span>🕒</span>
                  <span className="whitespace-nowrap">
                    {formatTime(item.SubmittedAt)}
                  </span>

                  {getDayLabel(item.SubmittedAt) && (
                    <span className="rounded-full bg-[#eee4d6] px-2.5 py-1 text-[11px] font-semibold text-[#9b7440]">
                      {getDayLabel(item.SubmittedAt)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              "-"
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================================
  // Loading state
  // =========================================
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-xl font-semibold text-black">
        Loading feedbacks...
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      {/* =========================================
          Summary cards
         ========================================= */}
      <div className="grid w-full max-w-full grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Total Feedbacks
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {filteredFeedbacks.length}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            All filtered feedback records
          </p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Responded
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {respondedCount}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Teacher response submitted
          </p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Pending
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {pendingCount}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Awaiting teacher response
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================================
          Filter section
         ========================================= */}
      <div className="w-full max-w-full overflow-hidden rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg">
        <div className="space-y-4 border-b border-[#dcc7a6] bg-[#f1e7d7] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Feedback Filters
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Refine records by search, class, teacher, subject, form and
                response status
              </p>
            </div>

            <button
              onClick={handleClearFilters}
              className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input
              type="text"
              placeholder="Search parent, student, teacher, comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            />

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.ClassId} value={cls.ClassId}>
                  {cls.ClassName} - {cls.Section}
                </option>
              ))}
            </select>

            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.TeacherId} value={teacher.TeacherId}>
                  {teacher.FullName}
                </option>
              ))}
            </select>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.SubjectId} value={subject.SubjectId}>
                  {subject.SubjectName}
                </option>
              ))}
            </select>

            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Feedback Forms</option>
              {forms.map((form) => (
                <option key={form.FeedbackFormId} value={form.FeedbackFormId}>
                  {form.FormName}
                </option>
              ))}
            </select>

            <select
              value={responseFilter}
              onChange={(e) => setResponseFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Response Status</option>
              <option value="responded">Responded</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* =========================================
            Mobile / tablet view
           ========================================= */}
        <div className="block space-y-4 bg-[#fcfaf6] p-4 2xl:hidden">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <button
              onClick={() => toggleSort("parent")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
            >
              Parent{getSortIndicator(parentSort)}
            </button>

            <button
              onClick={() => toggleSort("student")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
            >
              Student{getSortIndicator(studentSort)}
            </button>

            <button
              onClick={() => toggleSort("class")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
            >
              Class{getSortIndicator(classSort)}
            </button>

            <button
              onClick={() => toggleSort("teacher")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
            >
              Teacher{getSortIndicator(teacherSort)}
            </button>

            <button
              onClick={() => toggleSort("subject")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
            >
              Subject{getSortIndicator(subjectSort)}
            </button>

            <button
              onClick={() => toggleSort("rating")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
            >
              Rating{getSortIndicator(ratingSort)}
            </button>

            <button
              onClick={() => toggleSort("submitted")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
            >
              Submitted{getSortIndicator(submittedSort, "date")}
            </button>
          </div>

          {paginatedFeedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No feedback records found
            </div>
          ) : (
            paginatedFeedbacks.map((item) => (
              <FeedbackCard key={item.FeedbackId} item={item} />
            ))
          )}

          {/* Mobile pagination */}
          {filteredFeedbacks.length > 0 && totalPages > 1 && (
            <div className="rounded-2xl border border-[#d6c2a8] bg-white p-4 shadow-sm">
              <p className="mb-4 text-center text-sm text-[#6b7280]">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredFeedbacks.length
                )}{" "}
                of {filteredFeedbacks.length} records
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
                      className={`h-11 min-w-[44px] rounded-2xl px-3 text-base font-semibold transition ${
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
        </div>

        {/* =========================================
            Laptop / desktop table view
           ========================================= */}
        <div className="hidden w-full max-w-full bg-[#fcfaf6] 2xl:block">
          {paginatedFeedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No feedback records found
            </div>
          ) : (
            <div className="w-full overflow-x-auto overflow-y-hidden">
              <div className="min-w-[1350px]">
                <table className="w-full border-t border-[#eadcc8] bg-white">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleSort("parent")}
                        className="cursor-pointer select-none px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Parent{getSortIndicator(parentSort)}
                      </th>

                      <th
                        onClick={() => toggleSort("student")}
                        className="cursor-pointer select-none px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Student{getSortIndicator(studentSort)}
                      </th>

                      <th
                        onClick={() => toggleSort("class")}
                        className="cursor-pointer select-none px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Class{getSortIndicator(classSort)}
                      </th>

                      <th
                        onClick={() => toggleSort("teacher")}
                        className="cursor-pointer select-none px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Teacher{getSortIndicator(teacherSort)}
                      </th>

                      <th
                        onClick={() => toggleSort("subject")}
                        className="cursor-pointer select-none px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Subject{getSortIndicator(subjectSort)}
                      </th>

                      <th className="px-3 py-3 text-left text-sm font-bold text-black">
                        Form
                      </th>

                      <th
                        onClick={() => toggleSort("rating")}
                        className="cursor-pointer select-none px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Rating{getSortIndicator(ratingSort)}
                      </th>

                      <th className="px-3 py-3 text-left text-sm font-bold text-black">
                        Comment
                      </th>

                      <th className="px-3 py-3 text-left text-sm font-bold text-black">
                        Teacher Response
                      </th>

                      <th
                        onClick={() => toggleSort("submitted")}
                        className="cursor-pointer select-none px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Submitted At{getSortIndicator(submittedSort, "date")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedFeedbacks.map((item) => (
                      <tr
                        key={item.FeedbackId}
                        className="border-t border-[#eee2cf] align-top hover:bg-[#fcfaf6]"
                      >
                        <td className="max-w-[140px] px-3 py-4 text-black">
                          <div
                            className="truncate font-medium"
                            title={item.ParentName || "-"}
                          >
                            {item.ParentName || "-"}
                          </div>
                          <div className="truncate text-xs text-[#a57f42]">
                            {item.ParentCode || ""}
                          </div>
                        </td>

                        <td className="max-w-[140px] px-3 py-4 text-gray-700">
                          <div
                            className="truncate font-medium text-black"
                            title={item.StudentName || "-"}
                          >
                            {item.StudentName || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Roll No: {item.RollNumber || "-"}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-gray-700">
                          {item.ClassName || "-"} {item.Section || ""}
                          <div className="text-xs text-gray-500">
                            {item.AcademicYear || ""}
                          </div>
                        </td>

                        <td className="max-w-[140px] px-3 py-4 text-gray-700">
                          <div
                            className="truncate font-medium text-black"
                            title={item.TeacherName || "-"}
                          >
                            {item.TeacherName || "-"}
                          </div>
                          <div className="truncate text-xs text-[#a57f42]">
                            {item.TeacherCode || ""}
                          </div>
                        </td>

                        <td
                          className="max-w-[110px] truncate px-3 py-4 text-gray-700"
                          title={item.SubjectName || "-"}
                        >
                          {item.SubjectName || "-"}
                        </td>

                        {/* Form column compacted to one line */}
                        <td className="max-w-[115px] px-3 py-4 text-gray-700">
                          <TruncatedText text={item.FormName} lines={1} />
                        </td>

                        <td className="px-3 py-4 text-gray-700">
                          <span className="inline-flex rounded-full bg-[#eee4d6] px-3 py-1 text-xs font-semibold text-[#9b7440]">
                            {item.Rating ?? "-"}
                          </span>
                        </td>

                        {/* Comment column compacted to two lines */}
                        <td className="max-w-[180px] px-3 py-4 text-gray-700">
                          <TruncatedText text={item.Comments} lines={2} />
                        </td>

                        {/* Teacher Response column compacted to two lines */}
                        <td className="max-w-[180px] px-3 py-4 text-gray-700">
                          {item.TeacherResponse &&
                          item.TeacherResponse.trim() !== "" ? (
                            <TruncatedText
                              text={item.TeacherResponse}
                              lines={2}
                            />
                          ) : (
                            <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-4">
                          {item.SubmittedAt ? (
                            <div className="min-w-[170px] rounded-2xl border border-[#e3d3bb] bg-white px-3 py-3 shadow-sm">
                              <div className="flex items-center gap-2 text-sm font-semibold text-black">
                                <span>📅</span>
                                <span>{formatDate(item.SubmittedAt)}</span>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                <span>🕒</span>
                                <span className="whitespace-nowrap">
                                  {formatTime(item.SubmittedAt)}
                                </span>

                                {getDayLabel(item.SubmittedAt) && (
                                  <span className="rounded-full bg-[#eee4d6] px-2 py-1 text-[10px] font-semibold text-[#9b7440]">
                                    {getDayLabel(item.SubmittedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Desktop pagination inside same section */}
                {filteredFeedbacks.length > 0 && totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] bg-white px-4 py-6">
                    <p className="text-center text-sm text-[#6b7280]">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredFeedbacks.length
                      )}{" "}
                      of {filteredFeedbacks.length} records
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllFeedbacksManagement;