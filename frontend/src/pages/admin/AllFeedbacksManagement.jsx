import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const AllFeedbacksManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [forms, setForms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");
  const [responseFilter, setResponseFilter] = useState("all");

  const [parentSort, setParentSort] = useState("default");
  const [studentSort, setStudentSort] = useState("default");
  const [classSort, setClassSort] = useState("default");
  const [teacherSort, setTeacherSort] = useState("default");
  const [subjectSort, setSubjectSort] = useState("default");
  const [ratingSort, setRatingSort] = useState("default");
  const [submittedSort, setSubmittedSort] = useState("default");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [feedbackRes, classesRes, teachersRes, subjectsRes, formsRes] =
        await Promise.all([
          axios.get("/admin/all-feedbacks", { headers: getAuthHeaders() }),
          axios.get("/admin/classes", { headers: getAuthHeaders() }),
          axios.get("/admin/teachers", { headers: getAuthHeaders() }),
          axios.get("/admin/subjects", { headers: getAuthHeaders() }),
          axios.get("/admin/feedback-forms", { headers: getAuthHeaders() }),
        ]);

      if (feedbackRes.data.success) setFeedbacks(feedbackRes.data.data || []);
      if (classesRes.data.success) setClasses(classesRes.data.data || []);
      if (teachersRes.data.success) setTeachers(teachersRes.data.data || []);
      if (subjectsRes.data.success) setSubjects(subjectsRes.data.data || []);
      if (formsRes.data.success) setForms(formsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch feedback data");
    } finally {
      setLoading(false);
    }
  };

  const resetAllSorts = () => {
    setParentSort("default");
    setStudentSort("default");
    setClassSort("default");
    setTeacherSort("default");
    setSubjectSort("default");
    setRatingSort("default");
    setSubmittedSort("default");
  };

  const setOnlyActiveSort = (type, value) => {
    resetAllSorts();

    if (type === "parent") setParentSort(value);
    if (type === "student") setStudentSort(value);
    if (type === "class") setClassSort(value);
    if (type === "teacher") setTeacherSort(value);
    if (type === "subject") setSubjectSort(value);
    if (type === "rating") setRatingSort(value);
    if (type === "submitted") setSubmittedSort(value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setClassFilter("all");
    setTeacherFilter("all");
    setSubjectFilter("all");
    setFormFilter("all");
    setResponseFilter("all");
    resetAllSorts();
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

  const filteredFeedbacks = useMemo(() => {
    let result = feedbacks.filter((item) => {
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        item.ParentName?.toLowerCase().includes(q) ||
        item.StudentName?.toLowerCase().includes(q) ||
        item.TeacherName?.toLowerCase().includes(q) ||
        item.SubjectName?.toLowerCase().includes(q) ||
        item.FormName?.toLowerCase().includes(q) ||
        item.Comments?.toLowerCase().includes(q) ||
        item.TeacherResponse?.toLowerCase().includes(q);

      const matchesClass =
        classFilter === "all" ? true : String(item.ClassId) === classFilter;

      const matchesTeacher =
        teacherFilter === "all" ? true : String(item.TeacherId) === teacherFilter;

      const matchesSubject =
        subjectFilter === "all" ? true : String(item.SubjectId) === subjectFilter;

      const matchesForm =
        formFilter === "all" ? true : String(item.FeedbackFormId) === formFilter;

      const hasResponse =
        item.TeacherResponse && item.TeacherResponse.trim() !== "";

      const matchesResponse =
        responseFilter === "all"
          ? true
          : responseFilter === "responded"
          ? hasResponse
          : !hasResponse;

      return (
        matchesSearch &&
        matchesClass &&
        matchesTeacher &&
        matchesSubject &&
        matchesForm &&
        matchesResponse
      );
    });

    const getClassValue = (item) => {
      const raw = String(item.ClassName || "").trim();
      const num = Number(raw);
      if (!Number.isNaN(num) && raw !== "") return { isNumeric: true, value: num };
      return { isNumeric: false, value: raw.toLowerCase() };
    };

    if (parentSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.ParentName || "").localeCompare(String(b.ParentName || ""))
      );
    } else if (parentSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.ParentName || "").localeCompare(String(a.ParentName || ""))
      );
    } else if (studentSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.StudentName || "").localeCompare(String(b.StudentName || ""))
      );
    } else if (studentSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.StudentName || "").localeCompare(String(a.StudentName || ""))
      );
    } else if (classSort === "asc") {
      result = [...result].sort((a, b) => {
        const av = getClassValue(a);
        const bv = getClassValue(b);
        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    } else if (classSort === "desc") {
      result = [...result].sort((a, b) => {
        const av = getClassValue(a);
        const bv = getClassValue(b);
        if (av.isNumeric && bv.isNumeric) return bv.value - av.value;
        if (av.isNumeric && !bv.isNumeric) return 1;
        if (!av.isNumeric && bv.isNumeric) return -1;
        return String(bv.value).localeCompare(String(av.value));
      });
    } else if (teacherSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.TeacherName || "").localeCompare(String(b.TeacherName || ""))
      );
    } else if (teacherSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.TeacherName || "").localeCompare(String(a.TeacherName || ""))
      );
    } else if (subjectSort === "asc") {
      result = [...result].sort((a, b) =>
        String(a.SubjectName || "").localeCompare(String(b.SubjectName || ""))
      );
    } else if (subjectSort === "desc") {
      result = [...result].sort((a, b) =>
        String(b.SubjectName || "").localeCompare(String(a.SubjectName || ""))
      );
    } else if (ratingSort === "asc") {
      result = [...result].sort(
        (a, b) => Number(a.Rating || 0) - Number(b.Rating || 0)
      );
    } else if (ratingSort === "desc") {
      result = [...result].sort(
        (a, b) => Number(b.Rating || 0) - Number(a.Rating || 0)
      );
    } else if (submittedSort === "latest") {
      result = [...result].sort(
        (a, b) => new Date(b.SubmittedAt || 0) - new Date(a.SubmittedAt || 0)
      );
    } else if (submittedSort === "oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.SubmittedAt || 0) - new Date(b.SubmittedAt || 0)
      );
    }

    return result;
  }, [
    feedbacks,
    searchTerm,
    classFilter,
    teacherFilter,
    subjectFilter,
    formFilter,
    responseFilter,
    parentSort,
    studentSort,
    classSort,
    teacherSort,
    subjectSort,
    ratingSort,
    submittedSort,
  ]);

  const respondedCount = filteredFeedbacks.filter(
    (item) => item.TeacherResponse && item.TeacherResponse.trim() !== ""
  ).length;

  const pendingCount = filteredFeedbacks.length - respondedCount;

  const FeedbackCard = ({ item }) => {
    const hasResponse =
      item.TeacherResponse && item.TeacherResponse.trim() !== "";

    return (
      <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Parent</p>
            <p className="font-semibold text-black break-words">
              {item.ParentName || "-"}
            </p>
            <p className="text-xs text-[#a57f42] mt-1">{item.ParentCode || ""}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Student</p>
            <p className="font-semibold text-black break-words">
              {item.StudentName || "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Roll No: {item.RollNumber || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Class</p>
            <p className="text-black">
              {item.ClassName || "-"} {item.Section || ""}
            </p>
            <p className="text-xs text-gray-500 mt-1">{item.AcademicYear || ""}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Teacher</p>
            <p className="font-semibold text-black break-words">
              {item.TeacherName || "-"}
            </p>
            <p className="text-xs text-[#a57f42] mt-1">{item.TeacherCode || ""}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Subject</p>
            <p className="text-black break-words">{item.SubjectName || "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Form</p>
            <p className="text-black break-words">{item.FormName || "-"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Rating</p>
            <span className="inline-flex rounded-full bg-[#eee4d6] px-3 py-1 text-xs font-semibold text-[#9b7440]">
              {item.Rating ?? "-"}
            </span>
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-500">Comment</p>
            <div className="mt-1 rounded-xl bg-[#faf6ef] border border-[#eadcc8] px-3 py-3 text-black whitespace-pre-wrap break-words">
              {item.Comments || "-"}
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-500">Teacher Response</p>
            {hasResponse ? (
              <div className="mt-1 rounded-xl bg-[#f6fbf4] border border-[#dbe8d5] px-3 py-3 text-black whitespace-pre-wrap break-words">
                {item.TeacherResponse}
              </div>
            ) : (
              <span className="mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
                Pending
              </span>
            )}
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-2">Submitted At</p>
            {item.SubmittedAt ? (
              <div className="rounded-2xl border border-[#e3d3bb] bg-[#fffdf9] px-3 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-black font-semibold text-sm">
                  <span>📅</span>
                  <span>{formatDate(item.SubmittedAt)}</span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-gray-600 text-xs flex-wrap">
                  <span>🕒</span>
                  <span className="whitespace-nowrap">
                    {formatTime(item.SubmittedAt)}
                  </span>

                  {getDayLabel(item.SubmittedAt) && (
                    <span className="rounded-full bg-[#eee4d6] px-2.5 py-1 text-[11px] font-semibold text-[#9b7440]">
                      {getDayLabel(item.SubmittedAt)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              "-"
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xl font-semibold text-black">
        Loading feedbacks...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-full">
        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Total Feedbacks
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {filteredFeedbacks.length}
          </h3>
          <p className="mt-2 text-sm text-gray-500">All filtered feedback records</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Responded
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">{respondedCount}</h3>
          <p className="mt-2 text-sm text-gray-500">Teacher response submitted</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Pending
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">{pendingCount}</h3>
          <p className="mt-2 text-sm text-gray-500">Awaiting teacher response</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="w-full max-w-full bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
        <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6] space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-black">Feedback Filters</h2>
              <p className="text-gray-600 text-sm mt-1">
                Refine records by search, class, teacher, subject, form and response status
              </p>
            </div>

            <button
              onClick={handleClearFilters}
              className="rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search parent, student, teacher, comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            />

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.ClassId} value={cls.ClassId}>
                  {cls.ClassName} - {cls.Section}
                </option>
              ))}
            </select>

            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.TeacherId} value={teacher.TeacherId}>
                  {teacher.FullName}
                </option>
              ))}
            </select>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.SubjectId} value={subject.SubjectId}>
                  {subject.SubjectName}
                </option>
              ))}
            </select>

            <select
              value={formFilter}
              onChange={(e) => setFormFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Feedback Forms</option>
              {forms.map((form) => (
                <option key={form.FeedbackFormId} value={form.FeedbackFormId}>
                  {form.FormName}
                </option>
              ))}
            </select>

            <select
              value={responseFilter}
              onChange={(e) => setResponseFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Response Status</option>
              <option value="responded">Responded</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            <select
              value={parentSort === "asc" || parentSort === "desc" ? parentSort : "default"}
              onChange={(e) => setOnlyActiveSort("parent", e.target.value)}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
            >
              <option value="default">Parent</option>
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>

            <select
              value={studentSort === "asc" || studentSort === "desc" ? studentSort : "default"}
              onChange={(e) => setOnlyActiveSort("student", e.target.value)}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
            >
              <option value="default">Student</option>
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>

            <select
              value={classSort === "asc" || classSort === "desc" ? classSort : "default"}
              onChange={(e) => setOnlyActiveSort("class", e.target.value)}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
            >
              <option value="default">Class</option>
              <option value="asc">Low-High</option>
              <option value="desc">High-Low</option>
            </select>

            <select
              value={teacherSort === "asc" || teacherSort === "desc" ? teacherSort : "default"}
              onChange={(e) => setOnlyActiveSort("teacher", e.target.value)}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
            >
              <option value="default">Teacher</option>
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>

            <select
              value={subjectSort === "asc" || subjectSort === "desc" ? subjectSort : "default"}
              onChange={(e) => setOnlyActiveSort("subject", e.target.value)}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
            >
              <option value="default">Subject</option>
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>

            <select
              value={ratingSort === "asc" || ratingSort === "desc" ? ratingSort : "default"}
              onChange={(e) => setOnlyActiveSort("rating", e.target.value)}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
            >
              <option value="default">Rating</option>
              <option value="asc">Low-High</option>
              <option value="desc">High-Low</option>
            </select>

            <select
              value={
                submittedSort === "latest" || submittedSort === "oldest"
                  ? submittedSort
                  : "default"
              }
              onChange={(e) => setOnlyActiveSort("submitted", e.target.value)}
              className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
            >
              <option value="default">Submitted At</option>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No feedback records found
            </div>
          ) : (
            filteredFeedbacks.map((item) => (
              <FeedbackCard key={item.FeedbackId} item={item} />
            ))
          )}
        </div>

        <div className="hidden 2xl:block w-full max-w-full bg-[#fcfaf6]">
          {filteredFeedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No feedback records found
            </div>
          ) : (
            <div className="w-full overflow-x-auto overflow-y-hidden">
              <div className="min-w-[1450px]">
                <table className="w-full bg-white border-t border-[#eadcc8]">
                  <thead className="bg-[#fbf7f0]">
                    <tr>
                      <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                        <div className="flex flex-col gap-2">
                          <span>Parent</span>
                          <select
                            value={parentSort === "asc" || parentSort === "desc" ? parentSort : "default"}
                            onChange={(e) => setOnlyActiveSort("parent", e.target.value)}
                            className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
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
                            value={studentSort === "asc" || studentSort === "desc" ? studentSort : "default"}
                            onChange={(e) => setOnlyActiveSort("student", e.target.value)}
                            className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
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
                            value={classSort === "asc" || classSort === "desc" ? classSort : "default"}
                            onChange={(e) => setOnlyActiveSort("class", e.target.value)}
                            className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                          >
                            <option value="default">Def</option>
                            <option value="asc">Low-Hi</option>
                            <option value="desc">High-Lo</option>
                          </select>
                        </div>
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                        <div className="flex flex-col gap-2">
                          <span>Teacher</span>
                          <select
                            value={teacherSort === "asc" || teacherSort === "desc" ? teacherSort : "default"}
                            onChange={(e) => setOnlyActiveSort("teacher", e.target.value)}
                            className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                          >
                            <option value="default">Def</option>
                            <option value="asc">A-Z</option>
                            <option value="desc">Z-A</option>
                          </select>
                        </div>
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                        <div className="flex flex-col gap-2">
                          <span>Subject</span>
                          <select
                            value={subjectSort === "asc" || subjectSort === "desc" ? subjectSort : "default"}
                            onChange={(e) => setOnlyActiveSort("subject", e.target.value)}
                            className="w-[64px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                          >
                            <option value="default">Def</option>
                            <option value="asc">A-Z</option>
                            <option value="desc">Z-A</option>
                          </select>
                        </div>
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Form
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                        <div className="flex flex-col gap-2">
                          <span>Rating</span>
                          <select
                            value={ratingSort === "asc" || ratingSort === "desc" ? ratingSort : "default"}
                            onChange={(e) => setOnlyActiveSort("rating", e.target.value)}
                            className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                          >
                            <option value="default">Def</option>
                            <option value="asc">Low-Hi</option>
                            <option value="desc">High-Lo</option>
                          </select>
                        </div>
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Comment
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black">
                        Teacher Response
                      </th>

                      <th className="text-left px-3 py-3 text-sm font-bold text-black align-top">
                        <div className="flex flex-col gap-2">
                          <span>Submitted At</span>
                          <select
                            value={
                              submittedSort === "latest" || submittedSort === "oldest"
                                ? submittedSort
                                : "default"
                            }
                            onChange={(e) => setOnlyActiveSort("submitted", e.target.value)}
                            className="w-[78px] rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                          >
                            <option value="default">Def</option>
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                          </select>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredFeedbacks.map((item) => (
                      <tr
                        key={item.FeedbackId}
                        className="border-t border-[#eee2cf] hover:bg-[#fcfaf6] align-top"
                      >
                        <td className="px-3 py-4 text-black max-w-[150px]">
                          <div className="font-medium truncate" title={item.ParentName || "-"}>
                            {item.ParentName || "-"}
                          </div>
                          <div className="text-xs text-[#a57f42] truncate">
                            {item.ParentCode || ""}
                          </div>
                        </td>

                        <td className="px-3 py-4 text-gray-700 max-w-[150px]">
                          <div className="font-medium text-black truncate" title={item.StudentName || "-"}>
                            {item.StudentName || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Roll No: {item.RollNumber || "-"}
                          </div>
                        </td>

                        <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                          {item.ClassName || "-"} {item.Section || ""}
                          <div className="text-xs text-gray-500">
                            {item.AcademicYear || ""}
                          </div>
                        </td>

                        <td className="px-3 py-4 text-gray-700 max-w-[150px]">
                          <div className="font-medium text-black truncate" title={item.TeacherName || "-"}>
                            {item.TeacherName || "-"}
                          </div>
                          <div className="text-xs text-[#a57f42] truncate">
                            {item.TeacherCode || ""}
                          </div>
                        </td>

                        <td
                          className="px-3 py-4 text-gray-700 max-w-[120px] truncate"
                          title={item.SubjectName || "-"}
                        >
                          {item.SubjectName || "-"}
                        </td>

                        <td
                          className="px-3 py-4 text-gray-700 max-w-[150px] truncate"
                          title={item.FormName || "-"}
                        >
                          {item.FormName || "-"}
                        </td>

                        <td className="px-3 py-4 text-gray-700">
                          <span className="inline-flex rounded-full bg-[#eee4d6] px-3 py-1 text-xs font-semibold text-[#9b7440]">
                            {item.Rating ?? "-"}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-gray-700 max-w-[240px]">
                          <div className="whitespace-pre-wrap break-words">
                            {item.Comments || "-"}
                          </div>
                        </td>

                        <td className="px-3 py-4 text-gray-700 max-w-[240px]">
                          {item.TeacherResponse && item.TeacherResponse.trim() !== "" ? (
                            <div className="whitespace-pre-wrap break-words">
                              {item.TeacherResponse}
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-4">
                          {item.SubmittedAt ? (
                            <div className="min-w-[180px] rounded-2xl border border-[#e3d3bb] bg-white px-3 py-3 shadow-sm">
                              <div className="flex items-center gap-2 text-black font-semibold text-sm">
                                <span>📅</span>
                                <span>{formatDate(item.SubmittedAt)}</span>
                              </div>

                              <div className="mt-2 flex items-center gap-2 text-gray-600 text-xs flex-wrap">
                                <span>🕒</span>
                                <span className="whitespace-nowrap">
                                  {formatTime(item.SubmittedAt)}
                                </span>

                                {getDayLabel(item.SubmittedAt) && (
                                  <span className="rounded-full bg-[#eee4d6] px-2 py-1 text-[10px] font-semibold text-[#9b7440]">
                                    {getDayLabel(item.SubmittedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllFeedbacksManagement;