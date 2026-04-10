import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";

const ReportsManagement = () => {
  const [teacherPerformance, setTeacherPerformance] = useState([]);
  const [classSummary, setClassSummary] = useState([]);
  const [monthlyFeedback, setMonthlyFeedback] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [reportFilter, setReportFilter] = useState("all");

  const [teacherSort, setTeacherSort] = useState("default");
  const [classSort, setClassSort] = useState("default");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [teacherRes, classRes, monthlyRes] = await Promise.all([
        axios.get("/admin/reports/teacher-performance", {
          headers: getAuthHeaders(),
        }),
        axios.get("/admin/reports/class-feedback-summary", {
          headers: getAuthHeaders(),
        }),
        axios.get("/admin/reports/monthly-feedback", {
          headers: getAuthHeaders(),
        }),
      ]);

      if (teacherRes.data.success) {
        setTeacherPerformance(teacherRes.data.data || []);
      }

      if (classRes.data.success) {
        setClassSummary(classRes.data.data || []);
      }

      if (monthlyRes.data.success) {
        setMonthlyFeedback(monthlyRes.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setReportFilter("all");
    setTeacherSort("default");
    setClassSort("default");
  };

  const filteredTeacherPerformance = useMemo(() => {
    let result = teacherPerformance.filter((teacher) => {
      const q = searchTerm.toLowerCase();
      return (
        teacher.TeacherCode?.toLowerCase().includes(q) ||
        teacher.TeacherName?.toLowerCase().includes(q) ||
        teacher.Email?.toLowerCase().includes(q) ||
        teacher.Mobile?.toLowerCase().includes(q)
      );
    });

    if (teacherSort === "nameAsc") {
      result = [...result].sort((a, b) =>
        String(a.TeacherName || "").localeCompare(String(b.TeacherName || ""))
      );
    } else if (teacherSort === "nameDesc") {
      result = [...result].sort((a, b) =>
        String(b.TeacherName || "").localeCompare(String(a.TeacherName || ""))
      );
    } else if (teacherSort === "ratingHigh") {
      result = [...result].sort(
        (a, b) => Number(b.AverageRating || 0) - Number(a.AverageRating || 0)
      );
    } else if (teacherSort === "ratingLow") {
      result = [...result].sort(
        (a, b) => Number(a.AverageRating || 0) - Number(b.AverageRating || 0)
      );
    } else if (teacherSort === "subjectsHigh") {
      result = [...result].sort(
        (a, b) =>
          Number(b.TotalSubjectsCovered || 0) - Number(a.TotalSubjectsCovered || 0)
      );
    } else if (teacherSort === "subjectsLow") {
      result = [...result].sort(
        (a, b) =>
          Number(a.TotalSubjectsCovered || 0) - Number(b.TotalSubjectsCovered || 0)
      );
    }

    return result;
  }, [teacherPerformance, searchTerm, teacherSort]);

  const filteredClassSummary = useMemo(() => {
    let result = classSummary.filter((item) => {
      const q = searchTerm.toLowerCase();
      return (
        item.ClassName?.toLowerCase().includes(q) ||
        item.Section?.toLowerCase().includes(q) ||
        item.AcademicYear?.toLowerCase().includes(q)
      );
    });

    const getClassValue = (item) => {
      const raw = String(item.ClassName || "").trim();
      const num = Number(raw);
      if (!Number.isNaN(num) && raw !== "") return { isNumeric: true, value: num };
      return { isNumeric: false, value: raw.toLowerCase() };
    };

    const getYearValue = (item) => {
      const raw = String(item.AcademicYear || "");
      const firstYear = raw.split("-")[0]?.trim();
      const num = Number(firstYear);
      return Number.isNaN(num) ? 0 : num;
    };

    if (classSort === "classAsc") {
      result = [...result].sort((a, b) => {
        const av = getClassValue(a);
        const bv = getClassValue(b);
        if (av.isNumeric && bv.isNumeric) return av.value - bv.value;
        if (av.isNumeric && !bv.isNumeric) return -1;
        if (!av.isNumeric && bv.isNumeric) return 1;
        return String(av.value).localeCompare(String(bv.value));
      });
    } else if (classSort === "classDesc") {
      result = [...result].sort((a, b) => {
        const av = getClassValue(a);
        const bv = getClassValue(b);
        if (av.isNumeric && bv.isNumeric) return bv.value - av.value;
        if (av.isNumeric && !bv.isNumeric) return 1;
        if (!av.isNumeric && bv.isNumeric) return -1;
        return String(bv.value).localeCompare(String(av.value));
      });
    } else if (classSort === "yearOldNew") {
      result = [...result].sort((a, b) => getYearValue(a) - getYearValue(b));
    } else if (classSort === "yearNewOld") {
      result = [...result].sort((a, b) => getYearValue(b) - getYearValue(a));
    } else if (classSort === "teachersHigh") {
      result = [...result].sort(
        (a, b) => Number(b.TotalTeachers || 0) - Number(a.TotalTeachers || 0)
      );
    } else if (classSort === "teachersLow") {
      result = [...result].sort(
        (a, b) => Number(a.TotalTeachers || 0) - Number(b.TotalTeachers || 0)
      );
    } else if (classSort === "studentsHigh") {
      result = [...result].sort(
        (a, b) => Number(b.TotalStudents || 0) - Number(a.TotalStudents || 0)
      );
    } else if (classSort === "studentsLow") {
      result = [...result].sort(
        (a, b) => Number(a.TotalStudents || 0) - Number(b.TotalStudents || 0)
      );
    }

    return result;
  }, [classSummary, searchTerm, classSort]);

  const filteredMonthlyFeedback = useMemo(() => {
    return monthlyFeedback.filter((item) => {
      const q = searchTerm.toLowerCase();
      return item.ReportMonth?.toLowerCase().includes(q);
    });
  }, [monthlyFeedback, searchTerm]);

  const totalRows =
    filteredTeacherPerformance.length +
    filteredClassSummary.length +
    filteredMonthlyFeedback.length;

  const TeacherReportCard = ({ teacher }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Teacher Code</p>
          <p className="font-semibold text-[#a57f42] break-words">
            {teacher.TeacherCode}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Teacher Name</p>
          <p className="font-semibold text-black break-words">
            {teacher.TeacherName}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Email</p>
          <p className="text-black break-words">{teacher.Email || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Mobile</p>
          <p className="text-black">{teacher.Mobile || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Average Rating</p>
          <p className="text-black">{teacher.AverageRating ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Feedbacks</p>
          <p className="text-black">{teacher.TotalFeedbacks ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Subjects Covered</p>
          <p className="text-black">{teacher.TotalSubjectsCovered ?? 0}</p>
        </div>
      </div>
    </div>
  );

  const ClassReportCard = ({ item }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Class</p>
          <p className="font-semibold text-black">{item.ClassName}</p>
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
          <p className="text-xs text-gray-500">Average Rating</p>
          <p className="text-black">{item.AverageRating ?? "-"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Feedbacks</p>
          <p className="text-black">{item.TotalFeedbacks ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Teachers</p>
          <p className="text-black">{item.TotalTeachers ?? 0}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-500">Total Students</p>
          <p className="text-black">{item.TotalStudents ?? 0}</p>
        </div>
      </div>
    </div>
  );

  const MonthlyReportCard = ({ item }) => (
    <div className="rounded-2xl border border-[#e7d5b7] bg-white p-4 shadow-sm space-y-3">
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Month</p>
          <p className="font-semibold text-black">{item.ReportMonth}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Feedbacks</p>
          <p className="text-black">{item.TotalFeedbacks ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Average Rating</p>
          <p className="text-black">{item.AverageRating ?? "-"}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xl font-semibold text-black">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Teacher Reports
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {teacherPerformance.length}
          </h3>
          <p className="mt-2 text-sm text-gray-500">Teacher report rows</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Class Reports
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {classSummary.length}
          </h3>
          <p className="mt-2 text-sm text-gray-500">Class report rows</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Monthly Reports
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">
            {monthlyFeedback.length}
          </h3>
          <p className="mt-2 text-sm text-gray-500">Monthly report rows</p>
        </div>

        <div className="rounded-[24px] border border-[#d8c3a0] bg-white px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
            Filtered Rows
          </p>
          <h3 className="mt-3 text-4xl font-bold text-black">{totalRows}</h3>
          <p className="mt-2 text-sm text-gray-500">Rows after filters</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
        <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6] space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-black">Report Filters</h2>
              <p className="text-gray-600 text-sm mt-1">
                Search and switch between report sections easily
              </p>
            </div>

            <button
              onClick={handleClearFilters}
              className="rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search teacher, class, section, month..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            />

            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              className="w-full rounded-2xl border border-[#b9c7da] bg-white px-4 py-3 outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
            >
              <option value="all">All Reports</option>
              <option value="teacher">Teacher Performance</option>
              <option value="class">Class Feedback Summary</option>
              <option value="monthly">Monthly Feedback</option>
            </select>
          </div>
        </div>
      </div>

      {(reportFilter === "all" || reportFilter === "teacher") && (
        <div className="bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6]">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Teacher Performance Report
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Performance summary of teachers
              </p>
            </div>
          </div>

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={teacherSort === "nameAsc" || teacherSort === "nameDesc" ? teacherSort : "default"}
                onChange={(e) => setTeacherSort(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Teacher Name</option>
                <option value="nameAsc">A-Z</option>
                <option value="nameDesc">Z-A</option>
              </select>

              <select
                value={teacherSort === "ratingHigh" || teacherSort === "ratingLow" ? teacherSort : "default"}
                onChange={(e) => setTeacherSort(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Average Rating</option>
                <option value="ratingHigh">High-Low</option>
                <option value="ratingLow">Low-High</option>
              </select>

              <select
                value={teacherSort === "subjectsHigh" || teacherSort === "subjectsLow" ? teacherSort : "default"}
                onChange={(e) => setTeacherSort(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Subjects Covered</option>
                <option value="subjectsHigh">High-Low</option>
                <option value="subjectsLow">Low-High</option>
              </select>
            </div>

            {filteredTeacherPerformance.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No teacher performance data found
              </div>
            ) : (
              filteredTeacherPerformance.map((teacher, index) => (
                <TeacherReportCard
                  key={`${teacher.TeacherId}-${index}`}
                  teacher={teacher}
                />
              ))
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {filteredTeacherPerformance.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No teacher performance data found
              </div>
            ) : (
              <table className="min-w-[1080px] w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Teacher Code
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Teacher Name</span>
                        <select
                          value={teacherSort === "nameAsc" || teacherSort === "nameDesc" ? teacherSort : "default"}
                          onChange={(e) => setTeacherSort(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="nameAsc">A-Z</option>
                          <option value="nameDesc">Z-A</option>
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
                      <div className="flex items-center gap-2">
                        <span>Average Rating</span>
                        <select
                          value={teacherSort === "ratingHigh" || teacherSort === "ratingLow" ? teacherSort : "default"}
                          onChange={(e) => setTeacherSort(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="ratingHigh">High-Low</option>
                          <option value="ratingLow">Low-High</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Total Feedbacks
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Total Subjects Covered</span>
                        <select
                          value={teacherSort === "subjectsHigh" || teacherSort === "subjectsLow" ? teacherSort : "default"}
                          onChange={(e) => setTeacherSort(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="subjectsHigh">High-Low</option>
                          <option value="subjectsLow">Low-High</option>
                        </select>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeacherPerformance.map((teacher, index) => (
                    <tr
                      key={`${teacher.TeacherId}-${index}`}
                      className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                    >
                      <td className="px-3 py-4 font-semibold text-[#a57f42]">
                        {teacher.TeacherCode}
                      </td>
                      <td className="px-3 py-4 text-black max-w-[140px] truncate" title={teacher.TeacherName}>
                        {teacher.TeacherName}
                      </td>
                      <td className="px-3 py-4 text-gray-700 max-w-[180px] truncate" title={teacher.Email || "-"}>
                        {teacher.Email || "-"}
                      </td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                        {teacher.Mobile || "-"}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {teacher.AverageRating ?? "-"}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {teacher.TotalFeedbacks ?? 0}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {teacher.TotalSubjectsCovered ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {(reportFilter === "all" || reportFilter === "class") && (
        <div className="bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6]">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Class Feedback Summary Report
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Feedback summary by class
              </p>
            </div>
          </div>

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select
                value={classSort === "classAsc" || classSort === "classDesc" ? classSort : "default"}
                onChange={(e) => setClassSort(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Class</option>
                <option value="classAsc">Low-High</option>
                <option value="classDesc">High-Low</option>
              </select>

              <select
                value={classSort === "yearOldNew" || classSort === "yearNewOld" ? classSort : "default"}
                onChange={(e) => setClassSort(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Academic Year</option>
                <option value="yearOldNew">Old-New</option>
                <option value="yearNewOld">New-Old</option>
              </select>

              <select
                value={classSort === "teachersHigh" || classSort === "teachersLow" ? classSort : "default"}
                onChange={(e) => setClassSort(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Total Teachers</option>
                <option value="teachersHigh">High-Low</option>
                <option value="teachersLow">Low-High</option>
              </select>

              <select
                value={classSort === "studentsHigh" || classSort === "studentsLow" ? classSort : "default"}
                onChange={(e) => setClassSort(e.target.value)}
                className="rounded-xl border border-[#d8c3a0] bg-white px-3 py-2 text-xs"
              >
                <option value="default">Total Students</option>
                <option value="studentsHigh">High-Low</option>
                <option value="studentsLow">Low-High</option>
              </select>
            </div>

            {filteredClassSummary.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No class summary data found
              </div>
            ) : (
              filteredClassSummary.map((item, index) => (
                <ClassReportCard key={`${item.ClassId}-${index}`} item={item} />
              ))
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {filteredClassSummary.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No class summary data found
              </div>
            ) : (
              <table className="min-w-[1080px] w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Class</span>
                        <select
                          value={classSort === "classAsc" || classSort === "classDesc" ? classSort : "default"}
                          onChange={(e) => setClassSort(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="classAsc">Low-High</option>
                          <option value="classDesc">High-Low</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Section
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Academic Year</span>
                        <select
                          value={classSort === "yearOldNew" || classSort === "yearNewOld" ? classSort : "default"}
                          onChange={(e) => setClassSort(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="yearOldNew">Old-New</option>
                          <option value="yearNewOld">New-Old</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Average Rating
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Total Feedbacks
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Total Teachers</span>
                        <select
                          value={classSort === "teachersHigh" || classSort === "teachersLow" ? classSort : "default"}
                          onChange={(e) => setClassSort(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="teachersHigh">High-Low</option>
                          <option value="teachersLow">Low-High</option>
                        </select>
                      </div>
                    </th>

                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      <div className="flex items-center gap-2">
                        <span>Total Students</span>
                        <select
                          value={classSort === "studentsHigh" || classSort === "studentsLow" ? classSort : "default"}
                          onChange={(e) => setClassSort(e.target.value)}
                          className="rounded-lg border border-[#d8c3a0] bg-white px-1.5 py-1 text-[11px] font-medium text-black outline-none"
                        >
                          <option value="default">Def</option>
                          <option value="studentsHigh">High-Low</option>
                          <option value="studentsLow">Low-High</option>
                        </select>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClassSummary.map((item, index) => (
                    <tr
                      key={`${item.ClassId}-${index}`}
                      className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                    >
                      <td className="px-3 py-4 text-black font-medium">
                        {item.ClassName}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {item.Section}
                      </td>
                      <td className="px-3 py-4 text-gray-700 whitespace-nowrap">
                        {item.AcademicYear}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {item.AverageRating ?? "-"}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {item.TotalFeedbacks ?? 0}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {item.TotalTeachers ?? 0}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {item.TotalStudents ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {(reportFilter === "all" || reportFilter === "monthly") && (
        <div className="bg-white border border-[#d8c3a0] rounded-[28px] shadow-lg overflow-hidden">
          <div className="bg-[#f1e7d7] px-6 py-5 border-b border-[#dcc7a6]">
            <div>
              <h2 className="text-2xl font-bold text-black">
                Monthly Feedback Report
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Month-wise feedback summary
              </p>
            </div>
          </div>

          <div className="block 2xl:hidden p-4 space-y-4 bg-[#fcfaf6]">
            {filteredMonthlyFeedback.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No monthly feedback data found
              </div>
            ) : (
              filteredMonthlyFeedback.map((item, index) => (
                <MonthlyReportCard
                  key={`${item.ReportMonth}-${index}`}
                  item={item}
                />
              ))
            )}
          </div>

          <div className="hidden 2xl:block overflow-x-auto">
            {filteredMonthlyFeedback.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No monthly feedback data found
              </div>
            ) : (
              <table className="min-w-[900px] w-full">
                <thead className="bg-[#fbf7f0]">
                  <tr>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Month
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Total Feedbacks
                    </th>
                    <th className="text-left px-3 py-3 text-sm font-bold text-black">
                      Average Rating
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMonthlyFeedback.map((item, index) => (
                    <tr
                      key={`${item.ReportMonth}-${index}`}
                      className="border-t border-[#eee2cf] hover:bg-[#fcfaf6]"
                    >
                      <td className="px-3 py-4 text-black font-medium">
                        {item.ReportMonth}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {item.TotalFeedbacks ?? 0}
                      </td>
                      <td className="px-3 py-4 text-gray-700">
                        {item.AverageRating ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;