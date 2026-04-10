import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const StudentsManagement = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    classId: "",
    rollNumber: "",
  });

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const [studentNameSortOrder, setStudentNameSortOrder] = useState("default");
  const [rollNumberSortOrder, setRollNumberSortOrder] = useState("default");
  const [classSortOrder, setClassSortOrder] = useState("default");
  const [academicYearSortOrder, setAcademicYearSortOrder] = useState("default");
  const [dateSortOrder, setDateSortOrder] = useState("default");

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

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

  const resetAllSorts = () => {
    setStudentNameSortOrder("default");
    setRollNumberSortOrder("default");
    setClassSortOrder("default");
    setAcademicYearSortOrder("default");
    setDateSortOrder("default");
  };

  const setOnlyActiveSort = (sortType, value) => {
    resetAllSorts();

    if (sortType === "studentName") setStudentNameSortOrder(value);
    if (sortType === "rollNumber") setRollNumberSortOrder(value);
    if (sortType === "class") setClassSortOrder(value);
    if (sortType === "academicYear") setAcademicYearSortOrder(value);
    if (sortType === "date") setDateSortOrder(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setClassFilter("all");
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
      studentName: "",
      classId: "",
      rollNumber: "",
    });
    setEditingStudentId(null);
    setMessage("");
    setError("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowStudentModal(true);
  };

  const closeStudentModal = () => {
    resetForm();
    setShowStudentModal(false);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.studentName || !formData.classId) {
      setError("Student name and class are required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        studentName: formData.studentName,
        classId: Number(formData.classId),
        rollNumber: formData.rollNumber || null,
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

  const handleStudentStatusChange = async (studentId, newStatus) => {
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
        fetchStudents();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student status");
    }
  };

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

  const activeStudentsCount = useMemo(() => {
    return students.filter(
      (student) => student.IsActive === 1 || student.IsActive === true
    ).length;
  }, [students]);

  const inactiveStudentsCount = students.length - activeStudentsCount;

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
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              student.IsActive
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
          className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${
            student.IsActive
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

        {error && !showStudentModal && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select
                value={studentNameSortOrder}
                onChange={(e) => setOnlyActiveSort("studentName", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Name</option>
                <option value="asc">Name A-Z</option>
                <option value="desc">Name Z-A</option>
              </select>

              <select
                value={rollNumberSortOrder}
                onChange={(e) => setOnlyActiveSort("rollNumber", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Roll No</option>
                <option value="asc">Roll Low-High</option>
                <option value="desc">Roll High-Low</option>
              </select>

              <select
                value={classSortOrder}
                onChange={(e) => setOnlyActiveSort("class", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Class</option>
                <option value="asc">Class Low-High</option>
                <option value="desc">Class High-Low</option>
              </select>

              <select
                value={academicYearSortOrder}
                onChange={(e) => setOnlyActiveSort("academicYear", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Year</option>
                <option value="asc">Year Old-New</option>
                <option value="desc">Year New-Old</option>
              </select>

              <select
                value={dateSortOrder}
                onChange={(e) => setOnlyActiveSort("date", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Date</option>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            {tableLoading ? (
              <div className="p-6 text-center text-gray-600">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No students found</div>
            ) : (
              filteredStudents.map((student) => (
                <StudentCard key={student.StudentId} student={student} />
              ))
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">
                Loading students...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No students found
              </div>
            ) : (
              <table className="min-w-[1180px] w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Student Name</span>
                        <select
                          value={studentNameSortOrder}
                          onChange={(e) =>
                            setOnlyActiveSort("studentName", e.target.value)
                          }
                          className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Roll Number</span>
                        <select
                          value={rollNumberSortOrder}
                          onChange={(e) =>
                            setOnlyActiveSort("rollNumber", e.target.value)
                          }
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="asc">Low-Hi</option>
                          <option value="desc">High-Lo</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Class</span>
                        <select
                          value={classSortOrder}
                          onChange={(e) =>
                            setOnlyActiveSort("class", e.target.value)
                          }
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="asc">Low-Hi</option>
                          <option value="desc">High-Lo</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Section
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Academic Year</span>
                        <select
                          value={academicYearSortOrder}
                          onChange={(e) =>
                            setOnlyActiveSort("academicYear", e.target.value)
                          }
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="asc">Old-New</option>
                          <option value="desc">New-Old</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Status
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Created At</span>
                        <select
                          value={dateSortOrder}
                          onChange={(e) => setOnlyActiveSort("date", e.target.value)}
                          className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] text-black outline-none"
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
                  {filteredStudents.map((student) => (
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
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                            student.IsActive
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
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                              student.IsActive
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
            )}
          </div>
        </div>
      </div>

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