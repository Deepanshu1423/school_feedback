import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const ClassesManagement = () => {
  const [formData, setFormData] = useState({
    className: "",
    section: "",
    academicYear: "",
  });

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingClassId, setEditingClassId] = useState(null);
  const [showClassModal, setShowClassModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [classNameSortOrder, setClassNameSortOrder] = useState("default");
  const [sectionSortOrder, setSectionSortOrder] = useState("default");
  const [academicYearSortOrder, setAcademicYearSortOrder] = useState("default");

  useEffect(() => {
    fetchClasses();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchClasses = async () => {
    try {
      setTableLoading(true);
      setError("");

      const response = await axios.get("/admin/classes", {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setClasses(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch classes");
    } finally {
      setTableLoading(false);
    }
  };

  const resetAllSorts = () => {
    setClassNameSortOrder("default");
    setSectionSortOrder("default");
    setAcademicYearSortOrder("default");
  };

  const setOnlyActiveSort = (sortType, value) => {
    resetAllSorts();

    if (sortType === "className") setClassNameSortOrder(value);
    if (sortType === "section") setSectionSortOrder(value);
    if (sortType === "academicYear") setAcademicYearSortOrder(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    resetAllSorts();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      className: "",
      section: "",
      academicYear: "",
    });
    setEditingClassId(null);
    setMessage("");
    setError("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowClassModal(true);
  };

  const closeClassModal = () => {
    resetForm();
    setShowClassModal(false);
  };

  const handleEdit = (cls) => {
    setMessage("");
    setError("");
    setEditingClassId(cls.ClassId);
    setFormData({
      className: cls.ClassName || "",
      section: cls.Section || "",
      academicYear: cls.AcademicYear || "",
    });
    setShowClassModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.className || !formData.section || !formData.academicYear) {
      setError("Class name, section and academic year are required");
      return;
    }

    try {
      setLoading(true);

      let response;

      if (editingClassId) {
        response = await axios.put(
          `/admin/update-class/${editingClassId}`,
          formData,
          {
            headers: getAuthHeaders(),
          }
        );
      } else {
        response = await axios.post("/admin/create-class", formData, {
          headers: getAuthHeaders(),
        });
      }

      if (response.data.success) {
        setMessage(
          response.data.message ||
            (editingClassId
              ? "Class updated successfully"
              : "Class created successfully")
        );
        fetchClasses();

        setTimeout(() => {
          closeClassModal();
        }, 900);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (editingClassId ? "Failed to update class" : "Failed to create class")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClassStatusChange = async (classId, newStatus) => {
    try {
      setMessage("");
      setError("");

      const response = await axios.put(
        `/admin/class-status/${classId}`,
        { isActive: newStatus },
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        fetchClasses();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update class status");
    }
  };

  const handleDeleteClass = async (classId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      const response = await axios.delete(`/admin/delete-class/${classId}`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setMessage(response.data.message || "Class deleted successfully");
        if (editingClassId === classId) {
          resetForm();
        }
        fetchClasses();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete class");
    }
  };

  const getClassNameSortValue = (cls) => {
    const raw = String(cls.ClassName || "").trim();
    const num = Number(raw);

    if (!Number.isNaN(num) && raw !== "") {
      return { isNumeric: true, value: num };
    }

    return { isNumeric: false, value: raw.toLowerCase() };
  };

  const getAcademicYearSortValue = (cls) => {
    const raw = String(cls.AcademicYear || "");
    const firstYear = raw.split("-")[0]?.trim();
    const num = Number(firstYear);
    return Number.isNaN(num) ? 0 : num;
  };

  const filteredClasses = useMemo(() => {
    let result = classes.filter((cls) => {
      const matchesSearch =
        cls.ClassName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.Section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.AcademicYear?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? cls.IsActive === 1 || cls.IsActive === true
          : cls.IsActive === 0 || cls.IsActive === false;

      return matchesSearch && matchesStatus;
    });

    if (classNameSortOrder === "asc") {
      result = [...result].sort((a, b) => {
        const av = getClassNameSortValue(a);
        const bv = getClassNameSortValue(b);

        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    } else if (classNameSortOrder === "desc") {
      result = [...result].sort((a, b) => {
        const av = getClassNameSortValue(a);
        const bv = getClassNameSortValue(b);

        if (av.isNumeric && bv.isNumeric) return bv.value - av.value;
        if (av.isNumeric && !bv.isNumeric) return 1;
        if (!av.isNumeric && bv.isNumeric) return -1;
        return String(bv.value).localeCompare(String(av.value));
      });
    } else if (sectionSortOrder === "asc") {
      result = [...result].sort((a, b) =>
        String(a.Section || "").localeCompare(String(b.Section || ""))
      );
    } else if (sectionSortOrder === "desc") {
      result = [...result].sort((a, b) =>
        String(b.Section || "").localeCompare(String(a.Section || ""))
      );
    } else if (academicYearSortOrder === "asc") {
      result = [...result].sort(
        (a, b) => getAcademicYearSortValue(a) - getAcademicYearSortValue(b)
      );
    } else if (academicYearSortOrder === "desc") {
      result = [...result].sort(
        (a, b) => getAcademicYearSortValue(b) - getAcademicYearSortValue(a)
      );
    } else {
      result = [...result].sort((a, b) => {
        const av = getClassNameSortValue(a);
        const bv = getClassNameSortValue(b);

        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    }

    return result;
  }, [
    classes,
    searchTerm,
    statusFilter,
    classNameSortOrder,
    sectionSortOrder,
    academicYearSortOrder,
  ]);

  const activeClassesCount = useMemo(() => {
    return classes.filter((cls) => cls.IsActive === 1 || cls.IsActive === true)
      .length;
  }, [classes]);

  const inactiveClassesCount = classes.length - activeClassesCount;

  return (
    <>
      <div className="space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Total Classes
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {classes.length}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              All class records
            </p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Active Classes
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {activeClassesCount}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Currently active classes
            </p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Inactive Classes
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {inactiveClassesCount}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Currently inactive classes
            </p>
          </div>
        </div>

        {error && !showClassModal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-[22px] sm:rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-4 sm:px-6 py-4 sm:py-5 border-b border-[#dcc7a6] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-black">
                  Classes List
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {filteredClasses.length} of {classes.length} classes
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={openCreateModal}
                  className="rounded-2xl bg-[#b79257] hover:bg-[#a57f42] text-black px-4 sm:px-5 py-2.5 text-sm font-semibold shadow-sm transition"
                >
                  Create Class
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
                placeholder="Search class, section, academic year..."
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
                <option value="active">Active Classes</option>
                <option value="inactive">Inactive Classes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">
                Loading classes...
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No classes found
              </div>
            ) : (
              <table className="min-w-[980px] w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Class Name</span>
                        <select
                          value={classNameSortOrder}
                          onChange={(e) =>
                            setOnlyActiveSort("className", e.target.value)
                          }
                          className="w-[92px] rounded-lg border border-[#d8c3a0] bg-white px-2 py-1 text-xs font-medium text-black outline-none"
                        >
                          <option value="default">Default</option>
                          <option value="asc">Low-High</option>
                          <option value="desc">High-Low</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Section</span>
                        <select
                          value={sectionSortOrder}
                          onChange={(e) =>
                            setOnlyActiveSort("section", e.target.value)
                          }
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-2 py-1 text-xs font-medium text-black outline-none"
                        >
                          <option value="default">Default</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Academic Year</span>
                        <select
                          value={academicYearSortOrder}
                          onChange={(e) =>
                            setOnlyActiveSort("academicYear", e.target.value)
                          }
                          className="w-[92px] rounded-lg border border-[#d8c3a0] bg-white px-2 py-1 text-xs font-medium text-black outline-none"
                        >
                          <option value="default">Default</option>
                          <option value="asc">Old-New</option>
                          <option value="desc">New-Old</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold text-black">
                      Status
                    </th>

                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-bold text-black">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClasses.map((cls) => (
                    <tr
                      key={cls.ClassId}
                      className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                    >
                      <td className="px-4 sm:px-6 py-4 sm:py-6 text-black font-medium whitespace-nowrap">
                        {cls.ClassName}
                      </td>

                      <td className="px-4 sm:px-6 py-4 sm:py-6 text-gray-700 whitespace-nowrap">
                        {cls.Section}
                      </td>

                      <td className="px-4 sm:px-6 py-4 sm:py-6 text-gray-700 whitespace-nowrap">
                        {cls.AcademicYear}
                      </td>

                      <td className="px-4 sm:px-6 py-4 sm:py-6">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                            cls.IsActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {cls.IsActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(cls)}
                            className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold whitespace-nowrap"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleClassStatusChange(
                                cls.ClassId,
                                cls.IsActive ? 0 : 1
                              )
                            }
                            className={`rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap ${
                              cls.IsActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {cls.IsActive ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            onClick={() => handleDeleteClass(cls.ClassId)}
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
            )}
          </div>
        </div>
      </div>

      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 sm:px-4 py-4">
          <div className="relative w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-[24px] sm:rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl">
            <button
              onClick={closeClassModal}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-lg sm:text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-5 sm:px-8 py-5 sm:py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {editingClassId ? "Edit Class" : "Create Class"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#ece1cf]">
                {editingClassId
                  ? "Update selected class details"
                  : "Add class name, section and academic year"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  name="className"
                  value={formData.className}
                  onChange={handleChange}
                  placeholder="Enter class name"
                  className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="Enter section"
                  className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base sm:text-lg outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  placeholder="Enter academic year (e.g. 2025-2026)"
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
                    ? editingClassId
                      ? "Updating..."
                      : "Saving..."
                    : editingClassId
                    ? "Update Class"
                    : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={closeClassModal}
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

export default ClassesManagement;