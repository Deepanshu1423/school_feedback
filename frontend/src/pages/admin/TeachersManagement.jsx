import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const TeachersManagement = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [nameSortOrder, setNameSortOrder] = useState("default");
  const [dateSortOrder, setDateSortOrder] = useState("default");

  useEffect(() => {
    fetchTeachers();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

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
    setEditingTeacherId(null);
    setMessage("");
    setError("");
  };

  const closeTeacherModal = () => {
    resetForm();
    setShowTeacherModal(false);
  };

  const openCreateModal = () => {
    resetForm();
    setShowTeacherModal(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.fullName || !formData.mobile) {
      setError("Full name and mobile are required");
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

  const handleTeacherStatusChange = async (teacherId, newStatus) => {
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
        fetchTeachers();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update teacher status");
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
  }, [teachers, searchTerm, statusFilter, nameSortOrder, dateSortOrder]);

  const activeTeachersCount = useMemo(() => {
    return teachers.filter(
      (teacher) => teacher.IsActive === 1 || teacher.IsActive === true
    ).length;
  }, [teachers]);

  const inactiveTeachersCount = teachers.length - activeTeachersCount;

  return (
    <>
      <div className="space-y-6">
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

        {error && !showTeacherModal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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

          <div className="overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">Loading teachers...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No teachers found</div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-bold text-black">
                      Teacher Code
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Name</span>
                        <select
                          value={nameSortOrder}
                          onChange={(e) => setNameSortOrder(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-2 py-1 text-xs font-medium text-black outline-none"
                        >
                          <option value="default">Default</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
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

                    <th className="text-left px-6 py-4 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Created At</span>
                        <select
                          value={dateSortOrder}
                          onChange={(e) => setDateSortOrder(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-2 py-1 text-xs font-medium text-black outline-none"
                        >
                          <option value="default">Default</option>
                          <option value="latest">Latest</option>
                          <option value="oldest">Oldest</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-bold text-black">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeachers.map((teacher) => (
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
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            teacher.IsActive
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
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleTeacherStatusChange(
                                teacher.TeacherId,
                                teacher.IsActive ? 0 : 1
                              )
                            }
                            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                              teacher.IsActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
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
            )}
          </div>
        </div>
      </div>

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
                  {editingTeacherId ? "New Password (Optional)" : "Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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