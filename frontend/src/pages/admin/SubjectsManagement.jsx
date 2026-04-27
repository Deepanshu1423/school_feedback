import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const SubjectsManagement = () => {
  // =========================================
  // Form state
  // =========================================
  const [formData, setFormData] = useState({
    subjectName: "",
  });

  // =========================================
  // Main data states
  // =========================================
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // =========================================
  // Filter and sort states
  // =========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectNameSortOrder, setSubjectNameSortOrder] = useState("");
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
    fetchSubjects();
  }, []);

  // =========================================
  // Reset page when filters or sorting change
  // =========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, subjectNameSortOrder, dateSortOrder]);

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
  // Fetch subjects from backend
  // =========================================
  const fetchSubjects = async () => {
    try {
      setTableLoading(true);
      setError("");

      const response = await axios.get("/admin/subjects", {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setSubjects(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch subjects");
    } finally {
      setTableLoading(false);
    }
  };

  // =========================================
  // Reset all sorting states
  // =========================================
  const resetAllSorts = () => {
    setSubjectNameSortOrder("");
    setDateSortOrder("");
  };

  // =========================================
  // Toggle sorting per column
  // =========================================
  const toggleSort = (sortType) => {
    if (sortType === "subjectName") {
      const next =
        subjectNameSortOrder === ""
          ? "asc"
          : subjectNameSortOrder === "asc"
          ? "desc"
          : "";

      resetAllSorts();
      setSubjectNameSortOrder(next);
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
    resetAllSorts();
    setCurrentPage(1);
  };

  // =========================================
  // Handle form input changes
  // =========================================
  const handleChange = (e) => {
    setFormData({
      subjectName: e.target.value,
    });
  };

  // =========================================
  // Reset form state
  // =========================================
  const resetForm = () => {
    setFormData({
      subjectName: "",
    });
    setEditingSubjectId(null);
    setMessage("");
    setError("");
  };

  // =========================================
  // Open and close modal
  // =========================================
  const openCreateModal = () => {
    resetForm();
    setShowSubjectModal(true);
  };

  const closeSubjectModal = () => {
    resetForm();
    setShowSubjectModal(false);
  };

  // =========================================
  // Open edit modal and prefill form
  // =========================================
  const handleEdit = (subject) => {
    setMessage("");
    setError("");
    setEditingSubjectId(subject.SubjectId);
    setFormData({
      subjectName: subject.SubjectName || "",
    });
    setShowSubjectModal(true);
  };

  // =========================================
  // Create or update subject
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.subjectName) {
      setError("Subject name is required");
      return;
    }

    try {
      setLoading(true);

      let response;

      if (editingSubjectId) {
        response = await axios.put(
          `/admin/update-subject/${editingSubjectId}`,
          formData,
          {
            headers: getAuthHeaders(),
          }
        );
      } else {
        response = await axios.post("/admin/create-subject", formData, {
          headers: getAuthHeaders(),
        });
      }

      if (response.data.success) {
        setMessage(
          response.data.message ||
            (editingSubjectId
              ? "Subject updated successfully"
              : "Subject created successfully")
        );

        fetchSubjects();

        setTimeout(() => {
          closeSubjectModal();
        }, 900);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingSubjectId
            ? "Failed to update subject"
            : "Failed to create subject")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Activate / Deactivate subject with confirm popup
  // =========================================
  const handleSubjectStatusChange = async (subjectId, newStatus) => {
    const actionText = newStatus === 1 ? "activate" : "deactivate";

    const confirmAction = window.confirm(
      `Are you sure you want to ${actionText} this subject?`
    );

    if (!confirmAction) return;

    try {
      setMessage("");
      setError("");

      const response = await axios.put(
        `/admin/subject-status/${subjectId}`,
        { isActive: newStatus },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setMessage(
          response.data.message ||
            `Subject ${newStatus === 1 ? "activated" : "deactivated"} successfully`
        );
        fetchSubjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update subject status");
    }
  };

  // =========================================
  // Delete subject with confirm popup
  // =========================================
  const handleDeleteSubject = async (subjectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subject?"
    );

    if (!confirmDelete) return;

    try {
      setMessage("");
      setError("");

      const response = await axios.delete(`/admin/delete-subject/${subjectId}`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setMessage(response.data.message || "Subject deleted successfully");

        if (editingSubjectId === subjectId) {
          resetForm();
        }

        fetchSubjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete subject");
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
  // Filter and sort subjects
  // =========================================
  const filteredSubjects = useMemo(() => {
    let result = subjects.filter((subject) => {
      const matchesSearch = subject.SubjectName?.toLowerCase().includes(
        searchTerm.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? subject.IsActive === 1 || subject.IsActive === true
          : subject.IsActive === 0 || subject.IsActive === false;

      return matchesSearch && matchesStatus;
    });

    if (subjectNameSortOrder === "asc") {
      result = [...result].sort((a, b) =>
        String(a.SubjectName || "").localeCompare(String(b.SubjectName || ""))
      );
    } else if (subjectNameSortOrder === "desc") {
      result = [...result].sort((a, b) =>
        String(b.SubjectName || "").localeCompare(String(a.SubjectName || ""))
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
  }, [subjects, searchTerm, statusFilter, subjectNameSortOrder, dateSortOrder]);

  // =========================================
  // Summary counts
  // =========================================
  const activeSubjectsCount = useMemo(() => {
    return subjects.filter(
      (subject) => subject.IsActive === 1 || subject.IsActive === true
    ).length;
  }, [subjects]);

  const inactiveSubjectsCount = subjects.length - activeSubjectsCount;

  // =========================================
  // Pagination calculations
  // =========================================
  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);

  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredSubjects.slice(startIndex, endIndex);
  }, [filteredSubjects, currentPage]);

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

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        {/* =========================================
            Summary cards
           ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Total Subjects
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {subjects.length}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              All subject records
            </p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Active Subjects
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {activeSubjectsCount}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Currently active subjects
            </p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Inactive Subjects
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {inactiveSubjectsCount}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Currently inactive subjects
            </p>
          </div>
        </div>

        {/* Top error message */}
        {error && !showSubjectModal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =========================================
            Main subjects list section
           ========================================= */}
        <div className="rounded-[22px] sm:rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-4 sm:px-6 py-4 sm:py-5 border-b border-[#dcc7a6] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-black">
                  Subjects List
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredSubjects.length} of {subjects.length} subjects
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={openCreateModal}
                  className="rounded-2xl bg-[#b79257] hover:bg-[#a57f42] text-black px-4 sm:px-5 py-2.5 text-sm font-semibold shadow-sm transition"
                >
                  Create Subject
                </button>

                <button
                  onClick={handleClearFilters}
                  className="rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                placeholder="Search subject name..."
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
                <option value="active">Active Subjects</option>
                <option value="inactive">Inactive Subjects</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">
                Loading subjects...
              </div>
            ) : paginatedSubjects.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No subjects found
              </div>
            ) : (
              <>
                <table className="min-w-[980px] w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleSort("subjectName")}
                        className="cursor-pointer text-left px-4 sm:px-6 py-4 text-sm font-bold text-black select-none"
                      >
                        Subject Name{getSortIndicator(subjectNameSortOrder)}
                      </th>

                      <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold text-black">
                        Status
                      </th>

                      <th
                        onClick={() => toggleSort("date")}
                        className="cursor-pointer text-left px-4 sm:px-6 py-4 text-sm font-bold text-black select-none"
                      >
                        Created At{getSortIndicator(dateSortOrder, "date")}
                      </th>

                      <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold text-black">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedSubjects.map((subject) => (
                      <tr
                        key={subject.SubjectId}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td className="px-4 sm:px-6 py-4 sm:py-6 text-black font-medium whitespace-nowrap">
                          {subject.SubjectName}
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-6">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                              subject.IsActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {subject.IsActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-6">
                          {subject.CreatedAt ? (
                            <div className="min-w-[180px] sm:min-w-[210px] rounded-2xl border border-[#e3d3bb] bg-white px-3 sm:px-4 py-3 shadow-sm">
                              <div className="flex items-center gap-2 sm:gap-3 text-black font-semibold text-sm sm:text-[15px]">
                                <span className="text-base sm:text-lg">📅</span>
                                <span>{formatDate(subject.CreatedAt)}</span>
                              </div>

                              <div className="mt-2 flex items-center gap-2 sm:gap-3 text-gray-600 text-xs sm:text-sm flex-wrap">
                                <span className="text-sm sm:text-base">🕒</span>
                                <span>{formatTime(subject.CreatedAt)}</span>

                                {getDayLabel(subject.CreatedAt) && (
                                  <span className="rounded-full bg-[#eee4d6] px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold text-[#9b7440]">
                                    {getDayLabel(subject.CreatedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-4 sm:px-6 py-4 sm:py-6">
                          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold whitespace-nowrap"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleSubjectStatusChange(
                                  subject.SubjectId,
                                  subject.IsActive ? 0 : 1
                                )
                              }
                              className={`rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                                subject.IsActive
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {subject.IsActive ? "Deactivate" : "Activate"}
                            </button>

                            <button
                              onClick={() => handleDeleteSubject(subject.SubjectId)}
                              className="rounded-xl bg-gray-900 text-white hover:bg-black px-4 py-2 text-sm font-semibold whitespace-nowrap"
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
                {filteredSubjects.length > 0 && totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] bg-white px-4 py-6">
                    <p className="text-sm text-[#6b7280] text-center">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubjects.length)} of{" "}
                      {filteredSubjects.length} subjects
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          Create / Edit subject modal
         ========================================= */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 sm:px-4 py-4">
          <div className="relative w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-[24px] sm:rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl">
            <button
              onClick={closeSubjectModal}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-lg sm:text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-5 sm:px-8 py-5 sm:py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {editingSubjectId ? "Edit Subject" : "Create Subject"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#ece1cf]">
                {editingSubjectId
                  ? "Update selected subject details"
                  : "Add a new subject to the system"}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={handleChange}
                  placeholder="Enter subject name"
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
                    ? editingSubjectId
                      ? "Updating..."
                      : "Saving..."
                    : editingSubjectId
                    ? "Update Subject"
                    : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={closeSubjectModal}
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

export default SubjectsManagement;