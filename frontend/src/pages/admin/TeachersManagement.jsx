import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const TeachersManagement = () => {
  // =========================================
  // Form state
  // =========================================
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
  });

  // =========================================
  // Main data states
  // =========================================
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  // =========================================
  // Filter and sort states
  // =========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teacherCodeSortOrder, setTeacherCodeSortOrder] = useState("");
  const [nameSortOrder, setNameSortOrder] = useState("");
  const [dateSortOrder, setDateSortOrder] = useState("");

  // =========================================
  // Pagination states
  // =========================================
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // =========================================
  // Initial load
  // =========================================
  useEffect(() => {
    fetchTeachers();
  }, []);

  // =========================================
  // Reset page when filters or sorting change
  // =========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, teacherCodeSortOrder, nameSortOrder, dateSortOrder]);

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
  // Fetch teachers from backend
  // =========================================
  const fetchTeachers = async () => {
    try {
      setTableLoading(true);
      setError("");

      const response = await axios.get("/admin/teachers", {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setTeachers(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch teachers");
    } finally {
      setTableLoading(false);
    }
  };

  // =========================================
  // Clear filters, sorting, and reset page
  // =========================================
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTeacherCodeSortOrder("");
    setNameSortOrder("");
    setDateSortOrder("");
    setCurrentPage(1);
  };

  // =========================================
  // Handle form input changes
  // Mobile field allows digits only and max 10 digits
  // =========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
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
  // Reset form state
  // =========================================
  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      password: "",
    });
    setEditingTeacherId(null);
    setMessage("");
    setError("");
  };

  // =========================================
  // Close modal
  // =========================================
  const closeTeacherModal = () => {
    resetForm();
    setShowTeacherModal(false);
  };

  // =========================================
  // Open create modal
  // =========================================
  const openCreateModal = () => {
    setEditingTeacherId(null);

    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      password: "",
    });

    setMessage("");
    setError("");
    setShowTeacherModal(true);
  };
  // =========================================
  // Open edit modal and prefill form
  // =========================================
  const handleEdit = (teacher) => {
    setMessage("");
    setError("");
    setEditingTeacherId(teacher.TeacherId);

    setFormData({
      fullName: teacher.FullName || "",
      email: teacher.Email || "",
      mobile: teacher.Mobile || "",
      password: "",
    });

    setShowTeacherModal(true);
  };

  // =========================================
  // Submit create/update teacher form
  // Includes exact 10-digit mobile validation
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.fullName || !formData.mobile) {
      setError("Full name and mobile are required");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }

    if (!editingTeacherId && !formData.password) {
      setError("Password is required while creating teacher");
      return;
    }

    try {
      setLoading(true);

      let response;

      if (editingTeacherId) {
        response = await axios.put(
          `/admin/update-teacher/${editingTeacherId}`,
          formData,
          {
            headers: getAuthHeaders(),
          }
        );
      } else {
        response = await axios.post("/admin/create-teacher", formData, {
          headers: getAuthHeaders(),
        });
      }

      if (response.data.success) {
        const createdCode = response.data?.data?.teacherCode;

        setMessage(
          editingTeacherId
            ? response.data.message || "Teacher updated successfully"
            : createdCode
              ? `Teacher created successfully. Teacher Code: ${createdCode}`
              : response.data.message || "Teacher created successfully"
        );

        fetchTeachers();

        setTimeout(() => {
          closeTeacherModal();
        }, 900);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (editingTeacherId
          ? "Failed to update teacher"
          : "Failed to create teacher")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Activate / Deactivate teacher with confirm popup
  // =========================================
  const handleTeacherStatusChange = async (teacherId, newStatus) => {
    const actionText = newStatus === 1 ? "activate" : "deactivate";

    const confirmAction = window.confirm(
      `Are you sure you want to ${actionText} this teacher?`
    );

    if (!confirmAction) return;

    try {
      setMessage("");
      setError("");

      const response = await axios.put(
        `/admin/teacher-status/${teacherId}`,
        { isActive: newStatus },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setMessage(
          response.data.message ||
          `Teacher ${newStatus === 1 ? "activated" : "deactivated"} successfully`
        );
        fetchTeachers();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update teacher status");
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
  // Toggle sorting
  // =========================================
  const toggleSort = (column) => {
    if (column === "teacherCode") {
      const nextSort =
        teacherCodeSortOrder === ""
          ? "asc"
          : teacherCodeSortOrder === "asc"
            ? "desc"
            : "";
      setTeacherCodeSortOrder(nextSort);
      setNameSortOrder("");
      setDateSortOrder("");
    }

    if (column === "name") {
      const nextSort =
        nameSortOrder === "" ? "asc" : nameSortOrder === "asc" ? "desc" : "";
      setNameSortOrder(nextSort);
      setTeacherCodeSortOrder("");
      setDateSortOrder("");
    }

    if (column === "date") {
      const nextSort =
        dateSortOrder === ""
          ? "latest"
          : dateSortOrder === "latest"
            ? "oldest"
            : "";
      if (dateSortOrder === "oldest") {
        setDateSortOrder("");
      } else {
        setDateSortOrder(nextSort);
      }
      setTeacherCodeSortOrder("");
      setNameSortOrder("");
    }
  };

  // =========================================
  // Sort indicator helper
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
  // Filter and sort teachers list
  // =========================================
  const filteredTeachers = useMemo(() => {
    let result = teachers.filter((teacher) => {
      const matchesSearch =
        teacher.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.TeacherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.Mobile?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? teacher.IsActive === 1 || teacher.IsActive === true
            : teacher.IsActive === 0 || teacher.IsActive === false;

      return matchesSearch && matchesStatus;
    });

    if (teacherCodeSortOrder === "asc") {
      result = [...result].sort((a, b) =>
        (a.TeacherCode || "").localeCompare(b.TeacherCode || "", undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else if (teacherCodeSortOrder === "desc") {
      result = [...result].sort((a, b) =>
        (b.TeacherCode || "").localeCompare(a.TeacherCode || "", undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else if (nameSortOrder === "asc") {
      result = [...result].sort((a, b) =>
        (a.FullName || "").localeCompare(b.FullName || "")
      );
    } else if (nameSortOrder === "desc") {
      result = [...result].sort((a, b) =>
        (b.FullName || "").localeCompare(a.FullName || "")
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
    teachers,
    searchTerm,
    statusFilter,
    teacherCodeSortOrder,
    nameSortOrder,
    dateSortOrder,
  ]);

  // =========================================
  // Summary counts
  // =========================================
  const activeTeachersCount = useMemo(() => {
    return teachers.filter(
      (teacher) => teacher.IsActive === 1 || teacher.IsActive === true
    ).length;
  }, [teachers]);

  const inactiveTeachersCount = teachers.length - activeTeachersCount;

  // =========================================
  // Pagination calculations
  // =========================================
  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTeachers.slice(startIndex, endIndex);
  }, [filteredTeachers, currentPage]);

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





  // =========================================
  // Mobile / tablet teacher card
  // =========================================
  const TeacherCard = ({ teacher }) => (
    <div className="space-y-4 rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Teacher Code</p>
          <p className="break-words font-semibold text-[#a57f42]">
            {teacher.TeacherCode}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Name</p>
          <p className="break-words font-semibold text-black">
            {teacher.FullName}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-gray-500">Email</p>
          <p className="break-words text-black">{teacher.Email || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Mobile</p>
          <p className="text-black">{teacher.Mobile}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Status</p>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${teacher.IsActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {teacher.IsActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="col-span-2">
          <p className="mb-2 text-xs text-gray-500">Created At</p>
          {teacher.CreatedAt ? (
            <div className="rounded-2xl border border-[#e3d3bb] bg-[#fffdf9] px-3 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-black">
                <span>📅</span>
                <span>{formatDate(teacher.CreatedAt)}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span>🕒</span>
                <span className="whitespace-nowrap">
                  {formatTime(teacher.CreatedAt)}
                </span>

                {getDayLabel(teacher.CreatedAt) && (
                  <span className="rounded-full bg-[#eee4d6] px-2.5 py-1 text-[11px] font-semibold text-[#9b7440]">
                    {getDayLabel(teacher.CreatedAt)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            "-"
          )}
        </div>
      </div>

      <div className="rounded-xl bg-[#f7f1e8] px-4 py-2.5 text-center text-sm font-semibold">
        <button
          onClick={() => handleEdit(teacher)}
          className="text-blue-700 hover:underline"
        >
          Edit
        </button>

        <span className="mx-2 text-[#8b7355]">/</span>

        <button
          onClick={() =>
            handleTeacherStatusChange(
              teacher.TeacherId,
              teacher.IsActive ? 0 : 1
            )
          }
          className={`hover:underline ${teacher.IsActive ? "text-red-700" : "text-green-700"
            }`}
        >
          {teacher.IsActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );
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
    <>
      <div className="space-y-6">
        {/* =========================================
            Summary cards
           ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Total Teachers
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">{teachers.length}</h3>
            <p className="mt-2 text-sm text-gray-500">All teacher records</p>
          </div>

          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Active Teachers
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">
              {activeTeachersCount}
            </h3>
            <p className="mt-2 text-sm text-gray-500">Currently active teachers</p>
          </div>

          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Inactive Teachers
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">
              {inactiveTeachersCount}
            </h3>
            <p className="mt-2 text-sm text-gray-500">Currently inactive teachers</p>
          </div>
        </div>

        {/* Top error message */}
        {error && !showTeacherModal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =========================================
            Main teachers list section
           ========================================= */}
        <div className="rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6] space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-black">Teachers List</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredTeachers.length} of {teachers.length} teachers
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={openCreateModal}
                  className="rounded-2xl bg-[#b79257] hover:bg-[#a57f42] text-black px-5 py-2.5 text-sm font-semibold shadow-sm transition"
                >
                  Create Teacher
                </button>

                <button
                  onClick={handleClearFilters}
                  className="rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search name, code, email, mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Teachers</option>
                <option value="inactive">Inactive Teachers</option>
              </select>
            </div>
          </div>

          <div className="block space-y-4 bg-[#fcfaf6] p-4 2xl:hidden">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                onClick={() => toggleSort("teacherCode")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
              >
                Teacher Code{getSortIndicator(teacherCodeSortOrder)}
              </button>

              <button
                onClick={() => toggleSort("name")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
              >
                Name{getSortIndicator(nameSortOrder)}
              </button>

              <button
                onClick={() => toggleSort("date")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
              >
                Date{getSortIndicator(dateSortOrder, "date")}
              </button>
            </div>

            {tableLoading ? (
              <div className="p-6 text-center text-gray-600">Loading teachers...</div>
            ) : paginatedTeachers.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No teachers found</div>
            ) : (
              paginatedTeachers.map((teacher) => (
                <TeacherCard key={teacher.TeacherId} teacher={teacher} />
              ))
            )}

            {filteredTeachers.length > 0 && totalPages > 1 && (
              <div className="rounded-2xl border border-[#d6c2a8] bg-white p-4 shadow-sm">
                <p className="mb-4 text-center text-sm text-[#6b7280]">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredTeachers.length)} of{" "}
                  {filteredTeachers.length} teachers
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

          <div className="hidden overflow-x-auto 2xl:block">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">Loading teachers...</div>
            ) : paginatedTeachers.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No teachers found</div>
            ) : (
              <>
                <table className="min-w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleSort("teacherCode")}
                        className="cursor-pointer text-left px-6 py-4 text-sm font-bold text-black select-none"
                      >
                        Teacher Code{getSortIndicator(teacherCodeSortOrder)}
                      </th>

                      <th
                        onClick={() => toggleSort("name")}
                        className="cursor-pointer text-left px-6 py-4 text-sm font-bold text-black select-none"
                      >
                        Name{getSortIndicator(nameSortOrder)}
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-bold text-black">
                        Email
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-bold text-black">
                        Mobile
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-bold text-black">
                        Status
                      </th>

                      <th
                        onClick={() => toggleSort("date")}
                        className="cursor-pointer text-left px-6 py-4 text-sm font-bold text-black select-none"
                      >
                        Created At{getSortIndicator(dateSortOrder, "date")}
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-bold text-black">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedTeachers.map((teacher) => (
                      <tr
                        key={teacher.TeacherId}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td className="px-6 py-4 font-semibold text-[#a57f42]">
                          {teacher.TeacherCode}
                        </td>

                        <td className="px-6 py-4 text-black">{teacher.FullName}</td>

                        <td className="px-6 py-4 text-gray-700">
                          {teacher.Email || "-"}
                        </td>

                        <td className="px-6 py-4 text-gray-700">{teacher.Mobile}</td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${teacher.IsActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {teacher.IsActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {teacher.CreatedAt ? (
                            <div className="min-w-[210px] rounded-2xl border border-[#e3d3bb] bg-white px-4 py-3 shadow-sm">
                              <div className="flex items-center gap-3 text-black font-semibold text-[15px]">
                                <span className="text-lg">📅</span>
                                <span>{formatDate(teacher.CreatedAt)}</span>
                              </div>

                              <div className="mt-2 flex items-center gap-3 text-gray-600 text-sm">
                                <span className="text-base">🕒</span>
                                <span>{formatTime(teacher.CreatedAt)}</span>

                                {getDayLabel(teacher.CreatedAt) && (
                                  <span className="rounded-full bg-[#eee4d6] px-3 py-1 text-xs font-semibold text-[#9b7440]">
                                    {getDayLabel(teacher.CreatedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="inline-flex items-center rounded-xl bg-[#f7f1e8] px-3 py-2 text-sm font-semibold whitespace-nowrap">
                            <button
                              onClick={() => handleEdit(teacher)}
                              className="text-blue-700 hover:underline"
                            >
                              Edit
                            </button>

                            <span className="mx-2 text-[#8b7355]">/</span>

                            <button
                              onClick={() =>
                                handleTeacherStatusChange(
                                  teacher.TeacherId,
                                  teacher.IsActive ? 0 : 1
                                )
                              }
                              className={`hover:underline ${teacher.IsActive ? "text-red-700" : "text-green-700"
                                }`}
                            >
                              {teacher.IsActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredTeachers.length > 0 && totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] bg-white px-4 py-6">
                    <p className="text-sm text-[#6b7280] text-center">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredTeachers.length)} of{" "}
                      {filteredTeachers.length} teachers
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
          Create / Edit teacher modal
         ========================================= */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-4">
          <div className="relative w-full max-w-[680px] rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl overflow-hidden">
            <button
              onClick={closeTeacherModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-8 py-6">
              <h2 className="text-3xl font-bold text-white">
                {editingTeacherId ? "Edit Teacher" : "Create Teacher"}
              </h2>
              <p className="mt-2 text-base text-[#ece1cf]">
                {editingTeacherId
                  ? "Update selected teacher details"
                  : "Add a new teacher to the system"}
              </p>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off" className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder="Enter email"
                  className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Mobile
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Mobile number must be exactly 10 digits.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  {editingTeacherId ? "New Password (Optional)" : "Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder={
                    editingTeacherId
                      ? "Enter new password only if you want to change it"
                      : "Enter password"
                  }
                  className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
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

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-[22px] bg-[#b79257] hover:bg-[#a57f42] disabled:opacity-70 text-black font-semibold py-4 text-lg shadow-md transition"
                >
                  {loading
                    ? editingTeacherId
                      ? "Updating..."
                      : "Saving..."
                    : editingTeacherId
                      ? "Update Teacher"
                      : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={closeTeacherModal}
                  className="rounded-[22px] bg-black text-white px-6 py-4 text-base font-semibold"
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

export default TeachersManagement;