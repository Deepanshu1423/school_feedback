import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const StudentsManagement = () => {
  // =========================================
  // Form state
  // =========================================
  const [formData, setFormData] = useState({
    studentName: "",
    classId: "",
    rollNumber: "",
  });

  // =========================================
  // Main data states
  // =========================================
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // =========================================
  // Filter states
  // =========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // =========================================
  // Sort states
  // =========================================
  const [studentNameSortOrder, setStudentNameSortOrder] = useState("");
  const [rollNumberSortOrder, setRollNumberSortOrder] = useState("");
  const [classSortOrder, setClassSortOrder] = useState("");
  const [academicYearSortOrder, setAcademicYearSortOrder] = useState("");
  const [dateSortOrder, setDateSortOrder] = useState("");

  // =========================================
  // Pagination states
  // =========================================
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // =========================================
  // Initial page load
  // =========================================
  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  // =========================================
  // Reset page when filters or sorting change
  // =========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    classFilter,
    studentNameSortOrder,
    rollNumberSortOrder,
    classSortOrder,
    academicYearSortOrder,
    dateSortOrder,
  ]);

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
  // Fetch classes for dropdown
  // =========================================
  const fetchClasses = async () => {
    try {
      const response = await axios.get("/admin/classes", {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setClasses(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch classes");
    }
  };

  // =========================================
  // Fetch students list
  // =========================================
  const fetchStudents = async () => {
    try {
      setTableLoading(true);
      setError("");

      const response = await axios.get("/admin/students", {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch students");
    } finally {
      setTableLoading(false);
    }
  };

  // =========================================
  // Reset all sorting states
  // =========================================
  const resetAllSorts = () => {
    setStudentNameSortOrder("");
    setRollNumberSortOrder("");
    setClassSortOrder("");
    setAcademicYearSortOrder("");
    setDateSortOrder("");
  };

  // =========================================
  // Toggle sorting per column
  // =========================================
  const toggleSort = (sortType) => {
    if (sortType === "studentName") {
      const next =
        studentNameSortOrder === ""
          ? "asc"
          : studentNameSortOrder === "asc"
            ? "desc"
            : "";
      resetAllSorts();
      setStudentNameSortOrder(next);
    }

    if (sortType === "rollNumber") {
      const next =
        rollNumberSortOrder === ""
          ? "asc"
          : rollNumberSortOrder === "asc"
            ? "desc"
            : "";
      resetAllSorts();
      setRollNumberSortOrder(next);
    }

    if (sortType === "class") {
      const next =
        classSortOrder === ""
          ? "asc"
          : classSortOrder === "asc"
            ? "desc"
            : "";
      resetAllSorts();
      setClassSortOrder(next);
    }

    if (sortType === "academicYear") {
      const next =
        academicYearSortOrder === ""
          ? "asc"
          : academicYearSortOrder === "asc"
            ? "desc"
            : "";
      resetAllSorts();
      setAcademicYearSortOrder(next);
    }

    if (sortType === "date") {
      const next =
        dateSortOrder === ""
          ? "latest"
          : dateSortOrder === "latest"
            ? "oldest"
            : "";
      resetAllSorts();
      setDateSortOrder(next);
    }
  };

  // =========================================
  // Show sorting arrows
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
  // Clear filters and reset page
  // =========================================
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setClassFilter("all");
    resetAllSorts();
    setCurrentPage(1);
  };

  // =========================================
  // Handle form input changes
  // =========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Roll Number me sirf digits allow honge
    // Aur maximum 15 digits hi store honge
    if (name === "rollNumber") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 15);

      setFormData((prev) => ({
        ...prev,
        rollNumber: onlyDigits,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // Reset form state
  // =========================================
  const resetForm = () => {
    setFormData({
      studentName: "",
      classId: "",
      rollNumber: "",
    });
    setEditingStudentId(null);
    setMessage("");
    setError("");
  };

  // =========================================
  // Open / close modal
  // =========================================
  const openCreateModal = () => {
    resetForm();
    setShowStudentModal(true);
  };

  const closeStudentModal = () => {
    resetForm();
    setShowStudentModal(false);
  };

  // =========================================
  // Open edit modal and prefill form
  // =========================================
  const handleEdit = (student) => {
    setMessage("");
    setError("");
    setEditingStudentId(student.StudentId);
    setFormData({
      studentName: student.StudentName || "",
      classId: String(student.ClassId || ""),
      rollNumber: student.RollNumber || "",
    });
    setShowStudentModal(true);
  };

  // =========================================
  // Create or update student
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (
      !formData.studentName.trim() ||
      !formData.classId ||
      !formData.rollNumber.trim()
    ) {
      setError("Student name, class and roll number are required");
      return;
    }

    if (!/^\d{1,15}$/.test(formData.rollNumber.trim())) {
      setError("Roll number must contain only digits and maximum 15 digits");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        studentName: formData.studentName.trim(),
        classId: Number(formData.classId),
        rollNumber: formData.rollNumber.trim(),
      };
      const response = editingStudentId
        ? await axios.put(`/admin/update-student/${editingStudentId}`, payload, {
          headers: getAuthHeaders(),
        })
        : await axios.post("/admin/create-student", payload, {
          headers: getAuthHeaders(),
        });

      if (response.data.success) {
        setMessage(
          response.data.message ||
          (editingStudentId
            ? "Student updated successfully"
            : "Student created successfully")
        );
        fetchStudents();

        setTimeout(() => {
          closeStudentModal();
        }, 900);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (editingStudentId ? "Failed to update student" : "Failed to create student")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Activate / Deactivate student with confirm popup
  // =========================================
  const handleStudentStatusChange = async (studentId, newStatus) => {
    const actionText = newStatus === 1 ? "activate" : "deactivate";

    const confirmAction = window.confirm(
      `Are you sure you want to ${actionText} this student?`
    );

    if (!confirmAction) return;

    try {
      setMessage("");
      setError("");

      const response = await axios.put(
        `/admin/student-status/${studentId}`,
        { isActive: newStatus },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setMessage(
          response.data.message ||
          `Student ${newStatus === 1 ? "activated" : "deactivated"} successfully`
        );
        fetchStudents();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student status");
    }
  };

  // =========================================
  // Delete student with confirm popup
  // =========================================
  const handleDeleteStudent = async (studentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      const response = await axios.delete(`/admin/delete-student/${studentId}`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setMessage(response.data.message || "Student deleted successfully");
        if (editingStudentId === studentId) {
          resetForm();
        }
        fetchStudents();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
    }
  };

  // =========================================
  // Format created date
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

  // =========================================
  // Format created time
  // =========================================
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

  // =========================================
  // Show Today / Yesterday chip
  // =========================================
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
  // Helpers for numeric/text sorting
  // =========================================
  const getClassSortValue = (student) => {
    const raw = student.ClassName ?? "";
    const num = Number(raw);
    if (!Number.isNaN(num) && raw !== "") return { isNumeric: true, value: num };
    return { isNumeric: false, value: String(raw).toLowerCase() };
  };

  const getAcademicYearSortValue = (student) => {
    const raw = String(student.AcademicYear || "");
    const firstYear = raw.split("-")[0]?.trim();
    const num = Number(firstYear);
    return Number.isNaN(num) ? 0 : num;
  };

  const getRollNumberSortValue = (student) => {
    const raw = String(student.RollNumber ?? "").trim();
    const num = Number(raw);
    return Number.isNaN(num) ? Number.MAX_SAFE_INTEGER : num;
  };

  // =========================================
  // Filter and sort students
  // =========================================
  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      const matchesSearch =
        student.StudentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.RollNumber || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.ClassName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.Section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(student.AcademicYear || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? student.IsActive === 1 || student.IsActive === true
            : student.IsActive === 0 || student.IsActive === false;

      const matchesClass =
        classFilter === "all" ? true : String(student.ClassId) === classFilter;

      return matchesSearch && matchesStatus && matchesClass;
    });

    if (studentNameSortOrder === "asc") {
      result = [...result].sort((a, b) =>
        String(a.StudentName || "").localeCompare(String(b.StudentName || ""))
      );
    } else if (studentNameSortOrder === "desc") {
      result = [...result].sort((a, b) =>
        String(b.StudentName || "").localeCompare(String(a.StudentName || ""))
      );
    } else if (rollNumberSortOrder === "asc") {
      result = [...result].sort(
        (a, b) => getRollNumberSortValue(a) - getRollNumberSortValue(b)
      );
    } else if (rollNumberSortOrder === "desc") {
      result = [...result].sort(
        (a, b) => getRollNumberSortValue(b) - getRollNumberSortValue(a)
      );
    } else if (classSortOrder === "asc") {
      result = [...result].sort((a, b) => {
        const av = getClassSortValue(a);
        const bv = getClassSortValue(b);

        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    } else if (classSortOrder === "desc") {
      result = [...result].sort((a, b) => {
        const av = getClassSortValue(a);
        const bv = getClassSortValue(b);

        if (av.isNumeric && bv.isNumeric) return bv.value - av.value;
        if (av.isNumeric && !bv.isNumeric) return 1;
        if (!av.isNumeric && bv.isNumeric) return -1;
        return String(bv.value).localeCompare(String(av.value));
      });
    } else if (academicYearSortOrder === "asc") {
      result = [...result].sort(
        (a, b) => getAcademicYearSortValue(a) - getAcademicYearSortValue(b)
      );
    } else if (academicYearSortOrder === "desc") {
      result = [...result].sort(
        (a, b) => getAcademicYearSortValue(b) - getAcademicYearSortValue(a)
      );
    } else if (dateSortOrder === "latest") {
      result = [...result].sort(
        (a, b) => new Date(b.CreatedAt || 0) - new Date(a.CreatedAt || 0)
      );
    } else if (dateSortOrder === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.CreatedAt || 0) - new Date(b.CreatedAt || 0)
      );
    }

    return result;
  }, [
    students,
    searchTerm,
    statusFilter,
    classFilter,
    studentNameSortOrder,
    rollNumberSortOrder,
    classSortOrder,
    academicYearSortOrder,
    dateSortOrder,
  ]);

  // =========================================
  // Summary counts
  // =========================================
  const activeStudentsCount = useMemo(() => {
    return students.filter(
      (student) => student.IsActive === 1 || student.IsActive === true
    ).length;
  }, [students]);

  const inactiveStudentsCount = students.length - activeStudentsCount;

  // =========================================
  // Pagination calculations
  // =========================================
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage]);

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
  // Mobile / tablet student card
  // =========================================
  const StudentCard = ({ student }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Student Name</p>
          <p className="font-semibold text-black break-words">{student.StudentName}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Roll Number</p>
          <p className="text-black">{student.RollNumber || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="text-black">{student.ClassName}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Section</p>
          <p className="text-black">{student.Section}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Academic Year</p>
          <p className="text-black">{student.AcademicYear}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Status</p>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${student.IsActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {student.IsActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-2">Created At</p>
          {student.CreatedAt ? (
            <div className="rounded-2xl border border-[#e3d3bb] bg-[#fffdf9] px-3 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-black font-semibold text-sm">
                <span>📅</span>
                <span>{formatDate(student.CreatedAt)}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-gray-600 text-xs flex-wrap">
                <span>🕒</span>
                <span>{formatTime(student.CreatedAt)}</span>
                {getDayLabel(student.CreatedAt) && (
                  <span className="rounded-full bg-[#eee4d6] px-2.5 py-1 text-[11px] font-semibold text-[#9b7440]">
                    {getDayLabel(student.CreatedAt)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            "-"
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleEdit(student)}
          className="w-full rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold"
        >
          Edit
        </button>

        <button
          onClick={() =>
            handleStudentStatusChange(
              student.StudentId,
              student.IsActive ? 0 : 1
            )
          }
          className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${student.IsActive
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
        >
          {student.IsActive ? "Deactivate" : "Activate"}
        </button>

        <button
          onClick={() => handleDeleteStudent(student.StudentId)}
          className="w-full rounded-xl bg-gray-900 text-white hover:bg-black px-4 py-2 text-sm font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        {/* =========================================
            Summary cards
           ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Total Students
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {students.length}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              All student records
            </p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Active Students
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {activeStudentsCount}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Currently active students
            </p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Inactive Students
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {inactiveStudentsCount}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Currently inactive students
            </p>
          </div>
        </div>

        {/* Top error message */}
        {error && !showStudentModal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =========================================
            Main students list section
           ========================================= */}
        <div className="rounded-[22px] sm:rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-4 sm:px-6 py-4 sm:py-5 border-b border-[#dcc7a6] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-black">
                  Students List
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredStudents.length} of {students.length} students
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={openCreateModal}
                  className="rounded-2xl bg-[#b79257] hover:bg-[#a57f42] text-black px-4 sm:px-5 py-2.5 text-sm font-semibold shadow-sm transition"
                >
                  Create Student
                </button>

                <button
                  onClick={handleClearFilters}
                  className="rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Search name, roll no, class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
              />

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.ClassId} value={cls.ClassId}>
                    {cls.ClassName} - {cls.Section}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Students</option>
                <option value="inactive">Inactive Students</option>
              </select>
            </div>
          </div>

          {/* =========================================
              Mobile / tablet view
             ========================================= */}
          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => toggleSort("studentName")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Name{getSortIndicator(studentNameSortOrder)}
              </button>

              <button
                onClick={() => toggleSort("rollNumber")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Roll No{getSortIndicator(rollNumberSortOrder)}
              </button>

              <button
                onClick={() => toggleSort("class")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Class{getSortIndicator(classSortOrder)}
              </button>

              <button
                onClick={() => toggleSort("academicYear")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Year{getSortIndicator(academicYearSortOrder)}
              </button>

              <button
                onClick={() => toggleSort("date")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Date{getSortIndicator(dateSortOrder, "date")}
              </button>
            </div>

            {tableLoading ? (
              <div className="p-6 text-center text-gray-600">Loading students...</div>
            ) : paginatedStudents.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No students found</div>
            ) : (
              paginatedStudents.map((student) => (
                <StudentCard key={student.StudentId} student={student} />
              ))
            )}

            {/* Mobile pagination */}
            {filteredStudents.length > 0 && totalPages > 1 && (
              <div className="rounded-2xl border border-[#d6c2a8] bg-white p-4 shadow-sm">
                <p className="mb-4 text-center text-sm text-[#6b7280]">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of{" "}
                  {filteredStudents.length} students
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
          </div>

          {/* =========================================
              Desktop table view
             ========================================= */}
          <div className="hidden 2xl:block overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">
                Loading students...
              </div>
            ) : paginatedStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No students found
              </div>
            ) : (
              <>
                <table className="min-w-[1180px] w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleSort("studentName")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Student Name{getSortIndicator(studentNameSortOrder)}
                      </th>

                      <th
                        onClick={() => toggleSort("rollNumber")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Roll Number{getSortIndicator(rollNumberSortOrder)}
                      </th>

                      <th
                        onClick={() => toggleSort("class")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Class{getSortIndicator(classSortOrder)}
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Section
                      </th>

                      <th
                        onClick={() => toggleSort("academicYear")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Academic Year{getSortIndicator(academicYearSortOrder)}
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Status
                      </th>

                      <th
                        onClick={() => toggleSort("date")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Created At{getSortIndicator(dateSortOrder, "date")}
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedStudents.map((student) => (
                      <tr
                        key={student.StudentId}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td
                          className="px-3 py-4 text-black font-medium max-w-[120px] truncate"
                          title={student.StudentName}
                        >
                          {student.StudentName}
                        </td>

                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {student.RollNumber || "-"}
                        </td>

                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {student.ClassName}
                        </td>

                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {student.Section}
                        </td>

                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {student.AcademicYear}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${student.IsActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {student.IsActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          {student.CreatedAt ? (
                            <div className="min-w-[165px] rounded-2xl border border-[#e3d3bb] bg-white px-3 py-3 shadow-sm">
                              <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                <span>📅</span>
                                <span>{formatDate(student.CreatedAt)}</span>
                              </div>

                              <div className="mt-2 flex items-center gap-2 text-gray-600 text-xs flex-wrap">
                                <span>🕒</span>
                                <span>{formatTime(student.CreatedAt)}</span>

                                {getDayLabel(student.CreatedAt) && (
                                  <span className="rounded-full bg-[#eee4d6] px-2 py-1 text-[10px] font-semibold text-[#9b7440]">
                                    {getDayLabel(student.CreatedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex flex-col gap-2 w-[92px]">
                            <button
                              onClick={() => handleEdit(student)}
                              className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 text-xs font-semibold"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleStudentStatusChange(
                                  student.StudentId,
                                  student.IsActive ? 0 : 1
                                )
                              }
                              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${student.IsActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                            >
                              {student.IsActive ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              onClick={() => handleDeleteStudent(student.StudentId)}
                              className="rounded-xl bg-gray-900 text-white hover:bg-black px-3 py-1.5 text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination inside same section */}
                {filteredStudents.length > 0 && totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] bg-white px-4 py-6">
                    <p className="text-sm text-[#6b7280] text-center">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of{" "}
                      {filteredStudents.length} students
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          Create / Edit student modal
         ========================================= */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 sm:px-4 py-4">
          <div className="relative w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-[24px] sm:rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl">
            <button
              onClick={closeStudentModal}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-lg sm:text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-5 sm:px-8 py-5 sm:py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {editingStudentId ? "Edit Student" : "Create Student"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#ece1cf]">
                {editingStudentId
                  ? "Update selected student details"
                  : "Add a new student to the system"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Class
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.ClassId} value={cls.ClassId}>
                      {cls.ClassName} - {cls.Section} ({cls.AcademicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="Enter roll number"
                  className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              {message && (
                <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-[20px] sm:rounded-[22px] bg-[#b79257] hover:bg-[#a57f42] disabled:opacity-70 text-black font-semibold py-3.5 sm:py-4 text-base sm:text-lg shadow-md transition"
                >
                  {loading
                    ? editingStudentId
                      ? "Updating..."
                      : "Saving..."
                    : editingStudentId
                      ? "Update Student"
                      : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={closeStudentModal}
                  className="rounded-[20px] sm:rounded-[22px] bg-black text-white px-6 py-3.5 sm:py-4 text-sm sm:text-base font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentsManagement;