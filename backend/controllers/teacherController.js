const teacherModel = require("../models/teacherModel");

const getTeacherFeedbacks = (req, res) => {
  const teacherId = req.params.teacherId;

  if (!teacherId) {
    return res.status(400).json({
      success: false,
      message: "TeacherId is required",
    });
  }

  teacherModel.getTeacherFeedbackList(teacherId, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher feedback list fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const respondToFeedback = (req, res) => {
  const { feedbackId, teacherId, teacherResponse } = req.body;

  if (!feedbackId || !teacherId || !teacherResponse) {
    return res.status(400).json({
      success: false,
      message: "feedbackId, teacherId and teacherResponse are required",
    });
  }

  teacherModel.addTeacherResponse(
    feedbackId,
    teacherId,
    teacherResponse,
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to add teacher response",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Feedback not found for this teacher",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Teacher response submitted successfully",
      });
    }
  );
};

const getTeacherDashboardSummary = (req, res) => {
  const teacherId = req.params.teacherId;

  if (!teacherId) {
    return res.status(400).json({
      success: false,
      message: "TeacherId is required",
    });
  }

  teacherModel.getTeacherDashboardSummary(teacherId, (summaryErr, summaryResults) => {
    if (summaryErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard summary",
        error: summaryErr.message,
      });
    }

    teacherModel.getTeacherSubjectWiseSummary(teacherId, (subjectErr, subjectResults) => {
      if (subjectErr) {
        return res.status(500).json({
          success: false,
          message: "Failed to fetch subject-wise summary",
          error: subjectErr.message,
        });
      }

      teacherModel.getTeacherRecentComments(teacherId, (commentsErr, commentsResults) => {
        if (commentsErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to fetch recent comments",
            error: commentsErr.message,
          });
        }

        return res.status(200).json({
          success: true,
          message: "Teacher dashboard summary fetched successfully",
          data: {
            overview: summaryResults.length > 0
              ? summaryResults[0]
              : {
                  TeacherId: Number(teacherId),
                  AverageRating: 0,
                  TotalFeedbacks: 0,
                },
            subjectWiseSummary: subjectResults,
            recentComments: commentsResults,
          },
        });
      });
    });
  });
};

module.exports = {
  getTeacherFeedbacks,
  respondToFeedback,
  getTeacherDashboardSummary,
};