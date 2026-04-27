import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
  // =========================================
  // Dashboard stats state
  // =========================================
  const [stats, setStats] = useState({
    teachers: 0,
    parents: 0,
    students: 0,
    classes: 0,
    subjects: 0,
    feedbackForms: 0,
    totalFeedbacks: 0,
    pendingResponses: 0,
    totalMappings: 0,
  });

  // =========================================
  // Page loading and error states
  // =========================================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // Fetch counts on first load
  // =========================================
  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  // =========================================
  // Fetch all dashboard count data
  // Important:
  // - Uses shared api instance
  // - So mobile + laptop both work if axios.js has laptop LAN IP
  // =========================================
  const fetchDashboardCounts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Admin token not found. Please login again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        teachersRes,
        parentsRes,
        studentsRes,
        classesRes,
        subjectsRes,
        feedbackFormsRes,
        allFeedbacksRes,
        teacherMappingsRes,
        parentMappingsRes,
      ] = await Promise.all([
        api.get("/admin/teachers", { headers }),
        api.get("/admin/parents", { headers }),
        api.get("/admin/students", { headers }),
        api.get("/admin/classes", { headers }),
        api.get("/admin/subjects", { headers }),
        api.get("/admin/feedback-forms", { headers }),
        api.get("/admin/all-feedbacks", { headers }),
        api.get("/admin/teacher-class-subject-mappings", { headers }),
        api.get("/admin/parent-student-mappings", { headers }),
      ]);

      // =========================================
      // Read counts safely from backend response
      // count field preferred, otherwise data array length
      // =========================================
      const teachersCount =
        teachersRes.data.count ?? teachersRes.data.data?.length ?? 0;
      const parentsCount =
        parentsRes.data.count ?? parentsRes.data.data?.length ?? 0;
      const studentsCount =
        studentsRes.data.count ?? studentsRes.data.data?.length ?? 0;
      const classesCount =
        classesRes.data.count ?? classesRes.data.data?.length ?? 0;
      const subjectsCount =
        subjectsRes.data.count ?? subjectsRes.data.data?.length ?? 0;
      const feedbackFormsCount =
        feedbackFormsRes.data.count ?? feedbackFormsRes.data.data?.length ?? 0;

      const allFeedbacks = allFeedbacksRes.data.data || [];
      const totalFeedbacks = allFeedbacksRes.data.count ?? allFeedbacks.length ?? 0;

      // =========================================
      // Pending response means teacher reply is empty
      // =========================================
      const pendingResponses = allFeedbacks.filter(
        (item) => !item.TeacherResponse || item.TeacherResponse.trim() === ""
      ).length;

      const teacherMappingsCount =
        teacherMappingsRes.data.count ?? teacherMappingsRes.data.data?.length ?? 0;
      const parentMappingsCount =
        parentMappingsRes.data.count ?? parentMappingsRes.data.data?.length ?? 0;

      setStats({
        teachers: teachersCount,
        parents: parentsCount,
        students: studentsCount,
        classes: classesCount,
        subjects: subjectsCount,
        feedbackForms: feedbackFormsCount,
        totalFeedbacks,
        pendingResponses,
        totalMappings: teacherMappingsCount + parentMappingsCount,
      });
    } catch (error) {
      console.error("Failed to fetch admin dashboard data:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load admin dashboard data."
      );

      // =========================================
      // Keep dashboard stable even if API fails
      // =========================================
      setStats({
        teachers: 0,
        parents: 0,
        students: 0,
        classes: 0,
        subjects: 0,
        feedbackForms: 0,
        totalFeedbacks: 0,
        pendingResponses: 0,
        totalMappings: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Dashboard cards data
  // =========================================
  const cards = [
    {
      label: "Teachers",
      value: stats.teachers,
      helper: "Registered teacher records",
    },
    {
      label: "Parents",
      value: stats.parents,
      helper: "Registered parent records",
    },
    {
      label: "Students",
      value: stats.students,
      helper: "Student records in system",
    },
    {
      label: "Classes",
      value: stats.classes,
      helper: "Available class records",
    },
    {
      label: "Subjects",
      value: stats.subjects,
      helper: "Configured subject records",
    },
    {
      label: "Feedback Forms",
      value: stats.feedbackForms,
      helper: "Created feedback form records",
    },
    {
      label: "Total Feedbacks",
      value: stats.totalFeedbacks,
      helper: "All submitted feedback entries",
    },
    {
      label: "Pending Responses",
      value: stats.pendingResponses,
      helper: "Feedbacks awaiting teacher reply",
    },
    {
      label: "Total Mappings",
      value: stats.totalMappings,
      helper: "Parent-student and teacher mappings",
    },
  ];

  // =========================================
  // Loading UI
  // =========================================
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-[#d8c3a0] bg-white px-5 py-5 text-center shadow-sm sm:px-8 sm:py-6">
          <div className="text-base font-semibold text-black sm:text-xl">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // Main UI
  // =========================================
  return (
    <div className="w-full max-w-full space-y-5 overflow-x-hidden px-0 sm:space-y-6">
      <section className="overflow-hidden rounded-[24px] border border-[#d8c3a0] shadow-lg sm:rounded-[28px]">
        <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e5d5bc] sm:text-xs sm:tracking-[0.22em]">
              Administration Overview
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:mt-3 sm:text-3xl lg:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#f1e6d6] sm:mt-3 sm:text-base sm:leading-7">
              Manage teachers, parents, students, classes, subjects, feedback
              forms, mappings, and feedback records from one compact control
              panel.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section>
        <div className="mb-4 px-1">
          <h3 className="text-xl font-bold text-black sm:text-2xl">
            Quick Summary
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Core system counts and current activity snapshot
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-[20px] border border-[#d8c3a0] bg-white px-4 py-4 shadow-sm sm:rounded-[24px] sm:px-5 sm:py-5 lg:px-6"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b7440] sm:text-xs sm:tracking-[0.2em]">
                {card.label}
              </p>
              <h4 className="mt-2 break-words text-2xl font-bold text-black sm:mt-3 sm:text-3xl lg:text-4xl">
                {card.value}
              </h4>
              <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
                {card.helper}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;