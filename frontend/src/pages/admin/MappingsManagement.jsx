import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const MappingsManagement = () => {
  const [teacherClassSubjectForm, setTeacherClassSubjectForm] = useState({
    teacherId: "",
    classId: "",
    subjectId: "",
  });

  const [parentStudentForm, setParentStudentForm] = useState({
    parentId: "",
    studentId: "",
  });

  const [editingTeacherMappingId, setEditingTeacherMappingId] = useState(null);
  const [editingParentMappingId, setEditingParentMappingId] = useState(null);

  const [showTeacherMappingModal, setShowTeacherMappingModal] = useState(false);
  const [showParentMappingModal, setShowParentMappingModal] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);

  const [teacherMappings, setTeacherMappings] = useState([]);
  const [parentMappings, setParentMappings] = useState([]);

  const [loadingTeacherMapping, setLoadingTeacherMapping] = useState(false);
  const [loadingParentMapping, setLoadingParentMapping] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  const [teacherMappingMessage, setTeacherMappingMessage] = useState("");
  const [teacherMappingError, setTeacherMappingError] = useState("");

  const [parentMappingMessage, setParentMappingMessage] = useState("");
  const [parentMappingError, setParentMappingError] = useState("");

  const [teacherSearch, setTeacherSearch] = useState("");
  const [parentSearch, setParentSearch] = useState("");

  const [teacherNameSort, setTeacherNameSort] = useState("default");
  const [teacherCodeSort, setTeacherCodeSort] = useState("default");
  const [teacherClassSort, setTeacherClassSort] = useState("default");
  const [teacherYearSort, setTeacherYearSort] = useState("default");
  const [teacherSubjectSort, setTeacherSubjectSort] = useState("default");

  const [parentNameSort, setParentNameSort] = useState("default");
  const [parentCodeSort, setParentCodeSort] = useState("default");
  const [studentNameSort, setStudentNameSort] = useState("default");
  const [rollNumberSort, setRollNumberSort] = useState("default");
  const [parentClassSort, setParentClassSort] = useState("default");
  const [parentYearSort, setParentYearSort] = useState("default");

  useEffect(() => {
    fetchDropdownData();
    fetchMappings();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchDropdownData = async () => {
    try {
      const [teachersRes, classesRes, subjectsRes, parentsRes, studentsRes] =
        await Promise.all([
          axios.get("/admin/teachers", { headers: getAuthHeaders() }),
          axios.get("/admin/classes", { headers: getAuthHeaders() }),
          axios.get("/admin/subjects", { headers: getAuthHeaders() }),
          axios.get("/admin/parents", { headers: getAuthHeaders() }),
          axios.get("/admin/students", { headers: getAuthHeaders() }),
        ]);

      if (teachersRes.data.success) setTeachers(teachersRes.data.data || []);
      if (classesRes.data.success) setClasses(classesRes.data.data || []);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.data || []);
      if (parentsRes.data.success) setParents(parentsRes.data.data || []);
      if (studentsRes.data.success) setStudents(studentsRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch mapping dropdown data:", error);
    }
  };

  const fetchMappings = async () => {
    try {
      setTableLoading(true);

      const [teacherMappingsRes, parentMappingsRes] = await Promise.all([
        axios.get("/admin/teacher-class-subject-mappings", {
          headers: getAuthHeaders(),
        }),
        axios.get("/admin/parent-student-mappings", {
          headers: getAuthHeaders(),
        }),
      ]);

      if (teacherMappingsRes.data.success) {
        setTeacherMappings(teacherMappingsRes.data.data || []);
      }

      if (parentMappingsRes.data.success) {
        setParentMappings(parentMappingsRes.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch mappings:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const handleTeacherClassSubjectChange = (e) => {
    setTeacherClassSubjectForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleParentStudentChange = (e) => {
    setParentStudentForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetTeacherClassSubjectForm = () => {
    setTeacherClassSubjectForm({
      teacherId: "",
      classId: "",
      subjectId: "",
    });
    setEditingTeacherMappingId(null);
    setTeacherMappingMessage("");
    setTeacherMappingError("");
  };

  const resetParentStudentForm = () => {
    setParentStudentForm({
      parentId: "",
      studentId: "",
    });
    setEditingParentMappingId(null);
    setParentMappingMessage("");
    setParentMappingError("");
  };

  const openTeacherMappingModal = () => {
    resetTeacherClassSubjectForm();
    setShowTeacherMappingModal(true);
  };

  const closeTeacherMappingModal = () => {
    resetTeacherClassSubjectForm();
    setShowTeacherMappingModal(false);
  };

  const openParentMappingModal = () => {
    resetParentStudentForm();
    setShowParentMappingModal(true);
  };

  const closeParentMappingModal = () => {
    resetParentStudentForm();
    setShowParentMappingModal(false);
  };

  const handleEditTeacherMapping = (item) => {
    setTeacherMappingMessage("");
    setTeacherMappingError("");
    setEditingTeacherMappingId(item.MappingId);
    setTeacherClassSubjectForm({
      teacherId: String(item.TeacherId),
      classId: String(item.ClassId),
      subjectId: String(item.SubjectId),
    });
    setShowTeacherMappingModal(true);
  };

  const handleEditParentMapping = (item) => {
    setParentMappingMessage("");
    setParentMappingError("");
    setEditingParentMappingId(item.MappingId);
    setParentStudentForm({
      parentId: String(item.ParentId),
      studentId: String(item.StudentId),
    });
    setShowParentMappingModal(true);
  };

  const handleTeacherClassSubjectSubmit = async (e) => {
    e.preventDefault();
    setTeacherMappingMessage("");
    setTeacherMappingError("");

    if (
      !teacherClassSubjectForm.teacherId ||
      !teacherClassSubjectForm.classId ||
      !teacherClassSubjectForm.subjectId
    ) {
      setTeacherMappingError("Teacher, class and subject are required");
      return;
    }

    try {
      setLoadingTeacherMapping(true);

      const payload = {
        teacherId: Number(teacherClassSubjectForm.teacherId),
        classId: Number(teacherClassSubjectForm.classId),
        subjectId: Number(teacherClassSubjectForm.subjectId),
      };

      const response = editingTeacherMappingId
        ? await axios.put(
            `/admin/update-teacher-class-subject-mapping/${editingTeacherMappingId}`,
            payload,
            { headers: getAuthHeaders() }
          )
        : await axios.post("/admin/map-teacher-class-subject", payload, {
            headers: getAuthHeaders(),
          });

      if (response.data.success) {
        setTeacherMappingMessage(
          response.data.message ||
            (editingTeacherMappingId
              ? "Teacher-Class-Subject mapping updated successfully"
              : "Teacher-Class-Subject mapping created successfully")
        );
        fetchMappings();
        setTimeout(() => {
          closeTeacherMappingModal();
        }, 900);
      }
    } catch (err) {
      setTeacherMappingError(
        err.response?.data?.message ||
          (editingTeacherMappingId
            ? "Failed to update teacher-class-subject mapping"
            : "Failed to create teacher-class-subject mapping")
      );
    } finally {
      setLoadingTeacherMapping(false);
    }
  };

  const handleParentStudentSubmit = async (e) => {
    e.preventDefault();
    setParentMappingMessage("");
    setParentMappingError("");

    if (!parentStudentForm.parentId || !parentStudentForm.studentId) {
      setParentMappingError("Parent and student are required");
      return;
    }

    try {
      setLoadingParentMapping(true);

      const payload = {
        parentId: Number(parentStudentForm.parentId),
        studentId: Number(parentStudentForm.studentId),
      };

      const response = editingParentMappingId
        ? await axios.put(
            `/admin/update-parent-student-mapping/${editingParentMappingId}`,
            payload,
            { headers: getAuthHeaders() }
          )
        : await axios.post("/admin/map-parent-student", payload, {
            headers: getAuthHeaders(),
          });

      if (response.data.success) {
        setParentMappingMessage(
          response.data.message ||
            (editingParentMappingId
              ? "Parent-Student mapping updated successfully"
              : "Parent-Student mapping created successfully")
        );
        fetchMappings();
        setTimeout(() => {
          closeParentMappingModal();
        }, 900);
      }
    } catch (err) {
      setParentMappingError(
        err.response?.data?.message ||
          (editingParentMappingId
            ? "Failed to update parent-student mapping"
            : "Failed to create parent-student mapping")
      );
    } finally {
      setLoadingParentMapping(false);
    }
  };

  const handleDeleteTeacherMapping = async (mappingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher-class-subject mapping?"
    );
    if (!confirmed) return;

    try {
      setTeacherMappingMessage("");
      setTeacherMappingError("");

      const response = await axios.delete(
        `/admin/delete-teacher-class-subject-mapping/${mappingId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setTeacherMappingMessage(
          response.data.message ||
            "Teacher-Class-Subject mapping deleted successfully"
        );
        if (editingTeacherMappingId === mappingId) resetTeacherClassSubjectForm();
        fetchMappings();
      }
    } catch (err) {
      setTeacherMappingError(
        err.response?.data?.message ||
          "Failed to delete teacher-class-subject mapping"
      );
    }
  };

  const handleDeleteParentMapping = async (mappingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this parent-student mapping?"
    );
    if (!confirmed) return;

    try {
      setParentMappingMessage("");
      setParentMappingError("");

      const response = await axios.delete(
        `/admin/delete-parent-student-mapping/${mappingId}`,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setParentMappingMessage(
          response.data.message || "Parent-Student mapping deleted successfully"
        );
        if (editingParentMappingId === mappingId) resetParentStudentForm();
        fetchMappings();
      }
    } catch (err) {
      setParentMappingError(
        err.response?.data?.message ||
          "Failed to delete parent-student mapping"
      );
    }
  };

  const resetTeacherSorts = () => {
    setTeacherNameSort("default");
    setTeacherCodeSort("default");
    setTeacherClassSort("default");
    setTeacherYearSort("default");
    setTeacherSubjectSort("default");
  };

  const setOnlyTeacherSort = (type, value) => {
    resetTeacherSorts();
    if (type === "teacherName") setTeacherNameSort(value);
    if (type === "teacherCode") setTeacherCodeSort(value);
    if (type === "teacherClass") setTeacherClassSort(value);
    if (type === "teacherYear") setTeacherYearSort(value);
    if (type === "teacherSubject") setTeacherSubjectSort(value);
  };

  const resetParentSorts = () => {
    setParentNameSort("default");
    setParentCodeSort("default");
    setStudentNameSort("default");
    setRollNumberSort("default");
    setParentClassSort("default");
    setParentYearSort("default");
  };

  const setOnlyParentSort = (type, value) => {
    resetParentSorts();
    if (type === "parentName") setParentNameSort(value);
    if (type === "parentCode") setParentCodeSort(value);
    if (type === "studentName") setStudentNameSort(value);
    if (type === "rollNumber") setRollNumberSort(value);
    if (type === "parentClass") setParentClassSort(value);
    if (type === "parentYear") setParentYearSort(value);
  };

  const handleClearTeacherFilters = () => {
    setTeacherSearch("");
    resetTeacherSorts();
  };

  const handleClearParentFilters = () => {
    setParentSearch("");
    resetParentSorts();
  };

  const getClassSortValue = (item) => {
    const raw = String(item.ClassName || "").trim();
    const num = Number(raw);
    if (!Number.isNaN(num) && raw !== "") return { isNumeric: true, value: num };
    return { isNumeric: false, value: raw.toLowerCase() };
  };

  const getAcademicYearSortValue = (item) => {
    const raw = String(item.AcademicYear || "");
    const firstYear = raw.split("-")[0]?.trim();
    const num = Number(firstYear);
    return Number.isNaN(num) ? 0 : num;
  };

  const getRollNumberSortValue = (item) => {
    const raw = String(item.RollNumber ?? "").trim();
    const num = Number(raw);
    return Number.isNaN(num) ? Number.MAX_SAFE_INTEGER : num;
  };

  const filteredTeacherMappings = useMemo(() => {
    let result = teacherMappings.filter((item) => {
      const q = teacherSearch.toLowerCase();
      return (
        item.TeacherName?.toLowerCase().includes(q) ||
        item.TeacherCode?.toLowerCase().includes(q) ||
        item.ClassName?.toLowerCase().includes(q) ||
        item.Section?.toLowerCase().includes(q) ||
        item.SubjectName?.toLowerCase().includes(q)
      );
    });

    if (teacherNameSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.TeacherName || "").localeCompare(String(b.TeacherName || ""))
      );
    } else if (teacherNameSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.TeacherName || "").localeCompare(String(a.TeacherName || ""))
      );
    } else if (teacherCodeSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.TeacherCode || "").localeCompare(String(b.TeacherCode || ""), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else if (teacherCodeSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.TeacherCode || "").localeCompare(String(a.TeacherCode || ""), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else if (teacherClassSort === "asc") {
      result = [...result].sort((a, b) => {
        const av = getClassSortValue(a);
        const bv = getClassSortValue(b);
        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    } else if (teacherClassSort === "desc") {
      result = [...result].sort((a, b) => {
        const av = getClassSortValue(a);
        const bv = getClassSortValue(b);
        if (av.isNumeric && bv.isNumeric) return bv.value - av.value;
        if (av.isNumeric && !bv.isNumeric) return 1;
        if (!av.isNumeric && bv.isNumeric) return -1;
        return String(bv.value).localeCompare(String(av.value));
      });
    } else if (teacherYearSort === "asc") {
      result = [...result].sort(
        (a, b) => getAcademicYearSortValue(a) - getAcademicYearSortValue(b)
      );
    } else if (teacherYearSort === "desc") {
      result = [...result].sort(
        (a, b) => getAcademicYearSortValue(b) - getAcademicYearSortValue(a)
      );
    } else if (teacherSubjectSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.SubjectName || "").localeCompare(String(b.SubjectName || ""))
      );
    } else if (teacherSubjectSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.SubjectName || "").localeCompare(String(a.SubjectName || ""))
      );
    }

    return result;
  }, [
    teacherMappings,
    teacherSearch,
    teacherNameSort,
    teacherCodeSort,
    teacherClassSort,
    teacherYearSort,
    teacherSubjectSort,
  ]);

  const filteredParentMappings = useMemo(() => {
    let result = parentMappings.filter((item) => {
      const q = parentSearch.toLowerCase();
      return (
        item.ParentName?.toLowerCase().includes(q) ||
        item.ParentCode?.toLowerCase().includes(q) ||
        item.StudentName?.toLowerCase().includes(q) ||
        item.ClassName?.toLowerCase().includes(q) ||
        item.Section?.toLowerCase().includes(q)
      );
    });

    if (parentNameSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.ParentName || "").localeCompare(String(b.ParentName || ""))
      );
    } else if (parentNameSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.ParentName || "").localeCompare(String(a.ParentName || ""))
      );
    } else if (parentCodeSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.ParentCode || "").localeCompare(String(b.ParentCode || ""), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else if (parentCodeSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.ParentCode || "").localeCompare(String(a.ParentCode || ""), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else if (studentNameSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.StudentName || "").localeCompare(String(b.StudentName || ""))
      );
    } else if (studentNameSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.StudentName || "").localeCompare(String(a.StudentName || ""))
      );
    } else if (rollNumberSort === "asc") {
      result = [...result].sort(
        (a, b) => getRollNumberSortValue(a) - getRollNumberSortValue(b)
      );
    } else if (rollNumberSort === "desc") {
      result = [...result].sort(
        (a, b) => getRollNumberSortValue(b) - getRollNumberSortValue(a)
      );
    } else if (parentClassSort === "asc") {
      result = [...result].sort((a, b) => {
        const av = getClassSortValue(a);
        const bv = getClassSortValue(b);
        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    } else if (parentClassSort === "desc") {
      result = [...result].sort((a, b) => {
        const av = getClassSortValue(a);
        const bv = getClassSortValue(b);
        if (av.isNumeric && bv.isNumeric) return bv.value - av.value;
        if (av.isNumeric && !bv.isNumeric) return 1;
        if (!av.isNumeric && bv.isNumeric) return -1;
        return String(bv.value).localeCompare(String(av.value));
      });
    } else if (parentYearSort === "asc") {
      result = [...result].sort(
        (a, b) => getAcademicYearSortValue(a) - getAcademicYearSortValue(b)
      );
    } else if (parentYearSort === "desc") {
      result = [...result].sort(
        (a, b) => getAcademicYearSortValue(b) - getAcademicYearSortValue(a)
      );
    }

    return result;
  }, [
    parentMappings,
    parentSearch,
    parentNameSort,
    parentCodeSort,
    studentNameSort,
    rollNumberSort,
    parentClassSort,
    parentYearSort,
  ]);

  const TeacherMappingCard = ({ item }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Teacher</p>
          <p className="font-semibold text-black break-words">{item.TeacherName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Teacher Code</p>
          <p className="font-semibold text-[#a57f42] break-words">{item.TeacherCode}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="text-black">{item.ClassName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Section</p>
          <p className="text-black">{item.Section}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Academic Year</p>
          <p className="text-black">{item.AcademicYear}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Subject</p>
          <p className="text-black break-words">{item.SubjectName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleEditTeacherMapping(item)}
          className="w-full rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteTeacherMapping(item.MappingId)}
          className="w-full rounded-xl bg-gray-900 text-white hover:bg-black px-4 py-2 text-sm font-semibold"
        >
          Delete
        </button>
      </div>
    </div>
  );

  const ParentMappingCard = ({ item }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Parent</p>
          <p className="font-semibold text-black break-words">{item.ParentName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Parent Code</p>
          <p className="font-semibold text-[#a57f42] break-words">{item.ParentCode}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Student</p>
          <p className="text-black break-words">{item.StudentName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Roll Number</p>
          <p className="text-black">{item.RollNumber || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="text-black">{item.ClassName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Section</p>
          <p className="text-black">{item.Section}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Academic Year</p>
          <p className="text-black">{item.AcademicYear}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleEditParentMapping(item)}
          className="w-full rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteParentMapping(item.MappingId)}
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
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 rounded-[22px] sm:rounded-[28px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-black">
              Mapping Actions
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Create teacher and parent mappings from one place
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto">
            <button
              onClick={openTeacherMappingModal}
              className="w-full rounded-2xl bg-[#b79257] hover:bg-[#a57f42] text-black px-4 sm:px-5 py-3 text-sm font-semibold shadow-sm transition"
            >
              Create Teacher Mapping
            </button>

            <button
              onClick={openParentMappingModal}
              className="w-full rounded-2xl bg-black text-white px-4 sm:px-5 py-3 text-sm font-semibold shadow-sm transition"
            >
              Create Parent Mapping
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Teacher Mappings
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {teacherMappings.length}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Teacher-Class-Subject records
            </p>
          </div>

          <div className="rounded-[20px] sm:rounded-[24px] border border-[#d8c3a0] bg-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
              Parent Mappings
            </p>
            <h3 className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-bold text-black">
              {parentMappings.length}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-500">
              Parent-Student records
            </p>
          </div>
        </div>

        <div className="rounded-[22px] sm:rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-4 sm:px-6 py-4 sm:py-5 border-b border-[#dcc7a6] space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black">
                Teacher-Class-Subject Mappings
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Total Mappings: {filteredTeacherMappings.length}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClearTeacherFilters}
                className="w-full sm:w-auto rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
              >
                Clear
              </button>
            </div>

            <input
              type="text"
              placeholder="Search teacher, class or subject"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            />
          </div>

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select
                value={teacherNameSort}
                onChange={(e) => setOnlyTeacherSort("teacherName", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Teacher</option>
                <option value="asc">Teacher A-Z</option>
                <option value="desc">Teacher Z-A</option>
              </select>

              <select
                value={teacherCodeSort}
                onChange={(e) => setOnlyTeacherSort("teacherCode", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Code</option>
                <option value="asc">Code A-Z</option>
                <option value="desc">Code Z-A</option>
              </select>

              <select
                value={teacherClassSort}
                onChange={(e) => setOnlyTeacherSort("teacherClass", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Class</option>
                <option value="asc">Class Low-High</option>
                <option value="desc">Class High-Low</option>
              </select>

              <select
                value={teacherYearSort}
                onChange={(e) => setOnlyTeacherSort("teacherYear", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Year</option>
                <option value="asc">Year Old-New</option>
                <option value="desc">Year New-Old</option>
              </select>

              <select
                value={teacherSubjectSort}
                onChange={(e) => setOnlyTeacherSort("teacherSubject", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Subject</option>
                <option value="asc">Subject A-Z</option>
                <option value="desc">Subject Z-A</option>
              </select>
            </div>

            {tableLoading ? (
              <div className="p-6 text-center text-gray-600">Loading mappings...</div>
            ) : filteredTeacherMappings.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No mappings found</div>
            ) : (
              filteredTeacherMappings.map((item) => (
                <TeacherMappingCard key={item.MappingId} item={item} />
              ))
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">Loading mappings...</div>
            ) : filteredTeacherMappings.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No mappings found</div>
            ) : (
              <table className="min-w-[1080px] w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Teacher</span>
                        <select
                          value={teacherNameSort}
                          onChange={(e) => setOnlyTeacherSort("teacherName", e.target.value)}
                          className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Teacher Code</span>
                        <select
                          value={teacherCodeSort}
                          onChange={(e) => setOnlyTeacherSort("teacherCode", e.target.value)}
                          className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Class</span>
                        <select
                          value={teacherClassSort}
                          onChange={(e) => setOnlyTeacherSort("teacherClass", e.target.value)}
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">Low-Hi</option>
                          <option value="desc">High-Lo</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">Section</th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Academic Year</span>
                        <select
                          value={teacherYearSort}
                          onChange={(e) => setOnlyTeacherSort("teacherYear", e.target.value)}
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">Old-New</option>
                          <option value="desc">New-Old</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Subject</span>
                        <select
                          value={teacherSubjectSort}
                          onChange={(e) => setOnlyTeacherSort("teacherSubject", e.target.value)}
                          className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeacherMappings.map((item) => (
                    <tr key={item.MappingId} className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]">
                      <td className="px-3 py-4 text-black max-w-[110px] truncate" title={item.TeacherName}>
                        {item.TeacherName}
                      </td>
                      <td className="px-3 py-4 text-[#a57f42] font-semibold max-w-[110px] truncate" title={item.TeacherCode}>
                        {item.TeacherCode}
                      </td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">{item.ClassName}</td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">{item.Section}</td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">{item.AcademicYear}</td>
                      <td className="px-3 py-4 text-gray-700 max-w-[110px] truncate" title={item.SubjectName}>
                        {item.SubjectName}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col gap-2 w-[88px]">
                          <button
                            onClick={() => handleEditTeacherMapping(item)}
                            className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTeacherMapping(item.MappingId)}
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

        <div className="rounded-[22px] sm:rounded-[28px] border border-[#d8c3a0] bg-white shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-4 sm:px-6 py-4 sm:py-5 border-b border-[#dcc7a6] space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black">
                Parent-Student Mappings
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Total Mappings: {filteredParentMappings.length}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClearParentFilters}
                className="w-full sm:w-auto rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
              >
                Clear
              </button>
            </div>

            <input
              type="text"
              placeholder="Search parent, student or class"
              value={parentSearch}
              onChange={(e) => setParentSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            />
          </div>

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <select
                value={parentNameSort}
                onChange={(e) => setOnlyParentSort("parentName", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Parent</option>
                <option value="asc">Parent A-Z</option>
                <option value="desc">Parent Z-A</option>
              </select>

              <select
                value={parentCodeSort}
                onChange={(e) => setOnlyParentSort("parentCode", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Code</option>
                <option value="asc">Code A-Z</option>
                <option value="desc">Code Z-A</option>
              </select>

              <select
                value={studentNameSort}
                onChange={(e) => setOnlyParentSort("studentName", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Student</option>
                <option value="asc">Student A-Z</option>
                <option value="desc">Student Z-A</option>
              </select>

              <select
                value={rollNumberSort}
                onChange={(e) => setOnlyParentSort("rollNumber", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Roll No</option>
                <option value="asc">Roll Low-High</option>
                <option value="desc">Roll High-Low</option>
              </select>

              <select
                value={parentClassSort}
                onChange={(e) => setOnlyParentSort("parentClass", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Class</option>
                <option value="asc">Class Low-High</option>
                <option value="desc">Class High-Low</option>
              </select>

              <select
                value={parentYearSort}
                onChange={(e) => setOnlyParentSort("parentYear", e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Year</option>
                <option value="asc">Year Old-New</option>
                <option value="desc">Year New-Old</option>
              </select>
            </div>

            {tableLoading ? (
              <div className="p-6 text-center text-gray-600">Loading mappings...</div>
            ) : filteredParentMappings.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No mappings found</div>
            ) : (
              filteredParentMappings.map((item) => (
                <ParentMappingCard key={item.MappingId} item={item} />
              ))
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">Loading mappings...</div>
            ) : filteredParentMappings.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No mappings found</div>
            ) : (
              <table className="min-w-[1180px] w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Parent</span>
                        <select
                          value={parentNameSort}
                          onChange={(e) => setOnlyParentSort("parentName", e.target.value)}
                          className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Parent Code</span>
                        <select
                          value={parentCodeSort}
                          onChange={(e) => setOnlyParentSort("parentCode", e.target.value)}
                          className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">A-Z</option>
                          <option value="desc">Z-A</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Student</span>
                        <select
                          value={studentNameSort}
                          onChange={(e) => setOnlyParentSort("studentName", e.target.value)}
                          className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
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
                          value={rollNumberSort}
                          onChange={(e) => setOnlyParentSort("rollNumber", e.target.value)}
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
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
                          value={parentClassSort}
                          onChange={(e) => setOnlyParentSort("parentClass", e.target.value)}
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">Low-Hi</option>
                          <option value="desc">High-Lo</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">Section</th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                      <div className="flex flex-col gap-2">
                        <span>Academic Year</span>
                        <select
                          value={parentYearSort}
                          onChange={(e) => setOnlyParentSort("parentYear", e.target.value)}
                          className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px]"
                        >
                          <option value="default">Def</option>
                          <option value="asc">Old-New</option>
                          <option value="desc">New-Old</option>
                        </select>
                      </div>
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParentMappings.map((item) => (
                    <tr key={item.MappingId} className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]">
                      <td className="px-3 py-4 text-black max-w-[110px] truncate" title={item.ParentName}>
                        {item.ParentName}
                      </td>
                      <td className="px-3 py-4 text-[#a57f42] font-semibold max-w-[110px] truncate" title={item.ParentCode}>
                        {item.ParentCode}
                      </td>
                      <td className="px-3 py-4 text-gray-700 max-w-[110px] truncate" title={item.StudentName}>
                        {item.StudentName}
                      </td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">{item.RollNumber || "-"}</td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">{item.ClassName}</td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">{item.Section}</td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">{item.AcademicYear}</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col gap-2 w-[88px]">
                          <button
                            onClick={() => handleEditParentMapping(item)}
                            className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 text-xs font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteParentMapping(item.MappingId)}
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

      {showTeacherMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 sm:px-4 py-4">
          <div className="relative w-full max-w-[720px] max-h-[90vh] overflow-y-auto rounded-[24px] sm:rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl">
            <button
              onClick={closeTeacherMappingModal}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-lg sm:text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-5 sm:px-8 py-5 sm:py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {editingTeacherMappingId
                  ? "Edit Teacher Mapping"
                  : "Create Teacher Mapping"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#ece1cf]">
                {editingTeacherMappingId
                  ? "Update teacher-class-subject mapping"
                  : "Create teacher-class-subject mapping"}
              </p>
            </div>

            <form
              onSubmit={handleTeacherClassSubjectSubmit}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              <select
                name="teacherId"
                value={teacherClassSubjectForm.teacherId}
                onChange={handleTeacherClassSubjectChange}
                className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base outline-none"
              >
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.TeacherId} value={teacher.TeacherId}>
                    {teacher.FullName} ({teacher.TeacherCode})
                  </option>
                ))}
              </select>

              <select
                name="classId"
                value={teacherClassSubjectForm.classId}
                onChange={handleTeacherClassSubjectChange}
                className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base outline-none"
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls.ClassId} value={cls.ClassId}>
                    {cls.ClassName} - {cls.Section} ({cls.AcademicYear})
                  </option>
                ))}
              </select>

              <select
                name="subjectId"
                value={teacherClassSubjectForm.subjectId}
                onChange={handleTeacherClassSubjectChange}
                className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base outline-none"
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.SubjectId} value={subject.SubjectId}>
                    {subject.SubjectName}
                  </option>
                ))}
              </select>

              {teacherMappingMessage && (
                <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {teacherMappingMessage}
                </div>
              )}

              {teacherMappingError && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {teacherMappingError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loadingTeacherMapping}
                  className="flex-1 rounded-[20px] sm:rounded-[22px] bg-[#b79257] hover:bg-[#a57f42] text-black font-semibold py-3.5 sm:py-4 text-base sm:text-lg shadow-md transition"
                >
                  {loadingTeacherMapping
                    ? editingTeacherMappingId
                      ? "Updating..."
                      : "Saving..."
                    : editingTeacherMappingId
                    ? "Update Mapping"
                    : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={closeTeacherMappingModal}
                  className="rounded-[20px] sm:rounded-[22px] bg-black text-white px-6 py-3.5 sm:py-4 text-sm sm:text-base font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showParentMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 sm:px-4 py-4">
          <div className="relative w-full max-w-[720px] max-h-[90vh] overflow-y-auto rounded-[24px] sm:rounded-[30px] border border-[#d8c3a0] bg-white shadow-2xl">
            <button
              onClick={closeParentMappingModal}
              className="absolute right-3 sm:right-4 top-3 sm:top-4 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f6efe4] text-lg sm:text-xl"
            >
              ×
            </button>

            <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-5 sm:px-8 py-5 sm:py-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {editingParentMappingId
                  ? "Edit Parent Mapping"
                  : "Create Parent Mapping"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#ece1cf]">
                {editingParentMappingId
                  ? "Update parent-student mapping"
                  : "Create parent-student mapping"}
              </p>
            </div>

            <form
              onSubmit={handleParentStudentSubmit}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              <select
                name="parentId"
                value={parentStudentForm.parentId}
                onChange={handleParentStudentChange}
                className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base outline-none"
              >
                <option value="">Select parent</option>
                {parents.map((parent) => (
                  <option key={parent.ParentId} value={parent.ParentId}>
                    {parent.FullName} ({parent.ParentCode})
                  </option>
                ))}
              </select>

              <select
                name="studentId"
                value={parentStudentForm.studentId}
                onChange={handleParentStudentChange}
                className="w-full rounded-[20px] sm:rounded-[24px] border border-[#b9c7da] bg-[#dfe7f5] px-4 sm:px-5 py-3.5 sm:py-4 text-base outline-none"
              >
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.StudentId} value={student.StudentId}>
                    {student.StudentName} - {student.ClassName} {student.Section}
                  </option>
                ))}
              </select>

              {parentMappingMessage && (
                <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {parentMappingMessage}
                </div>
              )}

              {parentMappingError && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {parentMappingError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loadingParentMapping}
                  className="flex-1 rounded-[20px] sm:rounded-[22px] bg-[#b79257] hover:bg-[#a57f42] text-black font-semibold py-3.5 sm:py-4 text-base sm:text-lg shadow-md transition"
                >
                  {loadingParentMapping
                    ? editingParentMappingId
                      ? "Updating..."
                      : "Saving..."
                    : editingParentMappingId
                    ? "Update Mapping"
                    : "Saved"}
                </button>

                <button
                  type="button"
                  onClick={closeParentMappingModal}
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

export default MappingsManagement;