const parentModel = require("../models/parentModel");

const getParentDashboard = (req, res) => {
  const parentId = req.params.parentId;

  if (!parentId) {
    return res.status(400).json({
      success: false,
      message: "ParentId is required",
    });
  }

  parentModel.getParentDashboardData(parentId, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No dashboard data found for this parent",
      });
    }

    const parentInfo = {
      parentId: results[0].ParentId,
      parentName: results[0].ParentName,
    };

    const studentsMap = {};

    results.forEach((row) => {
      if (!studentsMap[row.StudentId]) {
        studentsMap[row.StudentId] = {
          studentId: row.StudentId,
          studentName: row.StudentName,
          rollNumber: row.RollNumber,
          class: {
            classId: row.ClassId,
            className: row.ClassName,
            section: row.Section,
            academicYear: row.AcademicYear,
          },
          teachers: [],
        };
      }

      if (row.TeacherId && row.SubjectId) {
        const alreadyExists = studentsMap[row.StudentId].teachers.some(
          (teacher) =>
            teacher.teacherId === row.TeacherId &&
            teacher.subjectId === row.SubjectId
        );

        if (!alreadyExists) {
          studentsMap[row.StudentId].teachers.push({
            teacherId: row.TeacherId,
            teacherName: row.TeacherName,
            subjectId: row.SubjectId,
            subjectName: row.SubjectName,
          });
        }
      }
    });

    parentModel.getParentFeedbackStats(parentId, (statsErr, statsResults) => {
      if (statsErr) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch feedback stats",
          error: statsErr.message,
        });
      }

      parentModel.getParentRecentFeedback(parentId, (recentErr, recentResults) => {
        if (recentErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch recent feedback",
            error: recentErr.message,
          });
        }

        const stats = statsResults[0] || {};

        const recentFeedback = recentResults.map((item) => ({
          id: item.FeedbackId,
          teacher: item.TeacherName,
          subject: item.SubjectName,
          rating: `${item.Rating}/5`,
          date: item.SubmittedAt,
          status:
            item.TeacherResponse && item.TeacherResponse.trim() !== ""
              ? "Responded"
              : "Pending",
        }));

        return res.status(200).json({
          success: true,
          message: "Parent dashboard data fetched successfully",
          data: {
            parent: parentInfo,
            students: Object.values(studentsMap),
            totalFeedbackSubmitted: Number(stats.totalFeedbackSubmitted || 0),
            pendingResponses: Number(stats.pendingResponses || 0),
            respondedFeedback: Number(stats.respondedFeedback || 0),
            recentFeedback,
          },
        });
      });
    });
  });
};

const getParentFeedbackHistory = (req, res) => {
  const parentId = req.params.parentId;

  if (!parentId) {
    return res.status(400).json({
      success: false,
      message: "ParentId is required",
    });
  }

  parentModel.getParentFeedbackHistory(parentId, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parent feedback history fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const getParentDropdownData = (req, res) => {
  const parentId = req.params.parentId;
  const { studentId, classId, teacherId, subjectId } = req.query;

  if (!parentId) {
    return res.status(400).json({
      success: false,
      message: "ParentId is required",
    });
  }

  if (!classId) {
    return res.status(400).json({
      success: false,
      message: "classId is required",
    });
  }

  parentModel.getParentDropdownData(parentId, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    const studentsMap = new Map();
    const classesMap = new Map();
    const formsMap = new Map();
    const categoriesMap = new Map();

    results.forEach((row) => {
      if (row.StudentId) {
        studentsMap.set(row.StudentId, {
          id: String(row.StudentId),
          name: row.StudentName,
        });
      }

      if (row.ClassId) {
        classesMap.set(row.ClassId, {
          id: String(row.ClassId),
          name: `${row.ClassName}-${row.Section}`,
        });
      }

      if (row.FeedbackFormId) {
        formsMap.set(row.FeedbackFormId, {
          id: String(row.FeedbackFormId),
          name: row.FormName,
        });
      }

      if (row.CategoryId) {
        categoriesMap.set(row.CategoryId, {
          id: String(row.CategoryId),
          name: row.CategoryName,
        });
      }
    });

    parentModel.getMappedTeachersAndSubjectsByClassFilters(
      classId,
      teacherId || "",
      subjectId || "",
      (mapErr, mapResults) => {
        if (mapErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch mapped teachers and subjects",
            error: mapErr.message,
          });
        }

        const teachersMap = new Map();
        const subjectsMap = new Map();

        mapResults.forEach((row) => {
          if (row.TeacherId) {
            teachersMap.set(row.TeacherId, {
              id: String(row.TeacherId),
              name: row.TeacherName,
            });
          }

          if (row.SubjectId) {
            subjectsMap.set(row.SubjectId, {
              id: String(row.SubjectId),
              name: row.SubjectName,
            });
          }
        });

        return res.status(200).json({
          success: true,
          message: "Dropdown data fetched successfully",
          data: {
            students: Array.from(studentsMap.values()),
            teachers: Array.from(teachersMap.values()),
            classes: Array.from(classesMap.values()),
            subjects: Array.from(subjectsMap.values()),
            feedbackForms: Array.from(formsMap.values()),
            categories: Array.from(categoriesMap.values()),
            selectedStudentId: studentId || "",
            selectedClassId: classId || "",
            selectedTeacherId: teacherId || "",
            selectedSubjectId: subjectId || "",
          },
        });
      }
    );
  });
};

const getParentStudentDashboard = (req, res) => {
  const { parentId, studentId } = req.params;

  if (!parentId || !studentId) {
    return res.status(400).json({
      success: false,
      message: "ParentId and StudentId are required",
    });
  }

  parentModel.getParentStudentFeedbackStats(
    parentId,
    studentId,
    (statsErr, statsResults) => {
      if (statsErr) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch student feedback stats",
          error: statsErr.message,
        });
      }

      parentModel.getParentStudentRecentFeedback(
        parentId,
        studentId,
        (recentErr, recentResults) => {
          if (recentErr) {
            return res.status(500).json({
              success: false,
              message: "Failed to fetch student recent feedback",
              error: recentErr.message,
            });
          }

          const stats = statsResults[0] || {};

          const recentFeedback = recentResults.map((item) => ({
            id: item.FeedbackId,
            teacher: item.TeacherName,
            subject: item.SubjectName,
            rating: `${item.Rating}/5`,
            date: item.SubmittedAt,
            status:
              item.TeacherResponse && item.TeacherResponse.trim() !== ""
                ? "Responded"
                : "Pending",
          }));

          return res.status(200).json({
            success: true,
            message: "Student dashboard data fetched successfully",
            data: {
              totalFeedbackSubmitted: Number(stats.totalFeedbackSubmitted || 0),
              pendingResponses: Number(stats.pendingResponses || 0),
              respondedFeedback: Number(stats.respondedFeedback || 0),
              recentFeedback,
            },
          });
        }
      );
    }
  );
};

module.exports = {
  getParentDashboard,
  getParentFeedbackHistory,
  getParentDropdownData,
  getParentStudentDashboard,
};