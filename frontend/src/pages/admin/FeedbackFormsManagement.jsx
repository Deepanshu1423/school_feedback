import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const FeedbackFormsManagement = () => {
  // =========================
  // Form state
  // =========================
  const [formData, setFormData] = useState({
    formName: "",
    description: "",
  });

  // =========================
  // Main data state
  // =========================
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // Modal / edit state
  // =========================
  const [editingFormId, setEditingFormId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  // =========================
  // Filter + sort state
  // "" means no sorting applied
  // =========================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formNameSortOrder, setFormNameSortOrder] = useState("");
  const [dateSortOrder, setDateSortOrder] = useState("");

  // =========================
  // Initial API call
  // Feedback forms will be fetched when the page loads.
  // =========================
  useEffect(() => {
    fetchFeedbackForms();
  }, []);

  // =========================
  // Auth token headers
  // To send the token with every protected API call.
  // =========================
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // =========================
  // Fetch all feedback forms
  // Fetches the list from the backend
  // =========================
  const fetchFeedbackForms = async () => {
    try {
      setTableLoading(true);
      setError("");

      const response = await axios.get("/admin/feedback-forms", {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setForms(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch feedback forms");
    } finally {
      setTableLoading(false);
    }
  };

  // =========================
  // Sort helpers
  // toggleSort = click-based sorting
  // form name: asc -> desc -> default
  // date: latest -> oldest -> default
  // =========================
  const resetAllSorts = () => {
    setFormNameSortOrder("");
    setDateSortOrder("");
  };

  const toggleSort = (type) => {
    if (type === "formName") {
      const next =
        formNameSortOrder === ""
          ? "asc"
          : formNameSortOrder === "asc"
          ? "desc"
          : "";

      resetAllSorts();
      setFormNameSortOrder(next);
    }

    if (type === "date") {
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

  // To display an arrow with the column header.
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

  // =========================
  // Form input change handler
  // Updates the input fields in the modal.
  // =========================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // Form reset
  // Brings the Create/Edit modal to a clean state.
  // =========================
  const resetForm = () => {
    setFormData({
      formName: "",
      description: "",
    });
    setEditingFormId(null);
    setMessage("");
    setError("");
  };

  // Create modal open
  const openCreateModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  // Modal close
  const closeFormModal = () => {
    resetForm();
    setShowFormModal(false);
  };

  // Edit modal open with existing data
  const handleEdit = (form) => {
    setMessage("");
    setError("");
    setEditingFormId(form.FeedbackFormId);
    setFormData({
      formName: form.FormName || "",
      description: form.Description || "",
    });
    setShowFormModal(true);
  };

  // =========================
  // Clear filters + sorting
  // Search reset
  // Status reset
  // Sorting reset
  // =========================
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    resetAllSorts();
  };

  // =========================
  // Create / Update form submit
  // If editingFormId exists, update; otherwise, create.
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.formName.trim()) {
      setError("Form name is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        formName: formData.formName.trim(),
        description: formData.description.trim() || null,
      };

      const response = editingFormId
        ? await axios.put(`/admin/update-feedback-form/${editingFormId}`, payload, {
            headers: getAuthHeaders(),
          })
        : await axios.post("/admin/create-feedback-form", payload, {
            headers: getAuthHeaders(),
          });

      if (response.data.success) {
        setMessage(
          response.data.message ||
            (editingFormId
              ? "Feedback form updated successfully"
              : "Feedback form created successfully")
        );

        fetchFeedbackForms();

        setTimeout(() => {
          closeFormModal();
        }, 900);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingFormId
            ? "Failed to update feedback form"
            : "Failed to create feedback form")
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Activate / Deactivate form
  // =========================
  const handleStatusChange = async (feedbackFormId, newStatus) => {
    try {
      setMessage("");
      setError("");

      const response = await axios.put(
        `/admin/feedback-form-status/${feedbackFormId}`,
        { isActive: newStatus },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        setMessage(
          response.data.message || "Feedback form status updated successfully"
        );
        fetchFeedbackForms();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update feedback form status"
      );
    }
  };

  // =========================
  // Date helpers
  // To display a readable date, time, and day label in the UI.
  // =========================
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

  // =========================
  // Filtered + sorted data
  // Search + status filter + click sorting
  // =========================
  const filteredForms = useMemo(() => {
    let result = forms.filter((form) => {
      const matchesSearch =
        form.FormName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.Description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? form.IsActive === 1 || form.IsActive === true
          : form.IsActive === 0 || form.IsActive === false;

      return matchesSearch && matchesStatus;
    });

    if (formNameSortOrder === "asc") {
      result = [...result].sort((a, b) =>
        String(a.FormName || "").localeCompare(String(b.FormName || ""))
      );
    } else if (formNameSortOrder === "desc") {
      result = [...result].sort((a, b) =>
        String(b.FormName || "").localeCompare(String(a.FormName || ""))
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
  }, [forms, searchTerm, statusFilter, formNameSortOrder, dateSortOrder]);

  // Summary cards counts
  const activeFormsCount = useMemo(() => {
    return forms.filter((form) => form.IsActive === 1 || form.IsActive === true)
      .length;
  }, [forms]);

  const inactiveFormsCount = forms.length - activeFormsCount;

  // =========================
  // Mobile / small-screen card view
  // This is used only for small screens
  // Visible on screens smaller than 2xl
  // =========================
  const FeedbackFormCard = ({ form }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-4">
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Form Name</p>
          <p className="font-semibold text-black break-words">{form.FormName}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Description</p>
          <p className="text-black break-words">{form.Description || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Status</p>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              form.IsActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {form.IsActive ? "Active" : "Inactive"}
          </span>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2">Created At</p>
          {form.CreatedAt ? (
            <div className="rounded-2xl border border-[#e3d3bb] bg-[#fffdf9] px-3 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-black font-semibold text-sm">
                <span>📅</span>
                <span>{formatDate(form.CreatedAt)}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-gray-600 text-xs flex-wrap">
                <span>🕒</span>
                <span className="whitespace-nowrap">{formatTime(form.CreatedAt)}</span>
                {getDayLabel(form.CreatedAt) && (
                  <span className="rounded-full bg-[#eee4d6] px-2.5 py-1 text-[11px] font-semibold text-[#9b7440]">
                    {getDayLabel(form.CreatedAt)}
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
          onClick={() => handleEdit(form)}
          className="w-full rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold"
        >
          Edit
        </button>

        <button
          onClick={() =>
            handleStatusChange(form.FeedbackFormId, form.IsActive ? 0 : 1)
          }
          className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${
            form.IsActive
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {form.IsActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* =========================
          Summary cards
         ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Total Forms
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">{forms.length}</h3>
          <p className="mt-2 text-sm text-gray-500">All feedback forms</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Active Forms
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {activeFormsCount}
          </h3>
          <p className="mt-2 text-sm text-gray-500">Currently active forms</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Inactive Forms
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {inactiveFormsCount}
          </h3>
          <p className="mt-2 text-sm text-gray-500">Currently inactive forms</p>
        </div>
      </div>

      {/* Top error message */}
      {error && !showFormModal && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================
          Main list section
         ========================= */}
      <div className="rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg overflow-hidden">
        {/* Filter / actions header */}
        <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6] space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Feedback Forms List
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Showing {filteredForms.length} of {forms.length} forms
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={openCreateModal}
                className="rounded-2xl bg-[#b79257] hover:bg-[#a57f42] text-black px-5 py-2.5 text-sm font-semibold shadow-sm transition"
              >
                Create Feedback Form
              </button>

              <button
                onClick={handleClearFilters}
                className="rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search + filter row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by form name or description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            >
              <option value="all">All Forms</option>
              <option value="active">Active Forms</option>
              <option value="inactive">Inactive Forms</option>
            </select>
          </div>
        </div>

        {/* =========================
            Mobile / tablet sort buttons + card list
            This is for screens smaller than 2xl.
           ========================= */}
        <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => toggleSort("formName")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
            >
              Form Name{getSortIndicator(formNameSortOrder)}
            </button>

            <button
              onClick={() => toggleSort("date")}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
            >
              Date{getSortIndicator(dateSortOrder, "date")}
            </button>
          </div>

          {tableLoading ? (
            <div className="p-6 text-center text-gray-600">
              Loading feedback forms...
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No feedback forms found
            </div>
          ) : (
            filteredForms.map((form) => (
              <FeedbackFormCard key={form.FeedbackFormId} form={form} />
            ))
          )}
        </div>

        {/* =========================
            Laptop / desktop table view
            This is only for 2xl and above screens.
           ========================= */}
        <div className="hidden 2xl:block overflow-x-auto">
          {tableLoading ? (
            <div className="p-8 text-center text-gray-600">
              Loading feedback forms...
            </div>
          ) : filteredForms.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No feedback forms found
            </div>
          ) : (
            <table className="min-w-[1080px] w-full">
              <thead className="bg-[#fbf7f0]">
                <tr>
                  {/* Click sorting column */}
                  <th
                    onClick={() => toggleSort("formName")}
                    className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                  >
                    Form Name{getSortIndicator(formNameSortOrder)}
                  </th>

                  <th className="text-left px-3 py-3 text-sm font-bold text-black">
                    Description
                  </th>

                  <th className="text-left px-3 py-3 text-sm font-bold text-black">
                    Status
                  </th>

                  {/* Click sorting column */}
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
                {filteredForms.map((form) => (
                  <tr
                    key={form.FeedbackFormId}
                    className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                  >
                    <td
                      className="px-3 py-4 text-black font-medium max-w-[160px] truncate"
                      title={form.FormName}
                    >
                      {form.FormName}
                    </td>

                    <td
                      className="px-3 py-4 text-gray-700 max-w-[260px] truncate"
                      title={form.Description || "-"}
                    >
                      {form.Description || "-"}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          form.IsActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {form.IsActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className=" px-3 py-4 ">
                      {form.CreatedAt ? (
                        <div className="min-w-[100px] rounded-2xl border border-[#e3d3bb] bg-white px-3 py-3 shadow-sm">
                          <div className="flex items-center gap-2 text-black font-semibold text-sm">
                            <span>📅</span>
                            <span>{formatDate(form.CreatedAt)}</span>
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-gray-600 text-xs flex-wrap">
                            <span>🕒</span>
                            <span className="whitespace-nowrap">
                              {formatTime(form.CreatedAt)}
                            </span>

                            {getDayLabel(form.CreatedAt) && (
                              <span className="rounded-full bg-[#eee4d6] px-2 py-1 text-[10px] font-semibold text-[#9b7440]">
                                {getDayLabel(form.CreatedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-2 w-[122px]">
                        <button
                          onClick={() => handleEdit(form)}
                          className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 text-xs font-semibold"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(
                              form.FeedbackFormId,
                              form.IsActive ? 0 : 1
                            )
                          }
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                            form.IsActive
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {form.IsActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* =========================
          Create / Edit modal
         ========================= */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-4">
          <div className="relative w-full max-w-[680px] rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl overflow-hidden">
            <button
              onClick={closeFormModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-8 py-6">
              <h2 className="text-3xl font-bold text-white">
                {editingFormId ? "Edit Feedback Form" : "Create Feedback Form"}
              </h2>
              <p className="mt-2 text-base text-[#ece1cf]">
                {editingFormId
                  ? "Update selected feedback form"
                  : "Add a new feedback form"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Form Name
                </label>
                <input
                  type="text"
                  name="formName"
                  value={formData.formName}
                  onChange={handleChange}
                  placeholder="Enter form name"
                  className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  rows="4"
                  className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-lg outline-none resize-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
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
                    ? editingFormId
                      ? "Updating..."
                      : "Saving..."
                    : editingFormId
                    ? "Update Feedback Form"
                    : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={closeFormModal}
                  className="rounded-[22px] bg-black text-white px-6 py-4 text-base font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackFormsManagement;