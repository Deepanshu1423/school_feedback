import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import axios from "../../api/axios";

const searchableSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "56px",
    borderRadius: "24px",
    borderColor: state.isFocused ? "#b79257" : "#b9c7da",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(183, 146, 87, 0.2)" : "none",
    backgroundColor: "#dfe7f5",
    "&:hover": {
      borderColor: "#b79257",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 16px",
  }),
  input: (base) => ({
    ...base,
    color: "#111827",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#6b7280",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "18px",
    overflow: "hidden",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f3eadb" : "white",
    color: "#111827",
    cursor: "pointer",
  }),
};

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

  const [teacherNameSort, setTeacherNameSort] = useState("");
  const [teacherCodeSort, setTeacherCodeSort] = useState("");
  const [teacherClassSort, setTeacherClassSort] = useState("");
  const [teacherYearSort, setTeacherYearSort] = useState("");
  const [teacherSubjectSort, setTeacherSubjectSort] = useState("");

  const [parentNameSort, setParentNameSort] = useState("");
  const [parentCodeSort, setParentCodeSort] = useState("");
  const [studentNameSort, setStudentNameSort] = useState("");
  const [rollNumberSort, setRollNumberSort] = useState("");
  const [parentClassSort, setParentClassSort] = useState("");
  const [parentYearSort, setParentYearSort] = useState("");

  const [teacherCurrentPage, setTeacherCurrentPage] = useState(1);
  const [parentCurrentPage, setParentCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchDropdownData();
    fetchMappings();
  }, []);

  useEffect(() => {
    setTeacherCurrentPage(1);
  }, [
    teacherSearch,
    teacherNameSort,
    teacherCodeSort,
    teacherClassSort,
    teacherYearSort,
    teacherSubjectSort,
  ]);

  useEffect(() => {
    setParentCurrentPage(1);
  }, [
    parentSearch,
    parentNameSort,
    parentCodeSort,
    studentNameSort,
    rollNumberSort,
    parentClassSort,
    parentYearSort,
  ]);

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
          axios.get("/admin/active-teachers", { headers: getAuthHeaders() }),
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

  const handleTeacherMappingSelectChange = (fieldName, selectedOption) => {
    setTeacherClassSubjectForm((prev) => ({
      ...prev,
      [fieldName]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleParentMappingSelectChange = (fieldName, selectedOption) => {
    setParentStudentForm((prev) => ({
      ...prev,
      [fieldName]: selectedOption ? selectedOption.value : "",
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
        if (editingTeacherMappingId === mappingId) {
          resetTeacherClassSubjectForm();
        }
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
        if (editingParentMappingId === mappingId) {
          resetParentStudentForm();
        }
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
    setTeacherNameSort("");
    setTeacherCodeSort("");
    setTeacherClassSort("");
    setTeacherYearSort("");
    setTeacherSubjectSort("");
  };

  const resetParentSorts = () => {
    setParentNameSort("");
    setParentCodeSort("");
    setStudentNameSort("");
    setRollNumberSort("");
    setParentClassSort("");
    setParentYearSort("");
  };

  const toggleTeacherSort = (type) => {
    if (type === "teacherName") {
      const next =
        teacherNameSort === "" ? "asc" : teacherNameSort === "asc" ? "desc" : "";
      resetTeacherSorts();
      setTeacherNameSort(next);
    }

    if (type === "teacherCode") {
      const next =
        teacherCodeSort === "" ? "asc" : teacherCodeSort === "asc" ? "desc" : "";
      resetTeacherSorts();
      setTeacherCodeSort(next);
    }

    if (type === "teacherClass") {
      const next =
        teacherClassSort === "" ? "asc" : teacherClassSort === "asc" ? "desc" : "";
      resetTeacherSorts();
      setTeacherClassSort(next);
    }

    if (type === "teacherYear") {
      const next =
        teacherYearSort === "" ? "asc" : teacherYearSort === "asc" ? "desc" : "";
      resetTeacherSorts();
      setTeacherYearSort(next);
    }

    if (type === "teacherSubject") {
      const next =
        teacherSubjectSort === "" ? "asc" : teacherSubjectSort === "asc" ? "desc" : "";
      resetTeacherSorts();
      setTeacherSubjectSort(next);
    }
  };

  const toggleParentSort = (type) => {
    if (type === "parentName") {
      const next =
        parentNameSort === "" ? "asc" : parentNameSort === "asc" ? "desc" : "";
      resetParentSorts();
      setParentNameSort(next);
    }

    if (type === "parentCode") {
      const next =
        parentCodeSort === "" ? "asc" : parentCodeSort === "asc" ? "desc" : "";
      resetParentSorts();
      setParentCodeSort(next);
    }

    if (type === "studentName") {
      const next =
        studentNameSort === "" ? "asc" : studentNameSort === "asc" ? "desc" : "";
      resetParentSorts();
      setStudentNameSort(next);
    }

    if (type === "rollNumber") {
      const next =
        rollNumberSort === "" ? "asc" : rollNumberSort === "asc" ? "desc" : "";
      resetParentSorts();
      setRollNumberSort(next);
    }

    if (type === "parentClass") {
      const next =
        parentClassSort === "" ? "asc" : parentClassSort === "asc" ? "desc" : "";
      resetParentSorts();
      setParentClassSort(next);
    }

    if (type === "parentYear") {
      const next =
        parentYearSort === "" ? "asc" : parentYearSort === "asc" ? "desc" : "";
      resetParentSorts();
      setParentYearSort(next);
    }
  };

  const getSortIndicator = (sortValue) => {
    if (sortValue === "asc") return " ↑";
    if (sortValue === "desc") return " ↓";
    return "";
  };

  const handleClearTeacherFilters = () => {
    setTeacherSearch("");
    resetTeacherSorts();
    setTeacherCurrentPage(1);
  };

  const handleClearParentFilters = () => {
    setParentSearch("");
    resetParentSorts();
    setParentCurrentPage(1);
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
        String(a.TeacherCode || "").localeCompare(
          String(b.TeacherCode || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        )
      );
    } else if (teacherCodeSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.TeacherCode || "").localeCompare(
          String(a.TeacherCode || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        )
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
        String(a.ParentCode || "").localeCompare(
          String(b.ParentCode || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        )
      );
    } else if (parentCodeSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.ParentCode || "").localeCompare(
          String(a.ParentCode || ""),
          undefined,
          { numeric: true, sensitivity: "base" }
        )
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

  const teacherTotalPages = Math.ceil(
    filteredTeacherMappings.length / ITEMS_PER_PAGE
  );

  const paginatedTeacherMappings = useMemo(() => {
    const startIndex = (teacherCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTeacherMappings.slice(startIndex, endIndex);
  }, [filteredTeacherMappings, teacherCurrentPage]);

  const parentTotalPages = Math.ceil(
    filteredParentMappings.length / ITEMS_PER_PAGE
  );

  const paginatedParentMappings = useMemo(() => {
    const startIndex = (parentCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredParentMappings.slice(startIndex, endIndex);
  }, [filteredParentMappings, parentCurrentPage]);

  const goToTeacherPreviousPage = () => {
    if (teacherCurrentPage > 1) {
      setTeacherCurrentPage((prev) => prev - 1);
    }
  };

  const goToTeacherNextPage = () => {
    if (teacherCurrentPage < teacherTotalPages) {
      setTeacherCurrentPage((prev) => prev + 1);
    }
  };

  const goToTeacherPage = (pageNumber) => {
    setTeacherCurrentPage(pageNumber);
  };

  const goToParentPreviousPage = () => {
    if (parentCurrentPage > 1) {
      setParentCurrentPage((prev) => prev - 1);
    }
  };

  const goToParentNextPage = () => {
    if (parentCurrentPage < parentTotalPages) {
      setParentCurrentPage((prev) => prev + 1);
    }
  };

  const goToParentPage = (pageNumber) => {
    setParentCurrentPage(pageNumber);
  };

  const getVisibleTeacherPages = () => {
    const pages = [];

    if (teacherTotalPages <= 7) {
      for (let i = 1; i <= teacherTotalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (teacherCurrentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(2, teacherCurrentPage - 1);
    const endPage = Math.min(teacherTotalPages - 1, teacherCurrentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (teacherCurrentPage < teacherTotalPages - 2) {
      pages.push("...");
    }

    pages.push(teacherTotalPages);

    return pages;
  };

  const getVisibleParentPages = () => {
    const pages = [];

    if (parentTotalPages <= 7) {
      for (let i = 1; i <= parentTotalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (parentCurrentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(2, parentCurrentPage - 1);
    const endPage = Math.min(parentTotalPages - 1, parentCurrentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (parentCurrentPage < parentTotalPages - 2) {
      pages.push("...");
    }

    pages.push(parentTotalPages);

    return pages;
  };

  const teacherOptions = teachers.map((teacher) => ({
    value: String(teacher.TeacherId),
    label: `${teacher.FullName} (${teacher.TeacherCode})`,
  }));

  const classOptions = classes.map((cls) => ({
    value: String(cls.ClassId),
    label: `${cls.ClassName} - ${cls.Section} (${cls.AcademicYear})`,
  }));

  const subjectOptions = subjects.map((subject) => ({
    value: String(subject.SubjectId),
    label: subject.SubjectName,
  }));

  const parentOptions = parents.map((parent) => ({
    value: String(parent.ParentId),
    label: `${parent.FullName} (${parent.ParentCode})`,
  }));

  const studentOptions = students.map((student) => ({
    value: String(student.StudentId),
    label: `${student.StudentName}${
      student.RollNumber ? ` (${student.RollNumber})` : ""
    }`,
  }));

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
              <input
                type="text"
                placeholder="Search teacher, class or subject"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
              />

              <button
                onClick={handleClearTeacherFilters}
                className="w-full sm:w-auto sm:min-w-[90px] rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => toggleTeacherSort("teacherName")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Teacher{getSortIndicator(teacherNameSort)}
              </button>

              <button
                onClick={() => toggleTeacherSort("teacherCode")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Code{getSortIndicator(teacherCodeSort)}
              </button>

              <button
                onClick={() => toggleTeacherSort("teacherClass")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Class{getSortIndicator(teacherClassSort)}
              </button>

              <button
                onClick={() => toggleTeacherSort("teacherYear")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Year{getSortIndicator(teacherYearSort)}
              </button>

              <button
                onClick={() => toggleTeacherSort("teacherSubject")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Subject{getSortIndicator(teacherSubjectSort)}
              </button>
            </div>

            {tableLoading ? (
              <div className="p-6 text-center text-gray-600">Loading mappings...</div>
            ) : paginatedTeacherMappings.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No mappings found</div>
            ) : (
              paginatedTeacherMappings.map((item) => (
                <TeacherMappingCard key={item.MappingId} item={item} />
              ))
            )}

            {filteredTeacherMappings.length > 0 && teacherTotalPages > 1 && (
              <div className="rounded-2xl border border-[#d6c2a8] bg-white p-4 shadow-sm">
                <p className="mb-4 text-center text-sm text-[#6b7280]">
                  Showing {(teacherCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(
                    teacherCurrentPage * ITEMS_PER_PAGE,
                    filteredTeacherMappings.length
                  )}{" "}
                  of {filteredTeacherMappings.length} teacher mappings
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => goToTeacherPage(1)}
                    disabled={teacherCurrentPage === 1}
                    className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ≪
                  </button>

                  <button
                    onClick={goToTeacherPreviousPage}
                    disabled={teacherCurrentPage === 1}
                    className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ‹
                  </button>

                  {getVisibleTeacherPages().map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`teacher-ellipsis-mobile-${index}`}
                        className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl px-2 text-base font-semibold text-[#6b7280]"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`teacher-mobile-${page}`}
                        onClick={() => goToTeacherPage(page)}
                        className={`h-11 min-w-[44px] rounded-2xl px-3 text-base font-semibold transition ${
                          teacherCurrentPage === page
                            ? "bg-blue-500 text-white shadow-md"
                            : "border border-[#d6c2a8] bg-white text-[#1a1a1a] hover:bg-[#efe4d2]"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={goToTeacherNextPage}
                    disabled={teacherCurrentPage === teacherTotalPages}
                    className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ›
                  </button>

                  <button
                    onClick={() => goToTeacherPage(teacherTotalPages)}
                    disabled={teacherCurrentPage === teacherTotalPages}
                    className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ≫
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">Loading mappings...</div>
            ) : paginatedTeacherMappings.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No mappings found</div>
            ) : (
              <>
                <table className="min-w-[1080px] w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleTeacherSort("teacherName")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Teacher{getSortIndicator(teacherNameSort)}
                      </th>
                      <th
                        onClick={() => toggleTeacherSort("teacherCode")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Teacher Code{getSortIndicator(teacherCodeSort)}
                      </th>
                      <th
                        onClick={() => toggleTeacherSort("teacherClass")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Class{getSortIndicator(teacherClassSort)}
                      </th>
                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Section
                      </th>
                      <th
                        onClick={() => toggleTeacherSort("teacherYear")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Academic Year{getSortIndicator(teacherYearSort)}
                      </th>
                      <th
                        onClick={() => toggleTeacherSort("teacherSubject")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Subject{getSortIndicator(teacherSubjectSort)}
                      </th>
                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTeacherMappings.map((item) => (
                      <tr
                        key={item.MappingId}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td
                          className="px-3 py-4 text-black max-w-[110px] truncate"
                          title={item.TeacherName}
                        >
                          {item.TeacherName}
                        </td>
                        <td
                          className="px-3 py-4 text-[#a57f42] font-semibold max-w-[110px] truncate"
                          title={item.TeacherCode}
                        >
                          {item.TeacherCode}
                        </td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.ClassName}
                        </td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.Section}
                        </td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.AcademicYear}
                        </td>
                        <td
                          className="px-3 py-4 text-gray-700 max-w-[110px] truncate"
                          title={item.SubjectName}
                        >
                          {item.SubjectName}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                            <button
                              onClick={() => handleEditTeacherMapping(item)}
                              className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold whitespace-nowrap"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteTeacherMapping(item.MappingId)}
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

                {filteredTeacherMappings.length > 0 && teacherTotalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] bg-white px-4 py-6">
                    <p className="text-sm text-[#6b7280] text-center">
                      Showing {(teacherCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        teacherCurrentPage * ITEMS_PER_PAGE,
                        filteredTeacherMappings.length
                      )}{" "}
                      of {filteredTeacherMappings.length} teacher mappings
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => goToTeacherPage(1)}
                        disabled={teacherCurrentPage === 1}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ≪
                      </button>

                      <button
                        onClick={goToTeacherPreviousPage}
                        disabled={teacherCurrentPage === 1}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ‹
                      </button>

                      {getVisibleTeacherPages().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`teacher-ellipsis-${index}`}
                            className="flex h-12 min-w-[48px] items-center justify-center rounded-2xl px-3 text-lg font-semibold text-[#6b7280]"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToTeacherPage(page)}
                            className={`h-12 min-w-[48px] rounded-2xl px-4 text-lg font-semibold transition ${
                              teacherCurrentPage === page
                                ? "bg-blue-500 text-white shadow-md"
                                : "border border-[#d6c2a8] bg-white text-[#1a1a1a] hover:bg-[#efe4d2]"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={goToTeacherNextPage}
                        disabled={teacherCurrentPage === teacherTotalPages}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ›
                      </button>

                      <button
                        onClick={() => goToTeacherPage(teacherTotalPages)}
                        disabled={teacherCurrentPage === teacherTotalPages}
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
              <input
                type="text"
                placeholder="Search parent, student or class"
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
              />

              <button
                onClick={handleClearParentFilters}
                className="w-full sm:w-auto sm:min-w-[90px] rounded-2xl bg-black text-white px-4 py-2.5 text-sm font-medium hover:opacity-90"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                onClick={() => toggleParentSort("parentName")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Parent{getSortIndicator(parentNameSort)}
              </button>

              <button
                onClick={() => toggleParentSort("parentCode")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Code{getSortIndicator(parentCodeSort)}
              </button>

              <button
                onClick={() => toggleParentSort("studentName")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Student{getSortIndicator(studentNameSort)}
              </button>

              <button
                onClick={() => toggleParentSort("rollNumber")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Roll No{getSortIndicator(rollNumberSort)}
              </button>

              <button
                onClick={() => toggleParentSort("parentClass")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Class{getSortIndicator(parentClassSort)}
              </button>

              <button
                onClick={() => toggleParentSort("parentYear")}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs font-semibold text-left"
              >
                Year{getSortIndicator(parentYearSort)}
              </button>
            </div>

            {tableLoading ? (
              <div className="p-6 text-center text-gray-600">Loading mappings...</div>
            ) : paginatedParentMappings.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No mappings found</div>
            ) : (
              paginatedParentMappings.map((item) => (
                <ParentMappingCard key={item.MappingId} item={item} />
              ))
            )}

            {filteredParentMappings.length > 0 && parentTotalPages > 1 && (
              <div className="rounded-2xl border border-[#d6c2a8] bg-white p-4 shadow-sm">
                <p className="mb-4 text-center text-sm text-[#6b7280]">
                  Showing {(parentCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(
                    parentCurrentPage * ITEMS_PER_PAGE,
                    filteredParentMappings.length
                  )}{" "}
                  of {filteredParentMappings.length} parent mappings
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => goToParentPage(1)}
                    disabled={parentCurrentPage === 1}
                    className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ≪
                  </button>

                  <button
                    onClick={goToParentPreviousPage}
                    disabled={parentCurrentPage === 1}
                    className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ‹
                  </button>

                  {getVisibleParentPages().map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`parent-ellipsis-mobile-${index}`}
                        className="flex h-11 min-w-[44px] items-center justify-center rounded-2xl px-2 text-base font-semibold text-[#6b7280]"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={`parent-mobile-${page}`}
                        onClick={() => goToParentPage(page)}
                        className={`h-11 min-w-[44px] rounded-2xl px-3 text-base font-semibold transition ${
                          parentCurrentPage === page
                            ? "bg-blue-500 text-white shadow-md"
                            : "border border-[#d6c2a8] bg-white text-[#1a1a1a] hover:bg-[#efe4d2]"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={goToParentNextPage}
                    disabled={parentCurrentPage === parentTotalPages}
                    className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ›
                  </button>

                  <button
                    onClick={() => goToParentPage(parentTotalPages)}
                    disabled={parentCurrentPage === parentTotalPages}
                    className="h-11 min-w-[44px] rounded-2xl border border-[#d6c2a8] bg-white px-3 text-base font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ≫
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {tableLoading ? (
              <div className="p-8 text-center text-gray-600">Loading mappings...</div>
            ) : paginatedParentMappings.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No mappings found</div>
            ) : (
              <>
                <table className="min-w-[1180px] w-full">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th
                        onClick={() => toggleParentSort("parentName")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Parent{getSortIndicator(parentNameSort)}
                      </th>
                      <th
                        onClick={() => toggleParentSort("parentCode")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Parent Code{getSortIndicator(parentCodeSort)}
                      </th>
                      <th
                        onClick={() => toggleParentSort("studentName")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Student{getSortIndicator(studentNameSort)}
                      </th>
                      <th
                        onClick={() => toggleParentSort("rollNumber")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Roll Number{getSortIndicator(rollNumberSort)}
                      </th>
                      <th
                        onClick={() => toggleParentSort("parentClass")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Class{getSortIndicator(parentClassSort)}
                      </th>
                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Section
                      </th>
                      <th
                        onClick={() => toggleParentSort("parentYear")}
                        className="cursor-pointer text-left px-3 py-3 text-sm font-bold text-black select-none"
                      >
                        Academic Year{getSortIndicator(parentYearSort)}
                      </th>
                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedParentMappings.map((item) => (
                      <tr
                        key={item.MappingId}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                      >
                        <td
                          className="px-3 py-4 text-black max-w-[110px] truncate"
                          title={item.ParentName}
                        >
                          {item.ParentName}
                        </td>
                        <td
                          className="px-3 py-4 text-[#a57f42] font-semibold max-w-[110px] truncate"
                          title={item.ParentCode}
                        >
                          {item.ParentCode}
                        </td>
                        <td
                          className="px-3 py-4 text-gray-700 max-w-[110px] truncate"
                          title={item.StudentName}
                        >
                          {item.StudentName}
                        </td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.RollNumber || "-"}
                        </td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.ClassName}
                        </td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.Section}
                        </td>
                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.AcademicYear}
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex flex-row items-center gap-2 whitespace-nowrap">
                            <button
                              onClick={() => handleEditParentMapping(item)}
                              className="rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 text-sm font-semibold whitespace-nowrap"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDeleteParentMapping(item.MappingId)}
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

                {filteredParentMappings.length > 0 && parentTotalPages > 1 && (
                  <div className="mt-6 flex flex-col items-center gap-4 border-t border-[#eadcc8] bg-white px-4 py-6">
                    <p className="text-sm text-[#6b7280] text-center">
                      Showing {(parentCurrentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        parentCurrentPage * ITEMS_PER_PAGE,
                        filteredParentMappings.length
                      )}{" "}
                      of {filteredParentMappings.length} parent mappings
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => goToParentPage(1)}
                        disabled={parentCurrentPage === 1}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ≪
                      </button>

                      <button
                        onClick={goToParentPreviousPage}
                        disabled={parentCurrentPage === 1}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ‹
                      </button>

                      {getVisibleParentPages().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`parent-ellipsis-${index}`}
                            className="flex h-12 min-w-[48px] items-center justify-center rounded-2xl px-3 text-lg font-semibold text-[#6b7280]"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToParentPage(page)}
                            className={`h-12 min-w-[48px] rounded-2xl px-4 text-lg font-semibold transition ${
                              parentCurrentPage === page
                                ? "bg-blue-500 text-white shadow-md"
                                : "border border-[#d6c2a8] bg-white text-[#1a1a1a] hover:bg-[#efe4d2]"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={goToParentNextPage}
                        disabled={parentCurrentPage === parentTotalPages}
                        className="h-12 min-w-[48px] rounded-2xl border border-[#d6c2a8] bg-white px-4 text-lg font-semibold text-[#1a1a1a] transition hover:bg-[#efe4d2] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ›
                      </button>

                      <button
                        onClick={() => goToParentPage(parentTotalPages)}
                        disabled={parentCurrentPage === parentTotalPages}
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
              <Select
                options={teacherOptions}
                value={
                  teacherOptions.find(
                    (option) => option.value === teacherClassSubjectForm.teacherId
                  ) || null
                }
                onChange={(selectedOption) =>
                  handleTeacherMappingSelectChange("teacherId", selectedOption)
                }
                placeholder="Search and select teacher"
                isClearable
                isSearchable
                styles={searchableSelectStyles}
              />

              <Select
                options={classOptions}
                value={
                  classOptions.find(
                    (option) => option.value === teacherClassSubjectForm.classId
                  ) || null
                }
                onChange={(selectedOption) =>
                  handleTeacherMappingSelectChange("classId", selectedOption)
                }
                placeholder="Search and select class"
                isClearable
                isSearchable
                styles={searchableSelectStyles}
              />

              <Select
                options={subjectOptions}
                value={
                  subjectOptions.find(
                    (option) => option.value === teacherClassSubjectForm.subjectId
                  ) || null
                }
                onChange={(selectedOption) =>
                  handleTeacherMappingSelectChange("subjectId", selectedOption)
                }
                placeholder="Search and select subject"
                isClearable
                isSearchable
                styles={searchableSelectStyles}
              />

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
              <Select
                options={parentOptions}
                value={
                  parentOptions.find(
                    (option) => option.value === parentStudentForm.parentId
                  ) || null
                }
                onChange={(selectedOption) =>
                  handleParentMappingSelectChange("parentId", selectedOption)
                }
                placeholder="Search and select parent"
                isClearable
                isSearchable
                styles={searchableSelectStyles}
              />

              <Select
                options={studentOptions}
                value={
                  studentOptions.find(
                    (option) => option.value === parentStudentForm.studentId
                  ) || null
                }
                onChange={(selectedOption) =>
                  handleParentMappingSelectChange("studentId", selectedOption)
                }
                placeholder="Search and select student"
                isClearable
                isSearchable
                styles={searchableSelectStyles}
              />

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