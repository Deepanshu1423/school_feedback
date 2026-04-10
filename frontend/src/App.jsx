import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/auth/AdminLogin";
import ParentRegister from "./pages/auth/ParentRegister";
import ForgotPassword from "./pages/auth/ForgotPassword";

import ParentDashboard from "./pages/Parent/ParentDashboard";
import SubmitFeedback from "./pages/Parent/SubmitFeedback";
import FeedbackHistory from "./pages/Parent/FeedbackHistory";
import SelectChild from "./pages/Parent/SelectChild";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherFeedbackList from "./pages/teacher/TeacherFeedbackList";
import TeacherRespond from "./pages/teacher/TeacherRespond";

import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";
import TeachersManagement from "./pages/admin/TeachersManagement";
import ParentsManagement from "./pages/admin/ParentsManagement";
import StudentsManagement from "./pages/admin/StudentsManagement";
import ClassesManagement from "./pages/admin/ClassesManagement";
import SubjectsManagement from "./pages/admin/SubjectsManagement";
import MappingsManagement from "./pages/admin/MappingsManagement";
import FeedbackFormsManagement from "./pages/admin/FeedbackFormsManagement";
import ReportsManagement from "./pages/admin/ReportsManagement";

import ParentQuickLogin from "./pages/Parent/ParentQuickLogin";
import ParentQuickOtpVerify from "./pages/Parent/ParentQuickOtpVerify";
import FeedbackThankYou from "./pages/Parent/FeedbackThankYou";
// import QuickSubmitFeedback from "./pages/Parent/QuickSubmitFeedback";
import AllFeedbacksManagement from "./pages/admin/AllFeedbacksManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register-parent" element={<ParentRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* NEW QR QUICK LOGIN ROUTES */}
        <Route path="/parent/quick-login" element={<ParentQuickLogin />} />
        <Route
          path="/parent/quick-login/verify"
          element={<ParentQuickOtpVerify />}
        />
        {/* <Route
          path="/quick-submit-feedback/:parentId"
          element={<QuickSubmitFeedback />}
        /> */}
        <Route path="/feedback-thank-you" element={<FeedbackThankYou />} />

        <Route
          path="/parent/select-child/:parentId"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <SelectChild />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/dashboard/:parentId"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/submit-feedback/:parentId"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <SubmitFeedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent/feedback-history/:parentId"
          element={
            <ProtectedRoute allowedRoles={["Parent", "Admin"]}>
              <FeedbackHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/dashboard/:teacherId"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/feedbacks/:teacherId"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherFeedbackList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/respond/:teacherId/:feedbackId"
          element={
            <ProtectedRoute allowedRoles={["Teacher", "Admin"]}>
              <TeacherRespond />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/:adminId"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teachers" element={<TeachersManagement />} />
          <Route path="parents" element={<ParentsManagement />} />
          <Route path="students" element={<StudentsManagement />} />
          <Route path="classes" element={<ClassesManagement />} />
          <Route path="subjects" element={<SubjectsManagement />} />
          <Route path="mappings" element={<MappingsManagement />} />
          <Route path="feedback-forms" element={<FeedbackFormsManagement />} />
          <Route path="reports" element={<ReportsManagement />} />
          <Route path="all-feedbacks" element={<AllFeedbacksManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;