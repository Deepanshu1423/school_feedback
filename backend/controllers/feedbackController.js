const feedbackModel = require("../models/feedbackModel");

const submitFeedback = (req, res) => {
  const {
    feedbackFormId,
    parentId,
    studentId,
    teacherId,
    classId,
    subjectId,
    categoryId,
    rating,
    comments,
  } = req.body;

  if (
    !feedbackFormId ||
    !parentId ||
    !studentId ||
    !teacherId ||
    !classId ||
    !subjectId ||
    !categoryId ||
    !rating
  ) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided",
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5",
    });
  }

  feedbackModel.checkParentStudentMapping(parentId, studentId, (parentStudentErr, parentStudentResults) => {
    if (parentStudentErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to validate parent-student mapping",
        error: parentStudentErr.message,
      });
    }

    if (parentStudentResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent-student mapping",
      });
    }

    feedbackModel.checkTeacherClassSubjectMapping(
      teacherId,
      classId,
      subjectId,
      (teacherMapErr, teacherMapResults) => {
        if (teacherMapErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to validate teacher-class-subject mapping",
            error: teacherMapErr.message,
          });
        }

        if (teacherMapResults.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid teacher-class-subject mapping",
          });
        }

        feedbackModel.createFeedback(
          {
            feedbackFormId,
            parentId,
            studentId,
            teacherId,
            classId,
            subjectId,
            categoryId,
            rating,
            comments: comments || null,
          },
          (err, result) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Feedback submission failed",
                error: err.message,
              });
            }

            return res.status(201).json({
              success: true,
              message: "Feedback submitted successfully",
              data: {
                feedbackId: result.insertId,
              },
            });
          }
        );
      }
    );
  });
};

module.exports = {
  submitFeedback,
};