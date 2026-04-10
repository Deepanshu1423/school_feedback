import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const ParentsManagement = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showParentModal, setShowParentModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameSortOrder, setNameSortOrder] = useState("default");
  const [dateSortOrder, setDateSortOrder] = useState("default");

  useEffect(() => {
    fetchParents();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

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

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setNameSortOrder("default");
    setDateSortOrder("default");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      password: "",
    });
    setMessage("");
    setError("");
  };

  const closeParentModal = () => {
    resetForm();
    setShowParentModal(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowParentModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.fullName || !formData.mobile || !formData.password) {
      setError("Full name, mobile and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/admin/create-parent", formData, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        const createdCode = response.data?.data?.parentCode;
        setMessage(
          createdCode
            ? `Parent created successfully. Parent Code: ${createdCode}`
            : response.data.message || "Parent created successfully"
        );

        fetchParents();

        setTimeout(() => {
          closeParentModal();
        }, 900);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create parent");
    } finally {
      setLoading(false);
    }
  };

  const handleParentStatusChange = async (parentId, newStatus) => {
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
        fetchParents();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update parent status");
    }
  };

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

  const filteredParents = useMemo(() => {
    let result = parents.filter((parent) => {
      const matchesSearch =
        parent.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.ParentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        parent.Mobile?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? parent.IsActive === 1 || parent.IsActive === true
          : parent.IsActive === 0 || parent.IsActive === false;

      return matchesSearch && matchesStatus;
    });

    if (nameSortOrder === "asc") {
      result = [...result].sort((a, b) =>
        (a.FullName || "").localeCompare(b.FullName || "")
      );
    } else if (nameSortOrder === "desc") {
      result = [...result].sort((a, b) =>
        (b.FullName || "").localeCompare(a.FullName || "")
      );
    }

    if (dateSortOrder === "latest") {
      result = [...result].sort(
        (a, b) => new Date(b.CreatedAt || 0) - new Date(a.CreatedAt || 0)
      );
    } else if (dateSortOrder === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.CreatedAt || 0) - new Date(b.CreatedAt || 0)
      );
    }

    return result;
  }, [parents, searchTerm, statusFilter, nameSortOrder, dateSortOrder]);

  const activeParentsCount = useMemo(() => {
    return parents.filter(
      (parent) => parent.IsActive === 1 || parent.IsActive === true
    ).length;
  }, [parents]);

  const inactiveParentsCount = parents.length - activeParentsCount;

  const ParentCard = ({ parent }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Parent Code</p>
          <p className="font-semibold text-[#a57f42] break-words">{parent.ParentCode}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Name</p>
          <p className="font-semibold text-black break-words">{parent.FullName}</p>
        </div>

        <div className="col-span-2">
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-black break-words">{parent.Email || "-"}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Mobile</p>
          <p className="text-black">{parent.Mobile}</p>
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
          <p className="text-xs text-gray-500 mb-2">Created At</p>
          {parent.CreatedAt ? (
            <div className="rounded-2xl border border-[#e3d3bb] bg-[#fffdf9] px-3 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-black font-semibold text-sm">
                <span>📅</span>
                <span>{formatDate(parent.CreatedAt)}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-gray-600 text-xs flex-wrap">
                <span>🕒</span>
                <span className="whitespace-nowrap">{formatTime(parent.CreatedAt)}</span>

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

      <div className="flex flex-col gap-2">
        <button
          onClick={() =>
            handleParentStatusChange(
              parent.ParentId,
              parent.IsActive ? 0 : 1
            )
          }
          className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${
            parent.IsActive
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Total Parents
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">{parents.length}</h3>
            <p className="mt-2 text-sm text-gray-500">All parent records</p>
          </div>

          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Active Parents
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">
              {activeParentsCount}
            </h3>
            <p className="mt-2 text-sm text-gray-500">Currently active parents</p>
          </div>

          <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Inactive Parents
            </p>
            <h3 className="mt-3 text-4xl font-bold text-black">
              {inactiveParentsCount}
            </h3>
            <p className="mt-2 text-sm text-gray-500">Currently inactive parents</p>
          </div>
        </div>

        {error && !showParentModal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6] space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold text-black">Parents List</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredParents.length} of {parents.length} parents
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={openCreateModal}
                  className="rounded-2xl bg-[#b79257] hover:bg-[#a57f42] text-black px-5 py-2.5 text-sm font-semibold shadow-sm transition"
                >
                  Create Parent
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
                <option value="active">Active Parents</option>
                <option value="inactive">Inactive Parents</option>
              </select>
            </div>
          </div>

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select
                value={nameSortOrder}
                onChange={(e) => setNameSortOrder(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Name</option>
                <option value="asc">Name A-Z</option>
                <option value="desc">Name Z-A</option>
              </select>

              <select
                value={dateSortOrder}
                onChange={(e) => setDateSortOrder(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Date</option>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            {tableLoading ? (
              <div className="p-6 text-center text-gray-600">Loading parents...</div>
            ) : filteredParents.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No parents found</div>
            ) : (
              filteredParents.map((parent) => (
                <ParentCard key={parent.ParentId} parent={parent} />
              ))
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">Loading parents...</div>
            ) : filteredParents.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No parents found</div>
            ) : (
              <table className="min-w-[1080px] w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Parent Code
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Name</span>
                        <select
                          value={nameSortOrder}
                          onChange={(e) => {
                            setNameSortOrder(e.target.value);
                          }}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Email
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Mobile
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Status
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Created At</span>
                        <select
                          value={dateSortOrder}
                          onChange={(e) => {
                            setDateSortOrder(e.target.value);
                          }}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="latest">Latest</option>
                          <option value="oldest">Oldest</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredParents.map((parent) => (
                    <tr
                      key={parent.ParentId}
                      className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                    >
                      <td className="px-3 py-4 font-semibold text-[#a57f42] whitespace-nowrap">
                        {parent.ParentCode}
                      </td>

                      <td
                        className="px-3 py-4 text-black max-w-[140px] truncate"
                        title={parent.FullName}
                      >
                        {parent.FullName}
                      </td>

                      <td
                        className="px-3 py-4 text-gray-700 max-w-[180px] truncate"
                        title={parent.Email || "-"}
                      >
                        {parent.Email || "-"}
                      </td>

                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                        {parent.Mobile}
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
                            <div className="flex items-center gap-2 text-black font-semibold text-sm">
                              <span>📅</span>
                              <span>{formatDate(parent.CreatedAt)}</span>
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-gray-600 text-xs flex-wrap">
                              <span>🕒</span>
                              <span className="whitespace-nowrap">{formatTime(parent.CreatedAt)}</span>

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
                        <div className="flex flex-col gap-2 w-[92px]">
                          <button
                            onClick={() =>
                              handleParentStatusChange(
                                parent.ParentId,
                                parent.IsActive ? 0 : 1
                              )
                            }
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                              parent.IsActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
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
            )}
          </div>
        </div>
      </div>

      {showParentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-4">
          <div className="relative w-full max-w-[680px] rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl overflow-hidden">
            <button
              onClick={closeParentModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-8 py-6">
              <h2 className="text-3xl font-bold text-white">Create Parent</h2>
              <p className="mt-2 text-base text-[#ece1cf]">
                Add a new parent to the system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                  placeholder="Enter mobile number"
                  className="w-full rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-5 py-4 text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
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
                  {loading ? "Saving..." : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={closeParentModal}
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

export default ParentsManagement;