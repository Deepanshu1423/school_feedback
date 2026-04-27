const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");


router.post(
  "/create-teacher",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createTeacher
);
router.post(
  "/create-class",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createClass
);
router.post(
  "/create-subject",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createSubject
);

router.post(
  "/map-teacher-class-subject",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createTeacherClassSubjectMapping
);
router.post(
  "/map-parent-student",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createParentStudentMapping
);

router.post(
  "/create-student",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createStudent
);

router.post(
  "/create-parent",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createParent
);
router.post(
  "/create-admin",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createAdmin
);

router.get(
  "/classes",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getAllClasses
);
router.get(
  "/subjects",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getAllSubjects
);
router.get(
  "/teachers",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getAllTeachers
);

router.get(
  "/parents",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getAllParents
);
router.get(
  "/students",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getAllStudents
);

router.get(
  "/reports/teacher-performance",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getTeacherPerformanceReport
);

router.get(
  "/reports/class-feedback-summary",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getClassFeedbackSummaryReport
);

router.get(
  "/reports/monthly-feedback",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getMonthlyFeedbackReport
);

router.post(
  "/create-feedback-form",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.createFeedbackForm
);

router.get(
  "/feedback-forms",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getAllFeedbackForms
);


router.put(
  "/feedback-form-status/:feedbackFormId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateFeedbackFormStatus
);

router.put(
  "/teacher-status/:teacherId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateTeacherStatus
);


router.put(
  "/parent-status/:parentId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateParentStatus
);

router.put(
  "/update-parent/:parentId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateParent
);


router.put(
  "/update-class/:classId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateClass
);

router.put(
  "/class-status/:classId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateClassStatus
);


router.put(
  "/update-subject/:subjectId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateSubject
);

router.put(
  "/subject-status/:subjectId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateSubjectStatus
);

router.delete(
  "/delete-subject/:subjectId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.deleteSubject
);


router.get(
  "/teacher-class-subject-mappings",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getTeacherClassSubjectMappings
);

router.get(
  "/parent-student-mappings",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getParentStudentMappings
);

router.put(
  "/update-teacher-class-subject-mapping/:mappingId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateTeacherClassSubjectMapping
);

router.delete(
  "/delete-teacher-class-subject-mapping/:mappingId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.deleteTeacherClassSubjectMapping
);

router.put(
  "/update-parent-student-mapping/:mappingId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateParentStudentMapping
);

router.delete(
  "/delete-parent-student-mapping/:mappingId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.deleteParentStudentMapping
);

router.put(
  "/update-student/:studentId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateStudent
);

router.put(
  "/student-status/:studentId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateStudentStatus
);

router.delete(
  "/delete-student/:studentId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.deleteStudent
);
router.delete(
  "/delete-class/:classId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.deleteClass
);


router.get(
  "/all-feedbacks",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getAllFeedbacks
);


router.put(
  "/update-teacher/:teacherId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateTeacher
);

router.put(
  "/update-feedback-form/:feedbackFormId",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.updateFeedbackForm
);

router.get(
  "/active-teachers",
  verifyToken,
  authorizeRoles("Admin"),
  adminController.getActiveTeachers
);


module.exports = router;