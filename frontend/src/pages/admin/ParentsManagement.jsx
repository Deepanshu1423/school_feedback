import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const ParentsManagement = () => {
  // =========================================
  // Form state
  // =========================================
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    address: "",
    password: "",
  });

  // =========================================
  // Main data states
  // =========================================
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showParentModal, setShowParentModal] = useState(false);
  const [editingParentId, setEditingParentId] = useState(null);

  // =========================================
  // Filter and sort states
  // =========================================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [parentCodeSortOrder, setParentCodeSortOrder] = useState("");
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
    fetchParents();
  }, []);

  // =========================================
  // Reset page when filters or sorting change
  // =========================================
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    parentCodeSortOrder,
    nameSortOrder,
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
  // Fetch parents from backend
  // =========================================
  const fetchParents = async () => {
    try {
      setTableLoading(true);
      setError("");

      const response = await axios.get("/admin/parents", {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setParents(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch parents");
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
    setParentCodeSortOrder("");
    setNameSortOrder("");
    setDateSortOrder("");
    setCurrentPage(1);
  };

  // =========================================
  // Handle form input changes
  // Mobile fields allow digits only and max 10 digits
  // =========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" || name === "alternateMobile") {
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
      alternateMobile: "",
      address: "",
      password: "",
    });

    setEditingParentId(null);
    setMessage("");
    setError("");
  };

  // =========================================
  // Close modal
  // =========================================
  const closeParentModal = () => {
    resetForm();
    setShowParentModal(false);
  };

  // =========================================
  // Open create modal
  // Create mode me form blank rahega
  // =========================================
  const openCreateModal = () => {
    setEditingParentId(null);

    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      address: "",
      password: "",
    });

    setMessage("");
    setError("");
    setShowParentModal(true);
  };

  // =========================================
  // Open edit modal and prefill form
  // =========================================
  const handleEdit = (parent) => {
    setMessage("");
    setError("");
    setEditingParentId(parent.ParentId);

    setFormData({
      fullName: parent.FullName || "",
      email: parent.Email || "",
      mobile: parent.Mobile || "",
      alternateMobile: parent.AlternateMobile || "",
      address: parent.Address || "",
      password: "",
    });

    setShowParentModal(true);
  };

  // =========================================
  // Submit create/update parent form
  // Includes:
  // - required validation
  // - email format validation
  // - mobile validation
  // - clean payload for backend
  // =========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.mobile.trim()
    ) {
      setError("Full name, email and mobile are required");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile.trim())) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }

    if (
      formData.alternateMobile &&
      !/^\d{10}$/.test(formData.alternateMobile.trim())
    ) {
      setError("Alternate mobile number must be exactly 10 digits");
      return;
    }

    if (
      formData.alternateMobile &&
      formData.alternateMobile.trim() === formData.mobile.trim()
    ) {
      setError("Mobile and alternate mobile cannot be same");
      return;
    }

    if (!editingParentId && !formData.password) {
      setError("Password is required while creating parent");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        alternateMobile: formData.alternateMobile.trim() || null,
        address: formData.address.trim() || null,
        password: formData.password,
      };

      let response;

      if (editingParentId) {
        response = await axios.put(
          `/admin/update-parent/${editingParentId}`,
          payload,
          {
            headers: getAuthHeaders(),
          }
        );
      } else {
        response = await axios.post("/admin/create-parent", payload, {
          headers: getAuthHeaders(),
        });
      }

      if (response.data.success) {
        const createdCode = response.data?.data?.parentCode;

        setMessage(
          editingParentId
            ? response.data.message || "Parent updated successfully"
            : createdCode
            ? `Parent created successfully. Parent Code: ${createdCode}`
            : response.data.message || "Parent created successfully"
        );

        fetchParents();

        setTimeout(() => {
          closeParentModal();
        }, 900);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingParentId
            ? "Failed to update parent"
            : "Failed to create parent")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Activate / Deactivate parent with confirm popup
  // =========================================
  const handleParentStatusChange = async (parentId, newStatus) => {
    const actionText = newStatus === 1 ? "activate" : "deactivate";

    const confirmAction = window.confirm(
      `Are you sure you want to ${actionText} this parent?`
    );

    if (!confirmAction) return;

    try {
      setMessage("");
      setError("");

      const response = await axios.put(
        `/admin/parent-status/${parentId}`,
        { isActive: newStatus },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setMessage(
          response.data.message ||
            `Parent ${
              newStatus === 1 ? "activated" : "deactivated"
            } successfully`
        );
        fetchParents();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update parent status");
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
    if (column === "parentCode") {
      const nextSort =
        parentCodeSortOrder === ""
          ? "asc"
          : parentCodeSortOrder === "asc"
          ? "desc"
          : "";
      setParentCodeSortOrder(nextSort);
      setNameSortOrder("");
      setDateSortOrder("");
    }

    if (column === "name") {
      const nextSort =
        nameSortOrder === "" ? "asc" : nameSortOrder === "asc" ? "desc" : "";
      setNameSortOrder(nextSort);
      setParentCodeSortOrder("");
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
      setParentCodeSortOrder("");
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
  // Filter and sort parent list
  // =========================================
  const filteredParents = useMemo(() => {
    let result = parents.filter((parent) => {
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        parent.FullName?.toLowerCase().includes(term) ||
        parent.ParentCode?.toLowerCase().includes(term) ||
        parent.Email?.toLowerCase().includes(term) ||
        parent.Mobile?.toLowerCase().includes(term) ||
        parent.AlternateMobile?.toLowerCase().includes(term) ||
        parent.Address?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? parent.IsActive === 1 || parent.IsActive === true
          : parent.IsActive === 0 || parent.IsActive === false;

      return matchesSearch && matchesStatus;
    });

    if (parentCodeSortOrder === "asc") {
      result = [...result].sort((a, b) =>
        (a.ParentCode || "").localeCompare(b.ParentCode || "", undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else if (parentCodeSortOrder === "desc") {
      result = [...result].sort((a, b) =>
        (b.ParentCode || "").localeCompare(a.ParentCode || "", undefined, {
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
    parents,
    searchTerm,
    statusFilter,
    parentCodeSortOrder,
    nameSortOrder,
    dateSortOrder,
  ]);

  // =========================================
  // Summary counts
  // =========================================
  const activeParentsCount = useMemo(() => {
    return parents.filter(
      (parent) => parent.IsActive === 1 || parent.IsActive === true
    ).length;
  }, [parents]);

  const inactiveParentsCount = parents.length - activeParentsCount;

  // =========================================
  // Pagination calculations
  // =========================================
  const totalPages = Math.ceil(filteredParents.length / ITEMS_PER_PAGE);

  const paginatedParents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredParents.slice(startIndex, endIndex);
  }, [filteredParents, currentPage]);

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
  // Build visible page numbers
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
  // Mobile / tablet parent card
  // =========================================
  const ParentCard = ({ parent }) => (
    <div className="space-y-4 rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Parent Code</p>
          <p className="break-words font-semibold text-[#a57f42]">
            {parent.ParentCode}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Name</p>
          <p className="break-words font-semibold text-black">
            {parent.FullName}
          </p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-gray-500">Email</p>
          <p className="break-words text-black">{parent.Email || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Mobile</p>
          <p className="text-black">{parent.Mobile}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Alternate Mobile</p>
          <p className="text-black">{parent.AlternateMobile || "-"}</p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-gray-500">Address</p>
          <p className="break-words text-black">{parent.Address || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Status</p>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              parent.IsActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {parent.IsActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="col-span-2">
          <p className="mb-2 text-xs text-gray-500">Created At</p>
          {parent.CreatedAt ? (
            <div className="rounded-2xl border border-[#e3d3bb] bg-[#fffdf9] px-3 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-black">
                <span>📅</span>
                <span>{formatDate(parent.CreatedAt)}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span>🕒</span>
                <span className="whitespace-nowrap">
                  {formatTime(parent.CreatedAt)}
                </span>

                {getDayLabel(parent.CreatedAt) && (
                  <span className="rounded-full bg-[#eee4d6] px-2.5 py-1 text-[11px] font-semibold text-[#9b7440]">
                    {getDayLabel(parent.CreatedAt)}
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
          onClick={() => handleEdit(parent)}
          className="text-blue-700 hover:underline"
        >
          Edit
        </button>

        <span className="mx-2 text-[#8b7355]">/</span>

        <button
          onClick={() =>
            handleParentStatusChange(parent.ParentId, parent.IsActive ? 0 : 1)
          }
          className={`hover:underline ${
            parent.IsActive ? "text-red-700" : "text-green-700"
          }`}
        >
          {parent.IsActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Total Parents
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">
              {parents.length}
            </h3>
            <p className="mt-2 text-sm text-gray-500">All parent records</p>
          </div>

          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Active Parents
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">
              {activeParentsCount}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Currently active parents
            </p>
          </div>

          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Inactive Parents
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">
              {inactiveParentsCount}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Currently inactive parents
            </p>
          </div>
        </div>

        {error && !showParentModal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg">
          <div className="space-y-4 border-b border-[#dcc7a6] bg-[#f1e7d7] px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-black">Parents List</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Showing {filteredParents.length} of {parents.length} parents
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={openCreateModal}
                  className="rounded-2xl bg-[#b79257] px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-[#a57f42]"
                >
                  Create Parent
                </button>

                <button
                  onClick={handleClearFilters}
                  className="rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Search name, code, email, mobile, alternate mobile, address..."
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
                <option value="active">Active Parents</option>
                <option value="inactive">Inactive Parents</option>
              </select>
            </div>
          </div>

          <div className="block space-y-4 bg-[#fcfaf6] p-4 2xl:hidden">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                onClick={() => toggleSort("parentCode")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-left text-xs font-semibold"
              >
                Parent Code{getSortIndicator(parentCodeSortOrder)}
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
              <div className="p-6 text-center text-gray-600">
                Loading parents...
              </div>
            ) : paginatedParents.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No parents found
              </div>
            ) : (
              paginatedParents.map((parent) => (
                <ParentCard key={parent.ParentId} parent={parent} />
              ))
            )}

            {filteredParents.length > 0 && totalPages > 1 && (
              <div className="rounded-2xl border border-[#d6c2a8] bg-white p-4 shadow-sm">
                <p className="mb-4 text-center text-sm text-[#6b7280]">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredParents.length
                  )}{" "}
                  of {filteredParents.length} parents
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

          <div className="hidden overflow-x-auto 2xl:block">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">
                Loading parents...
              </div>
            ) : paginatedParents.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No parents found
              </div>
            ) : (
              <>
                <table className="min-w-[1180px] w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleSort("parentCode")}
                        className="select-none cursor-pointer px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Parent Code{getSortIndicator(parentCodeSortOrder)}
                      </th>

                      <th
                        onClick={() => toggleSort("name")}
                        className="select-none cursor-pointer px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Name{getSortIndicator(nameSortOrder)}
                      </th>

                      <th className="px-3 py-3 text-left text-sm font-bold text-black">
                        Email
                      </th>

                      <th className="px-3 py-3 text-left text-sm font-bold text-black">
                        Mobile
                      </th>

                      <th className="px-3 py-3 text-left text-sm font-bold text-black">
                        Alternate Mobile
                      </th>

                      <th className="w-[120px] px-3 py-3 text-left text-sm font-bold text-black">
                        Address
                      </th>

                      <th className="px-3 py-3 text-left text-sm font-bold text-black">
                        Status
                      </th>

                      <th
                        onClick={() => toggleSort("date")}
                        className="select-none cursor-pointer px-3 py-3 text-left text-sm font-bold text-black"
                      >
                        Created At{getSortIndicator(dateSortOrder, "date")}
                      </th>

                      <th className="px-3 py-3 text-left text-sm font-bold text-black">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedParents.map((parent) => (
                      <tr
                        key={parent.ParentId}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td className="whitespace-nowrap px-3 py-4 font-semibold text-[#a57f42]">
                          {parent.ParentCode}
                        </td>

                        <td
                          className="max-w-[150px] truncate px-3 py-4 text-black"
                          title={parent.FullName}
                        >
                          {parent.FullName}
                        </td>

                        <td
                          className="max-w-[190px] truncate px-3 py-4 text-gray-700"
                          title={parent.Email || "-"}
                        >
                          {parent.Email || "-"}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-gray-700">
                          {parent.Mobile}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-gray-700">
                          {parent.AlternateMobile || "-"}
                        </td>

                        <td
                          className="max-w-[120px] truncate px-3 py-4 text-gray-700"
                          title={parent.Address || "-"}
                        >
                          {parent.Address || "-"}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              parent.IsActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {parent.IsActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          {parent.CreatedAt ? (
                            <div className="min-w-[180px] rounded-2xl border border-[#e3d3bb] bg-white px-3 py-3 shadow-sm">
                              <div className="flex items-center gap-2 text-sm font-semibold text-black">
                                <span>📅</span>
                                <span>{formatDate(parent.CreatedAt)}</span>
                              </div>

                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                <span>🕒</span>
                                <span className="whitespace-nowrap">
                                  {formatTime(parent.CreatedAt)}
                                </span>

                                {getDayLabel(parent.CreatedAt) && (
                                  <span className="rounded-full bg-[#eee4d6] px-2 py-1 text-[10px] font-semibold text-[#9b7440]">
                                    {getDayLabel(parent.CreatedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <div className="inline-flex items-center whitespace-nowrap rounded-xl bg-[#f7f1e8] px-3 py-2 text-sm font-semibold">
                            <button
                              onClick={() => handleEdit(parent)}
                              className="text-blue-700 hover:underline"
                            >
                              Edit
                            </button>

                            <span className="mx-2 text-[#8b7355]">/</span>

                            <button
                              onClick={() =>
                                handleParentStatusChange(
                                  parent.ParentId,
                                  parent.IsActive ? 0 : 1
                                )
                              }
                              className={`hover:underline ${
                                parent.IsActive
                                  ? "text-red-700"
                                  : "text-green-700"
                              }`}
                            >
                              {parent.IsActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredParents.length > 0 && totalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] bg-white px-4 py-6">
                    <p className="text-center text-sm text-[#6b7280]">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredParents.length
                      )}{" "}
                      of {filteredParents.length} parents
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

      {showParentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-3 py-4 sm:px-4 sm:py-6">
          <div className="flex min-h-full items-start justify-center sm:items-center">
            <div className="relative w-full max-w-[620px] max-h-[92vh] overflow-hidden rounded-[22px] border border-[#d8c3a0] bg-white shadow-2xl sm:rounded-[28px]">
              <button
                onClick={closeParentModal}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-black shadow-md hover:bg-[#f6efe4] sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-xl"
              >
                ×
              </button>

              <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  {editingParentId ? "Edit Parent" : "Create Parent"}
                </h2>
                <p className="mt-1 text-sm text-[#ece1cf] sm:mt-2 sm:text-base">
                  {editingParentId
                    ? "Update selected parent details"
                    : "Add a new parent to the system"}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                autoComplete="off"
                className="max-h-[calc(92vh-88px)] space-y-4 overflow-y-auto p-4 sm:max-h-[calc(92vh-104px)] sm:space-y-5 sm:p-5"
              >
                {/* 
                  Dummy hidden fields browser autofill ko real email/password fields
                  me fill hone se rokne ke liye use kiye hain.
                */}
                <input
                  type="text"
                  name="fakeUsername"
                  autoComplete="username"
                  tabIndex="-1"
                  className="pointer-events-none absolute h-0 w-0 opacity-0"
                />

                <input
                  type="password"
                  name="fakePassword"
                  autoComplete="new-password"
                  tabIndex="-1"
                  className="pointer-events-none absolute h-0 w-0 opacity-0"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter full name"
                    className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[22px] sm:px-5 sm:py-3.5 sm:text-lg"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter email"
                    className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[22px] sm:px-5 sm:py-3.5 sm:text-lg"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[22px] sm:px-5 sm:py-3.5 sm:text-lg"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Alternate Mobile
                  </label>
                  <input
                    type="text"
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter alternate mobile number"
                    maxLength={10}
                    className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[22px] sm:px-5 sm:py-3.5 sm:text-lg"
                  />
                  <p className="mt-2 text-xs text-[#7b8794]">
                    Optional. Must be 10 digits if entered.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    autoComplete="off"
                    placeholder="Enter address"
                    rows={3}
                    className="w-full resize-none rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[22px] sm:px-5 sm:py-3.5 sm:text-lg"
                  />
                  <p className="mt-2 text-xs text-[#7b8794]">Optional</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-black">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    placeholder={
                      editingParentId
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    className="w-full rounded-[18px] border border-[#b9c7da] bg-[#dfe7f5] px-4 py-3 text-base outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a] sm:rounded-[22px] sm:px-5 sm:py-3.5 sm:text-lg"
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

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[20px] bg-[#b79257] py-3.5 text-base font-semibold text-black shadow-md transition hover:bg-[#a57f42] disabled:opacity-70 sm:flex-1 sm:rounded-[22px] sm:py-4 sm:text-lg"
                  >
                    {loading
                      ? editingParentId
                        ? "Updating..."
                        : "Saving..."
                      : editingParentId
                      ? "Update Parent"
                      : "Create Parent"}
                  </button>

                  <button
                    type="button"
                    onClick={closeParentModal}
                    className="w-full rounded-[20px] bg-black px-6 py-3.5 text-base font-semibold text-white sm:w-auto sm:rounded-[22px] sm:py-4"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParentsManagement;