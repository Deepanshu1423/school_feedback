import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  const fetchDashboardCounts = async () => {
    try {
      const token = localStorage.getItem("token");

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
        axios.get("http://localhost:5000/api/admin/teachers", { headers }),
        axios.get("http://localhost:5000/api/admin/parents", { headers }),
        axios.get("http://localhost:5000/api/admin/students", { headers }),
        axios.get("http://localhost:5000/api/admin/classes", { headers }),
        axios.get("http://localhost:5000/api/admin/subjects", { headers }),
        axios.get("http://localhost:5000/api/admin/feedback-forms", { headers }),
        axios.get("http://localhost:5000/api/admin/all-feedbacks", { headers }),
        axios.get("http://localhost:5000/api/admin/teacher-class-subject-mappings", { headers }),
        axios.get("http://localhost:5000/api/admin/parent-student-mappings", { headers }),
      ]);

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
      const totalFeedbacks =
        allFeedbacksRes.data.count ?? allFeedbacks.length ?? 0;

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
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="rounded-3xl border border-[#d8c3a0] bg-white px-8 py-6 shadow-sm">
          <div className="text-xl font-semibold text-black">
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <section className="rounded-[28px] border border-[#d8c3a0] overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-black via-[#1a1410] to-[#a67c3d] px-6 sm:px-8 py-7 sm:py-8">
          <div className="max-w-3xl">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#e5d5bc]">
              Administration Overview
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#f1e6d6] leading-7">
              Manage teachers, parents, students, classes, subjects, feedback forms,
              mappings, and feedback records from one compact control panel.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-black">Quick Summary</h3>
          <p className="text-sm text-gray-600 mt-1">
            Core system counts and current activity snapshot
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-[24px] border border-[#d8c3a0] bg-white px-5 sm:px-6 py-5 shadow-sm"
            >
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#9b7440]">
                {card.label}
              </p>
              <h4 className="mt-3 text-3xl sm:text-4xl font-bold text-black">
                {card.value}
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-6">
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